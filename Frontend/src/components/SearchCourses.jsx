import React, { useState, useEffect } from 'react';

export default function SearchCourses() {
  const [query, setQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetch("https://mis372t-course-reg-backend.onrender.com/api/courses")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(c => ({
          id: c.course_id,
          code: c.course_code,
          title: c.title,
          prof: c.professor,
          department: c.department || "N/A",
          time:
            (c.time_start ? c.time_start : "TBD") +
            " - " +
            (c.time_end ? c.time_end : "TBD")
        }));
        setCourses(formatted);
        setFiltered(formatted);
      })
      .catch(err => console.log(err));
  }, []);

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
              Dept: {c.department} • Prof: {c.prof} • Time: {c.time}  {/* ADD Dept */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
