import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{color:'#BF5700'}}>UT Registration</h2>

        <label>Email</label>
        <input 
          value={email} 
          onChange={e=>setEmail(e.target.value)}
          placeholder='netid@utexas.edu'
          style={styles.input}
        />

        <label>Password</label>
        <input type='password' style={styles.input} />

        <button style={styles.button} onClick={()=>nav('/dashboard')}>
          Sign In
        </button>
      </div>
    </div>
  );
}

const styles = {
  container:{display:'flex',justifyContent:'center',paddingTop:80,fontFamily:'Arial'},
  card:{background:'white',padding:30,borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,0.1)',width:350},
  input:{width:'100%',padding:10,borderRadius:6,border:'1px solid #ccc',marginBottom:10},
  button:{width:'100%',padding:12,background:'#BF5700',color:'white',border:'none',borderRadius:6,marginTop:10, cursor:'pointer'}
};
