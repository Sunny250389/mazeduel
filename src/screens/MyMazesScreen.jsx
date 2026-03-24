import React, { useState } from "react";
import { loadMazes } from "../utils/storage";
import { encodeMaze } from "../utils/mazeGenerator";

export default function MyMazesScreen({ onPlay, onBack }) {
  const mazes = loadMazes();
  const [copiedId, setCopiedId] = useState(null);

  const handleShare = async (maze, index) => {
    try {
      await navigator.clipboard.writeText(encodeMaze(maze));
      setCopiedId(index);
      setTimeout(() => setCopiedId((current) => (current === index ? null : current)), 1500);
    } catch (error) {
      setCopiedId(null);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📁 My Saved Mazes</h2>
      {mazes.length === 0 && <p style={{ color: "#555" }}>No saved mazes yet. Play some!</p>}
      {mazes.map((m, i) => (
        <div key={i} style={styles.card}>
          <div>
            <b style={{ color: "#00ff88" }}>
              {m.difficulty?.toUpperCase()} {m.width}×{m.height}
            </b>
            <span style={{ color: "#888", marginLeft: 10, fontSize: 12 }}>{m.date}</span>
          </div>
          <div style={{ color: "#ffd700" }}>Best: {m.bestEff}%</div>
          <div style={styles.row}>
            <button style={styles.btn} onClick={() => onPlay(m)}>
              ▶ Play Again
            </button>
            <button style={styles.ghostBtn} onClick={() => handleShare(m, i)}>
              {copiedId === i ? "✅ Copied" : "📋 Share Code"}
            </button>
          </div>
        </div>
      ))}
      <button style={styles.backBtn} onClick={onBack}>
        ← Back
      </button>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#0a0a1a", color: "#fff", padding: 20, fontFamily: "monospace" },
  title: { color: "#00ff88" },
  card: { background: "#16213e", border: "1px solid #0f3460", borderRadius: 10, padding: 16, marginBottom: 12, maxWidth: 400 },
  row: { display: "flex", gap: 8, marginTop: 10 },
  btn: {
    padding: "8px 16px",
    background: "#00ff88",
    color: "#000",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
  },
  ghostBtn: { padding: "8px 12px", background: "transparent", color: "#aaa", border: "1px solid #333", borderRadius: 6, cursor: "pointer" },
  backBtn: { marginTop: 20, background: "transparent", color: "#555", border: "none", cursor: "pointer", fontSize: 14 },
};
