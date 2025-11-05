// Platanus Hack 25: Doom-like 2.5D Maze Game
// Navigate through a maze with raycasting 2.5D graphics
// MODIFIED: Added health, shooting, health bars, and a banana gun

// =============================================================================
// ARCADE BUTTON MAPPING
// =============================================================================
const ARCADE_CONTROLS = {
  // Player 1 - WASD movement, UI buttons
  P1U: ["w"],
  P1D: ["s"],
  P1L: ["a"],
  P1R: ["d"],
  P1A: ["u"], // Shoot
  P1B: ["i"],
  P1C: ["o"],
  P1X: ["j"],
  P1Y: ["k"],
  P1Z: ["l"],
  START1: ["1", "Enter"],

  // Player 2 - Arrow keys, alternative buttons
  P2U: ["ArrowUp"],
  P2D: ["ArrowDown"],
  P2L: ["ArrowLeft"],
  P2R: ["ArrowRight"],
  P2A: ["r"], // Shoot
  P2B: ["t"],
  P2C: ["y"],
  P2X: ["f"],
  P2Y: ["g"],
  P2Z: ["h"],
  START2: ["2"],
};

const KEYBOARD_TO_ARCADE = {};
for (const [code, keys] of Object.entries(ARCADE_CONTROLS)) {
  if (keys) {
    (Array.isArray(keys) ? keys : [keys]).forEach((k) => {
      KEYBOARD_TO_ARCADE[k] = code;
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000",
  scene: { create: create, update: update },
};

const game = new Phaser.Game(config);

// Create cover image as base64 PNG
const coverImageData = "";
// Sprite types available for selection
const SPRITE_TYPES = {
  AMONGUS: "amongus",
};

let scene,
  graphics,
  currentState = "menu";
let numPlayers = 1;
let selectedSprites = [SPRITE_TYPES.AMONGUS, SPRITE_TYPES.AMONGUS]; // Default sprites for players

// Among Us sprite data (10x10 pixel art as arrays)
const AMONGUS_SPRITES = {
  idle: [
    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 1, 2, 2, 2, 2, 1, 0, 0, 0],
    [1, 2, 2, 2, 2, 2, 2, 1, 0, 0],
    [1, 3, 3, 3, 2, 2, 2, 1, 1, 1],
    [1, 3, 3, 3, 2, 2, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 2, 1],
    [1, 2, 2, 1, 1, 2, 2, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
  ],
  walk1: [
    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 1, 2, 2, 2, 2, 1, 0, 0, 0],
    [1, 2, 2, 2, 2, 2, 2, 1, 0, 0],
    [1, 3, 3, 3, 2, 2, 2, 1, 1, 1],
    [1, 3, 3, 3, 2, 2, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 2, 1],
    [1, 2, 2, 1, 1, 2, 2, 1, 1, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  ],
  walk2: [
    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 1, 2, 2, 2, 2, 1, 0, 0, 0],
    [1, 2, 2, 2, 2, 2, 2, 1, 0, 0],
    [1, 3, 3, 3, 2, 2, 2, 1, 1, 1],
    [1, 3, 3, 3, 2, 2, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 2, 1],
    [1, 2, 2, 1, 1, 2, 2, 1, 1, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
  ],
};

const BANANA_DEMON = [
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    2, 6, 2, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    8, 8, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    3, 5, 8, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    6, 5, 3, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    2, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    2, 5, 5, 8, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    8, 4, 5, 3, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6,
    4, 4, 4, 5, 3, 6, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
    4, 4, 4, 4, 8, 8, 8, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 7, 9, 4,
    4, 4, 4, 5, 6, 2, 3, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 1,
    1, 4, 4, 6, 2, 6, 5, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 1, 1,
    1, 4, 4, 6, 2, 3, 5, 3, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 9, 1, 1,
    4, 4, 4, 4, 5, 5, 5, 5, 8, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 4, 1, 1,
    4, 4, 4, 4, 4, 5, 5, 5, 3, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 4, 1, 1,
    4, 4, 4, 4, 4, 4, 5, 5, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 4, 4, 4, 4,
    4, 4, 4, 4, 5, 5, 5, 5, 3, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 5, 4, 5, 4,
    4, 5, 8, 6, 3, 5, 5, 5, 3, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 6, 3, 3, 4,
    5, 6, 7, 6, 3, 5, 5, 5, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 8, 8, 3, 6,
    2, 8, 2, 8, 5, 5, 5, 5, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 9, 5, 5, 4, 3,
    6, 6, 3, 4, 4, 5, 5, 5, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 6, 6, 2, 9, 5, 5, 4, 5,
    3, 5, 4, 4, 4, 5, 5, 5, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 8, 9, 8, 2, 3, 5, 3, 3, 3,
    5, 8, 8, 5, 5, 5, 5, 5, 8, 8, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 7, 6, 6, 8, 9, 9, 8, 3, 8, 9, 9,
    9, 9, 8, 6, 5, 5, 5, 3, 8, 2, 7, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 6, 8, 6, 6, 6, 2, 8, 8, 6, 8, 9, 6, 8, 9,
    6, 9, 2, 2, 5, 4, 5, 8, 2, 2, 8, 6, 6, 8, 2, 7, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 7, 7, 2, 2, 8, 6, 6, 9, 9, 9, 6, 2, 6, 2, 9, 4, 9, 9, 8,
    6, 9, 2, 2, 3, 4, 3, 2, 8, 9, 9, 9, 9, 8, 8, 2, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 2, 8, 8, 8, 2, 2, 9, 9, 9, 9, 8, 7, 7, 2, 5, 4, 4, 4, 4,
    5, 9, 9, 8, 3, 5, 8, 6, 9, 9, 9, 8, 8, 8, 8, 2, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 2, 6, 8, 9, 6, 7, 2, 8, 8, 8, 6, 2, 7, 7, 6, 4, 5, 5, 5, 5,
    5, 5, 8, 8, 4, 5, 6, 2, 6, 8, 9, 8, 6, 6, 6, 2, 7, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 6, 8, 9, 8, 2, 2, 7, 2, 2, 2, 2, 7, 7, 7, 9, 4, 4, 4, 4, 5,
    5, 5, 5, 4, 4, 5, 6, 7, 2, 6, 6, 8, 6, 2, 2, 7, 6, 6, 7, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 2, 8, 8, 9, 6, 6, 6, 7, 0, 7, 7, 7, 0, 0, 2, 4, 4, 4, 1, 1, 4,
    5, 5, 5, 5, 5, 3, 8, 2, 7, 7, 2, 2, 2, 2, 7, 7, 8, 9, 2, 0, 0, 0,
  ],
  [
    0, 0, 0, 7, 6, 8, 8, 6, 6, 6, 2, 0, 0, 0, 0, 0, 0, 0, 9, 4, 4, 1, 1, 1, 1,
    4, 5, 5, 4, 4, 5, 3, 6, 2, 7, 7, 2, 6, 9, 9, 8, 6, 8, 2, 0, 0, 0,
  ],
  [
    0, 0, 0, 2, 6, 8, 8, 2, 7, 7, 0, 0, 0, 0, 0, 0, 0, 2, 4, 4, 4, 1, 1, 1, 1,
    4, 4, 5, 4, 5, 5, 3, 8, 6, 2, 7, 6, 9, 9, 9, 9, 6, 6, 6, 2, 0, 0,
  ],
  [
    0, 0, 7, 6, 8, 6, 8, 8, 2, 0, 0, 0, 0, 0, 0, 0, 0, 6, 4, 4, 1, 1, 1, 1, 4,
    4, 4, 5, 5, 5, 5, 3, 8, 3, 6, 7, 2, 6, 8, 8, 8, 6, 2, 6, 2, 2, 0,
  ],
  [
    0, 0, 7, 6, 9, 6, 2, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 9, 4, 4, 1, 1, 1, 1, 4,
    4, 4, 4, 5, 5, 5, 3, 3, 3, 2, 0, 0, 2, 6, 6, 6, 2, 6, 8, 6, 6, 7,
  ],
  [
    0, 7, 2, 2, 6, 8, 6, 2, 2, 0, 0, 0, 0, 0, 0, 0, 9, 4, 4, 1, 1, 1, 1, 4, 4,
    4, 4, 4, 3, 5, 5, 3, 3, 3, 0, 0, 0, 0, 7, 7, 2, 8, 9, 9, 6, 6, 2,
  ],
  [
    0, 7, 2, 6, 2, 2, 2, 7, 0, 0, 0, 0, 0, 0, 0, 0, 9, 4, 1, 1, 1, 1, 4, 4, 4,
    4, 4, 5, 3, 5, 5, 3, 3, 6, 0, 0, 0, 0, 0, 0, 6, 9, 9, 8, 6, 6, 7,
  ],
  [
    0, 7, 2, 2, 6, 2, 7, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 4, 1, 1, 1, 1, 4, 4, 4,
    4, 4, 5, 5, 5, 3, 3, 3, 2, 0, 0, 0, 0, 0, 7, 8, 9, 8, 8, 6, 7, 7,
  ],
  [
    0, 0, 7, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 4, 1, 1, 1, 1, 4, 4, 4, 4,
    4, 4, 5, 5, 5, 3, 3, 8, 0, 0, 0, 0, 0, 0, 7, 8, 8, 9, 6, 2, 7, 7,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 4, 1, 1, 1, 1, 1, 4, 4, 4, 4,
    4, 5, 5, 5, 3, 3, 3, 2, 0, 0, 2, 2, 0, 0, 6, 8, 8, 6, 6, 2, 7, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 4, 4, 1, 1, 1, 1, 4, 4, 4, 4, 4,
    5, 5, 5, 3, 3, 3, 8, 0, 0, 2, 8, 9, 8, 6, 8, 9, 8, 6, 6, 2, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 4, 4, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4,
    5, 5, 5, 3, 3, 3, 0, 0, 2, 6, 2, 6, 9, 9, 9, 9, 8, 6, 2, 7, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 4, 4, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 5,
    5, 5, 3, 3, 3, 2, 0, 0, 2, 2, 2, 6, 9, 8, 8, 8, 6, 2, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 4, 4, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 5, 5,
    5, 5, 3, 3, 8, 0, 0, 0, 7, 6, 9, 8, 6, 6, 8, 6, 2, 7, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 4, 4, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 5, 5, 5,
    5, 3, 3, 8, 0, 0, 0, 0, 0, 2, 2, 2, 6, 8, 2, 2, 2, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 9, 4, 4, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5,
    3, 3, 8, 0, 0, 0, 0, 0, 0, 7, 7, 2, 2, 6, 6, 2, 7, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 9, 4, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 3,
    3, 3, 2, 0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 2, 2, 7, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 9, 4, 4, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 3, 3,
    3, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 9, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 3, 3, 3,
    2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 2, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 3, 3, 3, 3, 6,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 9, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 3, 3, 3, 3, 8, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 8, 5, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 3, 3, 3, 3, 6, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 2, 3, 5, 5, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 3, 3, 3, 3, 8, 6, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 7, 2, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 3, 6, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 2, 2, 2, 8, 3, 3, 3, 5, 5, 5, 5, 5, 3, 3, 3, 3, 8, 6, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 2, 2, 2, 2, 8, 3, 3, 3, 5, 3, 3, 3, 3, 3, 8, 6, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 7, 7, 2, 6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
];

const DEMON_SPRITES = {
  idle: BANANA_DEMON,
  walk1: BANANA_DEMON,
  walk2: BANANA_DEMON,
};

// Banana sprite (approx 20x15)
const BANANA_SPRITE = [
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 2, 2, 2, 3, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 2, 2, 3, 3, 3, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const HEALTH_CROSS_SPRITE = [
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
];

const DAMAGE_BANANAS_SPRITE = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 2, 2, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 2, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 2, 2, 2, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 2, 2, 2, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 2, 2, 2, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 2, 2, 2, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 2, 2, 2, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 2, 2, 2, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 2, 2, 2, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
];

// *** NEW *** Buff colors
const BUFF_COLORS = {
  // Health cross colors
  HEALTH: {
    0: 0x000000, // Transparent
    1: 0x00ff00, // Bright green cross
  },
  // Damage banana bunch colors
  DAMAGE: {
    0: 0x000000, // Transparent
    1: 0xffd700, // Golden yellow banana
    2: 0xffa500, // Orange highlight
  },
};

// Demon colors
const DEMON_COLORS = {
  0: 0x000000, // Transparent (using your original value for index 0)
  1: 0xf5e685, // New: (245, 230, 133)
  2: 0x5c381f, // New: (92, 56, 31)
  3: 0xc29220, // New: (194, 146, 32)
  4: 0xf0d248, // New: (240, 210, 72)
  5: 0xd9af28, // New: (217, 175, 40)
  6: 0x7f5329, // New: (127, 83, 41)
  7: 0x351e13, // New: (53, 30, 19)
  8: 0x9b6934, // New: (155, 105, 52)
  9: 0xae8452, // New: (174, 132, 82) - (This is the new 9th color)
};
// Banana colors
const BANANA_COLORS = {
  1: 0x4a2d0b, // Dark brown outline
  2: 0xffe135, // Main yellow
  3: 0xfff7a1, // Light yellow highlight
  4: 0x804e1c, // Brown tip
};

// Color palettes for different players (Among Us style)
const PLAYER_COLORS = {
  0: {
    // Player 1 - Red Among Us
    1: 0x8b0000, // Outline dark red
    2: 0xff4444, // Main body red
    3: 0x87ceeb, // Visor light blue
    4: 0x000000, // Eyes/details black
    5: 0x8b4513, // Unused
    6: 0x32cd32, // Unused
    7: 0x654321, // Unused
  },
  1: {
    // Player 2 - Blue Among Us
    1: 0x000080, // Outline dark blue
    2: 0x4169e1, // Main body blue
    3: 0x87ceeb, // Visor light blue
    4: 0x000000, // Eyes/details black
    5: 0x8b4513, // Unused
    6: 0xdc143c, // Unused
    7: 0x654321, // Unused
  },
};

// Map - 1 = wall, 0 = empty
const MAP_SIZE = 15;
let map = [];

// Generate maze using DFS algorithm from the beginning
function generateMaze() {
  // Initialize maze with all walls
  map = [];
  for (let y = 0; y < MAP_SIZE; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_SIZE; x++) {
      map[y][x] = 1; // All walls initially
    }
  }

  // Generate maze using DFS
  generateMazeWithDFS();

  // Remove dead ends to ensure no paths go to no-exit walls
  eliminateDeadEnds();

  // Randomly remove some additional walls for variety
  addRandomPaths();
}

// Generate the initial maze structure using DFS
function generateMazeWithDFS() {
  const visited = new Set();
  const directions = [
    [0, 2],
    [2, 0],
    [0, -2],
    [-2, 0], // Move by 2 to maintain wall structure
  ];

  // Start from a random odd position (ensures proper maze structure)
  let startX =
    1 + Math.floor(Math.random() * Math.floor((MAP_SIZE - 2) / 2)) * 2;
  let startY =
    1 + Math.floor(Math.random() * Math.floor((MAP_SIZE - 2) / 2)) * 2;

  // Make sure starting position is within bounds and odd
  startX = Math.min(startX, MAP_SIZE - 2);
  startY = Math.min(startY, MAP_SIZE - 2);
  if (startX % 2 === 0) startX = Math.max(1, startX - 1);
  if (startY % 2 === 0) startY = Math.max(1, startY - 1);

  map[startY][startX] = 0; // Carve starting cell
  const stack = [[startX, startY]];
  visited.add(`${startX},${startY}`);

  while (stack.length > 0) {
    const [currentX, currentY] = stack[stack.length - 1];
    const neighbors = [];

    // Find unvisited neighbors
    for (const [dx, dy] of directions) {
      const newX = currentX + dx;
      const newY = currentY + dy;

      if (
        newX >= 1 &&
        newX < MAP_SIZE - 1 &&
        newY >= 1 &&
        newY < MAP_SIZE - 1 &&
        !visited.has(`${newX},${newY}`)
      ) {
        neighbors.push([newX, newY]);
      }
    }

    if (neighbors.length > 0) {
      // Choose random neighbor
      const [nextX, nextY] =
        neighbors[Math.floor(Math.random() * neighbors.length)];

      // Carve path to neighbor
      map[nextY][nextX] = 0;
      map[currentY + (nextY - currentY) / 2][
        currentX + (nextX - currentX) / 2
      ] = 0;

      visited.add(`${nextX},${nextY}`);
      stack.push([nextX, nextY]);
    } else {
      stack.pop(); // Backtrack
    }
  }
}

// Eliminate dead ends by connecting them to other paths
function eliminateDeadEnds() {
  let changed = true;
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  while (changed) {
    changed = false;

    for (let y = 1; y < MAP_SIZE - 1; y++) {
      for (let x = 1; x < MAP_SIZE - 1; x++) {
        if (map[y][x] === 0) {
          // If it's an empty cell
          // Count adjacent empty cells
          let emptyNeighbors = 0;
          const wallNeighbors = [];

          for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;

            if (newX >= 0 && newX < MAP_SIZE && newY >= 0 && newY < MAP_SIZE) {
              if (map[newY][newX] === 0) {
                emptyNeighbors++;
              } else {
                wallNeighbors.push([newX, newY]);
              }
            }
          }

          // If this is a dead end (only one connection)
          if (emptyNeighbors === 1 && wallNeighbors.length > 0) {
            // Try to connect to another path by removing a wall
            const validWalls = wallNeighbors.filter(([wx, wy]) => {
              // Check if removing this wall would connect to another path
              let connectsToPath = false;
              for (const [dx2, dy2] of directions) {
                const checkX = wx + dx2;
                const checkY = wy + dy2;
                if (
                  checkX >= 0 &&
                  checkX < MAP_SIZE &&
                  checkY >= 0 &&
                  checkY < MAP_SIZE &&
                  map[checkY][checkX] === 0 &&
                  (checkX !== x || checkY !== y)
                ) {
                  connectsToPath = true;
                  break;
                }
              }
              return (
                connectsToPath &&
                wx > 0 &&
                wx < MAP_SIZE - 1 &&
                wy > 0 &&
                wy < MAP_SIZE - 1
              );
            });

            if (validWalls.length > 0) {
              const [wallX, wallY] =
                validWalls[Math.floor(Math.random() * validWalls.length)];
              map[wallY][wallX] = 0;
              changed = true;
            }
          }
        }
      }
    }
  }
}

// Add some random paths for variety while maintaining connectivity
function addRandomPaths() {
  const additionalPaths = Math.floor(MAP_SIZE * MAP_SIZE * 0.99); // 60% additional paths

  for (let i = 0; i < additionalPaths; i++) {
    const x = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
    const y = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;

    // Only remove wall if it connects two empty areas
    if (map[y][x] === 1) {
      const directions = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ];
      let adjacentEmpty = 0;

      for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;
        if (
          newX >= 0 &&
          newX < MAP_SIZE &&
          newY >= 0 &&
          newY < MAP_SIZE &&
          map[newY][newX] === 0
        ) {
          adjacentEmpty++;
        }
      }

      // Only remove wall if it connects exactly 2 empty areas (creates a loop)
      if (adjacentEmpty >= 2) {
        map[y][x] = 0;
      }
    }
  }
}

