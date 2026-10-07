/**
 * Classic Snake Game - JavaScript
 * Features: Game loop, smooth movement, collision detection, scoring,
 * high score persistence via localStorage, difficulty scaling, and pause/resume.
 */

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const levelEl = document.getElementById('level');
const difficultyEl = document.getElementById('difficulty');

// Overlays & Buttons
const startScreen = document.getElementById('startScreen');
const pauseScreen = document.getElementById('pauseScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');
const finalScoreEl = document.getElementById('finalScore');
const newHighScoreMsg = document.getElementById('newHighScoreMsg');

// D-pad buttons
const btnUp = document.getElementById('btnUp');
const btnDown = document.getElementById('btnDown');
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');
const btnPause = document.getElementById('btnPause');

// Game Constants
const GRID_SIZE = 20; // Size of each grid cell in pixels
const TILE_COUNT = canvas.width / GRID_SIZE; // 400 / 20 = 20 tiles per row/col

// Game State Variables
let snake = [];
let food = { x: 0, y: 0 };
let dx = 1; // Horizontal velocity (tiles per step)
let dy = 0; // Vertical velocity (tiles per step)
let nextDx = 1; // Buffered direction to prevent 180-degree bugs on fast keypresses
let nextDy = 0;
let score = 0;
let highScore = 0;
let level = 1;
let gameSpeed = 120; // milliseconds per frame (lower is faster)
let isGameRunning = false;
let isPaused = false;
let gameInterval = null;
let changeDirectionLock = false; // Prevents multiple turns within one tick

// Initialize High Score from localStorage on load
function initHighScore() {
    const savedHighScore = localStorage.getItem('snake_high_score');
    if (savedHighScore !== null) {
        highScore = parseInt(savedHighScore, 10);
    }
    highScoreEl.textContent = highScore;
}

/**
 * Starts a brand new game from the start screen
 */
function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');

    resetGameVariables();
    isGameRunning = true;
    isPaused = false;

    runGameLoop();
}

/**
 * Resets all game state variables to initial starting conditions
 */
function resetGameVariables() {
    // Initial snake: 3 segments horizontal centered
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    dx = 1;
    dy = 0;
    nextDx = 1;
    nextDy = 0;
    score = 0;
    level = 1;
    gameSpeed = 120;
    changeDirectionLock = false;

    updateUI();
    generateFood();
}

/**
 * Completely resets and starts the game again (used from Game Over screen)
 */
function restartGame() {
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');

    if (gameInterval) {
        clearInterval(gameInterval);
    }

    resetGameVariables();
    isGameRunning = true;
    isPaused = false;

    runGameLoop();
}

/**
 * Main Game Loop runner using setInterval based on dynamic gameSpeed
 */
function runGameLoop() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }

    gameInterval = setInterval(() => {
        if (!isGameRunning || isPaused) return;

        updateGame();
        drawGame();

        // Unlock direction change for the new frame
        changeDirectionLock = false;
    }, gameSpeed);
}

/**
 * Updates game state: moves snake, checks food consumption, checks collisions, updates difficulty
 */
function updateGame() {
    // Apply buffered direction
    dx = nextDx;
    dy = nextDy;

    moveSnake();

    // Check collision with walls or self
    if (checkCollision()) {
        gameOver();
        return;
    }

    // Check if snake ate food
    if (snake[0].x === food.x && snake[0].y === food.y) {
        // Grow snake by duplicating tail (don't pop in moveSnake)
        const tail = { ...snake[snake.length - 1] };
        snake.push(tail);

        // Increase score
        score += 10;

        // Update High Score if needed
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snake_high_score', highScore);
        }

        updateDifficulty();
        updateUI();
        generateFood();
    }
}

/**
 * Moves the snake forward by shifting head and popping tail (unless growing)
 */
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    snake.pop();
}

/**
 * Checks wall and self-collision
 */
function checkCollision() {
    const head = snake[0];

    // Wall collision
    const hitLeftWall = head.x < 0;
    const hitRightWall = head.x >= TILE_COUNT;
    const hitTopWall = head.y < 0;
    const hitBottomWall = head.y >= TILE_COUNT;

    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
        return true;
    }

    // Self collision (head hits any body segment)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

/**
 * Generates food at random coordinates not occupied by the snake
 */
function generateFood() {
    let validPosition = false;
    while (!validPosition) {
        food.x = Math.floor(Math.random() * TILE_COUNT);
        food.y = Math.floor(Math.random() * TILE_COUNT);

        // Check if food spawns on snake
        validPosition = true;
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                validPosition = false;
                break;
            }
        }
    }
}

/**
 * Updates difficulty levels and adjusts game speed based on score
 */
function updateDifficulty() {
    // Level calculation: every 50 points (5 foods) increases level
    level = Math.floor(score / 50) + 1;

    // Speed adjustment based on score
    if (score < 50) {
        gameSpeed = 120; // Easy
    } else if (score < 100) {
        gameSpeed = 95;  // Medium
    } else if (score < 180) {
        gameSpeed = 75;  // Hard
    } else {
        gameSpeed = 60;  // Expert / Max Speed
    }

    // Re-trigger game loop interval with new speed if running
    if (isGameRunning && !isPaused) {
        runGameLoop();
    }
}

/**
 * Renders game elements onto the canvas
 */
function drawGame() {
    // Clear canvas
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg').trim() || '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGridLines();
    drawFood();
    drawSnake();
}

/**
 * Draws subtle grid lines on the canvas
 */
function drawGridLines() {
    ctx.strokeStyle = '#131c2e';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }
}

