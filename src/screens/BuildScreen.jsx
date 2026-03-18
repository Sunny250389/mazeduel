import React, { useState, useRef, useEffect, useCallback } from "react";
import { T, encodeMaze } from "../utils/mazeGenerator";
import { T, encodeMaze, buildShareURL } from "../utils/mazeGenerator";

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
  [T.WALL]:"#1a1a2e",  [T.PATH]:"#2a2a4a",
  [T.START]:"#00ff88", [T.EXIT]:"#ff6b35",
  [T.KEY]:"#ffd700",   [T.DOOR]:"#8b4513",
  [T.TRAP]:"#ff0040",  [T.COIN]:"#ffd700",
};

const TILE_LABELS = {
  [T.START]:"S", [T.EXIT]:"E", [T.KEY]:"🔑",
  [T.DOOR]:"🚪", [T.TRAP]:"⚡", [T.COIN]:"🪙",
};

function makeGrid(size) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => T.WALL)
  );
}

export default function BuildScreen({ onDone, onCancel }) {
  const [size,      setSize]      = useState(11);
  const [tool,      setTool]      = useState(T.PATH);
  const [shareCode, setShareCode] = useState(null);
  const [copied,    setCopied]    = useState(false);
  const [,          forceRender]  = useState(0);

  const gridRef      = useRef(makeGrid(11));
  const isPainting   = useRef(false);
  const toolRef      = useRef(T.PATH);
  const sizeRef      = useRef(11);
  const containerRef = useRef(null);

  const selectTool = (t) => { toolRef.current = t; setTool(t); };

  const changeSize = (s) => {
    sizeRef.current = s;
    gridRef.current = makeGrid(s);
    setSize(s);
    setShareCode(null);
    forceRender(n => n + 1);
  };

  const paintCell = useCallback((x, y) => {
    const size = sizeRef.current;
    const g    = gridRef.current;
    const t    = toolRef.current;
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    if (y === 0 || y === size-1 || x === 0 || x === size-1) return;
    if (g[y][x] === t) return;
    if (t === T.START || t === T.EXIT) {
      for (let r=0; r<size; r++)
        for (let c=0; c<size; c++)
          if (g[r][c] === t) g[r][c] = T.PATH;
    }
    g[y][x] = t;
    forceRender(n => n + 1);
  }, []);

  const cellFromMouse = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const cellSize = rect.width / sizeRef.current;
    return {
      x: Math.floor((e.clientX - rect.left) / cellSize),
      y: Math.floor((e.clientY - rect.top)  / cellSize),
    };
  };

  const cellFromTouch = (e) => {
    const rect  = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    const cellSize = rect.width / sizeRef.current;
    return {
      x: Math.floor((touch.clientX - rect.left) / cellSize),
      y: Math.floor((touch.clientY - rect.top)  / cellSize),
    };
  };

  const onMouseDown  = (e) => { isPainting.current = true;  const c = cellFromMouse(e); paintCell(c.x, c.y); };
  const onMouseMove  = (e) => { if (!isPainting.current) return; const c = cellFromMouse(e); paintCell(c.x, c.y); };
  const onMouseUp    = ()  => { isPainting.current = false; };

  // Touch events need { passive: false } to preventDefault — must use useEffect
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const tStart = (e) => { e.preventDefault(); isPainting.current = true;  const c = cellFromTouch(e); paintCell(c.x, c.y); };
    const tMove  = (e) => { e.preventDefault(); if (!isPainting.current) return; const c = cellFromTouch(e); paintCell(c.x, c.y); };
    const tEnd   = ()  => { isPainting.current = false; };
    el.addEventListener("touchstart", tStart, { passive: false });
    el.addEventListener("touchmove",  tMove,  { passive: false });
    el.addEventListener("touchend",   tEnd);
    return () => {
      el.removeEventListener("touchstart", tStart);
      el.removeEventListener("touchmove",  tMove);
      el.removeEventListener("touchend",   tEnd);
    };
  }, [paintCell]);

  const validate = () => {
    const g = gridRef.current;
    const s = sizeRef.current;
    let hasStart = false, hasExit = false;
    for (let y=0; y<s; y++)
      for (let x=0; x<s; x++) {
        if (g[y][x] === T.START) hasStart = true;
        if (g[y][x] === T.EXIT)  hasExit  = true;
      }
    return hasStart && hasExit;
  };

  const handleDone = () => {
    if (!validate()) { alert("Place both a Start (S) and Exit (E) tile first!"); return; }
    const mazeData = {
      grid: gridRef.current.map(r => [...r]),
      width: sizeRef.current, height: sizeRef.current, difficulty: "custom"
    };
    setShareCode(buildShareURL(mazeData));      // generates full url
  };

  const copyCode = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cellPx = Math.min(
    Math.floor((Math.min(window.innerWidth, 500) - 32) / size), 36
  );

  const g = gridRef.current;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔨 Build Your Maze</h2>

      <div style={styles.row}>
        {[11,15,21].map(s => (
          <button key={s} onPointerDown={() => changeSize(s)}
            style={{ ...styles.sizeBtn,
              background: size===s ? "#00ff88":"#0f3460",
              color:      size===s ? "#000":"#fff" }}>
            {s}×{s}
          </button>
        ))}
      </div>

      <div style={styles.toolRow}>
        {TOOLS.map(t => (
          <button key={t.tile} onPointerDown={() => selectTool(t.tile)}
            style={{ ...styles.toolBtn,
              background: tool===t.tile ? "#00ff88":"#16213e",
              color:      tool===t.tile ? "#000":"#fff",
              outline:    tool===t.tile ? "2px solid #fff":"none" }}>
            <span style={{fontSize:15}}>{t.label}</span>
            <span style={{fontSize:9, marginTop:2}}>{t.name}</span>
          </button>
        ))}
      </div>

      <p style={styles.hint}>
        ✏️ <b style={{color:"#00ff88"}}>{TOOLS.find(t=>t.tile===tool)?.name}</b> selected — click/drag on grid
      </p>
      <p style={styles.tip}>
        💡 Grid starts as <b>all walls</b>. Use <b>⬜ Erase</b> to carve open paths,
        then place <b style={{color:"#00ff88"}}>S</b> Start + <b style={{color:"#ff6b35"}}>E</b> Exit.
      </p>

      <div
        ref={containerRef}
        style={{ display:"grid",
                 gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
                 border:"2px solid #0f3460", cursor:"crosshair",
                 touchAction:"none", userSelect:"none", WebkitUserSelect:"none" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {g.map((row, y) =>
          row.map((cell, x) => (
            <div key={`${x}-${y}`} style={{
              width: cellPx, height: cellPx,
              background: COLORS[cell] ?? "#2a2a4a",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize: Math.max(cellPx * 0.45, 8),
              boxSizing:"border-box",
              border:"1px solid #0f3460",
              pointerEvents:"none",
            }}>
              {TILE_LABELS[cell] || ""}
            </div>
          ))
        )}
      </div>

      <div style={{...styles.row, marginTop:14}}>
        {!shareCode ? (
          <>
            <button style={styles.primaryBtn} onPointerDown={handleDone}>✅ Done & Get Share Code</button>
            <button style={styles.ghostBtn}   onPointerDown={onCancel}>Cancel</button>
          </>
        ) : (
          <div style={styles.shareCard}>
            <p style={styles.shareTitle}>🎉 Maze Ready!</p>
            <p style={{color:"#aaa", fontSize:12, marginBottom:8}}>Share this code with your friend:</p>
            <div style={styles.codeBox}>
              <code style={styles.codeText}>{shareCode}</code>
            </div>
            <div style={styles.row}>
              <button style={styles.primaryBtn} onPointerDown={copyCode}>
                {copied ? "✅ Copied!" : "📋 Copy Code"}
              </button>
              <button style={styles.primaryBtn}
                onPointerDown={() => onDone({ grid: gridRef.current.map(r=>[...r]),
                  width: sizeRef.current, height: sizeRef.current, difficulty:"custom" })}>
                ▶ Play It Yourself
              </button>
            </div>
            <p style={styles.shareHint}>Friend: Open app → "📥 Friend's Maze" → Paste code → Play!</p>
            <button style={styles.ghostBtn} onPointerDown={onCancel}>🏠 Home</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container:  { minHeight:"100vh", background:"#0a0a1a", color:"#fff",
                display:"flex", flexDirection:"column", alignItems:"center",
                padding:"16px 12px", fontFamily:"monospace" },
  title:      { color:"#00ff88", marginBottom:10 },
  row:        { display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", marginBottom:8 },
  sizeBtn:    { padding:"8px 18px", borderRadius:8, border:"none", cursor:"pointer",
                fontWeight:"bold", touchAction:"manipulation" },
  toolRow:    { display:"flex", gap:5, flexWrap:"wrap", justifyContent:"center",
                marginBottom:6, maxWidth:440 },
  toolBtn:    { padding:"5px 7px", borderRadius:8, border:"1px solid #0f3460",
                cursor:"pointer", display:"flex", flexDirection:"column",
                alignItems:"center", minWidth:44,
                touchAction:"manipulation", WebkitTapHighlightColor:"transparent" },
  hint:       { color:"#aaa", fontSize:12, marginBottom:4 },
  tip:        { color:"#666", fontSize:11, marginBottom:8, textAlign:"center", maxWidth:380 },
  primaryBtn: { padding:"11px 18px", background:"#00ff88", color:"#000", border:"none",
                borderRadius:8, fontWeight:"bold", cursor:"pointer",
                touchAction:"manipulation", WebkitTapHighlightColor:"transparent" },
  ghostBtn:   { padding:"11px 16px", background:"transparent", color:"#888",
                border:"1px solid #333", borderRadius:8, cursor:"pointer", touchAction:"manipulation" },
  shareCard:  { background:"#16213e", border:"2px solid #00ff88", borderRadius:12,
                padding:"20px 24px", width:"100%", maxWidth:420, textAlign:"center" },
  shareTitle: { color:"#00ff88", fontWeight:"bold", fontSize:18, margin:"0 0 4px 0" },
  codeBox:    { background:"#0a0a1a", borderRadius:8, padding:"10px",
                marginBottom:12, wordBreak:"break-all" },
  codeText:   { color:"#ffd700", fontSize:11, lineHeight:1.6 },
  shareHint:  { color:"#888", fontSize:12, margin:"10px 0 12px 0" },
};
