import React, { useState, useEffect, useCallback, useRef } from "react";
import MazeGrid from "../components/MazeGrid";
import { T, findTile, bfsPath } from "../utils/mazeGenerator";
import { saveMaze, saveHOF, updateStats } from "../utils/storage";

const TIME_LIMITS = { easy: 90, medium: 150, hard: 240 };

export default function RunScreen({ mazeData, difficulty, onFinish }) {
  const { grid: initGrid, width, height } = mazeData;
  const gridRef    = useRef(initGrid.map(r => [...r]));
  const [grid, setGrid]     = useState(() => initGrid.map(r => [...r]));
  const [player, setPlayer] = useState(() => {
    const s = findTile(initGrid, height, width, T.START);
    return { x: s[0], y: s[1] };
  });
  const movesRef   = useRef(0);
  const coinsRef   = useRef(0);
  const keysRef    = useRef(0);
  const playerRef  = useRef(null);
  const [moves,    setMoves]    = useState(0);
  const [coins,    setCoins]    = useState(0);
  const [keys,     setKeys]     = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMITS[difficulty] || 90);
  const [status,   setStatus]   = useState("playing");
  const optimalRef  = useRef(bfsPath(initGrid, width, height));
  const statusRef   = useRef("playing");
  const touchStart  = useRef(null);
  const swipeActive = useRef(false);

  useEffect(() => { playerRef.current = player; }, [player]);

  // Timer
  useEffect(() => {
    if (statusRef.current !== "playing") return;
    if (timeLeft <= 0) { statusRef.current = "lost"; setStatus("lost"); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const move = useCallback((dx, dy) => {
    if (statusRef.current !== "playing") return;
    const p = playerRef.current;
    if (!p) return;

    const nx = p.x + dx;
    const ny = p.y + dy;
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;

    const currentGrid = gridRef.current;
    const cell = currentGrid[ny][nx];
    if (cell === T.WALL) return;
    if (cell === T.DOOR && keysRef.current === 0) return;

    const newGrid = currentGrid.map(r => [...r]);

    if (cell === T.COIN) { coinsRef.current++; setCoins(coinsRef.current); newGrid[ny][nx] = T.PATH; }
    if (cell === T.KEY)  { keysRef.current++;  setKeys(keysRef.current);   newGrid[ny][nx] = T.PATH; }
    if (cell === T.DOOR) { keysRef.current--;  setKeys(keysRef.current);   newGrid[ny][nx] = T.PATH; }
    if (cell === T.TRAP) { setTimeLeft(t => Math.max(0, t - 5)); }

    let finalX = nx, finalY = ny;
    if (cell === T.PORTAL_A) {
      const pb = findTile(newGrid, height, width, T.PORTAL_B);
      if (pb) { finalX = pb[0]; finalY = pb[1]; }
    }
    if (cell === T.PORTAL_B) {
      const pa = findTile(newGrid, height, width, T.PORTAL_A);
      if (pa) { finalX = pa[0]; finalY = pa[1]; }
    }

    movesRef.current++;
    setMoves(movesRef.current);
    gridRef.current = newGrid;
    setGrid(newGrid);
    playerRef.current = { x: finalX, y: finalY };
    setPlayer({ x: finalX, y: finalY });

    if (cell === T.EXIT) {
      statusRef.current = "won";
      setStatus("won");
      const eff = Math.min(100, Math.round((optimalRef.current / movesRef.current) * 100));
      updateStats(coinsRef.current);
      const record = {
        grid: initGrid, width, height, difficulty,
        bestEff: eff, date: new Date().toLocaleDateString(), id: Date.now().toString()
      };
      saveMaze(record);
      saveHOF({ difficulty, efficiency: eff, moves: movesRef.current, date: record.date });
    }
  }, [width, height, difficulty, initGrid]);

  // Keyboard (web)
  useEffect(() => {
    const handler = (e) => {
      const map = {
        ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0],
        w:[0,-1], s:[0,1], a:[-1,0], d:[1,0]
      };
      const d = map[e.key];
      if (d) { e.preventDefault(); move(d[0], d[1]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [move]);

  // Swipe on maze area
  const handleMazeTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    swipeActive.current = true;
  };
  const handleMazeTouchEnd = (e) => {
    if (!swipeActive.current || !touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const absDx = Math.abs(dx), absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < 15) return; // ignore tiny taps
    if (absDx > absDy) move(dx > 0 ? 1 : -1, 0);
    else               move(0, dy > 0 ? 1 : -1);
    touchStart.current = null;
    swipeActive.current = false;
  };

  // D-pad: onPointerDown = zero lag
  const dpadPress = (dx, dy) => (e) => {
    e.preventDefault();
    move(dx, dy);
  };

  const efficiency = moves > 0 ? Math.min(100, Math.round((optimalRef.current / moves) * 100)) : 100;
  const stars = efficiency >= 90 ? "⭐⭐⭐⭐" : efficiency >= 75 ? "⭐⭐⭐" : efficiency >= 55 ? "⭐⭐" : "⭐";

  return (
    <div style={styles.container}>
      <div style={styles.hud}>
        <span>⏱ {timeLeft}s</span>
        <span>🪙 {coins}</span>
        <span>🔑 {keys}</span>
        <span>👣 {moves}</span>
        <span>📊 {efficiency}%</span>
      </div>

      {/* Swipe area */}
      <div
        onTouchStart={handleMazeTouchStart}
        onTouchEnd={handleMazeTouchEnd}
        style={{ touchAction: "none" }}
      >
        <MazeGrid grid={grid} width={width} height={height} player={player} />
      </div>

      {/* D-Pad */}
      <div style={styles.dpad}>
        <div style={styles.dpadRow}>
          <DpadBtn onPress={dpadPress(0,-1)}>▲</DpadBtn>
        </div>
        <div style={styles.dpadRow}>
          <DpadBtn onPress={dpadPress(-1,0)}>◀</DpadBtn>
          <div style={styles.dpadCenter} />
          <DpadBtn onPress={dpadPress(1,0)}>▶</DpadBtn>
        </div>
        <div style={styles.dpadRow}>
          <DpadBtn onPress={dpadPress(0,1)}>▼</DpadBtn>
        </div>
      </div>

      {status !== "playing" && (
        <div style={styles.overlay}>
          <div style={styles.overlayCard}>
            <h2 style={{ color: status === "won" ? "#00ff88" : "#ff0040" }}>
              {status === "won" ? "🎉 You Escaped!" : "💀 Time's Up!"}
            </h2>
            {status === "won" && <>
              <p>Efficiency: <b>{efficiency}%</b> {stars}</p>
              <p>Optimal: {optimalRef.current} | Yours: {moves} moves</p>
            </>}
            <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginTop:16 }}>
              <button style={styles.btn}      onPointerDown={() => onFinish("replay")}>🔄 Replay</button>
              <button style={styles.btn}      onPointerDown={() => onFinish("harder")}>⬆ Next Harder</button>
              <button style={styles.btnGhost} onPointerDown={() => onFinish("home")}>🏠 Home</button>
            </div>
          </div>
        </div>
      )}

      <button style={styles.quitBtn} onPointerDown={() => onFinish("home")}>✕ Quit</button>
    </div>
  );
}

function DpadBtn({ onPress, children }) {
  return (
    <button
      style={styles.dpadBtn}
      onPointerDown={onPress}
      onContextMenu={e => e.preventDefault()}
    >
      {children}
    </button>
  );
}

const styles = {
  container:  { minHeight:"100vh", background:"#0a0a1a", color:"#fff",
                display:"flex", flexDirection:"column", alignItems:"center",
                padding:"10px 8px", fontFamily:"monospace",
                userSelect:"none", WebkitUserSelect:"none" },
  hud:        { display:"flex", gap:16, background:"#16213e", borderRadius:10,
                padding:"8px 16px", marginBottom:10, fontSize:14,
                flexWrap:"wrap", justifyContent:"center" },
  dpad:       { marginTop:16, display:"flex", flexDirection:"column",
                alignItems:"center", gap:6 },
  dpadRow:    { display:"flex", gap:6, alignItems:"center" },
  dpadCenter: { width:54, height:54 },
  dpadBtn:    { width:54, height:54, fontSize:22, background:"#16213e",
                color:"#00ff88", border:"1px solid #0f3460", borderRadius:12,
                cursor:"pointer", touchAction:"manipulation",
                WebkitTapHighlightColor:"transparent",
                display:"flex", alignItems:"center", justifyContent:"center" },
  overlay:    { position:"fixed", inset:0, background:"#000000cc",
                display:"flex", alignItems:"center", justifyContent:"center", zIndex:10 },
  overlayCard:{ background:"#16213e", border:"2px solid #00ff88", borderRadius:16,
                padding:"30px 36px", textAlign:"center", maxWidth:340 },
  btn:        { padding:"10px 18px", background:"#00ff88", color:"#000",
                border:"none", borderRadius:8, fontWeight:"bold",
                cursor:"pointer", touchAction:"manipulation",
                WebkitTapHighlightColor:"transparent" },
  btnGhost:   { padding:"10px 18px", background:"transparent", color:"#888",
                border:"1px solid #333", borderRadius:8, cursor:"pointer",
                touchAction:"manipulation" },
  quitBtn:    { marginTop:12, background:"transparent", color:"#555",
                border:"none", cursor:"pointer", fontSize:14,
                touchAction:"manipulation" },
};
