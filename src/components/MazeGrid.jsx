import React from "react";
import { T } from "../utils/mazeGenerator";

const TILE_COLORS = {
  [T.WALL]:     "#1a1a2e",
  [T.PATH]:     "#2a3f66",
  [T.START]:    "#00ff88",
  [T.EXIT]:     "#ff6b35",
  [T.KEY]:      "#ffd700",
  [T.DOOR]:     "#8b4513",
  [T.TRAP]:     "#ff0040",
  [T.COIN]:     "#ffd700",
  [T.PORTAL_A]: "#bf5fff",
  [T.PORTAL_B]: "#bf5fff",
};

const TILE_LABELS = {
  [T.START]:    "S",
  [T.EXIT]:     "E",
  [T.KEY]:      "🔑",
  [T.DOOR]:     "🚪",
  [T.TRAP]:     "⚡",
  [T.COIN]:     "●",
  [T.PORTAL_A]: "◎",
  [T.PORTAL_B]: "◎",
};

export default function MazeGrid({ grid, width, height, player }) {
  const cellSize = Math.min(
    Math.floor((window.innerWidth * 0.92) / width),
    Math.floor((window.innerHeight * 0.65) / height),
    36
  );

  return (
    <div style={{ display:"inline-block", border:"2px solid #00ff88",
                  boxShadow:"0 0 20px #00ff8844", borderRadius:4 }}>
      {grid.map((row, y) => (
        <div key={y} style={{ display:"flex" }}>
          {row.map((cell, x) => {
            const isPlayer = player && player.x === x && player.y === y;
            return (
              <div key={x} style={{
                width:  cellSize,
                height: cellSize,
                background: isPlayer ? "transparent" : TILE_COLORS[cell] ?? "#16213e",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize: cellSize * 0.55,
                fontWeight:"bold",
                color: "#fff",
                boxSizing:"border-box",
                border: cell === T.WALL ? "none" : "1px solid #0f3460",
              }}>
                {isPlayer ? "🟢" : (TILE_LABELS[cell] || "")}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