// Game constants
const PLAYER_MAX_HEALTH = 100;
const BULLET_DAMAGE = 25;
const MONSTER_DAMAGE = 10;
const MONSTER_ATTACK_COOLDOWN = 240; // frames between attacks
const MONSTER_DETECTION_RANGE = 3.0;
const MONSTER_ATTACK_RANGE = 1.0;
const MONSTER_SPEED = 0.015;
const MONSTER_CHASE_SPEED = 0.02;

// Points system constants
const POINTS_MONSTER_KILL = 5;
const POINTS_PLAYER_KILL = 20;
const POINTS_DEATH_PENALTY = -10;

// Game timer constants
const GAME_DURATION = 120 * 60; // 2 minutes at 60fps (120 seconds * 60 fps)
const RESPAWN_DELAY = 3 * 60; // 3 seconds at 60fps
const WALL_COLLISION_BUFFER = 0.1; // Buffer zone around player for wall collision

// *** NEW *** Buff system constants
const BUFF_TYPES = {
  HEALTH: "health",
  DAMAGE: "damage",
};

const BUFF_PICKUP_TIME = 0.2 * 60; // seconds at 60fps
const BUFF_RESPAWN_TIME = 1200; // 20 seconds at 60fps
const HEALTH_BUFF_AMOUNT = 100;
const DAMAGE_BUFF_MULTIPLIER = 2;

// Players
const players = [];

// Monsters
let monsters = [];
let deadMonsters = []; // Track dead monsters for respawning

// Game state variables
let gameTimer = GAME_DURATION;
let gameStartTime = 0;
let gameEnded = false;
let winner = null;

// Floating point text system
let floatingTexts = [];

// *** NEW *** Buff system variables
let buffs = [];
let nextBuffSpawn = 0;

class Monster {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.health = 50;
    this.maxHealth = 50;
    this.moveSpeed = MONSTER_SPEED;
    this.isMoving = false;
    this.animFrame = 0;
    this.animTimer = 0;
    this.state = "roaming"; // 'roaming', 'chasing', 'attacking'
    this.target = null; // Target player
    this.attackCooldown = 0;
    this.pathUpdateTimer = 0;
    this.hitFlashTimer = 0;
    this.lastX = x;
    this.lastY = y;
  }
}

class DeadMonster {
  constructor(deathTime) {
    this.deathTime = deathTime;
    this.respawnTime = deathTime + 120; // 2 seconds at 60 FPS
  }
}
class Player {
  constructor(x, y, color, playerId, spriteType = SPRITE_TYPES.AMONGUS) {
    this.x = x;
    this.y = y;
    this.a = 0; // angle
    this.color = color;
    this.playerId = playerId;
    this.spriteType = spriteType; // Store selected sprite type
    this.moveSpeed = 0.03;
    this.rotSpeed = 0.03;
    this.isMoving = false;
    this.animFrame = 0;
    this.animTimer = 0;
    this.lastX = x;
    this.lastY = y;
    // Health and shooting properties
    this.health = PLAYER_MAX_HEALTH;
    this.maxHealth = PLAYER_MAX_HEALTH;
    this.shootCooldown = 0;
    this.shootDelay = 30; // 30 frames cooldown (0.5 seconds at 60fps)
    // Weapon animation properties
    this.weaponBobTimer = 0;
    this.weaponFireTimer = 0; // Countdown for fire animation
    // Damage visual effects
    this.hitFlashTimer = 0; // Timer for hit flash effect
    this.damageScreenTimer = 0; // Timer for screen damage effect
    // Points and respawn system
    this.score = 0;
    this.respawnTimer = 0; // Timer for respawn delay
    this.isDead = false; // Flag to track if player is dead and waiting to respawn
    // *** NEW *** Damage buff system
    this.damageMultiplier = 1;
    this.damageBuffTimer = 0;
  }
}

// Bullet class
let bullets = [];
class Bullet {
  constructor(x, y, angle, ownerId) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.ownerId = ownerId;
    this.speed = 0.1;
    this.lifetime = 100; // Frames before it disappears
    // *** NEW *** Get damage from owner's multiplier
    const owner = players.find((p) => p.playerId === ownerId);
    this.damage = BULLET_DAMAGE * (owner ? owner.damageMultiplier : 1);
  }
}

// Floating text class for point notifications
// *** NEW *** Floating text class for point notifications
class FloatingText {
  constructor(x, y, text, color = "#ffff00") {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.lifetime = 120; // 2 seconds at 60fps
    this.velocityY = -0.5; // Float upward
  }

  update() {
    this.y += this.velocityY;
    this.lifetime--;
    return this.lifetime > 0;
  }
}

