import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';
const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      // Firebase auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful!", userCredential.user);

      // Lookup student in backend by email
        const res = await fetch(
          `${API}/api/students/email/${email}`
        );
      const data = await res.json();

      if (!data || !data.student_id) {
        setError("User exists in Firebase but not in Course Registration DB.");
        return;
      }

      // Store for later use
      localStorage.setItem("student_id", data.student_id);

      nav('/dashboard');
    } catch (err) {
      console.error("Full error:", err);
      if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/user-not-found') {
        setError("No user found with this email.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password.");
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="page-title">UT Course Registration</h2>

        {error && <div className="error-text">{error}</div>}

        <label className="label">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="netid@utexas.edu"
          className="input"
        />

        <label className="label">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input"
        />

        <button className="btn-orange full-width" onClick={handleLogin}>
          Sign In
        </button>
      </div>
    </div>
  );
}
