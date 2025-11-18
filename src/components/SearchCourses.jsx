import React, { useState } from 'react';

export default function SearchCourses() {
  const [query, setQuery] = useState('');

  return (
    <>
      <header style={styles.header}>Search Course Schedule</header>

      <div style={styles.container}>
        <input
          style={styles.input}
          placeholder='Search by course code, title, professor…'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <p style={{marginTop:20, opacity:0.7}}>(Search results will appear here in future enhancements)</p>
      </div>
    </>
  );
}

const styles = {
  header:{background:'#BF5700',color:'white',padding:20,fontSize:22},
  container:{padding:20,fontFamily:'Arial'},
  input:{padding:12,width:'100%',borderRadius:6,border:'1px solid #ccc'}
};