// *** NEW *** Buff class
class Buff {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.animTimer = 0;
    this.floatOffset = 0;
    this.playersNearby = new Map(); // Track how long each player has been nearby
  }

  update() {
    this.animTimer++;
    this.floatOffset = Math.sin(this.animTimer * 0.1) * 0.1; // Floating animation

    // Check for players nearby
    for (const player of players) {
      if (player.isDead) continue;

      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 0.5) {
        // Player is nearby
        if (!this.playersNearby.has(player.playerId)) {
          this.playersNearby.set(player.playerId, 0);
        }
        this.playersNearby.set(
          player.playerId,
          this.playersNearby.get(player.playerId) + 1,
        );

        // Check if player has been nearby long enough
        if (this.playersNearby.get(player.playerId) >= BUFF_PICKUP_TIME) {
          this.applyBuff(player);
          return true; // Buff consumed
        }
      } else {
        // Player moved away, reset their timer
        this.playersNearby.delete(player.playerId);
      }
    }

    return false; // Buff not consumed
  }

  applyBuff(player) {
    if (this.type === BUFF_TYPES.HEALTH) {
      player.health = Math.min(
        player.maxHealth * 5,
        player.health + HEALTH_BUFF_AMOUNT,
      );
      createFloatingText(
        player.x * 50,
        player.y * 50,
        `+${HEALTH_BUFF_AMOUNT} HP`,
        "#00ff00",
      );
    } else if (this.type === BUFF_TYPES.DAMAGE) {
      player.damageMultiplier = DAMAGE_BUFF_MULTIPLIER;
      player.damageBuffTimer = 30 * 60; // 30 seconds
      createFloatingText(player.x * 50, player.y * 50, "DAMAGE x2!", "#ffaa00");
    }
  }
}

// Input handling
const keys = {};

function create() {
  scene = this;
  graphics = this.add.graphics();

  // Generate initial maze
  generateMaze();
  initializePlayers();

  // Input setup
  this.input.keyboard.on("keydown", (e) => {
    const key = KEYBOARD_TO_ARCADE[e.key] || e.key;
    keys[key] = true;

    if (currentState === "menu") {
      if (key === "START1") {
        numPlayers = 1;
        selectedSprites = [SPRITE_TYPES.AMONGUS, SPRITE_TYPES.AMONGUS]; // Always use Among Us
        startNewGame();
      } else if (key === "START2") {
        numPlayers = 2;
        selectedSprites = [SPRITE_TYPES.AMONGUS, SPRITE_TYPES.AMONGUS]; // Always use Among Us
        startNewGame();
      }
    } else if (currentState === "game") {
      if (key === "START1" || key === "START2") {
        currentState = "menu";
      }
    } else if (currentState === "gameOver") {
      if (key === "Escape" || key === "START1" || key === "START2") {
        currentState = "menu";
      }
    }
  });

  this.input.keyboard.on("keyup", (e) => {
    const key = KEYBOARD_TO_ARCADE[e.key] || e.key;
    keys[key] = false;
  });
}

function startNewGame() {
  generateMaze();
  initializePlayers();
  initializeMonsters(); // *** NEW *** Initialize monsters
  bullets = []; // *** NEW *** Clear bullets on new game
  deadMonsters = []; // *** NEW *** Clear dead monsters on new game

  // *** NEW *** Reset game timer and state
  gameTimer = GAME_DURATION;
  gameStartTime = Date.now();
  gameEnded = false;
  winner = null;

  // *** NEW *** Reset all player scores and states
  for (const player of players) {
    player.score = 0;
    player.isDead = false;
    player.respawnTimer = 0;
    // *** NEW *** Reset damage multiplier
    player.damageMultiplier = 1;
    player.damageBuffTimer = 0;
  }

  // *** NEW *** Clear floating texts
  floatingTexts = [];

  // *** NEW *** Initialize buff system
  buffs = [];
  nextBuffSpawn = Date.now() + 5000; // First buff spawns after 5 seconds

  currentState = "game";
}

function initializePlayers() {
  // Clear existing players
  players.length = 0;

  // Find empty positions for players
  const emptySpots = [];
  for (let y = 1; y < MAP_SIZE - 1; y++) {
    for (let x = 1; x < MAP_SIZE - 1; x++) {
      if (map[y][x] === 0) emptySpots.push({ x: x + 0.5, y: y + 0.5 });
    }
  }

  // Initialize only active players based on numPlayers
  for (let i = 0; i < numPlayers; i++) {
    const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
    // Using player colors from the palette
    const playerColor = i === 0 ? PLAYER_COLORS[0][2] : PLAYER_COLORS[1][2];
    players.push(
      new Player(spot.x, spot.y, playerColor, i, selectedSprites[i]),
    );
    emptySpots.splice(emptySpots.indexOf(spot), 1);
  }
}

// Initialize monsters in the maze
function initializeMonsters() {
  monsters = [];

  // Find empty positions for monsters
  const emptySpots = [];
  for (let y = 1; y < MAP_SIZE - 1; y++) {
    for (let x = 1; x < MAP_SIZE - 1; x++) {
      if (map[y][x] === 0) emptySpots.push({ x: x + 0.5, y: y + 0.5 });
    }
  }

  // Spawn 5 monsters randomly
  const numMonsters = 5;
  for (let i = 0; i < numMonsters && emptySpots.length > 0; i++) {
    const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
    monsters.push(new Monster(spot.x, spot.y));
    emptySpots.splice(emptySpots.indexOf(spot), 1);
  }
}

// Respawn a monster far from players
function respawnMonster() {
  // Find empty positions far from players
  const emptySpots = [];
  for (let y = 1; y < MAP_SIZE - 1; y++) {
    for (let x = 1; x < MAP_SIZE - 1; x++) {
      if (map[y][x] === 0) {
        const spot = { x: x + 0.5, y: y + 0.5 };

        // Check distance from all players
        let farFromPlayers = true;
        for (const player of players) {
          const dx = spot.x - player.x;
          const dy = spot.y - player.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 5.0) {
            // Must be at least 5 units away from any player
            farFromPlayers = false;
            break;
          }
        }

        if (farFromPlayers) {
          emptySpots.push(spot);
        }
      }
    }
  }

  // If we found spots far from players, spawn there
  if (emptySpots.length > 0) {
    const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
    monsters.push(new Monster(spot.x, spot.y));
  } else {
    // Fallback: spawn at any empty spot (shouldn't happen in normal gameplay)
    const allEmptySpots = [];
    for (let y = 1; y < MAP_SIZE - 1; y++) {
      for (let x = 1; x < MAP_SIZE - 1; x++) {
        if (map[y][x] === 0) allEmptySpots.push({ x: x + 0.5, y: y + 0.5 });
      }
    }

    if (allEmptySpots.length > 0) {
      const spot =
        allEmptySpots[Math.floor(Math.random() * allEmptySpots.length)];
      monsters.push(new Monster(spot.x, spot.y));
    }
  }
}

// Respawn player function
function respawnPlayer(player) {
  const emptySpots = [];
  for (let y = 1; y < MAP_SIZE - 1; y++) {
    for (let x = 1; x < MAP_SIZE - 1; x++) {
      if (map[y][x] === 0) emptySpots.push({ x: x + 0.5, y: y + 0.5 });
    }
  }

  if (emptySpots.length > 0) {
    // Try to find a spot away from other players
    let bestSpot = emptySpots[0];
    let maxDist = 0;
    for (const spot of emptySpots) {
      let minDistToOther = Infinity;
      for (const p of players) {
        if (p === player) continue;
        const dx = spot.x - p.x;
        const dy = spot.y - p.y;
        minDistToOther = Math.min(minDistToOther, dx * dx + dy * dy);
      }
      if (minDistToOther > maxDist) {
        maxDist = minDistToOther;
        bestSpot = spot;
      }
    }
    player.x = bestSpot.x;
    player.y = bestSpot.y;
  } else {
    // Failsafe, though this shouldn't happen in a valid maze
    player.x = 1.5;
    player.y = 1.5;
  }

  player.health = player.maxHealth;
  player.a = Math.random() * Math.PI * 2; // Random angle
  // Reset damage visual effects
  player.hitFlashTimer = 0;
  player.damageScreenTimer = 0;
  // Reset respawn state
  player.isDead = false;
  player.respawnTimer = 0;
}

function update() {
  graphics.clear();

  if (currentState === "menu") {
    drawMenu();
  } else if (currentState === "gameOver") {
    drawGameOver();
  } else {
    // Update game timer
    if (!gameEnded) {
      gameTimer--;
      if (gameTimer <= 0) {
        endGame();
      }
    }

    updatePlayerRespawns(); // *** NEW *** Update player respawn timers
    updateFloatingTexts(); // *** NEW *** Update floating point texts
    updateBuffs(); // *** NEW *** Update buff system
    handleInput();
    updateBullets(); // Update bullet logic
    updateMonsters(); // Update monster AI
    updateMonsterRespawns(); // Update monster respawns
    updatePlayerEffects(); // Update player visual effects
    drawGame();
  }
}

// End game and determine winner
function endGame() {
  gameEnded = true;
  currentState = "gameOver";

  // Find winner (player with highest score)
  let highestScore = -Infinity;
  winner = null;
  let tiedPlayers = [];

  for (const player of players) {
    if (player.score > highestScore) {
      highestScore = player.score;
      winner = player;
      tiedPlayers = [player];
    } else if (player.score === highestScore) {
      tiedPlayers.push(player);
    }
  }

  // Handle ties - if multiple players have same highest score, no winner
  if (tiedPlayers.length > 1) {
    winner = null;
  }
}

// Create floating text notification
function createFloatingText(x, y, text, color) {
  floatingTexts.push(new FloatingText(x, y, text, color));
}

// Update floating texts
function updateFloatingTexts() {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    if (!floatingTexts[i].update()) {
      floatingTexts.splice(i, 1);
    }
  }
}

// Update player respawn timers
function updatePlayerRespawns() {
  for (const player of players) {
    if (player.isDead && player.respawnTimer > 0) {
      player.respawnTimer--;
      if (player.respawnTimer <= 0) {
        respawnPlayer(player);
        player.isDead = false;
      }
    }
  }
}

function drawMenu() {
  graphics.fillStyle(0x222222);
  graphics.fillRect(0, 0, 800, 600);

  // Clear any existing text objects
  scene.children.getChildren().forEach((child) => {
    if (child.type === "Text") {
      child.destroy();
    }
  });

  // Title
  scene.add
    .text(400, 150, "BANANA MAYHEM", {
      fontSize: "64px",
      color: "#ff0000",
      fontFamily: "monospace",
    })
    .setOrigin(0.5)
    .setDepth(1);

  // Options
  scene.add
    .text(400, 280, "Press P1 START: 1 Player", {
      fontSize: "28px",
      color: "#00ff00",
      fontFamily: "monospace",
    })
    .setOrigin(0.5)
    .setDepth(1);

  scene.add
    .text(400, 320, "Press P2 START: 2 Players", {
      fontSize: "28px",
      color: "#00ffff",
      fontFamily: "monospace",
    })
    .setOrigin(0.5)
    .setDepth(1);

  scene.add
    .text(400, 380, "In Game: START to return to menu", {
      fontSize: "20px",
      color: "#ffff00",
      fontFamily: "monospace",
    })
    .setOrigin(0.5)
    .setDepth(1);

  scene.add
    .text(400, 430, "WASD/Arrows: Move & Turn", {
      fontSize: "20px",
      color: "#888888",
      fontFamily: "monospace",
    })
    .setOrigin(0.5)
    .setDepth(1);

  scene.add
    .text(400, 460, "Hold I/T + Left/Right: Strafe", {
      fontSize: "20px",
      color: "#88ff88",
      fontFamily: "monospace",
    })
    .setOrigin(0.5)
    .setDepth(1);

  // Added shoot controls info
  scene.add
    .text(400, 490, "P1 'U' / P2 'R': Shoot", {
      fontSize: "20px",
      color: "#ff8888",
      fontFamily: "monospace",
    })
    .setOrigin(0.5)
    .setDepth(1);
}

// Sprite selection removed - game always uses Among Us sprites

