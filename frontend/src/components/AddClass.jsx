import React, { useState } from 'react';

export default function AddClass() {
  const [form, setForm] = useState({
    code: '',
    title: '',
    professor: '',
    time: ''
  });

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function saveClass() {
    try {
      const response = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      alert("Class added!");
      console.log(data);

    } catch (err) {
      alert("Error adding class");
      console.log(err);
    }
  }

  return (
    <>
      <header style={styles.header}>Add a New Class</header>

      <div style={styles.container}>
        <label>Course Code</label>
        <input style={styles.input} onChange={e => update('code', e.target.value)} />

        <label>Title</label>
        <input style={styles.input} onChange={e => update('title', e.target.value)} />

        <label>Professor</label>
        <input style={styles.input} onChange={e => update('professor', e.target.value)} />

        <label>Time (format: HH:MM-HH:MM)</label>
        <input style={styles.input} onChange={e => update('time', e.target.value)} />

        <button style={styles.saveBtn} onClick={saveClass}>Save Class</button>
      </div>
    </>
  );
}

const styles = {
  header:{background:'#BF5700',color:'white',padding:20,fontSize:22},
  container:{padding:20,fontFamily:'Arial'},
  input:{padding:10,width:'100%',borderRadius:6,border:'1px solid #ccc',marginBottom:12},
  saveBtn:{padding:'12px 20px',background:'#BF5700',color:'white',border:'none',borderRadius:6,marginTop:10,cursor:'pointer'}
};
