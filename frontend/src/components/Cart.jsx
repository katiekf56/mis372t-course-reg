import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Cart() {
  const location = useLocation();
  const nav = useNavigate();
  const cart = location.state?.cart || [];

  return (
    <>
      <header style={styles.header}>Your Registration Cart</header>
      <div style={styles.container}>
        {cart.length === 0 && <p>No courses added yet.</p>}

        {cart.map(c=>(
          <div key={c.id} style={styles.item}>
            <b>{c.code}</b> — {c.title} ({c.time})
          </div>
        ))}

        <button style={styles.backBtn} onClick={()=>nav('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </>
  );
}

const styles = {
  header:{background:'#BF5700',color:'white',padding:20,fontSize:22},
  container:{padding:20,fontFamily:'Arial'},
  item:{marginBottom:10},
  backBtn:{marginTop:20,padding:'10px 16px',background:'#333',color:'white',border:'none',borderRadius:6,cursor:'pointer'}
};