// Draw game over screen
function drawGameOver() {
  graphics.fillStyle(0x000000, 1);
  graphics.fillRect(0, 0, 800, 600);

  // Title
  graphics.fillStyle(0xffffff, 1);
  scene.add
    .text(400, 150, "GAME OVER", {
      fontSize: "48px",
      color: "#ffffff",
      fontFamily: "monospace",
    })
    .setOrigin(0.5);

  // Timer display
  scene.add
    .text(400, 200, "Time's Up!", {
      fontSize: "24px",
      color: "#ffff00",
      fontFamily: "monospace",
    })
    .setOrigin(0.5);

  // Winner announcement
  if (winner) {
    scene.add
      .text(400, 250, `Winner: Player ${winner.playerId + 1}`, {
        fontSize: "32px",
        color: "#00ff00",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    scene.add
      .text(400, 300, `Final Score: ${winner.score} points`, {
        fontSize: "24px",
        color: "#00ff00",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);
  } else {
    scene.add
      .text(400, 250, "It's a Tie!", {
        fontSize: "32px",
        color: "#ffaa00",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);
  }

  // Scores for all players
  scene.add
    .text(400, 380, "Final Scores:", {
      fontSize: "20px",
      color: "#ffffff",
      fontFamily: "monospace",
    })
    .setOrigin(0.5);

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    scene.add
      .text(
        400,
        410 + i * 25,
        `Player ${player.playerId + 1}: ${player.score} points`,
        {
          fontSize: "18px",
          color: "#ffffff",
          fontFamily: "monospace",
        },
      )
      .setOrigin(0.5);
  }

  // Restart instruction
  scene.add
    .text(400, 520, "Press ESC to return to menu", {
      fontSize: "16px",
      color: "#888888",
      fontFamily: "monospace",
    })
    .setOrigin(0.5);
}

// Update player visual effects timers
// *** NEW *** Update player visual effects timers
function updatePlayerEffects() {
  for (const player of players) {
    // Update hit flash timer
    if (player.hitFlashTimer > 0) {
      player.hitFlashTimer--;
    }

    // Update damage screen timer
    if (player.damageScreenTimer > 0) {
      player.damageScreenTimer--;
    }

    // *** NEW *** Update damage buff timer
    if (player.damageBuffTimer > 0) {
      player.damageBuffTimer--;
      if (player.damageBuffTimer === 0) {
        player.damageMultiplier = 1; // Reset to normal damage
      }
    }
  }
}

// *** NEW *** Update buff system
function updateBuffs() {
  // Update existing buffs
  for (let i = buffs.length - 1; i >= 0; i--) {
    if (buffs[i].update()) {
      // Buff was consumed
      buffs.splice(i, 1);
      nextBuffSpawn = Date.now() + BUFF_RESPAWN_TIME * (1000 / 60); // 20 seconds
    }
  }

  // Spawn new buff if it's time
  if (buffs.length === 0 && Date.now() >= nextBuffSpawn) {
    spawnRandomBuff();
  }
}

// *** NEW *** Spawn a random buff at a random location
function spawnRandomBuff() {
  const emptySpots = [];
  for (let y = 1; y < MAP_SIZE - 1; y++) {
    for (let x = 1; x < MAP_SIZE - 1; x++) {
      if (map[y][x] === 0) {
        emptySpots.push({ x: x + 0.5, y: y + 0.5 });
      }
    }
  }

  if (emptySpots.length > 0) {
    const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
    const buffType =
      Math.random() < 0.5 ? BUFF_TYPES.HEALTH : BUFF_TYPES.DAMAGE;
    buffs.push(new Buff(spot.x, spot.y, buffType));
  }
}

// Update monster AI and behavior
function updateMonsters() {
  for (const monster of monsters) {
    // Update animation
    monster.animTimer++;
    if (monster.animTimer > 15) {
      monster.animTimer = 0;
      monster.animFrame = (monster.animFrame + 1) % 2;
    }

    // Update attack cooldown
    if (monster.attackCooldown > 0) {
      monster.attackCooldown--;
    }

    // Update hit flash timer
    if (monster.hitFlashTimer > 0) {
      monster.hitFlashTimer--;
    }

    // Find nearest player (only alive players)
    let nearestPlayer = null;
    let nearestDistance = Infinity;

    for (const player of players) {
      // Skip dead players
      if (player.isDead) continue;

      const dx = player.x - monster.x;
      const dy = player.y - monster.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPlayer = player;
      }
    }

    // State machine
    if (nearestPlayer && nearestDistance < MONSTER_DETECTION_RANGE) {
      if (nearestDistance < MONSTER_ATTACK_RANGE) {
        // Attack state
        monster.state = "attacking";
        monster.target = nearestPlayer;

        // Check if player is in attack range
        if (nearestDistance <= MONSTER_ATTACK_RANGE) {
          if (monster.attackCooldown === 0) {
            // Attack player
            nearestPlayer.health -= MONSTER_DAMAGE;
            nearestPlayer.hitFlashTimer = 20;
            nearestPlayer.damageScreenTimer = 15;
            monster.attackCooldown = MONSTER_ATTACK_COOLDOWN;

            if (nearestPlayer.health <= 0) {
              // Deduct points for death by monster
              nearestPlayer.score += POINTS_DEATH_PENALTY;
              createFloatingText(
                nearestPlayer.x * 50,
                nearestPlayer.y * 50,
                `${POINTS_DEATH_PENALTY}`,
                "#ff0000",
              );

              // Reset health and start respawn timer
              nearestPlayer.health = 0;
              nearestPlayer.isDead = true;
              nearestPlayer.respawnTimer = RESPAWN_DELAY;
            }
          } else {
            monster.attackCooldown--;
          }
        }
      } else {
        // Chase state
        monster.state = "chasing";
        monster.target = nearestPlayer;
        monster.targetX = nearestPlayer.x;
        monster.targetY = nearestPlayer.y;
      }
    } else {
      // Roaming state
      monster.state = "roaming";
      monster.target = null;

      // Update roaming target occasionally
      monster.pathUpdateTimer++;
      if (monster.pathUpdateTimer > 120) {
        // Every 2 seconds
        monster.pathUpdateTimer = 0;

        // Find a new random target nearby
        const attempts = 10;
        for (let i = 0; i < attempts; i++) {
          const newX = monster.x + (Math.random() - 0.5) * 4;
          const newY = monster.y + (Math.random() - 0.5) * 4;

          const mapX = Math.floor(newX);
          const mapY = Math.floor(newY);

          if (
            mapX > 0 &&
            mapX < MAP_SIZE - 1 &&
            mapY > 0 &&
            mapY < MAP_SIZE - 1 &&
            map[mapY][mapX] === 0
          ) {
            monster.targetX = newX;
            monster.targetY = newY;
            break;
          }
        }
      }
    }

    // Movement
    const dx = monster.targetX - monster.x;
    const dy = monster.targetY - monster.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0.1) {
      const speed =
        monster.state === "chasing" ? MONSTER_CHASE_SPEED : MONSTER_SPEED;
      const moveX = (dx / distance) * speed;
      const moveY = (dy / distance) * speed;

      // Check collision before moving
      const newX = monster.x + moveX;
      const newY = monster.y + moveY;

      const mapX = Math.floor(newX);
      const mapY = Math.floor(newY);

      if (
        mapX > 0 &&
        mapX < MAP_SIZE - 1 &&
        mapY > 0 &&
        mapY < MAP_SIZE - 1 &&
        map[mapY][mapX] === 0
      ) {
        // Check collision with other monsters
        let collision = false;
        for (const other of monsters) {
          if (other !== monster) {
            const odx = newX - other.x;
            const ody = newY - other.y;
            const odist = Math.sqrt(odx * odx + ody * ody);
            if (odist < 0.4) {
              collision = true;
              break;
            }
          }
        }

        if (!collision) {
          monster.lastX = monster.x;
          monster.lastY = monster.y;
          monster.x = newX;
          monster.y = newY;
          monster.isMoving = true;
        } else {
          monster.isMoving = false;
        }
      } else {
        monster.isMoving = false;
        // If blocked, find new target
        if (monster.state === "roaming") {
          monster.pathUpdateTimer = 120; // Force new target next frame
        }
      }
    } else {
      monster.isMoving = false;
    }
  }
}

// Update monster respawn system
function updateMonsterRespawns() {
  const currentTime = Date.now();

  // Check if any dead monsters should respawn
  for (let i = deadMonsters.length - 1; i >= 0; i--) {
    const deadMonster = deadMonsters[i];
    if (currentTime >= deadMonster.respawnTime) {
      // Time to respawn this monster
      respawnMonster();
      deadMonsters.splice(i, 1); // Remove from dead list
    }
  }
}

// Update bullet physics and collisions
function updateBullets() {
  // Iterate backwards to safely remove items from array
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];

    b.lifetime--;
    if (b.lifetime <= 0) {
      bullets.splice(i, 1);
      continue;
    }

    const newX = b.x + Math.cos(b.angle) * b.speed;
    const newY = b.y + Math.sin(b.angle) * b.speed;

    // Check for wall collision
    if (map[Math.floor(newY)][Math.floor(newX)] === 1) {
      bullets.splice(i, 1);
      continue;
    }

    b.x = newX;
    b.y = newY;

    // Check for collisions - prioritize closer objects
    let hitSomething = false;
    let closestDistance = Infinity;
    let closestTarget = null;
    let closestType = null;

    // Check monster collisions first (they might be closer)
    for (let j = 0; j < monsters.length; j++) {
      const monster = monsters[j];
      const dx = b.x - monster.x;
      const dy = b.y - monster.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const monsterRadius = 0.3;

      if (dist < monsterRadius && dist < closestDistance) {
        closestDistance = dist;
        closestTarget = { monster, index: j };
        closestType = "monster";
      }
    }

    // Check player collisions
    for (let j = 0; j < players.length; j++) {
      const p = players[j];
      // Don't shoot self
      if (p.playerId === b.ownerId) continue;
      // Don't hit dead players
      if (p.isDead) continue;

      const dx = b.x - p.x;
      const dy = b.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const playerRadius = 0.5; // Collision radius for player

      if (dist < playerRadius && dist < closestDistance) {
        closestDistance = dist;
        closestTarget = { player: p, index: j };
        closestType = "player";
      }
    }

    // Hit the closest target
    if (closestTarget) {
      bullets.splice(i, 1); // Remove bullet

      if (closestType === "monster") {
        const monster = closestTarget.monster;
        // Hit monster!
        monster.health -= b.damage; // Use bullet's damage (includes multiplier)
        monster.hitFlashTimer = 15; // Flash for 15 frames

        if (monster.health <= 0) {
          // Award points to shooter for killing monster
          const shooter = players.find(
            (player) => player.playerId === b.ownerId,
          );
          if (shooter) {
            shooter.score += POINTS_MONSTER_KILL;
            createFloatingText(
              shooter.x * 50,
              shooter.y * 50,
              `+${POINTS_MONSTER_KILL}`,
              "#ffff00",
            );
          }

          // Add to dead monsters for respawning
          deadMonsters.push(new DeadMonster(Date.now()));
          monsters.splice(closestTarget.index, 1); // Remove dead monster
        }
      } else if (closestType === "player") {
        const p = closestTarget.player;
        // Hit player!
        p.health -= b.damage; // Use bullet's damage (includes multiplier)

        // Add visual damage effects
        p.hitFlashTimer = 20; // Flash for 20 frames
        p.damageScreenTimer = 15; // Screen effect for 15 frames

        if (p.health <= 0) {
          // Award points to shooter and deduct from victim
          const shooter = players.find(
            (player) => player.playerId === b.ownerId,
          );
          if (shooter) {
            shooter.score += POINTS_PLAYER_KILL;
            createFloatingText(
              shooter.x * 50,
              shooter.y * 50,
              `+${POINTS_PLAYER_KILL}`,
              "#00ff00",
            );
          }
          p.score += POINTS_DEATH_PENALTY;
          createFloatingText(
            p.x * 50,
            p.y * 50,
            `${POINTS_DEATH_PENALTY}`,
            "#ff0000",
          );

          // Reset health and start respawn timer
          p.health = 0;
          p.isDead = true;
          p.respawnTimer = RESPAWN_DELAY;
        }
      }
    }
  }
}

