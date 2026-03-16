import React from "react";
import { loadHOF } from "../utils/storage";

export default function HOFScreen({ onBack }) {
  const hof = loadHOF();
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏆 Hall of Fame</h2>
      {hof.length === 0 && <p style={{ color:"#555" }}>Beat a maze to make the leaderboard!</p>}
      {hof.map((entry, i) => (
        <div key={i} style={styles.row}>
          <span style={styles.rank}>#{i+1}</span>
          <span style={{ color:"#00ff88", flex:1 }}>{entry.difficulty?.toUpperCase()}</span>
          <span style={{ color:"#ffd700" }}>{entry.efficiency}%</span>
          <span style={{ color:"#888", fontSize:12, marginLeft:10 }}>{entry.date}</span>
        </div>
      ))}
      <button style={styles.backBtn} onClick={onBack}>← Back</button>
    </div>
  );
}

const styles = {
  container: { minHeight:"100vh", background:"#0a0a1a", color:"#fff",
               padding:20, fontFamily:"monospace" },
  title:     { color:"#ffd700" },
  row:       { display:"flex", alignItems:"center", gap:10,
               background:"#16213e", borderRadius:8, padding:"12px 16px",
               marginBottom:8, maxWidth:400 },
  rank:      { color:"#ffd700", fontWeight:"bold", minWidth:30 },
  backBtn:   { marginTop:20, background:"transparent", color:"#555",
               border:"none", cursor:"pointer", fontSize:14 },
};
