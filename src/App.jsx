// // App.jsx
// import React, { useState, useEffect } from "react";
// import HomeScreen from "./screens/HomeScreen";
// import RunScreen from "./screens/RunScreen";
// import { generateMaze } from "./utils/mazeGenerator";
//
// export default function App() {
//   const [screen, setScreen] = useState("home");
//   const [difficulty, setDifficulty] = useState("easy");
//   const [mazeData, setMazeData] = useState(null);
//
//   // GamePix Handshake
//   useEffect(() => {
//     if (window.GamePix && typeof window.GamePix.gameLoaded === 'function') {
//       window.GamePix.gameLoaded().then(() => {
//         if (typeof window.GamePix.getLang === 'function') window.GamePix.getLang();
//         if (typeof window.GamePix.resume === 'function') window.GamePix.resume();
//       });
//     }
//   }, []);
//
//   const startPlay = (diff) => {
//     const d = (typeof diff === 'string') ? diff.toLowerCase() : "easy";
//
//     // Updated sizing for your 21x21 Hard level
//     let size = 11;
//     if (d === "medium") size = 17;
//     if (d === "hard")   size = 21; // User requested 21x21
//
//     console.log(`MAZEDUEL: Creating ${d} maze (${size}x${size})`);
//
//     const maze = generateMaze(size, size, d === "hard" ? 6 : 2);
//
//     // CRITICAL: We need a unique ID to trigger the key change
//     maze.runId = Date.now();
//
//     setDifficulty(d);
//     setMazeData(maze);
//     setScreen("play");
//   };
//
//   return (
//     <div style={{ background: "#0a0a1a", minHeight: "100vh" }}>
//       {screen === "home" && <HomeScreen onPlay={startPlay} />}
//
//       {screen === "play" && (
//         <RunScreen
//           // THE FIX: This 'key' tells React: "Delete the old maze, make a new one!"
//           key={mazeData.runId}
//           mazeData={mazeData}
//           difficulty={difficulty}
//           onFinish={(action) => {
//             if (action === "home") setScreen("home");
//             else if (action === "harder") startPlay("hard");
//             else startPlay(difficulty);
//           }}
//         />
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import HomeScreen from "./screens/HomeScreen";
import RunScreen from "./screens/RunScreen";
import BuildScreen from "./screens/BuildScreen";
import MyMazesScreen from "./screens/MyMazesScreen";
import HOFScreen from "./screens/HOFScreen";
import { generateMaze, getMazeFromURL, clearMazeFromURL } from "./utils/mazeGenerator";
import { reportGamePause, reportGameReady } from "./utils/gamepix";

const DIFF_ORDER = ["easy", "medium", "hard"];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [difficulty, setDifficulty] = useState("medium");
  const [mazeData, setMazeData] = useState(null);

  useEffect(() => {
    const urlMaze = getMazeFromURL();
    if (urlMaze) {
      setScreen("run");
      setMazeData(urlMaze);
      setDifficulty(urlMaze.difficulty || "medium");
    }
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        reportGameReady();
      } else {
        reportGamePause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    handleVisibility();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const goPlay = (diff, data = null) => {
    setDifficulty(diff);
    setMazeData(data || generateMaze(diff));
    setScreen("run");
  };

  const handleFinish = (score) => {
    setScreen("home");
    clearMazeFromURL();
  };

  if (screen === "home") {
    return (
      <HomeScreen
        difficulty={difficulty}
        onPlay={goPlay}
        onBuild={() => setScreen("build")}
        //onMazes={() => setScreen("mazes")}
        //onHOF={() => setScreen("hof")}
        onViewMazes={() => setScreen("mazes")}
        onViewHOF={() => setScreen("hof")}
        onRunShared={() => setScreen("mazes")}
      />
    );
  }

  if (screen === "run" && mazeData) {
    return (
      <RunScreen
        mazeData={mazeData}
        difficulty={difficulty}
        onFinish={handleFinish}
      />
    );
  }

  if (screen === "build") {
    return (
      <BuildScreen
        onDone={(data) => goPlay("medium", data)}
        onCancel={() => setScreen("home")}
      />
    );
  }

  if (screen === "mazes") {
    return (
      <MyMazesScreen
        onPlay={(m) => goPlay(m.difficulty || "medium", m)}
        onBack={() => setScreen("home")}
      />
    );
  }

  if (screen === "hof") {
    return <HOFScreen onBack={() => setScreen("home")} />;
  }

  return null;
}