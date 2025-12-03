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
      const res = await fetch("https://mis372t-course-reg-backend.onrender.com/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        alert("Error saving class.");
        return;
      }
      alert("Class saved (demo).");
    } catch (err) {
      console.error(err);
      alert("Error saving class.");
    }
  }

  return (
    <div className="container">
      <h2 className="page-title">Add New Class</h2>

      <label className="label">Course Code</label>
      <input
        className="input"
        value={form.code}
        onChange={e => update('code', e.target.value)}
      />

      <label className="label">Title</label>
      <input
        className="input"
        value={form.title}
        onChange={e => update('title', e.target.value)}
      />

      <label className="label">Professor</label>
      <input
        className="input"
        value={form.professor}
        onChange={e => update('professor', e.target.value)}
      />

      <label className="label">Time</label>
      <input
        className="input"
        value={form.time}
        onChange={e => update('time', e.target.value)}
      />

      <button className="btn-orange" onClick={saveClass}>
        Save Class
      </button>
    </div>
  );
}
