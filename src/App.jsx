import React, { useState, useEffect } from "react";
import HomeScreen from "./screens/HomeScreen";
import RunScreen from "./screens/RunScreen";
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
        onViewMazes={() => setScreen("mazes")}
        onViewHOF={() => setScreen("hof")}
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
