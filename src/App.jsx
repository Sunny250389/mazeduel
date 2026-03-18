import React, { useState, useEffect } from "react";
import HomeScreen    from "./screens/HomeScreen";
import RunScreen     from "./screens/RunScreen";
import BuildScreen   from "./screens/BuildScreen";
import MyMazesScreen from "./screens/MyMazesScreen";
import HOFScreen     from "./screens/HOFScreen";
import { generateMaze, getMazeFromURL, clearMazeFromURL } from "./utils/mazeGenerator";
import { generateMaze, getMazeFromURL, clearMazeFromURL, decodeMaze } from "./utils/mazeGenerator";

const DIFF_ORDER = ["easy", "medium", "hard"];

export default function App() {
  const [screen,     setScreen]   = useState("home");
  const [mazeData,   setMazeData] = useState(null);
  const [difficulty, setDiff]     = useState("easy");
  const [runKey,     setRunKey]   = useState(0);

  // On first load: check if URL contains a shared maze
  useEffect(() => {
    const shared = getMazeFromURL();
    if (shared) {
      clearMazeFromURL();
      setMazeData(shared);
      setDiff(shared.difficulty || "medium");
      setRunKey(k => k + 1);
      setScreen("run");
    }
  }, []);

  const goPlay = (diff, data = null) => {
    setDiff(diff);
    setMazeData(data || generateMaze(diff));
    setRunKey(k => k + 1);
    setScreen("run");
  };

  const handleFinish = (action) => {
    if (action === "replay") {
      goPlay(difficulty);
    } else if (action === "harder") {
      const nextIndex = Math.min(DIFF_ORDER.indexOf(difficulty) + 1, 2);
      const next = DIFF_ORDER[nextIndex];
      goPlay(next);
    } else {
      setScreen("home");
    }
  };

  const runShared = () => {
    const code = prompt("Paste your friend's share code:");
    if (!code) return;
    const { decodeMaze } = require("./utils/mazeGenerator");
    const data = decodeMaze(code);
    if (data) goPlay(data.difficulty || "medium", data);
    else alert("Invalid code. Try copying again.");
  };

  if (screen === "home")
    return (
      <HomeScreen
        onPlay={goPlay}
        onBuild={() => setScreen("build")}
        onRunShared={runShared}
        onViewMazes={() => setScreen("mazes")}
        onViewHOF={() => setScreen("hof")}
      />
    );

  if (screen === "run")
    return (
      <RunScreen
        key={runKey}
        mazeData={mazeData}
        difficulty={difficulty}
        onFinish={handleFinish}
      />
    );

  if (screen === "build")
    return (
      <BuildScreen
        onDone={(data) => goPlay("custom", data)}
        onCancel={() => setScreen("home")}
      />
    );

  if (screen === "mazes")
    return (
      <MyMazesScreen
        onPlay={(m) => goPlay(m.difficulty || "medium", m)}
        onBack={() => setScreen("home")}
      />
    );

  if (screen === "hof")
    return <HOFScreen onBack={() => setScreen("home")} />;

  return null;
}
