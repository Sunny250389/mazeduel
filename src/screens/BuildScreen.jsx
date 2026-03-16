import React, { useState, useRef } from "react";
import { T, encodeMaze } from "../utils/mazeGenerator";

const TOOLS = [
  { tile: T.WALL,  label:"🧱", name:"Wall"  },
  { tile: T.PATH,  label:"⬜", name:"Erase" },
  { tile: T.START, label:"S",  name:"Start" },
  { tile: T.EXIT,  label:"E",  name:"Exit"  },
  { tile: T.KEY,   label:"🔑", name:"Key"   },
  { tile: T.DOOR,  label:"🚪", name:"Door"  },
  { tile: T.TRAP,  label:"⚡", name:"Trap"  },
  { tile: T.COIN,  label:"🪙", name:"Coin"  },
];

const COLORS = {
  [T.WALL]:"#1a1a2e", [T.PATH]:"#16213e", [T.START]:"#00ff88",
  [T.EXIT]:"#ff6b35", [T.KEY]:"#ffd700",  [T.DOOR]:"#8b4513",
  [T.TRAP]:"#ff0040", [T.COIN]:"#ffd700",
};

const LABELS = {
  [T.START]:"S", [T.EXIT]:"E", [T.KEY]:"🔑",
  [T.DOOR]:"🚪", [T.TRAP]:"⚡", [T.COIN]:"🪙",
};

function emptyGrid(size) {
  return Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) =>
      (y === 0 || y === size-1 || x === 0 || x === size-1) ? T.WALL : T.PATH
    )
  );
}

