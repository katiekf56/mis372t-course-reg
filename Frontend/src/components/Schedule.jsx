import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Schedule() {
  const nav = useNavigate();
  
  function goBack() {
    nav("/dashboard");
  }
  const [classes, setClasses] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // "list" or "calendar"
  const studentId = localStorage.getItem("student_id");
  const API = import.meta.env.VITE_API_BASE || "http://localhost:5001";

  // ----------------------------
  // GET CREDIT HOURS FROM COURSE CODE
  // ----------------------------
  function getCreditHours(courseCode) {
    if (!courseCode) return 0;
    const match = courseCode.match(/\d+/);
    if (!match) return 0;
    const courseNumber = match[0];
    const firstDigit = parseInt(courseNumber.charAt(0));
    return isNaN(firstDigit) ? 0 : firstDigit;
  }

  // Calculate total credits
  const totalCredits = classes.reduce((sum, cls) => sum + getCreditHours(cls.code), 0);

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
  // CONVERT TIME TO MINUTES FOR POSITIONING
  // ----------------------------
  function timeToMinutes(t) {
    if (!t) return 0;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  // ----------------------------
  // PARSE DAYS STRING (e.g., "MWF" → [1,3,5], "TTh" → [2,4])
  // ----------------------------
  function parseDays(daysStr) {
    if (!daysStr || daysStr === "TBD") return [];
    
    const days = [];
    let i = 0;
    while (i < daysStr.length) {
      if (i + 1 < daysStr.length && daysStr.substring(i, i + 2) === "Th") {
        // Thursday (TTh case)
        days.push(4);
        i += 2;
      } else if (daysStr[i] === "M") {
        days.push(1); // Monday
        i += 1;
      } else if (daysStr[i] === "T") {
        days.push(2); // Tuesday
        i += 1;
      } else if (daysStr[i] === "W") {
        days.push(3); // Wednesday
        i += 1;
      } else if (daysStr[i] === "F") {
        days.push(5); // Friday
        i += 1;
      } else {
        i += 1; // Skip unknown chars
      }
    }
    return days;
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
            )}`,
            time_start: reg.course_offering.time_start,
            time_end: reg.course_offering.time_end,
            days: reg.course_offering.days || "TBD"
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

      <h2 className="page-title">My Schedule</h2>

      {classes.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No classes in your schedule yet.</p>
      ) : (
        <>
          {/* Credit Hours Summary */}
          <div style={{ 
            background: totalCredits > 17 ? '#fff3cd' : totalCredits >= 15 ? '#e6f3ff' : '#e6ffe6', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            border: `2px solid ${totalCredits > 17 ? '#856404' : totalCredits >= 15 ? '#004085' : '#155724'}`,
            textAlign: 'center'
          }}>
            <strong style={{ fontSize: '18px' }}>
              Total Credit Hours: {totalCredits} / 17
            </strong>
            {totalCredits > 17 && (
              <div style={{ fontSize: '13px', color: '#856404', marginTop: '4px' }}>
                ⚠️ You have exceeded the maximum credit limit.
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
            <button
              className="pill"
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
            >
              📋 List View
            </button>
            <button
              className="pill"
              aria-pressed={viewMode === "calendar"}
              onClick={() => setViewMode("calendar")}
            >
              📅 Calendar View
            </button>
          </div>

          {/* LIST VIEW */}
          {viewMode === "list" && (
            <div>
              {classes.map((c) => {
                const credits = getCreditHours(c.code);
                return (
                <div key={c.enrollment_id} className="schedule-item">
                  <div className="schedule-main">
                    <strong>{c.code}</strong> — {c.title} 
                    <span style={{ 
                      marginLeft: '10px', 
                      padding: '2px 8px', 
                      background: '#bf5700', 
                      color: 'white', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {credits} credit{credits !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="schedule-sub">
                    Prof: {c.prof} • Time: {c.time} • Days: {c.days}
                  </div>

                  <button
                    className="btn-danger"
                    onClick={() => dropClass(c.enrollment_id)}
                  >
                    Drop
                  </button>
                </div>
                );
              })}
            </div>
          )}

          {/* CALENDAR VIEW */}
          {viewMode === "calendar" && (
            <CalendarView classes={classes} dropClass={dropClass} formatTime={formatTime} parseDays={parseDays} timeToMinutes={timeToMinutes} />
          )}
        </>
      )}
    </div>
  );
}

// ----------------------------
// CALENDAR VIEW COMPONENT
// ----------------------------
function CalendarView({ classes, dropClass, formatTime, parseDays, timeToMinutes }) {
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const START_HOUR = 7;
  const END_HOUR = 19;
  const SLOT_HEIGHT = 40; // pixels per hour

  // Generate consistent colors based on class code/title
  function getColorForClass(code) {
    const colors = [
      "#FFE6CC", // Orange
      "#E6F3FF", // Blue
      "#E6FFE6", // Green
      "#FFF0E6", // Peach
      "#F0E6FF", // Purple
      "#FFE6F0", // Pink
      "#E6FFFF", // Cyan
      "#FFFFE6", // Yellow
    ];
    
    // Hash the code to get a consistent color index
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = ((hash << 5) - hash) + code.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // Build calendar grid: day → time → [classes]
  const calendarGrid = {};
  for (let i = 0; i < DAYS.length; i++) {
    calendarGrid[i] = {};
  }

  // Place each class in grid
  classes.forEach((cls) => {
    const dayIndices = parseDays(cls.days);
    dayIndices.forEach((dayIdx) => {
      if (dayIdx >= 1 && dayIdx <= 5) {
        const gridDayIdx = dayIdx - 1;
        if (!calendarGrid[gridDayIdx]) calendarGrid[gridDayIdx] = {};
        
        const startMin = timeToMinutes(cls.time_start);
        const key = `${startMin}`;
        
        if (!calendarGrid[gridDayIdx][key]) {
          calendarGrid[gridDayIdx][key] = [];
        }
        calendarGrid[gridDayIdx][key].push(cls);
      }
    });
  });

  return (
    <div className="calendar-container">
      <div className="calendar-grid">
        {/* Header Row - Days */}
        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: '1px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#666', padding: '8px 0' }}>Time</div>
          {DAYS.map((day) => (
            <div
              key={day}
              style={{
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '10px 5px',
                background: '#f8f6f3',
                borderBottom: '2px solid #bf5700',
                fontSize: '13px'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time Slots */}
        {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => {
          const hour = START_HOUR + i;
          const hourStart = hour * 60;
          const hourEnd = (hour + 1) * 60;

          return (
            <div key={hour} style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: '1px' }}>
              {/* Time Label */}
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  color: '#666',
                  padding: '4px 4px',
                  textAlign: 'center',
                  background: '#f0f0f0'
                }}
              >
                {hour % 12 === 0 ? 12 : hour % 12}{hour >= 12 ? "PM" : "AM"}
              </div>

              {/* Day Cells */}
              {DAYS.map((_, dayIdx) => {
                const cellClasses = Object.entries(calendarGrid[dayIdx] || {})
                  .filter(([timeKey]) => {
                    const startMin = parseInt(timeKey);
                    return startMin >= hourStart && startMin < hourEnd;
                  })
                  .flatMap(([, cls]) => cls);

                return (
                  <div
                    key={`${hour}-${dayIdx}`}
                    style={{
                      minHeight: `${SLOT_HEIGHT}px`,
                      background: cellClasses.length > 0 ? '#fafafa' : '#fdfcfb',
                      border: '1px solid #eee',
                      padding: '4px',
                      position: 'relative',
                      fontSize: '11px'
                    }}
                  >
                    {cellClasses.map((cls) => {
                      const startMin = timeToMinutes(cls.time_start);
                      const endMin = timeToMinutes(cls.time_end);
                      const durationHours = (endMin - startMin) / 60;
                      const offsetMin = startMin - hourStart * 60;
                      const offsetPercent = (offsetMin / 60) * 100;
                      const classColor = getColorForClass(cls.code);

                      return (
                        <div
                          key={cls.enrollment_id}
                          style={{
                            background: classColor,
                            border: '1px solid #bf5700',
                            borderRadius: '6px',
                            padding: '6px 5px',
                            marginBottom: '2px',
                            minHeight: `${durationHours * SLOT_HEIGHT * 0.9}px`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(191,87,0,0.2)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div style={{ fontWeight: '600', fontSize: '11px', color: '#333' }}>
                            {cls.code}
                          </div>
                          <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                            {formatTime(cls.time_start)} - {formatTime(cls.time_end)}
                          </div>
                          <div style={{ fontSize: '9px', color: '#555', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cls.title}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dropClass(cls.enrollment_id);
                            }}
                            style={{
                              marginTop: '4px',
                              padding: '2px 6px',
                              fontSize: '9px',
                              background: '#d32f2f',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#c62828'}
                            onMouseLeave={(e) => e.target.style.background = '#d32f2f'}
                          >
                            Drop
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
