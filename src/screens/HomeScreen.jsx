import React, { useState } from "react";
import { loadMazes, loadHOF, getStats } from "../utils/storage";

export default function HomeScreen({ onPlay, onBuild, onRunShared, onViewMazes, onViewHOF }) {
  const [difficulty, setDifficulty] = useState("easy");
  const stats = getStats();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🌀 MazeDuel</h1>
      <p style={styles.sub}>No login. No cloud. Pure maze.</p>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Single Player</h2>
        <div style={styles.row}>
          {["easy","medium","hard"].map(d => (
            <button key={d} onClick={() => setDifficulty(d)}
              style={{ ...styles.diffBtn,
                background: difficulty === d ? "#00ff88" : "#0f3460",
                color: difficulty === d ? "#000" : "#fff" }}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => onPlay(difficulty)} style={styles.primaryBtn}>
          ▶ Play Now
        </button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Two Players</h2>
        <div style={styles.row}>
          <button onClick={onBuild} style={styles.secondaryBtn}>🔨 Build Maze</button>
          <button onClick={onRunShared} style={styles.secondaryBtn}>📥 Run Friend's Maze</button>
        </div>
      </div>

      <div style={styles.row}>
        <button onClick={onViewMazes} style={styles.ghostBtn}>📁 My Mazes ({loadMazes().length})</button>
        <button onClick={onViewHOF}   style={styles.ghostBtn}>🏆 Hall of Fame</button>
      </div>

      <p style={styles.statsText}>
        🎮 Played: {stats.played} &nbsp;|&nbsp; 🪙 Coins: {stats.coins}
      </p>
    </div>
  );
}

const styles = {
  container: { minHeight:"100vh", background:"#0a0a1a", color:"#fff",
               display:"flex", flexDirection:"column", alignItems:"center",
               justifyContent:"center", padding:20, fontFamily:"monospace" },
  title:     { fontSize:42, margin:0, color:"#00ff88", textShadow:"0 0 20px #00ff88" },
  sub:       { color:"#888", marginBottom:20 },
  card:      { background:"#16213e", borderRadius:12, padding:"20px 28px",
               marginBottom:16, width:"100%", maxWidth:400,
               border:"1px solid #0f3460" },
  sectionTitle: { margin:"0 0 12px 0", fontSize:18, color:"#00ff88" },
  row:       { display:"flex", gap:10, flexWrap:"wrap", marginBottom:10 },
  diffBtn:   { flex:1, padding:"10px 0", borderRadius:8, border:"none",
               cursor:"pointer", fontWeight:"bold", fontSize:14 },
  primaryBtn:{ width:"100%", padding:14, background:"#00ff88", color:"#000",
               border:"none", borderRadius:10, fontWeight:"bold",
               fontSize:16, cursor:"pointer", marginTop:4 },
  secondaryBtn: { flex:1, padding:12, background:"#0f3460", color:"#fff",
                  border:"1px solid #00ff8844", borderRadius:8,
                  cursor:"pointer", fontSize:14 },
  ghostBtn:  { flex:1, padding:10, background:"transparent", color:"#888",
               border:"1px solid #333", borderRadius:8, cursor:"pointer" },
  statsText: { color:"#555", marginTop:12, fontSize:13 },
};
