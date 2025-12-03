import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    major: "",
    classification: "",
  });

  const nav = useNavigate();
  const studentId = localStorage.getItem("student_id");

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  // Load user info
  useEffect(() => {
    if (!studentId) return;

    fetch(`https://mis372t-course-reg-backend.onrender.com/api/students/${studentId}`)
      .then((res) => res.json())
      .then((data) =>
        setForm({
          name: data.name || "",
          email: data.email || "",
          major: data.major || "",
          classification: data.classification || "",
        })
      )
      .catch((err) => console.error("Profile load error:", err));
  }, [studentId]);

  // Save Profile
  async function saveProfile() {
    try {
      const res = await fetch(
        `https://mis372t-course-reg-backend.onrender.com/api/students/${studentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        alert("Error saving profile.");
        return;
      }

      alert("Profile saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving profile.");
    }
  }

  // Logout
  function logout() {
    localStorage.clear();
    nav("/login");
  }

  return (
    <div className="profile-card">
      <h2 className="profile-title">Profile</h2>

      <label>Name</label>
      <input
        className="input"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
      />

      <label>Email</label>
      <input
        className="input"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
      />

      <label>Major</label>
      <select
        className="input"
        value={form.major}
        onChange={(e) => update("major", e.target.value)}
      >
        <option value="">Select Major</option>
        <option>Management Information Systems (MIS)</option>
        <option>Computer Science</option>
        <option>Business Administration</option>
        <option>Finance</option>
        <option>Marketing</option>
        <option>Accounting</option>
        <option>Economics</option>
        <option>Mechanical Engineering</option>
        <option>Electrical & Computer Engineering</option>
        <option>Civil Engineering</option>
        <option>Psychology</option>
        <option>Biology</option>
        <option>Government</option>
        <option>Communications & Media Studies</option>
      </select>

      <label>Classification</label>
      <select
        className="input"
        value={form.classification}
        onChange={(e) => update("classification", e.target.value)}
      >
        <option>Freshman</option>
        <option>Sophomore</option>
        <option>Junior</option>
        <option>Senior</option>
      </select>

      {/* Buttons */}
      <div className="profile-actions">
        <button className="btn-orange" onClick={saveProfile}>
          Save Profile
        </button>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}
