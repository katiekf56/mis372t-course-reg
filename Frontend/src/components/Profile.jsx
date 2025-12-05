import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

export default function Profile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    major: "",
    classification: "Freshman",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const nav = useNavigate();
  const studentId = localStorage.getItem("student_id");
  const userEmail = localStorage.getItem("user_email");

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  // Load user info
  useEffect(() => {
    console.log("Loading profile...");
    console.log("Student ID:", studentId);
    console.log("User Email:", userEmail);

    if (!studentId) {
      nav("/login");
      return;
    }

    setLoading(true);
    fetch(`${API}/api/students/${studentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => {
        console.log("Backend data:", data);
        setForm({
          name: data.name || "",
          email: data.email || userEmail || "",
          major: data.major || "",
          classification: data.classification || "Freshman",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Profile load error:", err);
        // If backend fails, still populate email from localStorage
        setForm(prev => ({
          ...prev,
          email: userEmail || ""
        }));
        setLoading(false);
      });
  }, [studentId, userEmail, nav]);

  // Save Profile
  async function saveProfile() {
    if (!studentId) {
      alert("No student ID found. Please log in again.");
      return;
    }

    setSaving(true);
    try {
      console.log("Saving profile:", form);
      
      const res = await fetch(`${API}/api/students/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error saving profile");
      }

      const updatedData = await res.json();
      console.log("Saved successfully:", updatedData);
      
      // Update form with confirmed backend data
      setForm({
        name: updatedData.name || form.name,
        email: updatedData.email || form.email,
        major: updatedData.major || form.major,
        classification: updatedData.classification || form.classification,
      });

      alert("Profile saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert(err.message || "Error saving profile.");
    } finally {
      setSaving(false);
    }
  }

  // Back to Dashboard
  function goBack() {
    nav("/dashboard");
  }

  // Logout
  function logout() {
    localStorage.clear();
    nav("/login");
  }

  if (loading) {
    return <div className="profile-card">Loading profile...</div>;
  }

return (
  <div className="profile-card" style={{ position: 'relative', paddingTop: '60px' }}>
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

      <h2 className="profile-title">Profile</h2>

      <label>Name</label>
      <input
        className="input"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        placeholder="Enter your name"
      />

      <label>Email</label>
      <input
        className="input"
        type="email"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        placeholder="Enter your email"
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

      <div className="profile-actions">
        <button 
          className="btn-orange" 
          onClick={saveProfile}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}