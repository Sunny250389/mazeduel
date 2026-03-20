const GAMEPIX_METHODS = [
  "resume",
  "pause",
  "updateScore",
  "updateLevel",
  "happyMoment",
  "gameOver",
];

function getGamePix() {
  if (typeof window === "undefined") return null;
  return window.GamePix || null;
}

export function isGamePixReady() {
  const sdk = getGamePix();
  if (!sdk) return false;
  return GAMEPIX_METHODS.some((method) => typeof sdk[method] === "function");
}

export function callGamePix(method, ...args) {
  const sdk = getGamePix();
  if (!sdk || typeof sdk[method] !== "function") return;

  try {
    sdk[method](...args);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[GamePix] ${method} failed`, error);
    }
  }
}

export function reportGameReady() {
  callGamePix("resume");
}

export function reportGamePause() {
  callGamePix("pause");
}
