import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bannerImg from "../UT-Full-Stack-Image.avif";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const nav = useNavigate();
  const studentId = localStorage.getItem("student_id");
  const API = import.meta.env.VITE_API_BASE || "http://localhost:5001";

  // -----------------------------
  // FORMAT TIME → "4:00 PM"
  // -----------------------------
  function formatTime(t) {
    if (!t) return "TBD";

    let [h, m] = t.split(":");
    h = Number(h);
    m = Number(m);

    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;

    return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  // -----------------------------
  // FETCH COURSES
  // -----------------------------
  useEffect(() => {
    fetch(`${API}/api/courses`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((c) => ({
          id: c.course_id,
          code: c.course_code,
          title: c.title,
          prof: c.professor,
          time: `${formatTime(c.time_start)} - ${formatTime(c.time_end)}`
        }));
        setCourses(formatted);
      })
      .catch((err) => console.log(err));
  }, []);

  // -----------------------------
  // REGISTER FOR CLASS
  // -----------------------------
  async function register(c) {
    console.log("REGISTER CLICKED:", c);

    if (!studentId) {
      alert("You must be logged in.");
      return;
    }

    try {
      console.log("Sending POST:", `${API}/api/registrations`);
      console.log("Payload:", {
        student_id: Number(studentId),
        course_id: Number(c.id)
      });

      const res = await fetch(`${API}/api/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: Number(studentId),
          course_id: Number(c.id)
        })
      });

      const data = await res.json();
      console.log("Response:", data);

      if (!res.ok) {
        alert(data.error || "Could not add class.");
        return;
      }

      alert("Class added to your schedule!");
      window.dispatchEvent(new Event("registrationsChanged"));
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      alert("Error adding class.");
    }
  }

  // -----------------------------
  // AI QUERY HANDLER
  // -----------------------------
  async function askAI() {
    if (!aiQuery.trim()) return;

    const endpoint = import.meta.env.VITE_AZURE_ENDPOINT;
    const apiKey = import.meta.env.VITE_AZURE_API_KEY;
    const deployment = import.meta.env.VITE_AZURE_DEPLOYMENT;

    // Defensive: ensure endpoint and deployment are present
    if (!endpoint || !apiKey || !deployment) {
      console.error('AI config missing: endpoint, apiKey, or deployment not set');
      setAiResponse('AI configuration missing. Check VITE_AZURE_* env variables.');
      return;
    }

    // Normalize endpoint so we don't accidentally concatenate without a slash
    const base = endpoint.replace(/\/$/, '');
    const url = `${base}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`;

    try {
      const res = await fetch(url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: aiQuery }],
            max_tokens: 200
          })
        }
      );

      const data = await res.json();
      setAiResponse(data?.choices?.[0]?.message?.content || "No response.");
    } catch (err) {
      console.error(err);
      setAiResponse("AI service error.");
    }
  }

  return (
    <>
      {/* Banner */}
      <div className="banner">
        <img src={bannerImg} alt="UT Campus" className="banner-img" />
        <h1 className="banner-title">UT Course Registration</h1>
      </div>

      <div className="container">
        <h2 className="page-title">Welcome to UT Course Registration</h2>

        {/* BUTTON BAR */}
        <div className="button-bar">
          <button className="btn-orange" onClick={() => nav("/search")}>
            🔍 Search Course Schedule
          </button>
          <button className="btn-orange" onClick={() => nav("/add-class")}>
            ➕ Add New Class
          </button>
          <button className="btn-orange" onClick={() => nav("/profile")}>
            👤 Profile
          </button>
          <button className="btn-orange" onClick={() => nav("/schedule")}>
            🗂️ View My Classes
          </button>
        </div>

        {/* AI BOX */}
        <div className="ai-box">
          <input
            className="input ai-input"
            placeholder="Ask the AI anything…"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
          />
          <button className="btn-orange" onClick={askAI}>Ask AI</button>

          {aiResponse && (
            <div className="ai-response">
              <strong>AI Response:</strong>
              <p>{aiResponse}</p>
            </div>
          )}
        </div>

        {/* COURSE TABLE */}
        <h2 className="section-title">Browse Courses</h2>

        <table className="table">
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
            {courses.map((c) => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.title}</td>
                <td>{c.prof}</td>
                <td>{c.time}</td>
                <td>
                  <button
                    className="btn-orange small"
                    onClick={() => register(c)}
                  >
                    Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
