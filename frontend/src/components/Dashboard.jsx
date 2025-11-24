import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const nav = useNavigate();
  const studentId = localStorage.getItem("student_id");

  useEffect(() => {
    fetch("https://mis372t-course-reg-backend.onrender.com/api/courses")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(c => ({
          id: c.course_id,
          code: c.course_code,
          title: c.title,
          prof: c.professor,
          time:
            (c.time_start ? c.time_start : "TBD") +
            " - " +
            (c.time_end ? c.time_end : "TBD")
        }));
        setCourses(formatted);
      })
      .catch(err => console.log(err));
  }, []);

  async function register(c) {
    if (!studentId) {
      alert("You must be logged in.");
      return;
    }

    try {
      const res = await fetch("https://mis372t-course-reg-backend.onrender.com/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, course_id: c.id })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Could not add class.");
        return;
      }

      alert("Class added to your schedule!");

    } catch (err) {
      console.log(err);
      alert("Error adding class.");
    }
  }

  return (
    <>
      <header style={styles.header}>UT Course Registration</header>

      <div style={styles.container}>
        <h2>Welcome to UT Course Registration</h2>

        <div style={styles.actionRow}>
          <button style={styles.actionBtn} onClick={() => nav("/search")}>
            🔍 Search Course Schedule
          </button>

          <button style={styles.actionBtn} onClick={() => nav("/add-class")}>
            ➕ Add New Class
          </button>
        </div>

        <button style={styles.actionBtn} onClick={() => nav("/profile")}>
          👤 Profile
        </button>

        <h2>Browse Courses</h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Course</th>
              <th>Title</th>
              <th>Professor</th>
              <th>Time</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {courses.map(c => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.title}</td>
                <td>{c.prof}</td>
                <td>{c.time}</td>
                <td>
                  <button style={styles.addBtn} onClick={() => register(c)}>
                    Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button 
          style={styles.cartBtn}
          onClick={() => nav("/schedule")}
        >
          View My Classes
        </button>
      </div>
    </>
  );
}

const styles = {
  header:{background:'#BF5700',color:'white',padding:20,fontSize:22},
  container:{padding:20,fontFamily:'Arial'},
  table:{width:'100%',borderCollapse:'collapse',marginTop:20},
  addBtn:{padding:'6px 10px',background:'#BF5700',color:'white',border:'none',borderRadius:6,cursor:'pointer'},
  cartBtn:{marginTop:20,padding:'10px 16px',background:'#333',color:'white',border:'none',borderRadius:6,cursor:'pointer'},
  actionRow:{display:'flex',gap:'12px',marginBottom:'20px'},
  actionBtn:{padding:'10px 16px',background:'#BF5700',color:'white',border:'none',borderRadius:6,cursor:'pointer'}
};
