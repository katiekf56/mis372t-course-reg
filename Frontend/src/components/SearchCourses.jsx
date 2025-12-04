import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

export default function SearchCourses() {
  const [query, setQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);

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
    fetch(`${API}/api/courses`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(c => ({
          id: c.course_id,
          code: c.course_code,
          title: c.title,
          prof: c.professor,
          department: c.department || "N/A",
          time: `${formatTime(c.time_start)} - ${formatTime(c.time_end)}`
        }));

        setCourses(formatted);
        setFiltered(formatted);
      })
      .catch(err => console.log(err));
  }, []);

  // ----------------------------
  // SEARCH HANDLER
  // ----------------------------
  function handleSearch(e) {
    const val = e.target.value;
    setQuery(val);

    const lower = val.toLowerCase();
    const f = courses.filter(c =>
      c.code.toLowerCase().includes(lower) ||
      c.title.toLowerCase().includes(lower) ||
      c.prof.toLowerCase().includes(lower) ||
      c.department.toLowerCase().includes(lower)
    );

    setFiltered(f);
  }

  // ----------------------------
  // ADD CLASS TO SCHEDULE
  // ----------------------------
  async function addToSchedule(courseId) {
    const studentId = localStorage.getItem("student_id");
    if (!studentId) {
      alert("Not logged in");
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
        alert(data.error || "Error adding class");
        return;
      }

      alert("Class added!");
    } catch (err) {
      console.error("Fetch FAILED:", err);
    }
  }

  // ----------------------------
  // UI RETURN
  // ----------------------------
  return (
    <div className="container">
      <h2 className="page-title">Search Course Schedule</h2>

      <input
        className="input"
        placeholder="Search by code, title, professor, or department"
        value={query}
        onChange={handleSearch}
      />

      <div className="search-results">
        {filtered.map(c => (
          <div key={c.id} className="search-result">
            <div className="search-main">
              <strong>{c.code}</strong> — {c.title}
            </div>

            <div className="search-sub">
              Dept: {c.department} • Prof: {c.prof} • Time: {c.time}
            </div>

            <button
              type="button"
              className="btn-orange"
              onClick={() => addToSchedule(c.id)}
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
