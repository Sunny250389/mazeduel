const MAZES_KEY  = 'mazeduel_mazes';
const STATS_KEY  = 'mazeduel_stats';
const HOF_KEY    = 'mazeduel_hof';

export function saveMaze(mazeRecord) {
  const mazes = loadMazes();
  mazes.unshift(mazeRecord);
  localStorage.setItem(MAZES_KEY, JSON.stringify(mazes.slice(0, 20)));
}

export function loadMazes() {
  try { return JSON.parse(localStorage.getItem(MAZES_KEY)) || []; }
  catch { return []; }
}

export function saveHOF(entry) {
  const hof = loadHOF();
  hof.push(entry);
  hof.sort((a, b) => b.efficiency - a.efficiency);
  localStorage.setItem(HOF_KEY, JSON.stringify(hof.slice(0, 10)));
}

export function loadHOF() {
  try { return JSON.parse(localStorage.getItem(HOF_KEY)) || []; }
  catch { return []; }
}

export function getStats() {
  try { return JSON.parse(localStorage.getItem(STATS_KEY)) || { played: 0, coins: 0 }; }
  catch { return { played: 0, coins: 0 }; }
}

export function updateStats(coinsEarned) {
  const s = getStats();
  s.played += 1;
  s.coins  += coinsEarned;
  localStorage.setItem(STATS_KEY, JSON.stringify(s));
}
