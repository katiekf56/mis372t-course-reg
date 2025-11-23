import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';

export default function Login() {
  const nav = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    
    // Validate inputs
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful!", userCredential.user);
      nav('/dashboard');
    } catch (err) {
      console.error("Full error:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      
      // Show more specific error messages
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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{color:'#BF5700'}}>UT Registration</h2>

        {error && <p style={{color:'red', fontSize: 14, marginBottom: 10}}>{error}</p>}

        <label>Email</label>
        <input 
          value={email} 
          onChange={e=>setEmail(e.target.value)}
          placeholder='netid@utexas.edu'
          style={styles.input}
        />

        <label>Password</label>
        <input 
          type='password' 
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
          style={styles.input}
        />

        <button style={styles.button} onClick={handleLogin}>
          Sign In
        </button>
      </div>
    </div>
  );
}

const styles = {
  container:{display:'flex',justifyContent:'center',paddingTop:80,fontFamily:'Arial', minHeight:'100vh', backgroundColor:'#f0f0f0'},
  card:{background:'white',padding:30,borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,0.1)',width:350},
  input:{width:'100%',padding:10,borderRadius:6,border:'1px solid #ccc',marginBottom:10},
  button:{width:'100%',padding:12,background:'#BF5700',color:'white',border:'none',borderRadius:6,marginTop:10, cursor:'pointer'}
};