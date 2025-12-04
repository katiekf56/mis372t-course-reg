import React, { useState, useEffect } from "react";

export default function Schedule() {
  const [classes, setClasses] = useState([]);
  const studentId = localStorage.getItem("student_id");
  const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

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

  useEffect(() => {
    if (!studentId) return;

    const load = () => {
      fetch(`${API}/api/registrations/student/${studentId}`)
        .then((res) => res.json())
        .then((data) => {
          const active = data.filter(
            (reg) => reg.status === "added" || !reg.status
          );

          const formatted = active.map((reg) => ({
            enrollment_id: reg.enrollment_id,
            code: reg.course_offering.course_code,
            title: reg.course_offering.title,
            prof: reg.course_offering.professor,
            time: `${formatTime(reg.course_offering.time_start)} - ${formatTime(
              reg.course_offering.time_end
            )}`
          }));

          setClasses(formatted);
        })
        .catch((err) => console.log(err));
    };

    load();

    window.addEventListener("registrationsChanged", load);
    return () => window.removeEventListener("registrationsChanged", load);
  }, [studentId]);

  async function dropClass(enrollment_id) {
    try {
      const res = await fetch(
        `${API}/api/registrations/${enrollment_id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        alert("Error dropping class.");
        return;
      }

      setClasses((prev) =>
        prev.filter((c) => c.enrollment_id !== enrollment_id)
      );
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
          {classes.map((c) => (
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
