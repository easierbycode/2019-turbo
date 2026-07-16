// state.js — mutable global game state, mirroring the original `D` object.
import { SHOOT_MODES, SHOOT_SPEEDS } from './constants.js';

export const gameState = {
  lowModeFlg: false,
  hitAreaFlg: false,
  debugFlg: typeof location !== 'undefined' ? location.hostname !== 'game.capcom.com' : true,
  playerRef: null,
  playerHp: 0,
  playerMaxHp: 0,
  caDamage: 0,
  combo: 0,
  maxCombo: 0,
  stageId: 0,
  akebonoCnt: 0,
  cagage: 0,
  score: 0,
  continueCnt: 0,
  highScore: 0,
  beforeHighScore: 0,
  frame: 0,
  shootMode: SHOOT_MODES.NORMAL,
  shootSpeed: SHOOT_SPEEDS.NORMAL,
  shortFlg: false,
  exUnlocked: false,
};

const COOKIE = 'afc2019_highScore';

export function loadHighScore() {
  if (typeof document === 'undefined' || !document.cookie) return;
  document.cookie.split(';').forEach((part) => {
    const [k, v] = part.trim().split('=');
    if (k === COOKIE && v) {
      gameState.highScore = parseInt(v, 10) || 0;
      gameState.beforeHighScore = gameState.highScore;
    }
  });
}

export function saveHighScore() {
  if (typeof document === 'undefined') return;
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    document.cookie = `${COOKIE}=${gameState.highScore}; path=/`;
  }
}

// EX mode (the super-scaler 3D version, ex.html) is the reward for clearing
// the game once; the unlock persists via cookie like the high score.
const EX_COOKIE = 'afc2019_exUnlocked';

export function loadExUnlocked() {
  if (typeof document === 'undefined' || !document.cookie) return;
  document.cookie.split(';').forEach((part) => {
    const [k, v] = part.trim().split('=');
    if (k === EX_COOKIE && v === '1') gameState.exUnlocked = true;
  });
}

export function saveExUnlocked() {
  gameState.exUnlocked = true;
  if (typeof document !== 'undefined') document.cookie = `${EX_COOKIE}=1; path=/`;
  // Unlocked mid-session inside the CMG launcher: advertise the EX version now
  // so the Guide gains its "Play EX" row without a reload (index.html handles
  // the already-unlocked case at boot).
  if (typeof window !== 'undefined' && window.parent !== window) {
    try {
      window.parent.postMessage({
        type: 'cmg-ex',
        url: new URL('ex.html', window.location.href).href,
        label: 'EX · Super Scaler 3D',
      }, '*');
    } catch (e) { /* not embedded / blocked — ignore */ }
  }
}

export function resetRun() {
  gameState.stageId = 0;
  gameState.score = 0;
  gameState.combo = 0;
  gameState.maxCombo = 0;
  gameState.cagage = 0;
  gameState.akebonoCnt = 0;
  gameState.continueCnt = 0;
  gameState.shootMode = SHOOT_MODES.NORMAL;
  gameState.shootSpeed = SHOOT_SPEEDS.NORMAL;
}

export function dlog(...args) {
  if (gameState.debugFlg) console.log(...args);
}
