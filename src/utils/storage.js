const MAZES_KEY  = 'mazeduel_mazes';
const STATS_KEY  = 'mazeduel_stats';
const HOF_KEY    = 'mazeduel_hof';

/**
 * Returns window.GamePix.localStorage if the game is running on their platform.
 * Falls back to native localStorage for Vercel/Localhost.
 */
const getStorage = () => {
  if (window.GamePix && window.GamePix.localStorage) {
    return window.GamePix.localStorage;
  }
  return window.localStorage;
};

export function saveMaze(mazeRecord) {
  const storage = getStorage();
  const mazes = loadMazes();
  mazes.unshift(mazeRecord);
  // GamePix storage requires the same setItem/getItem syntax as native storage
  storage.setItem(MAZES_KEY, JSON.stringify(mazes.slice(0, 20)));
}

export function loadMazes() {
  const storage = getStorage();
  try {
    return JSON.parse(storage.getItem(MAZES_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveHOF(entry) {
  const storage = getStorage();
  const hof = loadHOF();
  hof.push(entry);
  hof.sort((a, b) => b.efficiency - a.efficiency);
  storage.setItem(HOF_KEY, JSON.stringify(hof.slice(0, 10)));
}

export function loadHOF() {
  const storage = getStorage();
  try {
    return JSON.parse(storage.getItem(HOF_KEY)) || [];
  } catch {
    return [];
  }
}

export function getStats() {
  const storage = getStorage();
  try {
    return JSON.parse(storage.getItem(STATS_KEY)) || { played: 0, coins: 0 };
  } catch {
    return { played: 0, coins: 0 };
  }
}

export function updateStats(coinsEarned) {
  const storage = getStorage();
  const s = getStats();
  s.played += 1;
  s.coins  += coinsEarned;
  storage.setItem(STATS_KEY, JSON.stringify(s));
}