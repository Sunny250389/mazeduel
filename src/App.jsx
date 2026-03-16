import React, { useState } from "react";
import HomeScreen    from "./screens/HomeScreen";
import RunScreen     from "./screens/RunScreen";
import BuildScreen   from "./screens/BuildScreen";
import MyMazesScreen from "./screens/MyMazesScreen";
import HOFScreen     from "./screens/HOFScreen";
import { generateMaze, decodeMaze } from "./utils/mazeGenerator";

const DIFF_ORDER = ["easy", "medium", "hard"];

export default function App() {
  const [screen,     setScreen]   = useState("home");
  const [mazeData,   setMazeData] = useState(null);
  const [difficulty, setDiff]     = useState("easy");
  const [runKey,     setRunKey]   = useState(0);

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
      const next = DIFF_ORDER[Math.min(DIFF_ORDER.indexOf(difficulty) + 1, 2)];
      goPlay(next);
    } else {
      setScreen("home");
    }
  };

  const runShared = () => {
    const code = prompt("Paste your friend's share code:");
    if (!code) return;
    const data = decodeMaze(code);
    if (data) goPlay(data.difficulty || "medium", data);
    else alert("Invalid code. Ask your friend to copy it again.");
  };

  if (screen === "home")
    return <HomeScreen onPlay={goPlay} onBuild={() => setScreen("build")}
             onRunShared={runShared}
             onViewMazes={() => setScreen("mazes")}
             onViewHOF={() => setScreen("hof")} />;

  if (screen === "run")
    return <RunScreen key={runKey} mazeData={mazeData}
             difficulty={difficulty} onFinish={handleFinish} />;

  if (screen === "build")
    return <BuildScreen
             onDone={(data) => goPlay("custom", data)}
             onCancel={() => setScreen("home")} />;

  if (screen === "mazes")
    return <MyMazesScreen
             onPlay={(m) => goPlay(m.difficulty || "medium", m)}
             onBack={() => setScreen("home")} />;

  if (screen === "hof")
    return <HOFScreen onBack={() => setScreen("home")} />;

  return null;
}
