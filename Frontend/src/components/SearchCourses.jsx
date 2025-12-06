import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

export default function SearchCourses() {
  const nav = useNavigate();
  
  function goBack() {
    nav("/dashboard");
  }
  const [query, setQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [eligibility, setEligibility] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [myMajorOnly, setMyMajorOnly] = useState(false);

  // ----------------------------
  // FORMAT TIME → "4:00 PM"
  // ----------------------------
  function formatTime(t) {
    if (!t) return "TBD";

    let [h, m] = t.split(":");
    h = Number(h);
    m = Number(m);

    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;

    return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  // ----------------------------
  // FETCH COURSES
  // ----------------------------
  useEffect(() => {
    const studentId = localStorage.getItem("student_id");

    fetch(`${API}/api/courses`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(c => ({
          id: c.course_id,
          code: c.course_code,
          title: c.title,
          prof: c.professor,
          department: c.department || "N/A",
          time: `${formatTime(c.time_start)} - ${formatTime(c.time_end)}`,
          seatsAvailable: c.seats_available || 0,
          seatsTotal: c.capacity || 0
        }));

        setCourses(formatted);
        setFiltered(formatted);

        // Kick off eligibility checks
        if (studentId) {
          Promise.all(
            formatted.map(async (c) => {
              try {
                const res = await fetch(`${API}/api/courses/${c.id}/eligibility/${studentId}`);
                const data = await res.json();
                return { id: c.id, data };
              } catch (err) {
                console.error(`Eligibility check failed for ${c.id}`, err);
                return { id: c.id, data: { eligible: true } };
              }
            })
          ).then(results => {
            const eligMap = {};
            results.forEach(r => { eligMap[r.id] = r.data; });
            setEligibility(eligMap);
          });
        }
      })
      .catch(err => {
        console.log(err);
        setError("Could not load courses.");
      })
      .finally(() => setLoading(false));
  }, []);

  // ----------------------------
  // SEARCH HANDLER
  // ----------------------------
  function handleSearch(e) {
    const val = e.target.value;
    setQuery(val);

    const lower = val.toLowerCase();
    let f = courses.filter(c =>
      c.code.toLowerCase().includes(lower) ||
      c.title.toLowerCase().includes(lower) ||
      c.prof.toLowerCase().includes(lower) ||
      c.department.toLowerCase().includes(lower)
    );

    // open seats filter
    if (openOnly) {
      f = f.filter(c => c.seatsAvailable > 0);
    }

    // eligible filter
    if (eligibleOnly) {
      f = f.filter(c => {
        const elig = eligibility[c.id];
        return !elig || elig.eligible;
      });
    }

    // my major only filter (eligibility major check passes or no restriction)
    if (myMajorOnly) {
      f = f.filter(c => {
        const elig = eligibility[c.id];
        if (!elig) return true;
        if (elig.eligible) return true;
        if (elig.major_check && elig.major_check.valid) return true;
        return false;
      });
    }

    setFiltered(f);
  }

  // ----------------------------
  // ADD CLASS TO SCHEDULE
  // ----------------------------
  async function addToSchedule(courseId) {
    const studentId = localStorage.getItem("student_id");
    if (!studentId) {
      setError("Not logged in");
      return;
    }

    try {
      const res = await fetch(`${API}/api/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: Number(studentId),
          course_id: Number(courseId)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error adding class");
        return;
      }
      setError("");
    } catch (err) {
      console.error("Fetch FAILED:", err);
      setError("Error adding class");
    }
  }

  // Derived filtered list for rendering
  const visibleCourses = filtered;

  // ----------------------------
  // UI RETURN
  // ----------------------------
  return (
    <div className="container" style={{ position: 'relative', paddingTop: '60px' }}>
      {/* Back Button */}
      <button 
        onClick={goBack}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          color: '#bf5700',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        ← Back
      </button>

      <h2 className="page-title">Search Course Schedule</h2>

      {error && (
        <div style={{ background: '#ffe6e6', color: '#a30000', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #f5c2c7' }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ marginBottom: '12px', color: '#555' }}>Loading courses...</div>
      )}

      <input
        className="input"
        placeholder="Search by code, title, professor, or department"
        value={query}
        onChange={handleSearch}
      />

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px', marginBottom: '12px' }}>
        <button
          className="pill"
          onClick={() => { setOpenOnly(!openOnly); handleSearch({ target: { value: query } }); }}
          aria-pressed={openOnly}
        >
          {openOnly ? '✅ Open seats only' : 'Open seats only'}
        </button>
        <button
          className="pill"
          onClick={() => { setEligibleOnly(!eligibleOnly); handleSearch({ target: { value: query } }); }}
          aria-pressed={eligibleOnly}
        >
          {eligibleOnly ? '✅ Eligible only' : 'Eligible only'}
        </button>
        <button
          className="pill"
          onClick={() => { setMyMajorOnly(!myMajorOnly); handleSearch({ target: { value: query } }); }}
          aria-pressed={myMajorOnly}
        >
          {myMajorOnly ? '✅ My major only' : 'My major only'}
        </button>
      </div>

      <div className="search-results">
        {visibleCourses.length === 0 && !loading && (
          <div style={{ padding: '12px', color: '#555' }}>No courses match these filters.</div>
        )}

        {visibleCourses.map(c => {
          const elig = eligibility[c.id];
          const isEligible = !elig || elig.eligible;
          const isFull = c.seatsAvailable <= 0;
          const seatsTotal = c.seatsTotal || 0;
          const seatsFilled = Math.max(0, seatsTotal - c.seatsAvailable);

          return (
          <div key={c.id} className="search-result">
            <div className="search-main">
              <strong>{c.code}</strong> — {c.title}
            </div>

            <div className="search-sub">
              Dept: {c.department} • Prof: {c.prof} • Time: {c.time}
              <br /> Seats: {seatsFilled}/{seatsTotal} ({c.seatsAvailable} open)
            </div>

            <button
              type="button"
              className="btn-orange"
              onClick={() => addToSchedule(c.id)}
              disabled={isFull || !isEligible}
              style={isFull || !isEligible ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            >
              {isFull ? 'Full' : isEligible ? 'Add' : 'Ineligible'}
            </button>
          </div>
        );
        })}
      </div>
    </div>
  );
}
