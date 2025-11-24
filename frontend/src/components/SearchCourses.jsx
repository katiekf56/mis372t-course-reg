import React, { useState, useEffect } from 'react';

export default function SearchCourses() {
  const [query, setQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);

  // Load all courses on mount
  useEffect(() => {
    fetch("https://mis372t-course-reg-backend.onrender.com/api/courses")
      .then(res => res.json())
      .then(data => {
        // convert backend → frontend format
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
        setFiltered(formatted);
      })
      .catch(err => console.log(err));
  }, []);

  // Filter when user types
  useEffect(() => {
    const q = query.toLowerCase();

    const results = courses.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.prof.toLowerCase().includes(q)
    );

    setFiltered(results);
  }, [query, courses]);

  return (
    <>
      <header style={styles.header}>Search Course Schedule</header>

      <div style={styles.container}>
        <input
          style={styles.input}
          placeholder='Search by course code, title, professor…'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div style={{ marginTop: 20 }}>
          {filtered.map(c => (
            <div key={c.id} style={styles.result}>
              <b>{c.code}</b> – {c.title} <br />
              Professor: {c.prof} <br />
              Time: {c.time}
            </div>
          ))}

          {filtered.length === 0 &&
            <p style={{ opacity: 0.7 }}>No matching courses found.</p>
          }
        </div>
      </div>
    </>
  );
}

const styles = {
  header:{background:'#BF5700',color:'white',padding:20,fontSize:22},
  container:{padding:20,fontFamily:'Arial'},
  input:{padding:12,width:'100%',borderRadius:6,border:'1px solid #ccc'},
  result:{
    padding:12,
    borderBottom:'1px solid #ddd',
    marginBottom:12
  }
};
