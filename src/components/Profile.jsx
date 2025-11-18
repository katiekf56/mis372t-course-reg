import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const nav = useNavigate();

  // Example user state
  const [user, setUser] = useState({
    name: "Aaron Mullins",
    email: "netid@utexas.edu",
    major: "Management Information Systems",
    classification: "Junior"
  });

  function update(field, value) {
    setUser({ ...user, [field]: value });
  }

  function logout() {
    // In a real app you'd clear auth state/session
    nav("/");
  }

  return (
    <>
      <header style={styles.header}>My Profile</header>

      <div style={styles.container}>
        <h2>Student Information</h2>

        <label>Name</label>
        <input
          style={styles.input}
          value={user.name}
          onChange={(e) => update("name", e.target.value)}
        />

        <label>Email</label>
        <input
          style={styles.input}
          value={user.email}
          onChange={(e) => update("email", e.target.value)}
        />

        <label>Major</label>
        <input
          style={styles.input}
          value={user.major}
          onChange={(e) => update("major", e.target.value)}
        />

        <label>Classification</label>
        <input
          style={styles.input}
          value={user.classification}
          onChange={(e) => update("classification", e.target.value)}
        />

        <button style={styles.saveBtn}>Save Changes</button>

        <h2 style={{ marginTop: 40 }}>Student Tools</h2>

        <div style={styles.menu}>
          <button style={styles.menuBtn} onClick={() => nav("/cart")}>
            📦 Registration Cart
          </button>

          <button style={styles.menuBtn} onClick={() => nav("/waitlist")}>
            ⏳ Waitlist
          </button>

          <button style={styles.menuBtn} onClick={() => nav("/schedule")}>
            📆 Current Schedule
          </button>

          <button style={styles.menuBtn} onClick={() => nav("/previous")}>
            📚 Previous Classes
          </button>

          <button style={styles.logoutBtn} onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  );
}

const styles = {
  header: { background: "#BF5700", color: "white", padding: 20, fontSize: 22 },
  container: { padding: 20, fontFamily: "Arial" },
  input: {
    padding: 12,
    width: "100%",
    borderRadius: 6,
    border: "1px solid #ccc",
    marginBottom: 12
  },
  saveBtn: {
    padding: "12px 20px",
    background: "#BF5700",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    marginTop: 10
  },
  menu: { marginTop: 20, display: "flex", flexDirection: "column", gap: 12 },
  menuBtn: {
    padding: "12px",
    background: "#333",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    textAlign: "left"
  },
  logoutBtn: {
    padding: "12px",
    background: "#a30000",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    textAlign: "left",
    marginTop: 20
  }
};
