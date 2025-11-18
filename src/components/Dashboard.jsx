import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const sampleCourses = [
  { id:1, code:'MIS 301', title:'Intro to MIS', prof:'Smith', time:'MWF 10–11' },
  { id:2, code:'MIS 373', title:'Software Dev', prof:'Turner', time:'TTh 2–3:30' },
  { id:3, code:'ACC 311', title:'Financial Accounting', prof:'Davis', time:'MWF 1–2' }
];

export default function Dashboard() {
  const [cart, setCart] = useState([]);
  const nav = useNavigate();

  function addCourse(c) {
    if (!cart.find(x=>x.id===c.id)) setCart([...cart,c]);
  }

  return (
    <>
      <header style={styles.header}>UT Course Registration</header>

      <div style={styles.container}>
        <h2>Welcome to UT Course Registration</h2>

        <div style={styles.actionRow}>
          <button style={styles.actionBtn} onClick={() => nav("/search")}>
            🔍 Search Course Schedule
          </button>

          <button style={styles.actionBtn} onClick={() => nav("/add-class")}>
            ➕ Add New Class
          </button>
        </div>

        <button style={styles.actionBtn} onClick={() => nav("/profile")}>
          👤 Profile
        </button>

        <h2>Browse Courses</h2>
        <table style={styles.table}>
          <thead>
            <tr><th>Course</th><th>Title</th><th>Professor</th><th>Time</th><th></th></tr>
          </thead>
          <tbody>
            {sampleCourses.map(c=>(
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.title}</td>
                <td>{c.prof}</td>
                <td>{c.time}</td>
                <td>
                  <button style={styles.addBtn} onClick={()=>addCourse(c)}>Add</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button 
          style={styles.cartBtn}
          onClick={()=>nav('/cart', { state:{cart} })}
        >
          View Cart ({cart.length})
        </button>
      </div>
    </>
  );
}

const styles = {
  header:{background:'#BF5700',color:'white',padding:20,fontSize:22},
  container:{padding:20,fontFamily:'Arial'},
  table:{width:'100%',borderCollapse:'collapse',marginTop:20},
  addBtn:{padding:'6px 10px',background:'#BF5700',color:'white',border:'none',borderRadius:6,cursor:'pointer'},
  cartBtn:{marginTop:20,padding:'10px 16px',background:'#333',color:'white',border:'none',borderRadius:6,cursor:'pointer'},
  actionRow:{display:'flex',gap:'12px',marginBottom:'20px'},
  actionBtn:{padding:'10px 16px',background:'#BF5700',color:'white',border:'none',borderRadius:6,cursor:'pointer'}
};