function handleInput() {
  // Clear any text objects when in game mode
  if (currentState === "game") {
    scene.children.getChildren().forEach((child) => {
      if (child.type === "Text") {
        child.destroy();
      }
    });
  }

  for (let i = 0; i < numPlayers; i++) {
    const p = players[i];
    const prefix = i === 0 ? "P1" : "P2";

    // Skip input handling for dead players
    if (p.isDead) {
      continue;
    }

    // Update cooldown
    if (p.shootCooldown > 0) {
      p.shootCooldown--;
    }
    // Update weapon fire timer
    if (p.weaponFireTimer > 0) {
      p.weaponFireTimer--;
    }

    // Store previous position for movement detection
    p.lastX = p.x;
    p.lastY = p.y;
    let moved = false;

    // Check if strafe mode is active (B button held)
    const strafeMode = keys[prefix + "B"];

    // Rotation and Strafing
    if (keys[prefix + "L"]) {
      if (strafeMode) {
        // Strafe left (move perpendicular to facing direction)
        const strafeAngle = p.a - Math.PI / 2; // 90 degrees left
        const newX = p.x + Math.cos(strafeAngle) * p.moveSpeed;
        const newY = p.y + Math.sin(strafeAngle) * p.moveSpeed;
        if (!isWallCollision(newX, newY) && !isPlayerCollision(newX, newY, i)) {
          p.x = newX;
          p.y = newY;
          moved = true;
        }
      } else {
        // Normal rotation left
        p.a -= p.rotSpeed;
        moved = true;
      }
    }
    if (keys[prefix + "R"]) {
      if (strafeMode) {
        // Strafe right (move perpendicular to facing direction)
        const strafeAngle = p.a + Math.PI / 2; // 90 degrees right
        const newX = p.x + Math.cos(strafeAngle) * p.moveSpeed;
        const newY = p.y + Math.sin(strafeAngle) * p.moveSpeed;
        if (!isWallCollision(newX, newY) && !isPlayerCollision(newX, newY, i)) {
          p.x = newX;
          p.y = newY;
          moved = true;
        }
      } else {
        // Normal rotation right
        p.a += p.rotSpeed;
        moved = true;
      }
    }

    // Movement
    if (keys[prefix + "U"]) {
      const newX = p.x + Math.cos(p.a) * p.moveSpeed;
      const newY = p.y + Math.sin(p.a) * p.moveSpeed;
      if (!isWallCollision(newX, newY) && !isPlayerCollision(newX, newY, i)) {
        p.x = newX;
        p.y = newY;
        moved = true;
      }
    }
    if (keys[prefix + "D"]) {
      const newX = p.x - Math.cos(p.a) * p.moveSpeed;
      const newY = p.y - Math.sin(p.a) * p.moveSpeed;
      if (!isWallCollision(newX, newY) && !isPlayerCollision(newX, newY, i)) {
        p.x = newX;
        p.y = newY;
        moved = true;
      }
    }

    // Shooting
    if (keys[prefix + "A"] && p.shootCooldown <= 0) {
      // Fire a bullet from player's position in their current direction
      bullets.push(new Bullet(p.x, p.y, p.a, p.playerId));
      p.shootCooldown = p.shootDelay;
      // Trigger fire animation
      p.weaponFireTimer = 10; // 10 frames of animation
    }

    // Update movement state and animation
    p.isMoving = moved;
    if (p.isMoving) {
      p.animTimer += 0.1;
      if (p.animTimer >= 1) {
        p.animFrame = (p.animFrame + 1) % 2; // Cycle between walk1 and walk2
        p.animTimer = 0;
      }
      // Update weapon bob
      p.weaponBobTimer += 0.2; // Adjust speed as needed
    } else {
      p.animFrame = 0; // Reset to idle
      p.animTimer = 0;
    }
  }
}

// Check wall collision with buffer zone around player
function isWallCollision(x, y, buffer = WALL_COLLISION_BUFFER) {
  // Check multiple points around the player position
  const checkPoints = [
    [x, y], // Center
    [x - buffer, y - buffer], // Top-left
    [x + buffer, y - buffer], // Top-right
    [x - buffer, y + buffer], // Bottom-left
    [x + buffer, y + buffer], // Bottom-right
    [x - buffer, y], // Left
    [x + buffer, y], // Right
    [x, y - buffer], // Top
    [x, y + buffer], // Bottom
  ];

  for (const [checkX, checkY] of checkPoints) {
    const mapX = Math.floor(checkX);
    const mapY = Math.floor(checkY);

    // Check bounds
    if (mapX < 0 || mapX >= MAP_SIZE || mapY < 0 || mapY >= MAP_SIZE) {
      return true; // Out of bounds is a collision
    }

    // Check if position is a wall
    if (map[mapY][mapX] === 1) {
      return true; // Wall collision detected
    }
  }

  return false; // No collision
}

function isPlayerCollision(newX, newY, playerIndex) {
  const collisionRadius = 1; // Collision radius for players

  for (let i = 0; i < players.length; i++) {
    if (i === playerIndex) continue; // Don't check collision with self

    const otherPlayer = players[i];
    if (otherPlayer.isDead) continue; // Don't collide with dead players
    const dx = newX - otherPlayer.x;
    const dy = newY - otherPlayer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < collisionRadius) {
      return true; // Collision detected
    }
  }

  return false; // No collision
}

