import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bannerImg from "../UT-Full-Stack-Image.avif";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [eligibility, setEligibility] = useState({});
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterEligible, setFilterEligible] = useState(false);
  const [filterOpenSeats, setFilterOpenSeats] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const nav = useNavigate();
  const studentId = localStorage.getItem("student_id");
  const API = import.meta.env.VITE_API_BASE || "http://localhost:5001";

  // -----------------------------
  // FORMAT TIME → "4:00 PM"
  // -----------------------------
  function formatTime(t) {
    if (!t) return "TBD";

    let [h, m] = t.split(":");
    h = Number(h);
    m = Number(m);

    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;

    return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  // -----------------------------
  // PARSE PREREQUISITES FOR DISPLAY
  // -----------------------------
  async function getPrerequisiteNames(prereqString) {
    if (!prereqString || prereqString === "None") return "None";
    
    try {
      // Prerequisites are stored as comma-separated course_ids: "1,2,3"
      const prereqIds = prereqString.split(',').map(id => id.trim());
      const courseNames = [];
      
      for (const id of prereqIds) {
        const res = await fetch(`${API}/api/courses/${id}`);
        if (res.ok) {
          const course = await res.json();
          courseNames.push(course.course_code);
        }
      }
      
      return courseNames.length > 0 ? courseNames.join(', ') : "None";
    } catch (err) {
      console.error("Error fetching prerequisite names:", err);
      return prereqString;
    }
  }

  // -----------------------------
  // CHECK ELIGIBILITY FOR ALL COURSES
  // -----------------------------
  async function checkAllEligibility(courseList) {
    if (!studentId) return;

    const eligibilityData = {};

    for (const course of courseList) {
      try {
        const res = await fetch(
          `${API}/api/courses/${course.id}/eligibility/${studentId}`
        );
        const data = await res.json();
        eligibilityData[course.id] = data;
      } catch (err) {
        console.error(`Error checking eligibility for course ${course.id}:`, err);
        eligibilityData[course.id] = { eligible: true }; 
      }
    }

    setEligibility(eligibilityData);
  }

  // -----------------------------
  // FETCH COURSES
  // -----------------------------
  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch(`${API}/api/courses`);
        const data = await res.json();
        
        const formatted = await Promise.all(
          data.map(async (c) => ({
            id: c.course_id,
            code: c.course_code,
            title: c.title,
            prof: c.professor,
            time: `${formatTime(c.time_start)} - ${formatTime(c.time_end)}`,
            department: c.department || "N/A",
            days: c.days || "TBD",
            prerequisites: await getPrerequisiteNames(c.prerequisites),
            prerequisitesRaw: c.prerequisites,
            majorRestricted: c.major_restricted || "None",
            seatsAvailable: c.seats_available || 0,
            seatsTotal: c.capacity || 0
          }))
        );
        
        setCourses(formatted);
        await checkAllEligibility(formatted);
      } catch (err) {
        console.error("Error loading courses:", err);
        setError("Could not load courses.");
      }
      setLoading(false);
    }

    loadCourses();
  }, [studentId]);

  // -----------------------------
  // FETCH STUDENT'S REGISTERED COURSES
  // -----------------------------
  useEffect(() => {
    async function loadRegisteredCourses() {
      if (!studentId) return;
      
      try {
        const res = await fetch(`${API}/api/registrations/student/${studentId}`);
        const data = await res.json();
        
        // Extract course IDs that are currently added
        const registeredIds = data
          .filter(reg => reg.status === 'added')
          .map(reg => reg.course_id);
        
        setRegisteredCourses(registeredIds);
      } catch (err) {
        console.error("Error loading registered courses:", err);
      }
    }

    loadRegisteredCourses();
  }, [studentId]);

  // -----------------------------
  // GET ELIGIBILITY STATUS MESSAGE
  // -----------------------------
  function getEligibilityMessage(courseId) {
    const elig = eligibility[courseId];
    if (!elig) return null;

    if (elig.eligible) return null;

    const messages = [];

    // Check prerequisite issues
    if (elig.prerequisite_check && !elig.prerequisite_check.valid) {
      messages.push(`Missing: ${elig.prerequisite_check.missing.join(', ')}`);
    }

    // Check major restriction issues
    if (elig.major_check && !elig.major_check.valid) {
      const majors = elig.major_check.required_majors.join(', ');
      messages.push(`Restricted to ${majors} majors`);
    }

    // Check time conflict issues
    if (elig.time_conflict_check && !elig.time_conflict_check.valid) {
      const conflicts = elig.time_conflict_check.conflicts
        .map(c => `${c.course_code}`)
        .join(', ');
      messages.push(`Conflicting Class: ${conflicts}`);
    }

    return messages.join(' | ');
  }

  // Get unique departments for filter dropdown
  const departments = [...new Set(courses.map(c => c.department))].sort();

  // Filter courses (no sort)
  function getFilteredCourses() {
    let filtered = courses;

    if (filterDept) {
      filtered = filtered.filter(c => c.department === filterDept);
    }

    if (filterEligible) {
      filtered = filtered.filter(c => {
        const elig = eligibility[c.id];
        return (!elig || elig.eligible) && c.seatsAvailable > 0;
      });
    }

    if (filterOpenSeats) {
      filtered = filtered.filter(c => c.seatsAvailable > 0);
    }

    return filtered;
  }

  // -----------------------------
  // REGISTER FOR CLASS
  // -----------------------------
  async function register(c) {
    console.log("REGISTER CLICKED:", c);

    if (!studentId) {
      setError("You must be logged in.");
      return;
    }

    // Check eligibility before attempting to register
    const elig = eligibility[c.id];
    if (elig && !elig.eligible) {
      const message = getEligibilityMessage(c.id);
      setError(`Cannot register: ${message}`);
      return;
    }

    try {
      console.log("Sending POST:", `${API}/api/registrations`);
      console.log("Payload:", {
        student_id: Number(studentId),
        course_id: Number(c.id)
      });

      const res = await fetch(`${API}/api/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: Number(studentId),
          course_id: Number(c.id)
        })
      });

      const data = await res.json();
      console.log("Response:", data);

      if (!res.ok) {
        // Show the detailed error message from backend
        setError(data.details || data.error || "Could not add class.");
        return;
      }

      setError("");
      
      // Refresh registered courses list
      setRegisteredCourses([...registeredCourses, c.id]);
      
      window.dispatchEvent(new Event("registrationsChanged"));
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      alert("Error adding class.");
    }
  }

  // -----------------------------
  // AI QUERY HANDLER
  // -----------------------------
  async function askAI() {
    if (!aiQuery.trim()) return;

    const endpoint = import.meta.env.VITE_AZURE_ENDPOINT;
    const apiKey = import.meta.env.VITE_AZURE_API_KEY;
    const deployment = import.meta.env.VITE_AZURE_DEPLOYMENT;

    if (!endpoint || !apiKey || !deployment) {
      console.error('AI config missing: endpoint, apiKey, or deployment not set');
      setAiResponse('AI configuration missing. Check VITE_AZURE_* env variables.');
      return;
    }

    const base = endpoint.replace(/\/$/, '');
    const url = `${base}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: aiQuery }],
          max_tokens: 200
        })
      });

      const data = await res.json();
      setAiResponse(data?.choices?.[0]?.message?.content || "No response.");
    } catch (err) {
      console.error(err);
      setAiResponse("AI service error.");
    }
  }

  return (
    <>
      {/* Banner */}
      <div className="banner">
        <img src={bannerImg} alt="UT Campus" className="banner-img" />
        <h1 className="banner-title">UT Course Registration</h1>
      </div>

      <div className="container">
        <h2 className="page-title">Welcome to UT Course Registration</h2>

        {error && (
          <div style={{ background: '#ffe6e6', color: '#a30000', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #f5c2c7' }}>
            {error}
          </div>
        )}

        {/* BUTTON BAR */}
        <div className="button-bar">
          <button className="btn-orange" onClick={() => nav("/search")}>
            🔍 Search Course Schedule
          </button>
          <button className="btn-orange" onClick={() => nav("/profile")}>
            👤 Profile
          </button>
          <button className="btn-orange" onClick={() => nav("/schedule")}>
            🗂️ View My Classes
          </button>
        </div>

        {/* FILTERS */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ marginRight: '8px', fontWeight: '500' }}>Department:</label>
            <select 
              value={filterDept} 
              onChange={(e) => setFilterDept(e.target.value)}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={filterEligible} 
              onChange={(e) => setFilterEligible(e.target.checked)}
            />
            <span style={{ fontWeight: '500' }}>Show only eligible</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={filterOpenSeats} 
              onChange={(e) => setFilterOpenSeats(e.target.checked)}
            />
            <span style={{ fontWeight: '500' }}>Open seats only</span>
          </label>
        </div>

        {/* AI BOX */}
        <div className="ai-box">
          <input
            className="input ai-input"
            placeholder="Ask the AI anything…"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
          />
          <button className="btn-orange" onClick={askAI}>Ask AI</button>

          {aiResponse && (
            <div className="ai-response">
              <strong>AI Response:</strong>
              <p>{aiResponse}</p>
            </div>
          )}
        </div>

        {/* COURSE TABLE */}
        <h2 className="section-title">Browse Courses</h2>

        {loading && (
          <div style={{ marginBottom: '12px', color: '#555', padding: '20px', textAlign: 'center' }}>Loading courses...</div>
        )}

        {!loading && (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Title</th>
                  <th>Dept</th>
                  <th>Professor</th>
                  <th>Days</th>
                  <th>Time</th>
                  <th>Seats (filled/total)</th>
                  <th>Prerequisites</th>
                  <th>Major Restricted</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {getFilteredCourses().length === 0 && (
                  <tr>
                    <td colSpan="10" style={{ padding: '14px', color: '#555' }}>No courses match these filters.</td>
                  </tr>
                )}

                {getFilteredCourses().map((c) => {
                  const elig = eligibility[c.id];
                  const isEligible = !elig || elig.eligible;
                  const message = getEligibilityMessage(c.id);
              const isAlreadyAdded = registeredCourses.includes(c.id);
              const isFull = c.seatsAvailable <= 0;
              const seatsTotal = c.seatsTotal || 0;
              const seatsFilled = Math.max(0, seatsTotal - c.seatsAvailable);

              return (
                <tr 
                  key={c.id}
                  style={(!isEligible || isFull) && !isAlreadyAdded ? { backgroundColor: '#fff3cd' } : {}}
                >
                  <td>{c.code}</td>
                  <td>{c.title}</td>
                  <td>{c.department}</td>
                  <td>{c.prof}</td>
                  <td>{c.days}</td>
                  <td>{c.time}</td>
                  <td style={{ fontWeight: isFull ? 'bold' : 'normal', color: isFull ? '#a30000' : 'inherit' }}>
                    {seatsFilled}/{seatsTotal}
                    <div style={{ fontSize: '11px', color: '#555' }}>
                      {c.seatsAvailable} open
                    </div>
                  </td>
                  <td>{c.prerequisites}</td>
                  <td>{c.majorRestricted}</td>
                  <td>
                    {isAlreadyAdded ? (
                      <button
                        className="btn-orange small"
                        disabled
                        style={{ 
                          opacity: 0.7, 
                          cursor: 'default',
                          backgroundColor: '#28a745'
                        }}
                      >
                        Added
                      </button>
                    ) : isFull ? (
                      <div style={{ fontSize: '12px', color: '#a30000' }}>
                        <button
                          className="btn-orange small"
                          disabled
                          style={{ 
                            opacity: 0.5, 
                            cursor: 'not-allowed',
                            backgroundColor: '#ccc'
                          }}
                          title="Course is full"
                        >
                          Full
                        </button>
                      </div>
                    ) : isEligible ? (
                      <button
                        className="btn-orange small"
                        onClick={() => register(c)}
                      >
                        Add
                      </button>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#856404' }}>
                        <button
                          className="btn-orange small"
                          disabled
                          style={{ 
                            opacity: 0.5, 
                            cursor: 'not-allowed',
                            backgroundColor: '#ccc'
                          }}
                          title={message}
                        >
                          Ineligible
                        </button>
                        <div style={{ marginTop: '4px', whiteSpace: 'nowrap' }}>
                          {message}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
}