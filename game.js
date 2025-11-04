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

// Among Us sprite data (10x10 pixel art as arrays)
const AMONGUS_SPRITES = {
  idle: [
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 2, 2, 2, 2, 1, 0, 0],
    [0, 1, 2, 2, 2, 2, 2, 2, 1, 0],
    [1, 2, 2, 3, 3, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [0, 1, 2, 2, 2, 2, 2, 2, 1, 0],
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  ],
  walk1: [
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 2, 2, 2, 2, 1, 0, 0],
    [0, 1, 2, 2, 2, 2, 2, 2, 1, 0],
    [1, 2, 2, 3, 3, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [0, 1, 2, 2, 2, 2, 2, 2, 1, 0],
    [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
  ],
  walk2: [
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 2, 2, 2, 2, 1, 0, 0],
    [0, 1, 2, 2, 2, 2, 2, 2, 1, 0],
    [1, 2, 2, 3, 3, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [0, 1, 2, 2, 2, 2, 2, 2, 1, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  ],
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
  const additionalPaths = Math.floor(MAP_SIZE * MAP_SIZE * 0.99); // 20% additional paths

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
  constructor(x, y, color, playerId) {
    this.x = x;
    this.y = y;
    this.a = 0; // angle
    this.color = color;
    this.playerId = playerId;
    this.moveSpeed = 0.03;
    this.rotSpeed = 0.02;
    this.isMoving = false;
    this.animFrame = 0;
    this.animTimer = 0;
    this.lastX = x;
    this.lastY = y;
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

  // Initialize only active players based on numPlayers
  for (let i = 0; i < numPlayers; i++) {
    const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
    const colors = [0x00ff00, 0xff0000];
    players.push(new Player(spot.x, spot.y, colors[i], i));
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

    // Store previous position for movement detection
    p.lastX = p.x;
    p.lastY = p.y;
    let moved = false;

    // Rotation
    if (keys[prefix + "L"]) {
      p.a -= p.rotSpeed;
      moved = true;
    }
    if (keys[prefix + "R"]) {
      p.a += p.rotSpeed;
      moved = true;
    }

    // Movement
    if (keys[prefix + "U"]) {
      const newX = p.x + Math.cos(p.a) * p.moveSpeed;
      const newY = p.y + Math.sin(p.a) * p.moveSpeed;
      if (
        map[Math.floor(newY)][Math.floor(newX)] === 0 &&
        !isPlayerCollision(newX, newY, i)
      ) {
        p.x = newX;
        p.y = newY;
        moved = true;
      }
    }
    if (keys[prefix + "D"]) {
      const newX = p.x - Math.cos(p.a) * p.moveSpeed;
      const newY = p.y - Math.sin(p.a) * p.moveSpeed;
      if (
        map[Math.floor(newY)][Math.floor(newX)] === 0 &&
        !isPlayerCollision(newX, newY, i)
      ) {
        p.x = newX;
        p.y = newY;
        moved = true;
      }
    }

    // Update movement state and animation
    p.isMoving = moved;
    if (p.isMoving) {
      p.animTimer += 0.1;
      if (p.animTimer >= 1) {
        p.animFrame = (p.animFrame + 1) % 2; // Cycle between walk1 and walk2
        p.animTimer = 0;
      }
    } else {
      p.animFrame = 0; // Reset to idle
      p.animTimer = 0;
    }
  }
}

function isPlayerCollision(newX, newY, playerIndex) {
  const collisionRadius = 1; // Collision radius for players

  for (let i = 0; i < players.length; i++) {
    if (i === playerIndex) continue; // Don't check collision with self

    const otherPlayer = players[i];
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
}

function drawPlayer3D(player, offsetX, offsetY, width, height) {
  const rays = 60; // Ray count for performance
  const fov = Math.PI / 3; // 60 degrees

  // Store wall distances for sprite occlusion
  const wallDistances = [];

  // Draw walls
  for (let i = 0; i < rays; i++) {
    const rayAngle = player.a - fov / 2 + (fov / rays) * i;
    const dist = castRay(player.x, player.y, rayAngle, player);
    wallDistances[i] = dist;

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

  // Draw other players as sprites with occlusion
  drawPlayerSprites(player, offsetX, offsetY, width, height, wallDistances);

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

  for (let i = 0; i < players.length; i++) {
    const otherPlayer = players[i];
    if (otherPlayer === viewerPlayer) continue; // Don't draw self

    // Calculate relative position
    const dx = otherPlayer.x - viewerPlayer.x;
    const dy = otherPlayer.y - viewerPlayer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

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
    drawAmongUsSpriteWithOcclusion(
      offsetX,
      offsetX + screenX - spriteWidth / 2,
      offsetY + spriteY,
      spriteWidth,
      spriteHeight,
      otherPlayer.playerId,
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

function drawAmongUsSpriteWithOcclusion(
  offsetX, // <--- ADD THIS
  x,
  y,
  width,
  height,
  playerId,
  animFrame,
  wallDistances,
  spriteDistance,
  spriteLeftX,
  spriteRightX,
  screenWidth,
  rays,
) {
  const sprite = AMONGUS_SPRITES[animFrame];
  const colors = PLAYER_COLORS[playerId];
  const pixelWidth = width / 10; // Among Us sprites are 10x10
  const pixelHeight = height / 10;

  for (let sy = 0; sy < 10; sy++) {
    for (let sx = 0; sx < 10; sx++) {
      const colorIndex = sprite[sy][sx];
      if (colorIndex === 0) continue; // Transparent pixel

      // Calculate world position of this pixel
      const pixelScreenX = x + sx * pixelWidth;

      // --- FIX: Map pixel to ray index, relative to the viewport's offset ---
      const pixelRelativeX = pixelScreenX - offsetX;
      const rayIndex = Math.floor((pixelRelativeX / screenWidth) * rays);
      // --- END FIX ---

      // Check if this pixel is within screen bounds and behind a wall
      if (rayIndex >= 0 && rayIndex < rays) {
        const wallDistanceAtPixel = wallDistances[rayIndex];

        // Only draw pixel if sprite is closer than the wall at this screen position
        if (spriteDistance < wallDistanceAtPixel) {
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

function drawAmongUsSprite(x, y, width, height, playerId, animFrame) {
  const sprite = AMONGUS_SPRITES[animFrame];
  const colors = PLAYER_COLORS[playerId];
  const pixelWidth = width / 10; // Among Us sprites are 10x10
  const pixelHeight = height / 10;

  for (let sy = 0; sy < 10; sy++) {
    for (let sx = 0; sx < 10; sx++) {
      const colorIndex = sprite[sy][sx];
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
    graphics.fillStyle(p.color);
    graphics.fillRect(x + p.x * scale - 1, y + p.y * scale - 1, 3, 3);

    // Direction line for current player
    if (p === player) {
      graphics.lineStyle(1, p.color);
      graphics.beginPath();
      graphics.moveTo(x + p.x * scale, y + p.y * scale);
      graphics.lineTo(
        x + p.x * scale + Math.cos(p.a) * 10,
        y + p.y * scale + Math.sin(p.a) * 10,
      );
      graphics.strokePath();
    }
  }
}
