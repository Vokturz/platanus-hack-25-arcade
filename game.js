// Platanus Hack 25: Doom-like 2.5D Maze Game
// Navigate through a maze with raycasting 2.5D graphics

// =============================================================================
// ARCADE BUTTON MAPPING
// =============================================================================
const ARCADE_CONTROLS = {
  // Player 1 - WASD movement, UI buttons
  P1U: ["w"],
  P1D: ["s"],
  P1L: ["a"],
  P1R: ["d"],
  P1A: ["u"],
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
  P2A: ["r"],
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
let scene,
  graphics,
  currentState = "menu";
let numPlayers = 1;

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
  const additionalPaths = Math.floor(MAP_SIZE * MAP_SIZE * 0.2); // 20% additional paths

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

// Players
const players = [];
class Player {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.a = 0; // angle
    this.color = color;
    this.moveSpeed = 0.03;
    this.rotSpeed = 0.02;
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
        startNewGame();
      } else if (key === "START2") {
        numPlayers = 2;
        startNewGame();
      }
    } else if (currentState === "game") {
      if (key === "START1" || key === "START2") {
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

  // Initialize players at random positions
  for (let i = 0; i < 2; i++) {
    const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
    const colors = [0x00ff00, 0xff0000];
    players.push(new Player(spot.x, spot.y, colors[i]));
    emptySpots.splice(emptySpots.indexOf(spot), 1);
  }
}

function update() {
  graphics.clear();

  if (currentState === "menu") {
    drawMenu();
  } else {
    handleInput();
    drawGame();
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
    .text(400, 150, "DOOM MAZE", {
      fontSize: "64px",
      color: "#ff0000",
      fontFamily: "Arial",
    })
    .setOrigin(0.5)
    .setDepth(1);

  // Options
  scene.add
    .text(400, 280, "Press P1 START: 1 Player", {
      fontSize: "28px",
      color: "#00ff00",
      fontFamily: "Arial",
    })
    .setOrigin(0.5)
    .setDepth(1);

  scene.add
    .text(400, 320, "Press P2 START: 2 Players", {
      fontSize: "28px",
      color: "#00ffff",
      fontFamily: "Arial",
    })
    .setOrigin(0.5)
    .setDepth(1);

  scene.add
    .text(400, 380, "In Game: START to return to menu", {
      fontSize: "20px",
      color: "#ffff00",
      fontFamily: "Arial",
    })
    .setOrigin(0.5)
    .setDepth(1);

  scene.add
    .text(400, 450, "WASD/Arrows: Move & Turn", {
      fontSize: "20px",
      color: "#888888",
      fontFamily: "Arial",
    })
    .setOrigin(0.5)
    .setDepth(1);
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

    // Rotation
    if (keys[prefix + "L"]) p.a -= p.rotSpeed;
    if (keys[prefix + "R"]) p.a += p.rotSpeed;

    // Movement
    if (keys[prefix + "U"]) {
      const newX = p.x + Math.cos(p.a) * p.moveSpeed;
      const newY = p.y + Math.sin(p.a) * p.moveSpeed;
      if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
        p.x = newX;
        p.y = newY;
      }
    }
    if (keys[prefix + "D"]) {
      const newX = p.x - Math.cos(p.a) * p.moveSpeed;
      const newY = p.y - Math.sin(p.a) * p.moveSpeed;
      if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
        p.x = newX;
        p.y = newY;
      }
    }
  }
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
}

function drawPlayer3D(player, offsetX, offsetY, width, height) {
  const rays = 60; // Ray count for performance
  const fov = Math.PI / 3; // 60 degrees

  for (let i = 0; i < rays; i++) {
    const rayAngle = player.a - fov / 2 + (fov / rays) * i;
    const dist = castRay(player.x, player.y, rayAngle, player);

    // Calculate wall height based on distance
    const wallHeight = Math.min((height * 0.8) / dist, height);
    const wallTop = (height - wallHeight) / 2;

    // Wall color based on distance (darker = further)
    const shade = Math.max(50, 255 - dist * 30);
    const color = (shade << 16) | (shade << 8) | shade;

    graphics.fillStyle(color);
    graphics.fillRect(
      offsetX + (width / rays) * i,
      offsetY + wallTop,
      Math.ceil(width / rays) + 1,
      wallHeight,
    );
  }

  // Draw minimap in corner
  drawMinimap(player, offsetX + 10, offsetY + 10);
}

function castRay(startX, startY, angle, player) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let x = startX,
    y = startY;
  let dist = 0;

  while (dist < 20) {
    // Max ray distance
    x += dx * 0.01;
    y += dy * 0.01;
    dist += 0.01;

    const mapX = Math.floor(x);
    const mapY = Math.floor(y);

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

  return dist * Math.cos(angle - player.a); // Fix fisheye using the correct player's angle
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

  // Player
  graphics.fillStyle(player.color);
  graphics.fillRect(x + player.x * scale - 1, y + player.y * scale - 1, 3, 3);

  // Direction line
  graphics.lineStyle(1, player.color);
  graphics.beginPath();
  graphics.moveTo(x + player.x * scale, y + player.y * scale);
  graphics.lineTo(
    x + player.x * scale + Math.cos(player.a) * 10,
    y + player.y * scale + Math.sin(player.a) * 10,
  );
  graphics.strokePath();
}
