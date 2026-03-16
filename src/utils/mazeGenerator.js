// Tile codes
export const T = {
  WALL: 1, PATH: 0, START: 2, EXIT: 3,
  KEY: 4, DOOR: 5, TRAP: 6, COIN: 7, PORTAL_A: 8, PORTAL_B: 9,
};

export function generateMaze(difficulty) {
  const sizes = { easy: 11, medium: 15, hard: 21 };
  const size = sizes[difficulty] || 11;
  const W = size, H = size;

  const grid = Array.from({ length: H }, () => Array(W).fill(T.WALL));
  const inBounds = (x, y) => x > 0 && y > 0 && x < W - 1 && y < H - 1;
  const directions = [[0,-2],[2,0],[0,2],[-2,0]];

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function carve(x, y) {
    grid[y][x] = T.PATH;
    const dirs = shuffle([...directions]);
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (inBounds(nx, ny) && grid[ny][nx] === T.WALL) {
        grid[y + dy / 2][x + dx / 2] = T.PATH;
        carve(nx, ny);
      }
    }
  }

  carve(1, 1);
  grid[1][1] = T.START;
  grid[H - 2][W - 2] = T.EXIT;

  const specials = {
    easy:   { traps: 1, coins: 4, keys: 0, portals: 0 },
    medium: { traps: 2, coins: 6, keys: 1, portals: 0 },
    hard:   { traps: 5, coins: 10, keys: 2, portals: 2 },
  };
  const cfg = specials[difficulty] || specials.easy;

  const pathCells = [];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (grid[y][x] === T.PATH) pathCells.push([x, y]);

  shuffle(pathCells);
  let idx = 0;
  const place = (tile, count) => {
    for (let i = 0; i < count && idx < pathCells.length; i++, idx++)
      grid[pathCells[idx][1]][pathCells[idx][0]] = tile;
  };

  place(T.TRAP, cfg.traps);
  place(T.COIN, cfg.coins);

  // Smart Key & Door placement along optimal path
  if (cfg.keys > 0) {
    const path = bfsFullPath(grid, W, H);
    if (path && path.length > 6) {
      const keyPos  = path[Math.floor(path.length * 0.25)];
      const doorPos = path[Math.floor(path.length * 0.65)];
      grid[keyPos[1]][keyPos[0]]   = T.KEY;
      grid[doorPos[1]][doorPos[0]] = T.DOOR;

      if (cfg.keys > 1 && path.length > 10) {
        const key2Pos  = path[Math.floor(path.length * 0.45)];
        const door2Pos = path[Math.floor(path.length * 0.82)];
        if (grid[key2Pos[1]][key2Pos[0]]   === T.PATH)
          grid[key2Pos[1]][key2Pos[0]]   = T.KEY;
        if (grid[door2Pos[1]][door2Pos[0]] === T.PATH)
          grid[door2Pos[1]][door2Pos[0]] = T.DOOR;
      }
    }
  }

  if (cfg.portals > 0) {
    place(T.PORTAL_A, 1);
    place(T.PORTAL_B, 1);
  }

  return { grid, width: W, height: H };
}

// BFS full path — used for Key/Door placement (skips DOOR tiles)
export function bfsFullPath(grid, W, H) {
  const start = findTile(grid, H, W, T.START);
  const exit  = findTile(grid, H, W, T.EXIT);
  if (!start || !exit) return null;

  const queue   = [[start[0], start[1]]];
  const visited = Array.from({ length: H }, () => Array(W).fill(false));
  const parent  = Array.from({ length: H }, () => Array(W).fill(null));
  visited[start[1]][start[0]] = true;

  const dirs = [[0,1],[1,0],[0,-1],[-1,0]];
  let found = false;

  while (queue.length) {
    const [x, y] = queue.shift();
    if (x === exit[0] && y === exit[1]) { found = true; break; }
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < W && ny < H
          && !visited[ny][nx]
          && grid[ny][nx] !== T.WALL
          && grid[ny][nx] !== T.DOOR) {
        visited[ny][nx] = true;
        parent[ny][nx] = [x, y];
        queue.push([nx, ny]);
      }
    }
  }

  if (!found) return null;
  const path = [];
  let cur = [exit[0], exit[1]];
  while (cur) {
    path.unshift(cur);
    const [cx, cy] = cur;
    cur = parent[cy][cx];
  }
  return path;
}

// BFS for SCORING — treats DOOR as walkable (assumes player has key)
export function bfsPath(grid, W, H) {
  const start = findTile(grid, H, W, T.START);
  const exit  = findTile(grid, H, W, T.EXIT);
  if (!start || !exit) return 0;

  const queue   = [[start[0], start[1], 0]];
  const visited = Array.from({ length: H }, () => Array(W).fill(false));
  visited[start[1]][start[0]] = true;

  const dirs = [[0,1],[1,0],[0,-1],[-1,0]];

  while (queue.length) {
    const [x, y, dist] = queue.shift();
    if (x === exit[0] && y === exit[1]) return dist;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < W && ny < H
          && !visited[ny][nx]
          && grid[ny][nx] !== T.WALL) {  // DOOR treated as walkable
        visited[ny][nx] = true;
        queue.push([nx, ny, dist + 1]);
      }
    }
  }
  return 0;
}

export function findTile(grid, H, W, tile) {
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (grid[y][x] === tile) return [x, y];
  return null;
}

export function encodeMaze(mazeData) {
  return btoa(JSON.stringify(mazeData)).slice(0, 200);
}

export function decodeMaze(code) {
  try { return JSON.parse(atob(code)); } catch { return null; }
}
