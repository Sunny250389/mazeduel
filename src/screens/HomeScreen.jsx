import React, { useState } from "react";
import { loadMazes, getStats } from "../utils/storage";

const TILES = [
  { icon: "🟢", name: "You",    desc: "Your player character" },
  { icon: "S",  name: "Start",  desc: "Where you begin" },
  { icon: "E",  name: "Exit",   desc: "Reach this to win" },
  { icon: "🪙", name: "Coin",   desc: "Collect for bonus score" },
  { icon: "🔑", name: "Key",    desc: "Collect before the door" },
  { icon: "🚪", name: "Door",   desc: "Blocked until you have key" },
  { icon: "⚡", name: "Trap",   desc: "Lose 5 seconds instantly" },
  { icon: "◎",  name: "Portal", desc: "Teleports you across maze" },
];

export default function HomeScreen({ onPlay, onBuild, onRunShared, onViewMazes, onViewHOF }) {
  const [difficulty, setDifficulty] = useState("easy");
  const [showHow, setShowHow]       = useState(false);
  const stats = getStats();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🌀 MazeDuel</h1>
      <p style={styles.sub}>No login. No cloud. Pure maze.</p>

      {/* Single Player */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Single Player</h2>
        <div style={styles.row}>
          {["easy","medium","hard"].map(d => (
            <button key={d} onClick={() => setDifficulty(d)}
              style={{ ...styles.diffBtn,
                background: difficulty === d ? "#00ff88" : "#0f3460",
                color:      difficulty === d ? "#000"    : "#fff" }}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        {/* Difficulty preview */}
        <div style={styles.diffInfo}>
          {difficulty === "easy"   && <span>🗺 11×11 &nbsp;⚡ 1 trap &nbsp;⏱ 60s</span>}
          {difficulty === "medium" && <span>🗺 15×15 &nbsp;⚡ 2 traps &nbsp;🔑 1 key &nbsp;⏱ 90s</span>}
          {difficulty === "hard"   && <span>🗺 21×21 &nbsp;⚡ 5 traps &nbsp;🔑 2 keys &nbsp;◎ portals &nbsp;⏱ 150s</span>}
        </div>

        <button onClick={() => onPlay(difficulty)} style={styles.primaryBtn}>
          ▶ Play Now
        </button>
      </div>

      {/* Two Players */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Two Players</h2>
        <div style={styles.row}>
          <button onClick={onBuild}     style={styles.secondaryBtn}>🔨 Build Maze</button>
          <button onClick={onRunShared} style={styles.secondaryBtn}>📥 Friend's Maze</button>
        </div>
      </div>

      {/* How to Play — collapsible */}
      <div style={styles.card}>
        <button onClick={() => setShowHow(h => !h)} style={styles.howToggle}>
          {showHow ? "▲" : "▼"} &nbsp; How to Play
        </button>

        {showHow && (
          <div style={styles.howBody}>

            <p style={styles.howText}>
              Navigate from <b style={{color:"#00ff88"}}>S</b> to <b style={{color:"#ff6b35"}}>E</b> before
              time runs out. The closer your path to the optimal route, the higher your efficiency score ⭐
            </p>

            <div style={styles.howSection}>
              <b style={styles.howLabel}>🕹 Controls</b>
              <div style={styles.howGrid2}>
                <span>📱 Mobile</span><span style={{color:"#aaa"}}>Swipe on maze OR use D-pad</span>
                <span>💻 Web</span>   <span style={{color:"#aaa"}}>Arrow keys or WASD</span>
              </div>
            </div>

            <div style={styles.howSection}>
              <b style={styles.howLabel}>🗺 Tile Guide</b>
              <div style={styles.tileGrid}>
                {TILES.map(t => (
                  <div key={t.name} style={styles.tileRow}>
                    <span style={styles.tileIcon}>{t.icon}</span>
                    <span style={styles.tileName}>{t.name}</span>
                    <span style={styles.tileDesc}>{t.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.howSection}>
              <b style={styles.howLabel}>📊 Efficiency Score</b>
              <div style={styles.howGrid2}>
                <span>⭐⭐⭐⭐</span><span style={{color:"#aaa"}}>90–100% — Perfect run</span>
                <span>⭐⭐⭐</span>  <span style={{color:"#aaa"}}>75–89% — Great run</span>
                <span>⭐⭐</span>    <span style={{color:"#aaa"}}>55–74% — Good run</span>
                <span>⭐</span>      <span style={{color:"#aaa"}}>Below 55% — Keep trying!</span>
              </div>
            </div>

            <div style={styles.howSection}>
              <b style={styles.howLabel}>💡 Tips</b>
              <ul style={styles.tipList}>
                <li>🪙 Coins mark good paths — follow them</li>
                <li>🔑 Always grab the Key before heading to Exit</li>
                <li>⚡ Traps appear on dead ends — avoid or lose 5s</li>
                <li>◎ Portals on Hard can be shortcuts</li>
              </ul>
            </div>

          </div>
        )}
      </div>

      {/* Bottom Nav */}
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
  container:    { minHeight:"100vh", background:"#0a0a1a", color:"#fff",
                  display:"flex", flexDirection:"column", alignItems:"center",
                  justifyContent:"center", padding:"20px 16px", fontFamily:"monospace" },
  title:        { fontSize:42, margin:0, color:"#00ff88", textShadow:"0 0 20px #00ff88" },
  sub:          { color:"#888", marginBottom:20 },
  card:         { background:"#16213e", borderRadius:12, padding:"20px 24px",
                  marginBottom:14, width:"100%", maxWidth:420, border:"1px solid #0f3460" },
  sectionTitle: { margin:"0 0 12px 0", fontSize:18, color:"#00ff88" },
  row:          { display:"flex", gap:10, flexWrap:"wrap", marginBottom:10 },
  diffBtn:      { flex:1, padding:"10px 0", borderRadius:8, border:"none",
                  cursor:"pointer", fontWeight:"bold", fontSize:14 },
  diffInfo:     { color:"#aaa", fontSize:12, marginBottom:10, textAlign:"center" },
  primaryBtn:   { width:"100%", padding:14, background:"#00ff88", color:"#000",
                  border:"none", borderRadius:10, fontWeight:"bold",
                  fontSize:16, cursor:"pointer", marginTop:4 },
  secondaryBtn: { flex:1, padding:12, background:"#0f3460", color:"#fff",
                  border:"1px solid #00ff8844", borderRadius:8, cursor:"pointer", fontSize:14 },
  ghostBtn:     { flex:1, padding:10, background:"transparent", color:"#888",
                  border:"1px solid #333", borderRadius:8, cursor:"pointer" },
  statsText:    { color:"#555", marginTop:12, fontSize:13 },
  howToggle:    { width:"100%", background:"transparent", color:"#00ff88",
                  border:"none", cursor:"pointer", fontSize:16,
                  fontWeight:"bold", textAlign:"left", fontFamily:"monospace", padding:0 },
  howBody:      { marginTop:14 },
  howText:      { color:"#ccc", fontSize:13, marginBottom:12, lineHeight:1.6 },
  howSection:   { marginBottom:14 },
  howLabel:     { color:"#ffd700", fontSize:13, display:"block", marginBottom:6 },
  howGrid2:     { display:"grid", gridTemplateColumns:"auto 1fr",
                  gap:"4px 12px", fontSize:12, alignItems:"center" },
  tileGrid:     { display:"flex", flexDirection:"column", gap:5 },
  tileRow:      { display:"grid", gridTemplateColumns:"32px 64px 1fr",
                  alignItems:"center", gap:8, fontSize:12 },
  tileIcon:     { fontSize:16, textAlign:"center" },
  tileName:     { color:"#00ff88", fontWeight:"bold" },
  tileDesc:     { color:"#aaa" },
  tipList:      { margin:"4px 0 0 0", padding:"0 0 0 4px",
                  listStyle:"none", fontSize:12, color:"#ccc",
                  display:"flex", flexDirection:"column", gap:5 },
};
