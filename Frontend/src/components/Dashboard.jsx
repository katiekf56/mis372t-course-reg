import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bannerImg from "../UT-Full-Stack-Image.avif";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [eligibility, setEligibility] = useState({});
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");

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
            majorRestricted: c.major_restricted || "None"
          }))
        );
        
        setCourses(formatted);
        await checkAllEligibility(formatted);
      } catch (err) {
        console.error("Error loading courses:", err);
      }
    }

    loadCourses();
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

    return messages.join(' | ');
  }

  // -----------------------------
  // REGISTER FOR CLASS
  // -----------------------------
  async function register(c) {
    console.log("REGISTER CLICKED:", c);

    if (!studentId) {
      alert("You must be logged in.");
      return;
    }

    // Check eligibility before attempting to register
    const elig = eligibility[c.id];
    if (elig && !elig.eligible) {
      const message = getEligibilityMessage(c.id);
      alert(`Cannot register:\n${message}`);
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
        alert(data.details || data.error || "Could not add class.");
        return;
      }

      alert("Class added to your schedule!");
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

        {/* BUTTON BAR */}
        <div className="button-bar">
          <button className="btn-orange" onClick={() => nav("/search")}>
            🔍 Search Course Schedule
          </button>
          <button className="btn-orange" onClick={() => nav("/add-class")}>
            ➕ Add New Class
          </button>
          <button className="btn-orange" onClick={() => nav("/profile")}>
            👤 Profile
          </button>
          <button className="btn-orange" onClick={() => nav("/schedule")}>
            🗂️ View My Classes
          </button>
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

        <table className="table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Title</th>
              <th>Dept</th>
              <th>Professor</th>
              <th>Days</th>
              <th>Time</th>
              <th>Prerequisites</th>
              <th>Major Restricted</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {courses.map((c) => {
              const elig = eligibility[c.id];
              const isEligible = !elig || elig.eligible;
              const message = getEligibilityMessage(c.id);

              return (
                <tr 
                  key={c.id}
                  style={!isEligible ? { backgroundColor: '#fff3cd' } : {}}
                >
                  <td>{c.code}</td>
                  <td>{c.title}</td>
                  <td>{c.department}</td>
                  <td>{c.prof}</td>
                  <td>{c.days}</td>
                  <td>{c.time}</td>
                  <td>{c.prerequisites}</td>
                  <td>{c.majorRestricted}</td>
                  <td>
                    {isEligible ? (
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
      </div>
    </>
  );
}