export default function BuildScreen({ onDone, onCancel }) {
  const [size,      setSize]      = useState(11);
  const [grid,      setGrid]      = useState(() => emptyGrid(11));
  const [tool,      setTool]      = useState(T.WALL);
  const [shareCode, setShareCode] = useState(null);
  const [copied,    setCopied]    = useState(false);
  const isPainting  = useRef(false);
  const gridRef     = useRef(grid);
  const containerRef = useRef(null);

  const updateGrid = (newGrid) => {
    gridRef.current = newGrid;
    setGrid(newGrid);
  };

  const changeSize = (s) => {
    setSize(s);
    const ng = emptyGrid(s);
    gridRef.current = ng;
    setGrid(ng);
    setShareCode(null);
  };

  const paintCell = (x, y) => {
    const g = gridRef.current;
    if (y === 0 || y === size-1 || x === 0 || x === size-1) return;
    if (g[y][x] === tool) return;
    if (tool === T.START || tool === T.EXIT) {
      const ng = g.map(r => [...r]);
      for (let row=0; row<size; row++)
        for (let col=0; col<size; col++)
          if (ng[row][col] === tool) ng[row][col] = T.PATH;
      ng[y][x] = tool;
      updateGrid(ng);
    } else {
      const ng = g.map(r => [...r]);
      ng[y][x] = tool;
      updateGrid(ng);
    }
  };

  const getCellFromTouch = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    const cellSize = Math.floor(rect.width / size);
    const x = Math.floor((touch.clientX - rect.left) / cellSize);
    const y = Math.floor((touch.clientY - rect.top)  / cellSize);
    if (x >= 0 && y >= 0 && x < size && y < size) return { x, y };
    return null;
  };

  const handleTouchStart = (e) => { e.preventDefault(); isPainting.current = true; const c = getCellFromTouch(e); if (c) paintCell(c.x, c.y); };
  const handleTouchMove  = (e) => { e.preventDefault(); if (!isPainting.current) return; const c = getCellFromTouch(e); if (c) paintCell(c.x, c.y); };
  const handleTouchEnd   = ()  => { isPainting.current = false; };
  const handleMouseDown  = (x, y) => { isPainting.current = true;  paintCell(x, y); };
  const handleMouseEnter = (x, y) => { if (isPainting.current) paintCell(x, y); };
  const handleMouseUp    = ()      => { isPainting.current = false; };

  const validate = () => {
    let hasStart = false, hasExit = false;
    for (let y=0; y<size; y++)
      for (let x=0; x<size; x++) {
        if (gridRef.current[y][x] === T.START) hasStart = true;
        if (gridRef.current[y][x] === T.EXIT)  hasExit  = true;
      }
    return hasStart && hasExit;
  };

  const handleDone = () => {
    if (!validate()) { alert("Place both a Start (S) and Exit (E) tile first!"); return; }
    const mazeData = { grid: gridRef.current, width: size, height: size, difficulty: "custom" };
    const code = encodeMaze(mazeData);
    setShareCode(code);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cellSize = Math.min(
    Math.floor((Math.min(window.innerWidth, 480) - 40) / size), 34
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔨 Build Your Maze</h2>

      <div style={styles.row}>
        {[11,15,21].map(s => (
          <button key={s} onClick={() => changeSize(s)}
            style={{ ...styles.sizeBtn,
              background: size===s ? "#00ff88":"#0f3460",
              color:      size===s ? "#000":"#fff" }}>
            {s}×{s}
          </button>
        ))}
      </div>

      <div style={styles.toolRow}>
        {TOOLS.map(t => (
          <button key={t.tile} onPointerDown={() => setTool(t.tile)}
            style={{ ...styles.toolBtn,
              background: tool===t.tile ? "#00ff88":"#16213e",
              color:      tool===t.tile ? "#000":"#fff",
              outline:    tool===t.tile ? "2px solid #00ff88":"none" }}>
            <span style={{fontSize:16}}>{t.label}</span>
            <span style={{fontSize:10}}>{t.name}</span>
          </button>
        ))}
      </div>

      <p style={styles.hint}>
        Selected: <b style={{color:"#00ff88"}}>{TOOLS.find(t=>t.tile===tool)?.name}</b>
        &nbsp;— tap or drag on the grid to paint
      </p>

      <div
        ref={containerRef}
        style={{ border:"2px solid #0f3460", display:"inline-block",
                 touchAction:"none", userSelect:"none" }}
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {grid.map((row, y) => (
          <div key={y} style={{ display:"flex" }}>
            {row.map((cell, x) => (
              <div key={x}
                style={{ width:cellSize, height:cellSize,
                         background: COLORS[cell] ?? "#16213e",
                         display:"flex", alignItems:"center", justifyContent:"center",
                         fontSize: cellSize * 0.5, boxSizing:"border-box",
                         border:"1px solid #0f3460", cursor:"crosshair" }}
                onMouseDown={() => handleMouseDown(x, y)}
                onMouseEnter={() => handleMouseEnter(x, y)}>
                {LABELS[cell] || ""}
              </div>
            ))}
          </div>
        ))}
      </div>

      <p style={styles.tip}>
        💡 Place <b style={{color:"#00ff88"}}>S</b> (Start) and <b style={{color:"#ff6b35"}}>E</b> (Exit) first.
        Draw walls by dragging. Border walls are fixed.
      </p>

      {!shareCode && (
        <div style={styles.row}>
          <button style={styles.primaryBtn} onPointerDown={handleDone}>
            ✅ Done & Get Share Code
          </button>
          <button style={styles.ghostBtn} onPointerDown={onCancel}>Cancel</button>
        </div>
      )}

      {shareCode && (
        <div style={styles.shareCard}>
          <p style={styles.shareTitle}>🎉 Maze Ready! Share this code:</p>
          <div style={styles.codeBox}>
            <code style={styles.codeText}>{shareCode}</code>
          </div>
          <div style={styles.row}>
            <button style={styles.primaryBtn} onPointerDown={copyCode}>
              {copied ? "✅ Copied!" : "📋 Copy Code"}
            </button>
            <button style={styles.primaryBtn}
              onPointerDown={() => onDone({ grid: gridRef.current, width: size, height: size, difficulty:"custom" })}>
              ▶ Play It Yourself
            </button>
          </div>
          <p style={styles.shareHint}>
            Friend opens app → "📥 Friend's Maze" → Pastes this code → Plays!
          </p>
          <button style={styles.ghostBtn} onPointerDown={onCancel}>🏠 Back to Home</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container:  { minHeight:"100vh", background:"#0a0a1a", color:"#fff",
                display:"flex", flexDirection:"column", alignItems:"center",
                padding:"16px 12px", fontFamily:"monospace" },
  title:      { color:"#00ff88", marginBottom:12 },
  row:        { display:"flex", gap:8, marginBottom:10, flexWrap:"wrap", justifyContent:"center" },
  sizeBtn:    { padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontWeight:"bold" },
  toolRow:    { display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center", marginBottom:8, maxWidth:420 },
  toolBtn:    { padding:"6px 8px", borderRadius:8, border:"1px solid #0f3460", cursor:"pointer",
                display:"flex", flexDirection:"column", alignItems:"center", minWidth:48,
                touchAction:"manipulation", WebkitTapHighlightColor:"transparent" },
  hint:       { color:"#aaa", fontSize:12, marginBottom:8 },
  tip:        { color:"#555", fontSize:11, marginTop:8, textAlign:"center", maxWidth:360 },
  primaryBtn: { padding:"12px 20px", background:"#00ff88", color:"#000", border:"none",
                borderRadius:8, fontWeight:"bold", cursor:"pointer",
                touchAction:"manipulation", WebkitTapHighlightColor:"transparent" },
  ghostBtn:   { padding:"12px 18px", background:"transparent", color:"#888",
                border:"1px solid #333", borderRadius:8, cursor:"pointer", touchAction:"manipulation" },
  shareCard:  { background:"#16213e", border:"2px solid #00ff88", borderRadius:12,
                padding:"20px 24px", marginTop:16, width:"100%", maxWidth:420, textAlign:"center" },
  shareTitle: { color:"#00ff88", fontWeight:"bold", marginBottom:12 },
  codeBox:    { background:"#0a0a1a", borderRadius:8, padding:"12px",
                marginBottom:14, wordBreak:"break-all" },
  codeText:   { color:"#ffd700", fontSize:11, lineHeight:1.6 },
  shareHint:  { color:"#888", fontSize:12, margin:"10px 0" },
};