function drawGame() {
  if (numPlayers === 1) {
    drawPlayer3D(players[0], 0, 0, 800, 600);
  } else {
    // Split screen
    graphics.fillStyle(0x333333);
    graphics.fillRect(398, 0, 4, 600); // Divider
    drawPlayer3D(players[0], 0, 0, 398, 600);
    drawPlayer3D(players[1], 402, 0, 398, 600);
  }

  // Draw game timer
  const timeRemaining = Math.max(0, gameTimer);
  const minutes = Math.floor(timeRemaining / 3600);
  const seconds = Math.floor((timeRemaining % 3600) / 60);
  const timeText = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  scene.add
    .text(400, 20, timeText, {
      fontSize: "24px",
      color: gameTimer < 600 ? "#ff0000" : "#ffffff", // Red when less than 10 seconds
      fontFamily: "monospace",
    })
    .setOrigin(0.5);

  // *** NEW *** Draw player scores in bottom left corner (pixel art style)
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (numPlayers === 1) {
      // Single player - score in bottom left
      const yPos = 550 - i * 40;
      drawPixelScoreDisplay(20, yPos, player.score, i + 1);
    } else {
      // Split screen - each player's score in their own viewport
      const xPos = i === 0 ? 20 : 422; // Left side for P1, right side for P2
      const yPos = 550;
      drawPixelScoreDisplay(xPos, yPos, player.score, i + 1);
    }
  }

  // Draw floating point texts
  for (const floatingText of floatingTexts) {
    const alpha = floatingText.lifetime / 120; // Fade out over time
    scene.add
      .text(floatingText.x, floatingText.y, floatingText.text, {
        fontSize: "16px",
        color: floatingText.color,
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setAlpha(alpha);
  }
}

function drawPlayer3D(player, offsetX, offsetY, width, height) {
  // If player is dead, show black screen with respawn message
  if (player.isDead) {
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(offsetX, offsetY, width, height);

    const respawnSeconds = Math.ceil(player.respawnTimer / 60);
    const centerX = offsetX + width / 2;
    const centerY = offsetY + height / 2;

    scene.add
      .text(centerX, centerY - 30, "YOU DIED", {
        fontSize: "32px",
        color: "#ff0000",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    scene.add
      .text(centerX, centerY + 10, `Respawning in ${respawnSeconds}...`, {
        fontSize: "20px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    return;
  }

  const rays = 60; // Ray count for performance
  const fov = Math.PI / 3; // 60 degrees

  // Store wall distances for sprite occlusion
  const wallDistances = [];

  // Draw walls
  for (let i = 0; i < rays; i++) {
    const rayAngle = player.a - fov / 2 + (fov / rays) * i;
    const ray = castRay(player.x, player.y, rayAngle, player); // [NEW]
    wallDistances[i] = ray.projectedDistance;

    // Calculate wall height based on the *projected* distance
    const wallHeight = Math.min((height * 0.8) / ray.projectedDistance, height); // [NEW]
    const wallTop = (height - wallHeight) / 2;

    // Draw textured wall column
    drawWallColumn(
      // [NEW]
      offsetX + (width / rays) * i,
      offsetY + wallTop,
      Math.ceil(width / rays) + 1,
      wallHeight,
      ray, // [NEW] Pass the entire ray object
      offsetX, // [NEW] Pass view offsets
      offsetY, // [NEW] Pass view offsets
      height, // [NEW] Pass view height
    );
  }

  // Draw other players as sprites with occlusion
  drawPlayerSprites(player, offsetX, offsetY, width, height, wallDistances);

  // Draw monsters as sprites with occlusion
  drawMonsterSprites(player, offsetX, offsetY, width, height, wallDistances);

  // Draw bullets as sprites with occlusion
  drawBulletSprites(player, offsetX, offsetY, width, height, wallDistances);

  // *** NEW *** Draw buff sprites with occlusion
  drawBuffSprites(player, offsetX, offsetY, width, height, wallDistances);

  // Draw the weapon
  // This is drawn on top of the 3D world, but before the 2D UI overlays
  drawWeapon(player, offsetX, offsetY, width, height);

  // Draw minimap in corner - position based on player
  let minimapX, minimapY;
  if (numPlayers === 1) {
    // Single player - top left
    minimapX = offsetX + 10;
    minimapY = offsetY + 10;
  } else {
    // Split screen - P1 top left, P2 top right
    if (player.playerId === 0) {
      minimapX = offsetX + 10;
      minimapY = offsetY + 10;
    } else {
      minimapX = offsetX + width - 90; // 90 = minimap size (80) + margin (10)
      minimapY = offsetY + 10;
    }
  }
  drawMinimap(player, minimapX, minimapY);

  // Draw Health Percentage (Pixel Art Doom style)
  const healthValue = Math.max(0, Math.floor(player.health));
  drawPixelHealthDisplay(
    offsetX + width - 80,
    offsetY + height - 50,
    healthValue,
  );

  // Draw damage screen effect
  if (player.damageScreenTimer > 0) {
    const intensity = player.damageScreenTimer / 15; // Fade out over 15 frames

    // Red border effect for damage indication
    const borderThickness = Math.floor(intensity * 8 + 3);
    const redShade = Math.floor(255 * intensity);
    graphics.fillStyle((redShade << 16) | 0x000000); // Red color that fades

    // Top border
    graphics.fillRect(offsetX, offsetY, width, borderThickness);
    // Bottom border
    graphics.fillRect(
      offsetX,
      offsetY + height - borderThickness,
      width,
      borderThickness,
    );
    // Left border
    graphics.fillRect(offsetX, offsetY, borderThickness, height);
    // Right border
    graphics.fillRect(
      offsetX + width - borderThickness,
      offsetY,
      borderThickness,
      height,
    );

    // Additional pulsing center cross effect for more visibility
    if (Math.floor(player.damageScreenTimer / 3) % 2 === 0) {
      const crossThickness = 2;
      graphics.fillStyle(0xff0000);
      // Horizontal line
      graphics.fillRect(
        offsetX + width * 0.3,
        offsetY + height / 2 - crossThickness / 2,
        width * 0.4,
        crossThickness,
      );
      // Vertical line
      graphics.fillRect(
        offsetX + width / 2 - crossThickness / 2,
        offsetY + height * 0.3,
        crossThickness,
        height * 0.4,
      );
    }
  }
}

function castRay(startX, startY, angle, player) {
  // Use player's angle for fisheye correction
  const playerAngle = player.a;

  // Ray direction
  const rayDirX = Math.cos(angle);
  const rayDirY = Math.sin(angle);

  // Current map cell
  let mapX = Math.floor(startX);
  let mapY = Math.floor(startY);

  // Length of ray from current position to next x or y-side
  let sideDistX;
  let sideDistY;

  // Length of ray from one x or y-side to next x or y-side
  // (deltaDistX = 1 / abs(rayDirX))
  const deltaDistX = rayDirX === 0 ? Infinity : Math.abs(1 / rayDirX);
  const deltaDistY = rayDirY === 0 ? Infinity : Math.abs(1 / rayDirY);

  // Direction to step (1 or -1)
  let stepX;
  let stepY;

  let side; // 0 for N/S wall (Y-hit), 1 for E/W wall (X-hit)

  // Calculate initial step and sideDist
  if (rayDirX < 0) {
    stepX = -1;
    sideDistX = (startX - mapX) * deltaDistX;
  } else {
    stepX = 1;
    sideDistX = (mapX + 1.0 - startX) * deltaDistX;
  }

  if (rayDirY < 0) {
    stepY = -1;
    sideDistY = (startY - mapY) * deltaDistY;
  } else {
    stepY = 1;
    sideDistY = (mapY + 1.0 - startY) * deltaDistY;
  }

  let dist = 0;
  // Perform DDA
  while (dist < 20) {
    // Jump to next map square, OR in x-dir, OR in y-dir
    if (sideDistX < sideDistY) {
      sideDistX += deltaDistX;
      mapX += stepX;
      side = 1; // Hit E/W wall
    } else {
      sideDistY += deltaDistY;
      mapY += stepY;
      side = 0; // Hit N/S wall
    }

    // Check if ray has hit a wall
    if (
      mapX < 0 ||
      mapX >= MAP_SIZE ||
      mapY < 0 ||
      mapY >= MAP_SIZE ||
      map[mapY][mapX] === 1
    ) {
      break;
    }
  }

  // Calculate distance projected on camera direction (fisheye correction)
  // This is the distance used for wall height
  let projectedDistance;
  if (side === 1) {
    // E/W wall
    projectedDistance = (mapX - startX + (1 - stepX) / 2) / rayDirX;
  } else {
    // N/S wall
    projectedDistance = (mapY - startY + (1 - stepY) / 2) / rayDirY;
  }

  // Calculate the *exact* hit position on the wall (0.0 to 1.0)
  // This is our stable horizontal texture coordinate
  let wallX;
  if (side === 1) {
    // E/W wall
    wallX = startY + projectedDistance * rayDirY;
  } else {
    // N/S wall
    wallX = startX + projectedDistance * rayDirX;
  }
  wallX -= Math.floor(wallX);

  // Fix for fisheye correction on the *distance*
  const trueDistance = projectedDistance * Math.cos(angle - playerAngle);

  // Return all the data the drawing function will need
  return {
    distance: trueDistance, // The true distance
    projectedDistance: projectedDistance, // The distance for height calculation
    side: side, // 0 for N/S, 1 for E/W
    wallX: wallX, // The horizontal texture coordinate (0.0 to 1.0)
  };
}

function drawPlayerSprites(
  viewerPlayer,
  offsetX,
  offsetY,
  width,
  height,
  wallDistances,
) {
  const fov = Math.PI / 3; // 60 degrees
  const rays = 60; // Should match the ray count in drawPlayer3D

  // Create array of other players with distances for depth sorting
  const playersWithDistance = [];
  for (let i = 0; i < players.length; i++) {
    const otherPlayer = players[i];
    if (otherPlayer === viewerPlayer) continue; // Don't draw self
    if (otherPlayer.isDead) continue; // Don't draw dead players

    const dx = otherPlayer.x - viewerPlayer.x;
    const dy = otherPlayer.y - viewerPlayer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    playersWithDistance.push({ player: otherPlayer, distance });
  }

  // Sort by distance (farther players first for proper depth)
  playersWithDistance.sort((a, b) => b.distance - a.distance);

  for (const { player: otherPlayer, distance } of playersWithDistance) {
    const dx = otherPlayer.x - viewerPlayer.x;
    const dy = otherPlayer.y - viewerPlayer.y;

    if (distance > 15) {
      continue; // Too far to see clearly
    }
    if (distance < 0.1) {
      continue; // Too close
    }

    // Check if there's a wall between viewer and other player
    if (
      !hasLineOfSight(
        viewerPlayer.x,
        viewerPlayer.y,
        otherPlayer.x,
        otherPlayer.y,
      )
    ) {
      continue; // Blocked by wall
    }

    // Calculate angle to other player
    const angleToPlayer = Math.atan2(dy, dx);
    let relativeAngle = angleToPlayer - viewerPlayer.a;

    // Normalize angle to [-PI, PI]
    while (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
    while (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;

    // Check if player is within field of view
    if (Math.abs(relativeAngle) > fov / 2) continue;

    const projectedDistance = distance * Math.cos(relativeAngle);

    // Calculate screen position
    const screenX = (relativeAngle / fov + 0.5) * width;

    // 1. Sizing: Use a single formula based on the corrected projectedDistance.
    // The '120' is a new constant you can adjust to make the sprites bigger or smaller.
    const spriteHeight = Math.max(10, 240 / projectedDistance); // 8 = min size
    const spriteWidth = spriteHeight; // Keep it square for the 10x10 sprite

    // 2. Positioning: Use the *same* logic as the walls, but with projectedDistance.
    // This perfectly aligns the sprite's "feet" with the base of a wall at the same distance.
    const baseWallHeight = Math.min((height * 0.8) / projectedDistance, height);
    const wallBottom = height / 2 + baseWallHeight / 2;

    // Use the calculated wall bottom as the ground, capped at the screen bottom.
    const groundY = Math.min(wallBottom, height);
    const spriteY = groundY - spriteHeight; // Bottom of sprite touches the ground

    // Draw the sprite with wall occlusion
    drawPlayerSpriteWithOcclusion(
      offsetX,
      offsetX + screenX - spriteWidth / 2,
      offsetY + spriteY,
      spriteWidth,
      spriteHeight,
      otherPlayer,
      otherPlayer.isMoving
        ? otherPlayer.animFrame === 0
          ? "walk1"
          : "walk2"
        : "idle",
      wallDistances,
      projectedDistance,
      screenX - spriteWidth / 2,
      screenX + spriteWidth / 2,
      width,
      rays,
    );
  }
}

// Draw monster sprites in 3D view
function drawMonsterSprites(
  player,
  offsetX,
  offsetY,
  width,
  height,
  wallDistances,
) {
  if (monsters.length === 0) return;

  // Get 3D rendering parameters
  const fov = Math.PI / 3;
  const rays = wallDistances.length;

  // Create array of monsters with distances for depth sorting
  const monstersWithDistance = monsters.map((monster) => {
    const dx = monster.x - player.x;
    const dy = monster.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return { monster, distance };
  });

  // Sort by distance (farther monsters first for proper depth)
  monstersWithDistance.sort((a, b) => b.distance - a.distance);

  for (const { monster, distance } of monstersWithDistance) {
    const dx = monster.x - player.x;
    const dy = monster.y - player.y;

    // Skip if monster is too far away
    if (distance > 15) continue;

    // Check if monster has line of sight to player
    if (!hasLineOfSight(player.x, player.y, monster.x, monster.y)) continue;

    // Calculate angle to monster relative to player's facing direction
    const angleToMonster = Math.atan2(dy, dx);
    let relativeAngle = angleToMonster - player.a;

    // Normalize angle to [-π, π]
    while (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
    while (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;

    // Check if monster is within field of view
    if (Math.abs(relativeAngle) > fov / 2 + 0.2) continue;

    // Calculate screen position
    const projectedDistance = distance * Math.cos(relativeAngle);
    if (projectedDistance <= 0.1) continue;

    const screenX = (relativeAngle / (fov / 2)) * (width / 2) + width / 2;

    // Calculate sprite size based on distance (smaller for monsters)
    const spriteHeight = Math.min(
      (height * 0.6) / projectedDistance,
      height * 0.7,
    );
    const spriteWidth = spriteHeight;

    // Calculate ground level
    const baseWallHeight = (height * 0.8) / projectedDistance;
    const wallBottom = height / 2 + baseWallHeight / 2;
    const groundY = Math.min(wallBottom, height);
    const spriteY = groundY - spriteHeight;

    // Draw the monster sprite with wall occlusion
    drawMonsterSpriteWithOcclusion(
      offsetX,
      offsetX + screenX - spriteWidth / 2,
      offsetY + spriteY,
      spriteWidth,
      spriteHeight,
      monster,
      monster.isMoving ? (monster.animFrame === 0 ? "walk1" : "walk2") : "idle",
      wallDistances,
      projectedDistance,
      screenX - spriteWidth / 2,
      screenX + spriteWidth / 2,
      width,
      rays,
    );
  }
}

function drawBulletSprites(
  viewerPlayer,
  offsetX,
  offsetY,
  width,
  height,
  wallDistances,
) {
  const fov = Math.PI / 3;
  const rays = 60;

  // Create array of bullets with distances for depth sorting
  const bulletsWithDistance = bullets.map((bullet) => {
    const dx = bullet.x - viewerPlayer.x;
    const dy = bullet.y - viewerPlayer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return { bullet, distance };
  });

  // Sort by distance (farther bullets first for proper depth)
  bulletsWithDistance.sort((a, b) => b.distance - a.distance);

  for (const { bullet, distance } of bulletsWithDistance) {
    const dx = bullet.x - viewerPlayer.x;
    const dy = bullet.y - viewerPlayer.y;

    if (distance > 20 || distance < 0.1) {
      continue; // Too far or too close
    }

    // Check line of sight
    if (!hasLineOfSight(viewerPlayer.x, viewerPlayer.y, bullet.x, bullet.y)) {
      continue;
    }

    // Calculate angle
    const angleToBullet = Math.atan2(dy, dx);
    let relativeAngle = angleToBullet - viewerPlayer.a;
    while (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
    while (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;

    if (Math.abs(relativeAngle) > fov / 2) {
      continue; // Outside FOV
    }

    const projectedDistance = distance * Math.cos(relativeAngle);
    const screenX = (relativeAngle / fov + 0.5) * width;

    // Sizing (bullets are small)
    const spriteHeight = Math.max(2, 20 / projectedDistance);
    const spriteWidth = spriteHeight;

    // Positioning
    const baseWallHeight = Math.min((height * 0.8) / projectedDistance, height);
    const wallBottom = height / 2 + baseWallHeight / 2;
    const groundY = Math.min(wallBottom, height);
    // Bullets fly mid-air, so let's center them vertically
    const spriteY = groundY - spriteHeight / 2 - baseWallHeight * 0.2;

    // Draw with occlusion
    drawBulletSpriteWithOcclusion(
      offsetX,
      offsetX + screenX - spriteWidth / 2,
      offsetY + spriteY,
      spriteWidth,
      spriteHeight,
      wallDistances,
      projectedDistance,
      width,
      rays,
    );
  }
}

function hasLineOfSight(x1, y1, x2, y2) {
  // Cast a ray from viewer to other player to check for walls
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const stepSize = 0.1;
  const steps = Math.floor(distance / stepSize);

  const stepX = dx / steps;
  const stepY = dy / steps;

  for (let i = 1; i < steps; i++) {
    const checkX = x1 + stepX * i;
    const checkY = y1 + stepY * i;
    const mapX = Math.floor(checkX);
    const mapY = Math.floor(checkY);

    // Check bounds
    if (mapX < 0 || mapX >= MAP_SIZE || mapY < 0 || mapY >= MAP_SIZE) {
      return false;
    }

    // Check for wall
    if (map[mapY][mapX] === 1) {
      return false;
    }
  }

  return true;
}

// Generic sprite drawing function
function drawSprite(spriteData, colors, x, y, width, height) {
  const spriteHeight = spriteData.length;
  if (spriteHeight === 0) return;
  const spriteWidth = spriteData[0].length;
  if (spriteWidth === 0) return;

  const pixelWidth = width / spriteWidth;
  const pixelHeight = height / spriteHeight;

  for (let sy = 0; sy < spriteHeight; sy++) {
    for (let sx = 0; sx < spriteWidth; sx++) {
      const colorIndex = spriteData[sy][sx];
      if (colorIndex === 0) continue; // Transparent pixel

      const color = colors[colorIndex] || 0xffffff;
      graphics.fillStyle(color);
      graphics.fillRect(
        x + sx * pixelWidth,
        y + sy * pixelHeight,
        Math.ceil(pixelWidth),
        Math.ceil(pixelHeight),
      );
    }
  }
}

// Function to draw the player's weapon (banana)
function drawWeapon(player, offsetX, offsetY, width, height) {
  const spriteWidth = 20;
  const spriteHeight = 15;
  const scale = 8; // Make the banana large
  const w = spriteWidth * scale;
  const h = spriteHeight * scale;

  // Base position: bottom-center of the viewport
  let x = offsetX + (width - w) / 2;
  let y = offsetY + height - h; // Aligned with bottom

  // Add movement bob
  const bobAmount = player.isMoving ? Math.sin(player.weaponBobTimer) * 10 : 0;
  y += bobAmount;

  // Add fire "kick" (recoil)
  // Move "up" and then back down
  if (player.weaponFireTimer > 0) {
    const kickProgress = player.weaponFireTimer / 10; // 10 is the initial timer
    // A simple "kick up"
    const kickAmount = Math.sin(kickProgress * Math.PI) * 30; // 30 pixels kick
    y -= kickAmount;
  }

  // Draw the banana sprite with enhanced colors if damage buff is active
  let weaponColors = BANANA_COLORS;
  if (player.damageBuffTimer > 0) {
    // Create bright effect for damage buff
    weaponColors = {};
    for (let colorKey in BANANA_COLORS) {
      const originalColor = BANANA_COLORS[colorKey];
      const r = (originalColor >> 16) & 0xff;
      const g = (originalColor >> 8) & 0xff;
      const b = originalColor & 0xff;

      // Brighten with golden glow
      const brightR = Math.min(255, r + 80);
      const brightG = Math.min(255, g + 60);
      const brightB = Math.min(255, b + 30);

      weaponColors[colorKey] = (brightR << 16) | (brightG << 8) | brightB;
    }
  }

  // Draw glow effect if damage buff is active
  if (player.damageBuffTimer > 0) {
    // Create glow colors (dimmed versions for the glow effect)
    const glowColors = {};
    for (let colorKey in weaponColors) {
      const originalColor = weaponColors[colorKey];
      const r = (originalColor >> 16) & 0xff;
      const g = (originalColor >> 8) & 0xff;
      const b = originalColor & 0xff;

      // Create golden glow tint
      const glowR = Math.min(255, Math.floor((r + 255) * 0.7));
      const glowG = Math.min(255, Math.floor((g + 215) * 0.7));
      const glowB = Math.min(255, Math.floor((b + 0) * 0.5));

      glowColors[colorKey] = (glowR << 16) | (glowG << 8) | glowB;
    }

    // Draw glow layers around the weapon
    const glowOffsets = [
      [-2, -2],
      [2, -2],
      [-2, 2],
      [2, 2], // Close corners
      [-4, 0],
      [4, 0],
      [0, -4],
      [0, 4], // Close sides
      [-3, -3],
      [3, -3],
      [-3, 3],
      [3, 3], // Medium corners
    ];

    // Draw each glow layer
    for (const [dx, dy] of glowOffsets) {
      drawSprite(BANANA_SPRITE, glowColors, x + dx, y + dy, w, h);
    }
  }

  drawSprite(BANANA_SPRITE, weaponColors, x, y, w, h);
}

function drawPlayerSpriteWithOcclusion(
  offsetX,
  x,
  y,
  width,
  height,
  player,
  animFrame,
  wallDistances,
  spriteDistance,
  spriteLeftX,
  spriteRightX,
  screenWidth,
  rays,
) {
  let sprite, colors;

  // Always use Among Us sprites
  sprite = AMONGUS_SPRITES[animFrame];
  colors = PLAYER_COLORS[player.playerId];

  // Apply damage flash effect to colors
  if (player.hitFlashTimer > 0) {
    const flashIntensity = Math.sin(player.hitFlashTimer * 0.8) * 0.5 + 0.5;
    colors = { ...colors }; // Create a copy
    for (let colorKey in colors) {
      // Blend with red for damage flash
      const originalColor = colors[colorKey];
      const r = (originalColor >> 16) & 0xff;
      const g = (originalColor >> 8) & 0xff;
      const b = originalColor & 0xff;

      // Mix with red based on flash intensity
      const newR = Math.min(255, r + flashIntensity * (255 - r));
      const newG = Math.max(0, g - flashIntensity * g * 0.7);
      const newB = Math.max(0, b - flashIntensity * b * 0.7);

      colors[colorKey] =
        (Math.floor(newR) << 16) | (Math.floor(newG) << 8) | Math.floor(newB);
    }
  }

  const spriteHeight = sprite.length;
  if (spriteHeight === 0) return; // Safety check
  const spriteWidth = sprite[0].length;
  if (spriteWidth === 0) return; // Safety check

  const pixelWidth = width / spriteWidth;
  const pixelHeight = height / spriteHeight;

  for (let sy = 0; sy < spriteHeight; sy++) {
    for (let sx = 0; sx < spriteWidth; sx++) {
      const colorIndex = sprite[sy][sx];
      if (colorIndex === 0) continue; // Transparent pixel

      // Calculate world position of this pixel
      const pixelScreenX = x + sx * pixelWidth;

      const pixelRelativeX = pixelScreenX - offsetX;
      const rayIndex = Math.floor((pixelRelativeX / screenWidth) * rays);

      // Check if this pixel is within screen bounds and behind a wall
      if (rayIndex >= 0 && rayIndex < rays) {
        const wallDistanceAtPixel = wallDistances[rayIndex];

        // Only draw pixel if sprite is closer than the wall at this screen position
        if (spriteDistance <= wallDistanceAtPixel + 0.01) {
          // Added 0.01 buffer to prevent z-fighting
          const color = colors[colorIndex] || 0xffffff;
          graphics.fillStyle(color);
          graphics.fillRect(
            x + sx * pixelWidth,
            y + sy * pixelHeight,
            Math.ceil(pixelWidth),
            Math.ceil(pixelHeight),
          );
        }
      }
    }
  }
}

// Simple occlusion check for a single rectangle (bullet)
function drawBulletSpriteWithOcclusion(
  offsetX,
  x,
  y,
  width,
  height,
  wallDistances,
  spriteDistance,
  screenWidth,
  rays,
) {
  // Find the center ray for the sprite
  const pixelRelativeX = x + width / 2 - offsetX;
  const rayIndex = Math.floor((pixelRelativeX / screenWidth) * rays);

  if (rayIndex >= 0 && rayIndex < rays) {
    const wallDistanceAtPixel = wallDistances[rayIndex];

    // Only draw if the bullet is closer than the wall
    if (spriteDistance <= wallDistanceAtPixel + 0.01) {
      // Added 0.01 buffer
      graphics.fillStyle(0xffff00); // Yellow bullet
      graphics.fillRect(x, y, Math.ceil(width), Math.ceil(height));
    }
  }
}

// Generic sprite drawing function that handles different sprite types
function drawPlayerSprite(x, y, width, height, player, animFrame) {
  let sprite, colors;

  // Always use Among Us sprites
  sprite = AMONGUS_SPRITES[animFrame];
  colors = PLAYER_COLORS[player.playerId];

  // Apply damage flash effect to colors
  if (player.hitFlashTimer > 0) {
    const flashIntensity = Math.sin(player.hitFlashTimer * 0.8) * 0.5 + 0.5;
    colors = { ...colors }; // Create a copy
    for (let colorKey in colors) {
      // Blend with red for damage flash
      const originalColor = colors[colorKey];
      const r = (originalColor >> 16) & 0xff;
      const g = (originalColor >> 8) & 0xff;
      const b = originalColor & 0xff;

      // Mix with red based on flash intensity
      const newR = Math.min(255, r + flashIntensity * (255 - r));
      const newG = Math.max(0, g - flashIntensity * g * 0.7);
      const newB = Math.max(0, b - flashIntensity * b * 0.7);

      colors[colorKey] =
        (Math.floor(newR) << 16) | (Math.floor(newG) << 8) | Math.floor(newB);
    }
  }

  drawSprite(sprite, colors, x, y, width, height);
}

// Draw monster sprite with occlusion
function drawMonsterSpriteWithOcclusion(
  offsetX,
  x,
  y,
  width,
  height,
  monster,
  animFrame,
  wallDistances,
  spriteDistance,
  spriteLeftX,
  spriteRightX,
  screenWidth,
  rays,
) {
  const sprite = DEMON_SPRITES[animFrame];
  let colors = DEMON_COLORS;

  // Apply damage flash effect to colors
  if (monster.hitFlashTimer > 0) {
    const flashIntensity = Math.sin(monster.hitFlashTimer * 0.8) * 0.5 + 0.5;
    colors = { ...colors }; // Create a copy
    for (let colorKey in colors) {
      // Blend with red for damage flash
      const originalColor = colors[colorKey];
      const r = (originalColor >> 16) & 0xff;
      const g = (originalColor >> 8) & 0xff;
      const b = originalColor & 0xff;

      // Mix with red based on flash intensity
      const newR = Math.min(255, r + flashIntensity * (255 - r));
      const newG = Math.max(0, g - flashIntensity * g * 0.7);
      const newB = Math.max(0, b - flashIntensity * b * 0.7);

      colors[colorKey] =
        (Math.floor(newR) << 16) | (Math.floor(newG) << 8) | Math.floor(newB);
    }
  }

  const spriteHeight = sprite.length;
  if (spriteHeight === 0) return; // Safety check
  const spriteWidth = sprite[0].length;
  if (spriteWidth === 0) return; // Safety check

  const pixelWidth = width / spriteWidth;
  const pixelHeight = height / spriteHeight;

  for (let sy = 0; sy < spriteHeight; sy++) {
    for (let sx = 0; sx < spriteWidth; sx++) {
      const colorIndex = sprite[sy][sx];
      if (colorIndex === 0) continue;

      const pixelScreenX = x + sx * pixelWidth;
      const pixelRelativeX = pixelScreenX - offsetX;
      const rayIndex = Math.floor((pixelRelativeX / screenWidth) * rays);

      if (rayIndex >= 0 && rayIndex < rays) {
        const wallDistanceAtPixel = wallDistances[rayIndex];

        if (spriteDistance <= wallDistanceAtPixel + 0.01) {
          const color = colors[colorIndex] || 0xffffff;
          graphics.fillStyle(color);
          graphics.fillRect(
            x + sx * pixelWidth,
            y + sy * pixelHeight,
            Math.ceil(pixelWidth),
            Math.ceil(pixelHeight),
          );
        }
      }
    }
  }
}

function drawMinimap(player, x, y) {
  const size = 80;
  const scale = size / MAP_SIZE;

  // Background
  graphics.fillStyle(0x111111);
  graphics.fillRect(x, y, size, size);

  // Map
  for (let my = 0; my < MAP_SIZE; my++) {
    for (let mx = 0; mx < MAP_SIZE; mx++) {
      if (map[my][mx] === 1) {
        graphics.fillStyle(0x666666);
        graphics.fillRect(x + mx * scale, y + my * scale, scale, scale);
      }
    }
  }

  // All players on minimap
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    // Don't show dead players on minimap
    if (p.isDead) continue;

    // *** NEW *** Current player is green, others are red
    const minimapColor = p === player ? 0x00ff00 : 0xff0000;
    graphics.fillStyle(minimapColor);
    graphics.fillRect(x + p.x * scale - 1.5, y + p.y * scale - 1.5, 3, 3);

    // Direction line for current player
    if (p === player) {
      graphics.lineStyle(1, minimapColor);
      graphics.beginPath();
      graphics.moveTo(x + p.x * scale, y + p.y * scale);
      graphics.lineTo(
        x + p.x * scale + Math.cos(p.a) * 5, // Shorter line
        y + p.y * scale + Math.sin(p.a) * 5,
      );
      graphics.strokePath();
    }
  }

  // Draw monsters on minimap
  graphics.fillStyle(0xff0000); // Red for monsters
  for (const monster of monsters) {
    graphics.fillRect(
      x + monster.x * scale - 0.8,
      y + monster.y * scale - 0.8,
      1.6,
      1.6,
    );
  }

  // Draw bullets on minimap
  graphics.fillStyle(0xffff00); // Yellow
  for (const b of bullets) {
    graphics.fillRect(x + b.x * scale - 0.5, y + b.y * scale - 0.5, 1, 1);
  }
}

// Pixel art style health display
function drawPixelHealthDisplay(x, y, healthValue) {
  const scale = 3;

  // Draw "HEALTH" text in pixel art style
  const healthText = [
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1],
  ];

  // Draw "HEALTH" label
  for (let py = 0; py < healthText.length; py++) {
    for (let px = 0; px < healthText[py].length; px++) {
      if (healthText[py][px] === 1) {
        graphics.fillStyle(0xffffff);
        graphics.fillRect(x + px * scale, y + py * scale, scale, scale);
      }
    }
  }

  // Determine health color
  const healthColor =
    healthValue > 75
      ? 0x00ff00
      : healthValue > 50
        ? 0xffff00
        : healthValue > 25
          ? 0xff8800
          : 0xff0000;

  // Draw percentage digits in pixel art
  const digitY = y + 20;

  // Convert health value to digits
  const digitsLength = healthValue >= 100 ? 3 : healthValue >= 10 ? 2 : 1;
  const digits = healthValue.toString().padStart(digitsLength, "0").split("");

  for (let i = 0; i < digits.length; i++) {
    drawPixelDigit(x + i * 16, digitY, parseInt(digits[i]), healthColor, scale);
  }

  // Draw "%" symbol
  const percentSymbol = [
    [1, 1, 0, 0, 1],
    [1, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 1, 1],
    [1, 0, 0, 1, 1],
  ];

  const percentX = x + 48;
  for (let py = 0; py < percentSymbol.length; py++) {
    for (let px = 0; px < percentSymbol[py].length; px++) {
      if (percentSymbol[py][px] === 1) {
        graphics.fillStyle(healthColor);
        graphics.fillRect(
          percentX + px * scale,
          digitY + py * scale,
          scale,
          scale,
        );
      }
    }
  }
}

// *** NEW *** Draw buff sprites with occlusion
function drawBuffSprites(
  player,
  offsetX,
  offsetY,
  width,
  height,
  wallDistances,
) {
  if (buffs.length === 0) return;

  const fov = Math.PI / 3;
  const rays = wallDistances.length;

  // Sort buffs by distance (farther first)
  const buffsWithDistance = buffs.map((buff) => {
    const dx = buff.x - player.x;
    const dy = buff.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return { buff, distance };
  });

  buffsWithDistance.sort((a, b) => b.distance - a.distance);

  for (const { buff, distance } of buffsWithDistance) {
    const dx = buff.x - player.x;
    const dy = buff.y - player.y;

    if (distance > 15) continue; // Too far away

    // Check if buff is occluded by monsters or other players
    let occluded = false;

    // Check occlusion by monsters
    for (const monster of monsters) {
      const mdx = monster.x - player.x;
      const mdy = monster.y - player.y;
      const mDistance = Math.sqrt(mdx * mdx + mdy * mdy);

      if (mDistance < distance && mDistance > 0.1) {
        const monsterAngle = Math.atan2(mdy, mdx);
        const buffAngle = Math.atan2(dy, dx);
        const angleDiff = Math.abs(monsterAngle - buffAngle);

        if (angleDiff < 0.3 || angleDiff > Math.PI * 2 - 0.3) {
          const crossProduct = mdx * dy - mdy * dx;
          if (Math.abs(crossProduct) < 0.5) {
            occluded = true;
            break;
          }
        }
      }
    }

    // Check occlusion by other players
    if (!occluded) {
      for (const otherPlayer of players) {
        if (otherPlayer === player || otherPlayer.isDead) continue;

        const pdx = otherPlayer.x - player.x;
        const pdy = otherPlayer.y - player.y;
        const pDistance = Math.sqrt(pdx * pdx + pdy * pdy);

        if (pDistance < distance && pDistance > 0.1) {
          const playerAngle = Math.atan2(pdy, pdx);
          const buffAngle = Math.atan2(dy, dx);
          const angleDiff = Math.abs(playerAngle - buffAngle);

          if (angleDiff < 0.3 || angleDiff > Math.PI * 2 - 0.3) {
            const crossProduct = pdx * dy - pdy * dx;
            if (Math.abs(crossProduct) < 0.5) {
              occluded = true;
              break;
            }
          }
        }
      }
    }

    if (occluded) continue;

    // Add floating animation
    const floatY = buff.y + buff.floatOffset;

    // Calculate angle to buff
    const angleToBuff = Math.atan2(dy, dx);
    let relativeAngle = angleToBuff - player.a;

    // Normalize angle
    while (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
    while (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;

    // Check if buff is in field of view
    if (Math.abs(relativeAngle) > fov / 2) continue;

    // Project to screen space
    const projectedDistance = distance * Math.cos(relativeAngle);
    const screenX = (relativeAngle / (fov / 2)) * (width / 2) + width / 2;

    // Calculate sprite size (buffs are small)
    const spriteHeight = Math.max(20, 240 / projectedDistance);
    const spriteWidth = spriteHeight;

    // Position on ground
    const baseWallHeight = Math.min((height * 0.8) / projectedDistance, height);
    const wallBottom = height / 2 + baseWallHeight / 2;
    const groundY = Math.min(wallBottom, height);
    const spriteY = groundY - spriteHeight + buff.floatOffset * 20; // Add float animation

    // Get sprite data
    const spriteData =
      buff.type === BUFF_TYPES.HEALTH
        ? HEALTH_CROSS_SPRITE
        : DAMAGE_BANANAS_SPRITE;
    const colors = BUFF_COLORS[buff.type.toUpperCase()];

    // Draw with occlusion
    drawSpriteWithOcclusion(
      spriteData,
      colors,
      offsetX + screenX - spriteWidth / 2,
      offsetY + spriteY,
      spriteWidth,
      spriteHeight,
      projectedDistance,
      wallDistances,
      offsetX,
      width,
      rays,
    );
  }
}

// *** NEW *** Generic sprite drawing with occlusion for buffs
function drawSpriteWithOcclusion(
  spriteData,
  colors,
  x,
  y,
  width,
  height,
  distance,
  wallDistances,
  offsetX,
  screenWidth,
  rays,
) {
  const spriteHeight = spriteData.length;
  if (spriteHeight === 0) return;
  const spriteWidth = spriteData[0].length;
  if (spriteWidth === 0) return;

  const pixelWidth = width / spriteWidth;
  const pixelHeight = height / spriteHeight;

  for (let sy = 0; sy < spriteHeight; sy++) {
    for (let sx = 0; sx < spriteWidth; sx++) {
      const colorIndex = spriteData[sy][sx];
      if (colorIndex === 0) continue; // Transparent

      const pixelScreenX = x + sx * pixelWidth;
      const pixelRelativeX = pixelScreenX - offsetX;
      const rayIndex = Math.floor((pixelRelativeX / screenWidth) * rays);

      if (rayIndex < 0 || rayIndex >= wallDistances.length) continue;

      const wallDistanceAtPixel = wallDistances[rayIndex];
      if (distance >= wallDistanceAtPixel) continue; // Behind wall

      const color = colors[colorIndex];
      if (color !== undefined) {
        graphics.fillStyle(color);
        graphics.fillRect(
          pixelScreenX,
          y + sy * pixelHeight,
          Math.ceil(pixelWidth),
          Math.ceil(pixelHeight),
        );
      }
    }
  }
}

// Draw individual pixel art digits
function drawPixelDigit(x, y, digit, color, scale) {
  const digitPatterns = {
    0: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    1: [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 1],
    ],
    2: [
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
    ],
    3: [
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    4: [
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
    5: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    6: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    7: [
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
    8: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    9: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
  };

  const pattern = digitPatterns[digit];
  if (!pattern) return;

  for (let py = 0; py < pattern.length; py++) {
    for (let px = 0; px < pattern[py].length; px++) {
      if (pattern[py][px] === 1) {
        graphics.fillStyle(color);
        graphics.fillRect(x + px * scale, y + py * scale, scale, scale);
      }
    }
  }
}

// Brick wall texture pattern (12x8) - realistic staggered brick layout
const BRICK_PATTERN = [
  [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
  [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
  [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
];

// Brick colors with variations
const BRICK_COLORS = {
  0: 0x404040, // Dark gray (mortar lines)
  1: 0x707070, // Light gray (brick face)
  2: 0x606060, // Medium gray (brick variation)
  3: 0x808080, // Lighter gray (brick variation)
};

// Draw a column of textured wall (IMPROVED)
function drawWallColumn(
  x,
  y,
  width,
  height,
  ray,
  viewOffsetX,
  viewOffsetY,
  viewHeight,
) {
  // 1. Get the horizontal texture coordinate from the ray
  // ray.wallX is a stable 0.0-1.0 value
  let textureU = Math.floor(ray.wallX * BRICK_PATTERN[0].length);

  // 2. Apply shading based on the wall side (N/S vs E/W)
  // This adds depth and makes corners visible
  const shadeFactor = ray.side === 1 ? 0.75 : 1.0; // Make E/W walls 25% darker

  // 3. Loop through every *vertical pixel* of the wall column
  const wallTop = y;
  const wallBottom = y + height;
  const textureHeight = BRICK_PATTERN.length;

  for (let lineY = Math.floor(wallTop); lineY < wallBottom; lineY++) {
    // Ensure we don't draw outside the viewport
    if (lineY < viewOffsetY || lineY >= viewOffsetY + viewHeight) continue;

    // 4. Calculate the vertical texture coordinate (textureY)
    // This maps the screen-space Y pixel to a texture-space Y pixel
    const d = lineY - (viewOffsetY + viewHeight / 2) + height / 2;
    const textureY = Math.max(
      0,
      Math.floor((d * textureHeight) / height) % textureHeight,
    );

    // 5. Get the color from the brick pattern
    let colorIndex = BRICK_PATTERN[textureY][textureU];

    // Add subtle brick color variation for non-mortar pixels
    if (colorIndex === 1) {
      const variation = (Math.floor(ray.wallX * 10) + textureY) % 4;
      if (variation === 1) colorIndex = 2;
      else if (variation === 2) colorIndex = 3;
    }

    // 6. Apply shading
    const baseColor = BRICK_COLORS[colorIndex];
    const r = Math.floor(((baseColor >> 16) & 0xff) * shadeFactor);
    const g = Math.floor(((baseColor >> 8) & 0xff) * shadeFactor);
    const b = Math.floor((baseColor & 0xff) * shadeFactor);
    const shadedColor = (r << 16) | (g << 8) | b;

    // 7. Draw the single pixel-tall line
    graphics.fillStyle(shadedColor);
    graphics.fillRect(x, lineY, width, 1);
  }
}

// Pixel art style score display
function drawPixelScoreDisplay(x, y, scoreValue) {
  const scale = 3;

  // Draw "SCORE" text in pixel art style
  const scoreText = [
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
  ];

  // Draw "SCORE" label
  const scoreStartX = x;
  for (let py = 0; py < scoreText.length; py++) {
    for (let px = 0; px < scoreText[py].length; px++) {
      if (scoreText[py][px] === 1) {
        graphics.fillStyle(0xffffff);
        graphics.fillRect(
          scoreStartX + px * scale,
          y + py * scale,
          scale,
          scale,
        );
      }
    }
  }

  // Draw score value in pixel art
  const digitY = y + 20;

  // Convert score to string and pad if needed
  const scoreStr = Math.abs(scoreValue).toString();
  const isNegative = scoreValue < 0;

  // Draw negative sign if needed
  let digitX = x;
  if (isNegative) {
    // Draw minus sign
    graphics.fillStyle(0xff0000);
    graphics.fillRect(digitX, digitY + 4, 6, 2);
    digitX += 8;
  }

  // Determine score color based on value
  const scoreColor =
    scoreValue < 0 ? 0xff0000 : scoreValue > 0 ? 0x00ff00 : 0xffffff;

  // Draw each digit
  for (let i = 0; i < scoreStr.length; i++) {
    drawPixelDigit(
      digitX + i * 12,
      digitY,
      parseInt(scoreStr[i]),
      scoreColor,
      scale,
    );
  }
}