/**
 * Draws the snake on the canvas with rounded segments and eyes on the head
 */
function drawSnake() {
    snake.forEach((segment, index) => {
        const isHead = index === 0;

        // Snake body styling
        ctx.fillStyle = isHead ? '#22c55e' : '#16a34a';

        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;
        const padding = 1;
        const size = GRID_SIZE - (padding * 2);

        // Draw rounded rectangle for snake segments
        ctx.beginPath();
        ctx.roundRect(x + padding, y + padding, size, size, 6);
        ctx.fill();

        // Draw eyes on the head
        if (isHead) {
            ctx.fillStyle = '#0f172a';
            const eyeSize = 3;
            let eye1X, eye1Y, eye2X, eye2Y;

            if (dx === 1) { // Moving Right
                eye1X = x + 13; eye1Y = y + 4;
                eye2X = x + 13; eye2Y = y + 13;
            } else if (dx === -1) { // Moving Left
                eye1X = x + 4; eye1Y = y + 4;
                eye2X = x + 4; eye2Y = y + 13;
            } else if (dy === -1) { // Moving Up
                eye1X = x + 4; eye1Y = y + 4;
                eye2X = x + 13; eye2Y = y + 4;
            } else { // Moving Down
                eye1X = x + 4; eye1Y = y + 13;
                eye2X = x + 13; eye2Y = y + 13;
            }

            ctx.fillRect(eye1X, eye1Y, eyeSize, eyeSize);
            ctx.fillRect(eye2X, eye2Y, eyeSize, eyeSize);
        }
    });
}

/**
 * Draws food item (glowing apple/dot) on the canvas
 */
function drawFood() {
    const x = food.x * GRID_SIZE;
    const y = food.y * GRID_SIZE;
    const padding = 3;
    const size = GRID_SIZE - (padding * 2);

    ctx.fillStyle = '#ef4444'; // Red food
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;
}

/**
 * Updates UI score, high score, level, and difficulty text
 */
function updateUI() {
    scoreEl.textContent = score;
    highScoreEl.textContent = highScore;
    levelEl.textContent = level;

    // Difficulty text & styling
    if (score < 50) {
        difficultyEl.textContent = 'Easy';
        difficultyEl.className = 'stat-value difficulty-easy';
    } else if (score < 100) {
        difficultyEl.textContent = 'Medium';
        difficultyEl.className = 'stat-value difficulty-medium';
    } else {
        difficultyEl.textContent = 'Hard';
        difficultyEl.className = 'stat-value difficulty-hard';
    }
}

/**
 * Handles Game Over state
 */
function gameOver() {
    isGameRunning = false;
    if (gameInterval) {
        clearInterval(gameInterval);
    }

    finalScoreEl.textContent = score;

    // Check if high score was broken in this session
    if (score === highScore && score > 0) {
        newHighScoreMsg.classList.remove('hidden');
    } else {
        newHighScoreMsg.classList.add('hidden');
    }

    gameOverScreen.classList.remove('hidden');
}

/**
 * Toggles Pause / Resume state
 */
function togglePause() {
    if (!isGameRunning) return;

    isPaused = !isPaused;
    if (isPaused) {
        pauseScreen.classList.remove('hidden');
    } else {
        pauseScreen.classList.add('hidden');
    }
}

/**
 * Keyboard event listener for controls and pause
 */
function handleKeyPress(e) {
    // Prevent default scrolling behavior for arrow keys and spacebar
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'KeyP'].includes(e.code)) {
        e.preventDefault();
    }

    // Toggle Pause with 'P' or 'p'
    if (e.code === 'KeyP' || e.key === 'p' || e.key === 'P') {
        togglePause();
        return;
    }

    if (!isGameRunning || isPaused || changeDirectionLock) return;

    // Direction handling with 180-degree reversal prevention
    switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
            if (dy === 0) {
                nextDx = 0;
                nextDy = -1;
                changeDirectionLock = true;
            }
            break;
        case 'ArrowDown':
        case 'KeyS':
            if (dy === 0) {
                nextDx = 0;
                nextDy = 1;
                changeDirectionLock = true;
            }
            break;
        case 'ArrowLeft':
        case 'KeyA':
            if (dx === 0) {
                nextDx = -1;
                nextDy = 0;
                changeDirectionLock = true;
            }
            break;
        case 'ArrowRight':
        case 'KeyD':
            if (dx === 0) {
                nextDx = 1;
                nextDy = 0;
                changeDirectionLock = true;
            }
            break;
    }
}

// Event Listeners setup
window.addEventListener('keydown', handleKeyPress);
startBtn.addEventListener('click', startGame);
resumeBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);

// D-pad Touch / Click Controls
btnUp.addEventListener('click', () => {
    if (isGameRunning && !isPaused && dy === 0 && !changeDirectionLock) {
        nextDx = 0; nextDy = -1; changeDirectionLock = true;
    }
});
btnDown.addEventListener('click', () => {
    if (isGameRunning && !isPaused && dy === 0 && !changeDirectionLock) {
        nextDx = 0; nextDy = 1; changeDirectionLock = true;
    }
});
btnLeft.addEventListener('click', () => {
    if (isGameRunning && !isPaused && dx === 0 && !changeDirectionLock) {
        nextDx = -1; nextDy = 0; changeDirectionLock = true;
    }
});
btnRight.addEventListener('click', () => {
    if (isGameRunning && !isPaused && dx === 0 && !changeDirectionLock) {
        nextDx = 1; nextDy = 0; changeDirectionLock = true;
    }
});
btnPause.addEventListener('click', togglePause);

// Initialize on page load
initHighScore();
