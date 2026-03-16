import React, { useState } from "react";
import { T } from "../utils/mazeGenerator";

const CELL = 28;
const TOOLS = [
  { tile: T.WALL,  label:"🧱 Wall" },
  { tile: T.PATH,  label:"⬜ Erase" },
  { tile: T.START, label:"🟢 Start" },
  { tile: T.EXIT,  label:"🔴 Exit" },
  { tile: T.KEY,   label:"🔑 Key" },
  { tile: T.DOOR,  label:"🚪 Door" },
  { tile: T.TRAP,  label:"⚡ Trap" },
  { tile: T.COIN,  label:"🪙 Coin" },
];

const COLORS = {
  [T.WALL]:"#1a1a2e",[T.PATH]:"#16213e",[T.START]:"#00ff88",
  [T.EXIT]:"#ff6b35",[T.KEY]:"#ffd700",[T.DOOR]:"#8b4513",
  [T.TRAP]:"#ff0040",[T.COIN]:"#ffd700",
};

function emptyGrid(size) {
  return Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) =>
      (y === 0 || y === size-1 || x === 0 || x === size-1) ? T.WALL : T.PATH
    )
  );
}

export default function BuildScreen({ onDone, onCancel }) {
  const [size, setSize] = useState(11);
  const [grid, setGrid] = useState(() => emptyGrid(11));
  const [tool, setTool] = useState(T.WALL);
  const [painting, setPainting] = useState(false);

  const paint = (x, y) => {
    setGrid(g => {
      const ng = g.map(r => [...r]);
      ng[y][x] = tool;
      return ng;
    });
  };

  const changeSize = (s) => { setSize(s); setGrid(emptyGrid(s)); };

  const validate = () => {
    let hasStart = false, hasExit = false;
    for (let y=0;y<size;y++) for (let x=0;x<size;x++) {
      if (grid[y][x] === T.START) hasStart = true;
      if (grid[y][x] === T.EXIT)  hasExit  = true;
    }
    return hasStart && hasExit;
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔨 Build Your Maze</h2>

      <div style={styles.row}>
        {[11,15,21].map(s => (
          <button key={s} onClick={() => changeSize(s)}
            style={{ ...styles.sizeBtn, background: size===s ? "#00ff88":"#0f3460",
                     color: size===s ? "#000":"#fff" }}>
            {s}×{s}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10, maxWidth:380 }}>
        {TOOLS.map(t => (
          <button key={t.tile} onClick={() => setTool(t.tile)}
            style={{ ...styles.toolBtn, outline: tool===t.tile ? "2px solid #00ff88":"none" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ border:"2px solid #0f3460", display:"inline-block" }}
        onMouseLeave={() => setPainting(false)}>
        {grid.map((row, y) => (
          <div key={y} style={{ display:"flex" }}>
            {row.map((cell, x) => (
              <div key={x}
                style={{ width:CELL, height:CELL, background:COLORS[cell]??"#16213e",
                         boxSizing:"border-box", cursor:"crosshair",
                         border:"1px solid #0f3460", display:"flex",
                         alignItems:"center", justifyContent:"center", fontSize:14 }}
                onMouseDown={() => { setPainting(true); paint(x,y); }}
                onMouseEnter={() => { if (painting) paint(x,y); }}
                onMouseUp={() => setPainting(false)}
                onTouchStart={() => paint(x,y)}>
                {cell===T.START?"S":cell===T.EXIT?"E":""}
              </div>
            ))}
          </div>
        ))}
      </div>

      <p style={{ color:"#888", fontSize:12, marginTop:8 }}>
        💡 Place Start (S) and Exit (E) first. Paint walls by dragging.
      </p>

      <div style={styles.row}>
        <button style={styles.primaryBtn}
          onClick={() => validate()
            ? onDone({ grid, width:size, height:size })
            : alert("Place both a Start 🟢 and Exit 🔴 tile!")}>
          ✅ Done – Hide & Pass
        </button>
        <button style={styles.ghostBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight:"100vh", background:"#0a0a1a", color:"#fff",
               display:"flex", flexDirection:"column", alignItems:"center",
               padding:16, fontFamily:"monospace" },
  title:     { color:"#00ff88", marginBottom:12 },
  row:       { display:"flex", gap:8, marginBottom:10, flexWrap:"wrap", justifyContent:"center" },
  sizeBtn:   { padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontWeight:"bold" },
  toolBtn:   { padding:"6px 10px", background:"#16213e", color:"#fff",
               border:"1px solid #0f3460", borderRadius:6, cursor:"pointer", fontSize:12 },
  primaryBtn:{ padding:"12px 24px", background:"#00ff88", color:"#000",
               border:"none", borderRadius:8, fontWeight:"bold", cursor:"pointer" },
  ghostBtn:  { padding:"12px 18px", background:"transparent", color:"#888",
               border:"1px solid #333", borderRadius:8, cursor:"pointer" },
};
