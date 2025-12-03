import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bannerImg from "../UT-Full-Stack-Image.avif";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const nav = useNavigate();
  const studentId = localStorage.getItem("student_id");

  // -----------------------------
  // FETCH COURSES
  // -----------------------------
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
            (c.time_start || "TBD") +
            " - " +
            (c.time_end || "TBD")
        }));
        setCourses(formatted);
      })
      .catch(err => console.log(err));
  }, []);

  // -----------------------------
  // REGISTER FOR CLASS
  // -----------------------------
  async function register(c) {
    if (!studentId) {
      alert("You must be logged in.");
      return;
    }

    try {
      const res = await fetch(
        "https://mis372t-course-reg-backend.onrender.com/api/registrations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: studentId,
            course_id: c.id
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Could not add class.");
        return;
      }

      alert("Class added to your schedule!");
    } catch (err) {
      console.error(err);
      alert("Error adding class.");
    }
  }

  // -----------------------------
  // AI QUERY HANDLER (Azure OpenAI)
  // -----------------------------
  async function askAI() {
    if (!aiQuery.trim()) return;

    const endpoint = import.meta.env.VITE_AZURE_ENDPOINT;
    const apiKey = import.meta.env.VITE_AZURE_API_KEY;
    const deployment = import.meta.env.VITE_AZURE_DEPLOYMENT;

    try {
      const res = await fetch(
        `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey
          },
          body: JSON.stringify({
            messages: [
              { role: "user", content: aiQuery }
            ],
            max_tokens: 200
          })
        }
      );

      const data = await res.json();

      setAiResponse(
        data?.choices?.[0]?.message?.content || "No response generated."
      );
    } catch (err) {
      console.error(err);
      setAiResponse("AI service error — check console.");
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
            placeholder="Ask the AI anything about courses…"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
          />

          <button className="btn-orange" onClick={askAI}>
            Ask AI
          </button>

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
            {courses.map(c => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.title}</td>
                <td>{c.prof}</td>
                <td>{c.time}</td>
                <td>
                  <button className="btn-orange small" onClick={() => register(c)}>
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
