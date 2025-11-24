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
          time:
            (reg.course_offering.time_start || "TBD") +
            " - " +
            (reg.course_offering.time_end || "TBD")
        }));
        setClasses(formatted);
      })
      .catch(err => console.log(err));
  }, [studentId]);

  async function dropClass(enrollment_id) {
    try {
      await fetch(`https://mis372t-course-reg-backend.onrender.com/api/registrations/${enrollment_id}`, {
        method: "DELETE"
      });

      // Update UI instantly
      setClasses(prev => prev.filter(c => c.enrollment_id !== enrollment_id));

    } catch (err) {
      console.log("Error dropping class:", err);
    }
  }

  return (
    <>
      <header style={styles.header}>My Classes</header>

      <div style={styles.container}>
        {classes.length === 0 && (
          <p>You are not registered for any classes.</p>
        )}

        {classes.map(c => (
          <div key={c.enrollment_id} style={styles.item}>
            <b>{c.code}</b> — {c.title} <br />
            Professor: {c.prof} <br />
            Time: {c.time}
            <br />
            <button
              style={styles.dropBtn}
              onClick={() => dropClass(c.enrollment_id)}
            >
              Drop Class
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

const styles = {
  header:{background:'#BF5700',color:'white',padding:20,fontSize:22},
  container:{padding:20,fontFamily:'Arial'},
  item:{marginBottom:20, paddingBottom:12, borderBottom:'1px solid #ccc'},
  dropBtn:{marginTop:8,padding:'6px 12px',background:'#a30000',color:'white',
           border:'none',borderRadius:6,cursor:'pointer'}
};
