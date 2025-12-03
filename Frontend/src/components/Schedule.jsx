import React, { useState, useEffect } from "react";

export default function Schedule() {
  const [classes, setClasses] = useState([]);
  const studentId = localStorage.getItem("student_id");

  useEffect(() => {
    if (!studentId) return;

    fetch(`https://mis372t-course-reg-backend.onrender.com/api/registrations/student/${studentId}`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(reg => ({
          enrollment_id: reg.enrollment_id,
          code: reg.course_offering.course_code,
          title: reg.course_offering.title,
          prof: reg.course_offering.professor,
          time: `${reg.course_offering.time_start || "TBD"} - ${reg.course_offering.time_end || "TBD"}`
        }));
        setClasses(formatted);
      })
      .catch(err => console.log(err));
  }, [studentId]);

  async function dropClass(enrollment_id) {
    try {
      const res = await fetch(
        `https://mis372t-course-reg-backend.onrender.com/api/registrations/${enrollment_id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        alert("Error dropping class.");
        return;
      }
      setClasses(prev => prev.filter(c => c.enrollment_id !== enrollment_id));
    } catch (err) {
      console.error(err);
      alert("Error dropping class.");
    }
  }

  return (
    <div className="container">
      <h2 className="page-title">My Schedule</h2>

      {classes.length === 0 ? (
        <p>No classes in your schedule yet.</p>
      ) : (
        <div>
          {classes.map(c => (
            <div key={c.enrollment_id} className="schedule-item">
              <div className="schedule-main">
                <strong>{c.code}</strong> — {c.title}
              </div>
              <div className="schedule-sub">
                Prof: {c.prof} • Time: {c.time}
              </div>
              <button
                className="btn-danger"
                onClick={() => dropClass(c.enrollment_id)}
              >
                Drop
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
