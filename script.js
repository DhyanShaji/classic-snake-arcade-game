//code
/* Solar System Snake: canvas rendering, progression, input, and persistent scoring. */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const snakeLengthEl = document.getElementById('snakeLength');
const levelEl = document.getElementById('level');
const levelProgressBar = document.getElementById('levelProgressBar');
const nextLevelLabel = document.getElementById('nextLevelLabel');
const planetNameEl = document.getElementById('planetName');
const planetDifficultyEl = document.getElementById('planetDifficulty');
const planetVisualEl = document.getElementById('planetVisual');
const planetSteps = Array.from({ length: 6 }, (_, index) => document.getElementById(`planet-step-${index}`));
const startScreen = document.getElementById('startScreen');
const mainMenu = document.getElementById('mainMenu');
const menuHome = document.getElementById('menuHome');
const battleComingSoon = document.getElementById('battleComingSoon');
const singlePlayerBtn = document.getElementById('singlePlayerBtn');
const battleRoyaleBtn = document.getElementById('battleRoyaleBtn');
const menuBackBtn = document.getElementById('menuBackBtn');
const pauseScreen = document.getElementById('pauseScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const respawnScreen = document.getElementById('respawnScreen');
const startBtn = document.getElementById('startBtn');
const resumeBtn = document.getElementById('resumeBtn');
const pauseRestartBtn = document.getElementById('pauseRestartBtn');
const pauseMainMenuBtn = document.getElementById('pauseMainMenuBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverMainMenuBtn = document.getElementById('gameOverMainMenuBtn');
const respawnMessage = document.getElementById('respawnMessage');
const respawnCounter = document.getElementById('respawnCounter');
const finalScoreEl = document.getElementById('finalScore');
const finalLengthEl = document.getElementById('finalLength');
const finalPlanetEl = document.getElementById('finalPlanet');
const finalHighScoreEl = document.getElementById('finalHighScore');
const newHighScoreMsg = document.getElementById('newHighScoreMsg');
const deathParticles = document.getElementById('deathParticles');
const toastBanner = document.getElementById('toastBanner');
const headerPauseBtn = document.getElementById('headerPauseBtn');
const btnUp = document.getElementById('btnUp');
const btnDown = document.getElementById('btnDown');
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');
const btnPause = document.getElementById('btnPause');

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;
const ARCADE_CANVAS_SIZE = 400;
const START_SPEED = 210;
const MAX_SPEED = 80;
const SPEED_PER_SEGMENT = 4.5;
const PLANET_TRANSITION_MS = 1500;
const PLANETS = [
    { name: 'EARTH', background: '#041522', atmosphere: '#087db8', accent: '#70f0df', head: '#f1ffff', body: '#20c9ac', difficulty: 'EASY', kind: 'earth' },
    { name: 'MARS', background: '#1c080e', atmosphere: '#d9432d', accent: '#ff653f', head: '#fff2e5', body: '#de6240', difficulty: 'EASY+', kind: 'mars' },
    { name: 'JUPITER', background: '#1b1009', atmosphere: '#ce7e32', accent: '#ffb63e', head: '#fff2d7', body: '#c57839', difficulty: 'MEDIUM', kind: 'jupiter' },
    { name: 'SATURN', background: '#191506', atmosphere: '#d9ad43', accent: '#ffe45c', head: '#fffce9', body: '#d3a934', difficulty: 'MEDIUM+', kind: 'saturn' },
    { name: 'URANUS', background: '#04161d', atmosphere: '#45c8d1', accent: '#5ef2de', head: '#f0ffff', body: '#48bfc9', difficulty: 'HARD', kind: 'uranus' },
    { name: 'NEPTUNE', background: '#050c25', atmosphere: '#2764e6', accent: '#438dff', head: '#f0f5ff', body: '#386ee0', difficulty: 'EXPERT', kind: 'neptune' }
];
const stars = Array.from({ length: 130 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.15 + 0.3,
    speed: Math.random() * 0.009 + 0.002,
    depth: Math.random() * 0.75 + 0.25,
    phase: Math.random() * Math.PI * 2
}));
const spaceParticles = Array.from({ length: 22 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5 + 0.6,
    speed: Math.random() * 0.016 + 0.006,
    phase: Math.random() * Math.PI * 2
}));

let snake = [];
let food = { x: 0, y: 0 };
let dx = 1;
let dy = 0;
let nextDx = 1;
let nextDy = 0;
let score = 0;
let highScore = 0;
let level = 1;
let gameSpeed = START_SPEED;
let isGameRunning = false;
let isPaused = false;
let animationFrame = null;
let previousFrameTime = 0;
let moveAccumulator = 0;
let previousSnake = [];
let changeDirectionLock = false;
let toastHideAt = null;
let achievedHighScore = false;
let planetTransitionFrom = 0;
let planetTransitionTo = 0;
let planetTransitionStart = null;
let foodBurst = null;
let scorePopup = null;
let snakeGlowUntil = 0;
let pausedDuration = 0;
let pauseStartedAt = null;
let isRespawning = false;
let respawnStartedAt = null;
let spawnProtectionUntil = 0;
let menuHideTimeout = null;

let gameMode = 'single';
let brSnakes = [];
let brPlanets = [];
let brDrops = [];
let brAliveCount = 7;

const BR_BOT_CONFIGS = [
    { name: 'BOT ALPHA', personality: 'aggressive', color: { head: '#fff2e5', body: '#de6240', accent: '#ff653f' } },
    { name: 'BOT NOVA', personality: 'collector', color: { head: '#fffce9', body: '#d3a934', accent: '#ffe45c' } },
    { name: 'BOT TITAN', personality: 'balanced', color: { head: '#f3e8ff', body: '#8a38d9', accent: '#b85eff' } },
    { name: 'BOT ORION', personality: 'defensive', color: { head: '#f0f5ff', body: '#386ee0', accent: '#438dff' } },
    { name: 'BOT VORTEX', personality: 'aggressive', color: { head: '#ffe8f8', body: '#c93894', accent: '#ff5ec4' } },
    { name: 'BOT COSMOS', personality: 'collector', color: { head: '#f0ffff', body: '#26b893', accent: '#5ef2de' } }
];

const BR_PLANETS = [
    { name: 'EARTH', points: 10, color: '#70f0df', atmosphere: '#087db8', kind: 'earth' },
    { name: 'MARS', points: 20, color: '#ff653f', atmosphere: '#d9432d', kind: 'mars' },
    { name: 'JUPITER', points: 30, color: '#ffb63e', atmosphere: '#ce7e32', kind: 'jupiter' },
    { name: 'SATURN', points: 40, color: '#ffe45c', atmosphere: '#d9ad43', kind: 'saturn' },
    { name: 'URANUS', points: 50, color: '#5ef2de', atmosphere: '#45c8d1', kind: 'uranus' },
    { name: 'NEPTUNE', points: 60, color: '#438dff', atmosphere: '#2764e6', kind: 'neptune' }
];

function boardCols() {
    return Math.floor(canvas.width / GRID_SIZE);
}

function boardRows() {
    return Math.floor(canvas.height / GRID_SIZE);
}

function scatterSpaceField() {
    stars.forEach((star) => {
        star.x = Math.random() * canvas.width;
        star.y = Math.random() * canvas.height;
    });
    spaceParticles.forEach((particle) => {
        particle.x = Math.random() * canvas.width;
        particle.y = Math.random() * canvas.height;
    });
}

function fitBattleRoyaleCanvas() {
    const wrapper = canvas.parentElement;
    const width = wrapper && wrapper.clientWidth > 40 ? wrapper.clientWidth : window.innerWidth;
    const height = wrapper && wrapper.clientHeight > 40 ? wrapper.clientHeight : window.innerHeight;
    const cols = Math.max(20, Math.floor(width / GRID_SIZE));
    const rows = Math.max(20, Math.floor(height / GRID_SIZE));
    const nextWidth = cols * GRID_SIZE;
    const nextHeight = rows * GRID_SIZE;
    if (canvas.width === nextWidth && canvas.height === nextHeight) return false;
    canvas.width = nextWidth;
    canvas.height = nextHeight;
    scatterSpaceField();
    return true;
}

function restoreArcadeCanvas() {
    if (canvas.width === ARCADE_CANVAS_SIZE && canvas.height === ARCADE_CANVAS_SIZE) return;
    canvas.width = ARCADE_CANVAS_SIZE;
    canvas.height = ARCADE_CANVAS_SIZE;
    scatterSpaceField();
}

function clampBattleWorld() {
    if (!brSnakes.length) return;
    const cols = boardCols();
    const rows = boardRows();
    for (const snakeObj of brSnakes) {
        for (const segment of snakeObj.snake) {
            segment.x = Math.max(0, Math.min(cols - 1, segment.x));
            segment.y = Math.max(0, Math.min(rows - 1, segment.y));
        }
        if (snakeObj.previousSnake) {
            for (const segment of snakeObj.previousSnake) {
                segment.x = Math.max(0, Math.min(cols - 1, segment.x));
                segment.y = Math.max(0, Math.min(rows - 1, segment.y));
            }
        }
    }
    brPlanets = brPlanets.filter((planet) => planet.x >= 0 && planet.x < cols && planet.y >= 0 && planet.y < rows);
    brDrops = brDrops.filter((drop) => drop.x >= 0 && drop.x < cols && drop.y >= 0 && drop.y < rows);
    spawnBRPlanets(6);
}

function battlePhaseLabel() {
    if (brAliveCount <= 2) return 'FINAL SHOWDOWN';
    return `PHASE ${Math.min(5, Math.max(1, 8 - brAliveCount))}`;
}

function onBattleViewportChange() {
    if (gameMode !== 'battle' || !document.body.classList.contains('battle-royale')) return;
    const changed = fitBattleRoyaleCanvas();
    if (!changed) return;
    if (isRespawning) resetBattleRoyale();
    else clampBattleWorld();
    drawBattleRoyale();
}

function initHighScore() {
    try {
        const savedHighScore = Number(localStorage.getItem('snake_high_score'));
        if (Number.isFinite(savedHighScore) && savedHighScore >= 0) highScore = savedHighScore;
    } catch (error) {
        highScore = 0;
    }
    highScoreEl.textContent = highScore;
}

function requestFullscreenMode() {
    const elem = document.querySelector('.game-container') || document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => { });
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
    }
}

function exitFullscreenMode() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => { });
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    respawnScreen.classList.add('hidden');
    document.querySelector('.game-container').classList.remove('game-paused');
    resetGameVariables();
    isGameRunning = true;
    isPaused = false;
    drawGame();
    runGameLoop();
}

function launchBattleRoyale() {
    if (menuHideTimeout !== null) clearTimeout(menuHideTimeout);
    document.body.classList.add('game-active', 'battle-royale');
    mainMenu.classList.add('menu-leaving');
    requestFullscreenMode();
    startBattleRoyale();
    menuHideTimeout = window.setTimeout(() => {
        mainMenu.classList.add('hidden');
        menuHideTimeout = null;
    }, 700);
}

function startBattleRoyale() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    document.querySelector('.game-container').classList.remove('game-paused');
    document.body.classList.add('battle-royale');
    fitBattleRoyaleCanvas();
    resetBattleRoyale();
    isGameRunning = true;
    isPaused = false;
    isRespawning = true;
    respawnStartedAt = null;
    respawnMessage.textContent = 'BATTLE ROYALE';
    respawnCounter.textContent = '3';
    respawnScreen.classList.remove('hidden');
    drawBattleRoyale();
    runGameLoop();
}

function showBattleRoyale() {
    menuHome.classList.add('hidden');
    battleComingSoon.classList.remove('hidden');
    menuBackBtn.focus();
}

function showMainMenu() {
    battleComingSoon.classList.add('hidden');
    menuHome.classList.remove('hidden');
    battleRoyaleBtn.focus();
}

function exitToMainMenu() {
    exitFullscreenMode();
    if (menuHideTimeout !== null) {
        clearTimeout(menuHideTimeout);
        menuHideTimeout = null;
    }
    isGameRunning = false;
    isPaused = false;
    isRespawning = false;
    pauseStartedAt = null;
    document.querySelector('.game-container').classList.remove('game-paused');
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    pauseScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    respawnScreen.classList.add('hidden');
    startScreen.classList.add('hidden');
    toastBanner.classList.add('hidden');
    document.body.classList.remove('game-active', 'battle-royale');
    restoreArcadeCanvas();
    mainMenu.classList.remove('hidden', 'menu-leaving');
    battleComingSoon.classList.add('hidden');
    menuHome.classList.remove('hidden');
    singlePlayerBtn.focus();
}

function launchSinglePlayer() {
    if (menuHideTimeout !== null) clearTimeout(menuHideTimeout);
    document.body.classList.add('game-active');
    document.body.classList.remove('battle-royale');
    mainMenu.classList.add('menu-leaving');
    gameMode = 'single';
    restoreArcadeCanvas();
    startGame();
    menuHideTimeout = window.setTimeout(() => {
        mainMenu.classList.add('hidden');
        menuHideTimeout = null;
    }, 700);
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    mainMenu.addEventListener('pointermove', (event) => {
        const offsetX = (event.clientX / window.innerWidth - 0.5) * 10;
        const offsetY = (event.clientY / window.innerHeight - 0.5) * 10;
        mainMenu.style.setProperty('--menu-parallax-x', `${offsetX}px`);
        mainMenu.style.setProperty('--menu-parallax-y', `${offsetY}px`);
        mainMenu.style.setProperty('--menu-parallax-x-soft', `${offsetX * -0.38}px`);
        mainMenu.style.setProperty('--menu-parallax-y-soft', `${offsetY * -0.38}px`);
    });
    mainMenu.addEventListener('pointerleave', () => {
        mainMenu.style.setProperty('--menu-parallax-x', '0px');
        mainMenu.style.setProperty('--menu-parallax-y', '0px');
        mainMenu.style.setProperty('--menu-parallax-x-soft', '0px');
        mainMenu.style.setProperty('--menu-parallax-y-soft', '0px');
    });
}

function resetGameVariables() {
    gameMode = 'single';
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dx = 1;
    dy = 0;
    nextDx = 1;
    nextDy = 0;
    score = 0;
    level = 1;
    gameSpeed = START_SPEED;
    achievedHighScore = false;
    planetTransitionFrom = 0;
    planetTransitionTo = 0;
    planetTransitionStart = null;
    foodBurst = null;
    scorePopup = null;
    snakeGlowUntil = 0;
    pausedDuration = 0;
    pauseStartedAt = null;
    isRespawning = false;
    respawnStartedAt = null;
    spawnProtectionUntil = 0;
    toastHideAt = null;
    toastBanner.classList.add('hidden');
    changeDirectionLock = false;
    moveAccumulator = 0;
    previousFrameTime = 0;
    previousSnake = snake.map((segment) => ({ ...segment }));
    updateUI();
    generateFood();
}

function createBRSpawnCandidate(edge) {
    const columns = Math.floor(canvas.width / GRID_SIZE);
    const rows = Math.floor(canvas.height / GRID_SIZE);
    const position = 1 + Math.floor(Math.random() * (Math.min(columns, rows) - 2));

    if (edge === 'top') return { headX: position, headY: 2, dx: 0, dy: 1 };
    if (edge === 'bottom') return { headX: position, headY: rows - 3, dx: 0, dy: -1 };
    if (edge === 'left') return { headX: 2, headY: position, dx: 1, dy: 0 };
    return { headX: columns - 3, headY: position, dx: -1, dy: 0 };
}

function isSafeBRSpawn(spawn) {
    const spawnSnake = Array.from({ length: 3 }, (_, index) => ({
        x: spawn.headX - spawn.dx * index,
        y: spawn.headY - spawn.dy * index
    }));
    const columns = Math.floor(canvas.width / GRID_SIZE);
    const rows = Math.floor(canvas.height / GRID_SIZE);
    if (spawnSnake.some((segment) => segment.x < 0 || segment.x >= columns || segment.y < 0 || segment.y >= rows)) return false;

    const minimumDistance = Math.max(GRID_SIZE * 2.5, Math.min(canvas.width, canvas.height) * 0.12);
    const minimumDistanceSquared = minimumDistance ** 2;
    for (const existing of brSnakes) {
        for (const segment of spawnSnake) {
            for (const occupied of existing.snake) {
                const distanceX = (segment.x - occupied.x) * GRID_SIZE;
                const distanceY = (segment.y - occupied.y) * GRID_SIZE;
                if (distanceX ** 2 + distanceY ** 2 < minimumDistanceSquared) return false;
            }
        }
    }

    for (const planet of brPlanets) {
        for (const segment of spawnSnake) {
            const distanceX = segment.x - planet.x;
            const distanceY = segment.y - planet.y;
            if (distanceX ** 2 + distanceY ** 2 < 2.25) return false;
        }
    }

    return true;
}

function createSafeBRSpawn(edge) {
    const maxAttempts = 1000;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const spawn = createBRSpawnCandidate(edge);
        if (isSafeBRSpawn(spawn)) return spawn;
    }
    throw new Error(`Unable to find a safe Battle Royale spawn along the ${edge} edge`);
}

function resetBattleRoyale() {
    gameMode = 'battle';
    brAliveCount = 7;
    brPlanets = [];
    brDrops = [];
    toastHideAt = null;
    toastBanner.classList.add('hidden');
    changeDirectionLock = false;
    moveAccumulator = 0;
    previousFrameTime = 0;
    pausedDuration = 0;
    pauseStartedAt = null;
    isRespawning = false;
    respawnStartedAt = null;
    spawnProtectionUntil = 0;

    brSnakes = [];
    spawnBRPlanets(6);

    const spawnEdges = ['top', 'right', 'bottom', 'left'];
    for (let index = spawnEdges.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [spawnEdges[index], spawnEdges[swapIndex]] = [spawnEdges[swapIndex], spawnEdges[index]];
    }
    const matchEdges = Array.from({ length: 7 }, (_, index) => spawnEdges[index % spawnEdges.length]);
    for (let index = matchEdges.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [matchEdges[index], matchEdges[swapIndex]] = [matchEdges[swapIndex], matchEdges[index]];
    }

    const pSpawn = createSafeBRSpawn(matchEdges[0]);
    const playerSnakeArr = [
        { x: pSpawn.headX, y: pSpawn.headY },
        { x: pSpawn.headX - pSpawn.dx, y: pSpawn.headY - pSpawn.dy },
        { x: pSpawn.headX - pSpawn.dx * 2, y: pSpawn.headY - pSpawn.dy * 2 }
    ];

    brSnakes.push({
        id: 0,
        name: 'PLAYER',
        isPlayer: true,
        isAlive: true,
        snake: playerSnakeArr,
        previousSnake: playerSnakeArr.map((s) => ({ ...s })),
        dx: pSpawn.dx,
        dy: pSpawn.dy,
        nextDx: pSpawn.dx,
        nextDy: pSpawn.dy,
        score: 0,
        eliminatedBy: null,
        eliminations: 0,
        personality: 'player',
        color: { head: '#f1ffff', body: '#20c9ac', accent: '#70f0df' }
    });

    for (let i = 0; i < 6; i++) {
        const config = BR_BOT_CONFIGS[i];
        const spawn = createSafeBRSpawn(matchEdges[i + 1]);
        const botSnakeArr = [
            { x: spawn.headX, y: spawn.headY },
            { x: spawn.headX - spawn.dx, y: spawn.headY - spawn.dy },
            { x: spawn.headX - spawn.dx * 2, y: spawn.headY - spawn.dy * 2 }
        ];

        brSnakes.push({
            id: i + 1,
            name: config.name,
            isPlayer: false,
            isAlive: true,
            snake: botSnakeArr,
            previousSnake: botSnakeArr.map((s) => ({ ...s })),
            dx: spawn.dx,
            dy: spawn.dy,
            nextDx: spawn.dx,
            nextDy: spawn.dy,
            score: 0,
            eliminatedBy: null,
            eliminations: 0,
            personality: config.personality,
            color: config.color
        });
    }

    snake = brSnakes[0].snake;
    dx = brSnakes[0].dx;
    dy = brSnakes[0].dy;
    nextDx = brSnakes[0].nextDx;
    nextDy = brSnakes[0].nextDy;
    score = 0;
    level = 1;
    gameSpeed = 230;

    updateUI();
}

function restartGame() {
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    respawnScreen.classList.add('hidden');
    document.querySelector('.game-container').classList.remove('game-paused');
    if (gameMode === 'battle') {
        document.body.classList.add('battle-royale');
        fitBattleRoyaleCanvas();
        resetBattleRoyale();
        drawBattleRoyale();
    } else {
        resetGameVariables();
        drawGame();
    }
    isGameRunning = true;
    isPaused = false;
    runGameLoop();
}

function runGameLoop() {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    previousFrameTime = 0;
    animationFrame = requestAnimationFrame(gameLoopFrame);
}

function gameLoopFrame(timestamp) {
    if (!isGameRunning) return;
    if (isPaused) return;

    const gameTimestamp = timestamp - pausedDuration;
    if (isRespawning) {
        previousFrameTime = timestamp;
        updateRespawnCountdown(gameTimestamp);
        if (gameMode === 'battle') drawBattleRoyale(0, gameTimestamp);
        else drawGame(0, gameTimestamp);
        if (isGameRunning) animationFrame = requestAnimationFrame(gameLoopFrame);
        return;
    }

    if (previousFrameTime === 0) previousFrameTime = timestamp;
    moveAccumulator += Math.min(timestamp - previousFrameTime, 100);
    previousFrameTime = timestamp;
    while (moveAccumulator >= gameSpeed && isGameRunning) {
        if (gameMode === 'battle') {
            updateBattleRoyale(gameTimestamp);
        } else {
            previousSnake = snake.map((segment) => ({ ...segment }));
            updateGame(gameTimestamp);
        }
        moveAccumulator -= gameSpeed;
        changeDirectionLock = false;
    }

    if (isGameRunning) {
        if (gameMode === 'battle') {
            drawBattleRoyale(moveAccumulator / gameSpeed, gameTimestamp);
        } else {
            drawGame(moveAccumulator / gameSpeed, gameTimestamp);
        }
        if (toastHideAt !== null && gameTimestamp >= toastHideAt) {
            toastBanner.classList.add('hidden');
            toastHideAt = null;
        }
        animationFrame = requestAnimationFrame(gameLoopFrame);
    } else {
        if (gameMode === 'battle') {
            drawBattleRoyale(1, gameTimestamp);
        } else {
            drawGame(1, gameTimestamp);
        }
    }
}

function updateGame(timestamp = 0) {
    dx = nextDx;
    dy = nextDy;
    const nextHead = { x: snake[0].x + dx, y: snake[0].y + dy };
    const willGrow = nextHead.x === food.x && nextHead.y === food.y;
    if (checkCollision(nextHead, willGrow)) {
        if (timestamp < spawnProtectionUntil) return;
        gameOver();
        return;
    }

    const previousPlanet = currentPlanetIndex();
    snake.unshift(nextHead);
    if (!willGrow) {
        snake.pop();
        return;
    }

    score += 10;
    foodBurst = createFoodBurst(food, timestamp);
    scorePopup = { x: food.x * GRID_SIZE + GRID_SIZE / 2, y: food.y * GRID_SIZE + GRID_SIZE / 2, start: timestamp };
    snakeGlowUntil = timestamp + 360;
    scoreEl.classList.remove('score-pop');
    void scoreEl.offsetWidth;
    scoreEl.classList.add('score-pop');
    if (score > highScore) {
        highScore = score;
        achievedHighScore = true;
        try {
            localStorage.setItem('snake_high_score', highScore);
        } catch (error) {
            // Keep the current run playable when browser storage is unavailable.
        }
        highScoreEl.classList.remove('record-pop');
        void highScoreEl.offsetWidth;
        highScoreEl.classList.add('record-pop');
    }

    const previousLevel = level;
    updateDifficulty();
    updateUI();
    generateFood();
    const nextPlanet = currentPlanetIndex();
    if (nextPlanet !== previousPlanet) {
        planetTransitionFrom = previousPlanet;
        planetTransitionTo = nextPlanet;
        planetTransitionStart = timestamp;
        showToast(`ENTERING ${PLANETS[nextPlanet].name}`, PLANET_TRANSITION_MS);
    } else if (level > previousLevel) {
        showToast(`LEVEL ${level}`);
    }
}

function checkCollision(head, willGrow) {
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) return true;
    const bodyLength = willGrow ? snake.length : snake.length - 1;
    for (let index = 1; index < bodyLength; index++) {
        if (head.x === snake[index].x && head.y === snake[index].y) return true;
    }
    return false;
}

function generateFood() {
    const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
    const freeCells = [];
    for (let y = 0; y < TILE_COUNT; y++) {
        for (let x = 0; x < TILE_COUNT; x++) {
            if (!occupied.has(`${x},${y}`)) freeCells.push({ x, y });
        }
    }
    if (freeCells.length) food = freeCells[Math.floor(Math.random() * freeCells.length)];
}

function updateDifficulty() {
    level = Math.min(PLANETS.length, Math.floor((snake.length - 1) / 5) + 1);
    gameSpeed = Math.max(MAX_SPEED, START_SPEED - (snake.length - 3) * SPEED_PER_SEGMENT);
}

function planetProgress() {
    return Math.max(0, Math.min(PLANETS.length - 1, (snake.length - 3) / 5));
}

function currentPlanetIndex() {
    return Math.min(PLANETS.length - 1, level - 1);
}

function blendColor(startColor, endColor, amount) {
    const start = startColor.match(/[\da-f]{2}/gi).map((channel) => parseInt(channel, 16));
    const end = endColor.match(/[\da-f]{2}/gi).map((channel) => parseInt(channel, 16));
    const channels = start.map((channel, index) => Math.round(channel + (end[index] - channel) * amount));
    return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function transitionProgress(timestamp) {
    if (planetTransitionStart === null) return 1;
    return Math.max(0, Math.min(1, (timestamp - planetTransitionStart) / PLANET_TRANSITION_MS));
}

function smoothStep(amount) {
    return amount * amount * (3 - 2 * amount);
}

function planetColor(property, timestamp) {
    const currentPlanet = PLANETS[currentPlanetIndex()];
    if (planetTransitionStart === null || transitionProgress(timestamp) >= 1) return currentPlanet[property];
    const amount = smoothStep(transitionProgress(timestamp));
    return blendColor(PLANETS[planetTransitionFrom][property], PLANETS[planetTransitionTo][property], amount);
}

function drawGame(progress = 1, timestamp = 0) {
    drawSolarEnvironment(timestamp);
    drawGridLines();
    drawFood(timestamp);
    drawSnake(progress, timestamp);
    drawFoodBurst(timestamp);
}

function drawSolarEnvironment(timestamp) {
    const current = PLANETS[currentPlanetIndex()];
    const travel = transitionProgress(timestamp);
    let background = current.background;
    let atmosphere = current.atmosphere;
    let visiblePlanet = currentPlanetIndex();
    let planetOpacity = 1;

    if (planetTransitionStart !== null && travel < 1) {
        const eased = smoothStep(travel);
        const deepSpace = '#03040b';
        if (travel < 0.5) {
            const fade = eased * 2;
            background = blendColor(PLANETS[planetTransitionFrom].background, deepSpace, fade);
            atmosphere = blendColor(PLANETS[planetTransitionFrom].atmosphere, deepSpace, fade);
            visiblePlanet = planetTransitionFrom;
            planetOpacity = 1 - fade;
        } else {
            const reveal = (eased - 0.5) * 2;
            background = blendColor(deepSpace, PLANETS[planetTransitionTo].background, reveal);
            atmosphere = blendColor(deepSpace, PLANETS[planetTransitionTo].atmosphere, reveal);
            visiblePlanet = planetTransitionTo;
            planetOpacity = reveal;
        }
    }

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPlanetAtmosphere(atmosphere, background, timestamp);
    drawStarField(timestamp);
    drawPlanet(PLANETS[visiblePlanet], timestamp, planetOpacity);
    if (planetTransitionStart !== null && travel >= 1) planetTransitionStart = null;
}

function drawPlanetAtmosphere(color, background, timestamp) {
    const drift = Math.sin(timestamp * 0.0001) * 14;
    const halo = ctx.createRadialGradient(canvas.width * 0.76 + drift, canvas.height * 0.27, 3, canvas.width * 0.76, canvas.height * 0.27, canvas.width * 0.8);
    halo.addColorStop(0, `${color}68`);
    halo.addColorStop(1, `${background}00`);
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const lowerGlow = ctx.createRadialGradient(canvas.width * 0.2, canvas.height * 0.83, 0, canvas.width * 0.2, canvas.height * 0.83, canvas.width * 0.65);
    lowerGlow.addColorStop(0, `${color}24`);
    lowerGlow.addColorStop(1, `${background}00`);
    ctx.fillStyle = lowerGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStarField(timestamp) {
    const stage = planetProgress();
    const visibleStars = Math.floor(32 + stage * 15);
    const particleCount = Math.floor(2 + stage * 2.2);
    const activity = 0.22 + stage * 0.12;
    stars.slice(0, visibleStars).forEach((star) => {
        const twinkle = 0.35 + (Math.sin(timestamp * 0.0012 + star.phase) + 1) * 0.23;
        const y = (star.y + timestamp * star.speed * (0.2 + stage * 0.17) * star.depth) % canvas.height;
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = '#e6efff';
        ctx.beginPath();
        ctx.arc(star.x, y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    spaceParticles.slice(0, particleCount).forEach((particle) => {
        const drift = Math.sin(timestamp * 0.00045 + particle.phase) * (4 + stage * 2);
        const y = ((particle.y - timestamp * particle.speed * activity) % canvas.height + canvas.height) % canvas.height;
        ctx.globalAlpha = 0.2 + stage * 0.055;
        ctx.fillStyle = PLANETS[currentPlanetIndex()].accent;
        ctx.beginPath();
        ctx.arc(particle.x + drift, y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function drawPlanet(planet, timestamp, opacity) {
    if (opacity <= 0.01) return;
    const centerX = canvas.width * 0.79;
    const centerY = canvas.height * 0.25;
    const radius = canvas.width * 0.235;
    const drift = Math.sin(timestamp * 0.00018) * 2;
    ctx.save();
    ctx.globalAlpha = opacity * 0.78;
    const halo = ctx.createRadialGradient(centerX, centerY, radius * 0.55, centerX, centerY, radius * 1.55);
    halo.addColorStop(0, `${planet.atmosphere}00`);
    halo.addColorStop(0.72, `${planet.atmosphere}55`);
    halo.addColorStop(1, `${planet.atmosphere}00`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.55, 0, Math.PI * 2);
    ctx.fill();
    if (planet.kind === 'saturn' || planet.kind === 'uranus') drawPlanetRings(centerX, centerY + drift, radius, planet, false);

    if (planet.kind === 'sun') {
        const sun = ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.34, 1, centerX, centerY, radius);
        sun.addColorStop(0, '#fff9d5');
        sun.addColorStop(0.28, '#ffc95e');
        sun.addColorStop(0.68, '#ff844b');
        sun.addColorStop(1, '#d64758');
        ctx.fillStyle = sun;
        ctx.shadowColor = '#ffab59';
        ctx.shadowBlur = 34;
        ctx.beginPath();
        ctx.arc(centerX, centerY + drift, radius * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    } else {
        drawPlanetDisk(centerX, centerY + drift, radius, planet, timestamp);
        if (planet.kind === 'saturn' || planet.kind === 'uranus') drawPlanetRings(centerX, centerY + drift, radius, planet, true);
    }
    ctx.restore();
}

function drawPlanetDisk(centerX, centerY, radius, planet, timestamp) {
    ctx.save();
    const surface = ctx.createRadialGradient(centerX - radius * 0.36, centerY - radius * 0.42, radius * 0.05, centerX, centerY, radius * 1.15);
    surface.addColorStop(0, '#ffffff');
    surface.addColorStop(0.08, planet.accent);
    surface.addColorStop(0.34, planet.atmosphere);
    surface.addColorStop(1, planet.background);
    ctx.fillStyle = surface;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.clip();

    if (planet.kind === 'earth') {
        ctx.fillStyle = 'rgba(72, 191, 126, 0.78)';
        ctx.beginPath();
        ctx.ellipse(centerX - radius * 0.24, centerY - radius * 0.15, radius * 0.3, radius * 0.2, -0.45, 0, Math.PI * 2);
        ctx.ellipse(centerX + radius * 0.28, centerY + radius * 0.22, radius * 0.23, radius * 0.14, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(centerX - radius * 0.05, centerY - radius * 0.28, radius * 0.75, radius * 0.12, -0.25, 0, Math.PI * 2);
        ctx.stroke();
    } else if (planet.kind === 'mars') {
        ctx.fillStyle = 'rgba(91, 24, 20, 0.42)';
        [[-0.25, -0.22, 0.11], [0.3, 0.1, 0.08], [-0.03, 0.4, 0.06]].forEach(([x, y, size]) => {
            ctx.beginPath();
            ctx.arc(centerX + radius * x, centerY + radius * y, radius * size, 0, Math.PI * 2);
            ctx.fill();
        });
        drawPlanetDust(centerX, centerY, radius, timestamp, planet.accent);
    } else if (planet.kind === 'jupiter') {
        const bands = ['rgba(255, 218, 157, 0.46)', 'rgba(117, 62, 37, 0.4)', 'rgba(246, 187, 115, 0.5)', 'rgba(112, 58, 38, 0.38)', 'rgba(255, 222, 170, 0.42)'];
        bands.forEach((band, index) => {
            ctx.fillStyle = band;
            ctx.fillRect(centerX - radius, centerY - radius * 0.72 + index * radius * 0.37, radius * 2, radius * 0.2);
        });
        ctx.fillStyle = 'rgba(190, 76, 50, 0.78)';
        ctx.beginPath();
        ctx.ellipse(centerX + radius * 0.35, centerY + radius * 0.22, radius * 0.21, radius * 0.1, -0.12, 0, Math.PI * 2);
        ctx.fill();
    } else if (planet.kind === 'neptune') {
        ctx.strokeStyle = 'rgba(185, 220, 255, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX - radius * 0.22, centerY + radius * 0.28, radius * 0.18, radius * 0.1, -0.35, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

function drawPlanetRings(centerX, centerY, radius, planet, foreground) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-0.24);
    ctx.strokeStyle = planet.kind === 'saturn' ? 'rgba(255, 221, 132, 0.78)' : 'rgba(165, 239, 255, 0.62)';
    ctx.lineWidth = foreground ? 7 : 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.48, radius * 0.46, 0, foreground ? Math.PI * 0.06 : Math.PI * 0.58, foreground ? Math.PI * 0.94 : Math.PI * 1.94);
    ctx.stroke();
    ctx.restore();
}

function drawPlanetDust(centerX, centerY, radius, timestamp, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha *= 0.48;
    for (let index = 0; index < 9; index++) {
        const angle = index * 2.17 + timestamp * 0.00012;
        const distance = radius * (0.62 + (index % 3) * 0.1);
        ctx.beginPath();
        ctx.arc(centerX + Math.cos(angle) * distance, centerY + Math.sin(angle) * distance, 1.2 + index % 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawGridLines() {
    const cols = boardCols();
    const rows = boardRows();
    ctx.strokeStyle = `rgba(152, 177, 255, ${0.035 + planetProgress() * 0.004})`;
    ctx.lineWidth = 0.5;
    for (let index = 0; index < cols; index++) {
        ctx.beginPath();
        ctx.moveTo(index * GRID_SIZE, 0);
        ctx.lineTo(index * GRID_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let index = 0; index < rows; index++) {
        ctx.beginPath();
        ctx.moveTo(0, index * GRID_SIZE);
        ctx.lineTo(canvas.width, index * GRID_SIZE);
        ctx.stroke();
    }
}

function drawSnake(progress = 1, timestamp = 0) {
    const accent = planetColor('accent', timestamp);
    const body = planetColor('body', timestamp);
    const head = planetColor('head', timestamp);
    const protectedSpawn = isRespawning || timestamp < spawnProtectionUntil;
    const shieldAlpha = 0.58 + (Math.sin(timestamp * 0.012) + 1) * 0.12;
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        const priorSegment = previousSnake[index] || segment;
        const x = (priorSegment.x + (segment.x - priorSegment.x) * progress) * GRID_SIZE;
        const y = (priorSegment.y + (segment.y - priorSegment.y) * progress) * GRID_SIZE;
        ctx.globalAlpha = (index >= previousSnake.length ? Math.min(1, progress * 2) : 1) * (protectedSpawn ? shieldAlpha : 1);
        ctx.fillStyle = isHead ? head : body;
        ctx.shadowColor = protectedSpawn ? '#b5f4ff' : accent;
        ctx.shadowBlur = protectedSpawn ? (isHead ? 30 : 18) : (timestamp < snakeGlowUntil ? (isHead ? 28 : 16) : (isHead ? 16 : 8));
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2, 6);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (isHead) {
            ctx.fillStyle = '#081020';
            const eyeSize = 3;
            let eye1X, eye1Y, eye2X, eye2Y;
            if (dx === 1) {
                eye1X = x + 13; eye1Y = y + 4; eye2X = x + 13; eye2Y = y + 13;
            } else if (dx === -1) {
                eye1X = x + 4; eye1Y = y + 4; eye2X = x + 4; eye2Y = y + 13;
            } else if (dy === -1) {
                eye1X = x + 4; eye1Y = y + 4; eye2X = x + 13; eye2Y = y + 4;
            } else {
                eye1X = x + 4; eye1Y = y + 13; eye2X = x + 13; eye2Y = y + 13;
            }
            ctx.fillRect(eye1X, eye1Y, eyeSize, eyeSize);
            ctx.fillRect(eye2X, eye2Y, eyeSize, eyeSize);
        }
        ctx.globalAlpha = 1;
    });
}

function drawFood(timestamp = 0) {
    const centerX = food.x * GRID_SIZE + GRID_SIZE / 2;
    const centerY = food.y * GRID_SIZE + GRID_SIZE / 2;
    const pulse = 1 + Math.sin(timestamp * 0.0045) * 0.08;
    const accent = planetColor('accent', timestamp);
    const orbitAngle = timestamp * 0.0015;
    ctx.save();
    ctx.shadowColor = accent;
    ctx.shadowBlur = 26;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.84)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 9 * pulse, 7 * pulse, timestamp * 0.00035, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `${accent}dd`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8.4 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    const core = ctx.createRadialGradient(centerX - 2.5, centerY - 2.5, 0.5, centerX, centerY, 8 * pulse);
    core.addColorStop(0, '#ffffff');
    core.addColorStop(0.32, `${accent}ff`);
    core.addColorStop(0.72, `${accent}dd`);
    core.addColorStop(1, `${accent}22`);
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8 * pulse, 0, Math.PI * 2);
    ctx.fill();
    for (let index = 0; index < 3; index++) {
        const angle = orbitAngle + (Math.PI * 2 * index) / 3;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX + Math.cos(angle) * 8.8, centerY + Math.sin(angle) * 6.5, index === 0 ? 1.7 : 1.2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function createFoodBurst(position, timestamp) {
    return {
        x: position.x * GRID_SIZE + GRID_SIZE / 2,
        y: position.y * GRID_SIZE + GRID_SIZE / 2,
        start: timestamp,
        particles: Array.from({ length: 14 }, (_, index) => {
            const angle = (Math.PI * 2 * index) / 14;
            const speed = 0.035 + Math.random() * 0.055;
            return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: Math.random() * 2 + 1 };
        })
    };
}

function drawFoodBurst(timestamp) {
    if (!foodBurst) return;
    const age = timestamp - foodBurst.start;
    if (age < 0 || age > 760) {
        if (age > 760) {
            foodBurst = null;
            scorePopup = null;
        }
        return;
    }
    const accent = planetColor('accent', timestamp);
    ctx.save();
    if (age <= 620) {
        ctx.globalAlpha = 1 - age / 620;
        ctx.fillStyle = accent;
        ctx.shadowColor = accent;
        ctx.shadowBlur = 10;
        foodBurst.particles.forEach((particle) => {
            ctx.beginPath();
            ctx.arc(foodBurst.x + particle.vx * age, foodBurst.y + particle.vy * age, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    if (scorePopup && age <= 760) {
        ctx.globalAlpha = 1 - age / 760;
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 13px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+10', scorePopup.x, scorePopup.y - age * 0.035);
    } else if (scorePopup && age > 760) {
        scorePopup = null;
    }
    ctx.restore();
}

function spawnBRPlanets(count = 6) {
    while (brPlanets.length < count) {
        spawnBRPlanet();
    }
}

function spawnBRPlanet() {
    const occupied = new Set();
    for (const s of brSnakes) {
        if (!s.isAlive) continue;
        for (const seg of s.snake) {
            occupied.add(`${seg.x},${seg.y}`);
        }
    }
    for (const p of brPlanets) {
        occupied.add(`${p.x},${p.y}`);
    }
    for (const d of brDrops) {
        occupied.add(`${d.x},${d.y}`);
    }

    const freeCells = [];
    const cols = boardCols();
    const rows = boardRows();
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (!occupied.has(`${x},${y}`)) freeCells.push({ x, y });
        }
    }

    if (freeCells.length > 0) {
        const cell = freeCells[Math.floor(Math.random() * freeCells.length)];
        const planetType = BR_PLANETS[Math.floor(Math.random() * BR_PLANETS.length)];
        brPlanets.push({
            x: cell.x,
            y: cell.y,
            name: planetType.name,
            points: planetType.points,
            color: planetType.color,
            atmosphere: planetType.atmosphere,
            kind: planetType.kind
        });
    }
}

function updateBattleRoyale(timestamp = 0) {
    if (!isGameRunning || isPaused) return;

    for (let i = 1; i < brSnakes.length; i++) {
        const bot = brSnakes[i];
        if (bot.isAlive) {
            updateBotAI(bot);
        }
    }

    for (const s of brSnakes) {
        if (s.isAlive) {
            s.previousSnake = s.snake.map((seg) => ({ ...seg }));
            s.dx = s.nextDx;
            s.dy = s.nextDy;
        }
    }

    for (const s of brSnakes) {
        if (!s.isAlive) continue;
        const nextHead = { x: s.snake[0].x + s.dx, y: s.snake[0].y + s.dy };
        let willGrow = false;

        for (let pIdx = brPlanets.length - 1; pIdx >= 0; pIdx--) {
            const planetObj = brPlanets[pIdx];
            if (nextHead.x === planetObj.x && nextHead.y === planetObj.y) {
                s.score += planetObj.points;
                willGrow = true;
                brPlanets.splice(pIdx, 1);
                spawnBRPlanet();
                if (s.isPlayer) {
                    foodBurst = createFoodBurst(planetObj, timestamp);
                    scorePopup = { x: planetObj.x * GRID_SIZE + GRID_SIZE / 2, y: planetObj.y * GRID_SIZE + GRID_SIZE / 2, start: timestamp, text: `+${planetObj.points}` };
                    snakeGlowUntil = timestamp + 360;
                    scoreEl.classList.remove('score-pop');
                    void scoreEl.offsetWidth;
                    scoreEl.classList.add('score-pop');
                }
                break;
            }
        }

        if (!willGrow) {
            for (let dIdx = brDrops.length - 1; dIdx >= 0; dIdx--) {
                const dropObj = brDrops[dIdx];
                if (nextHead.x === dropObj.x && nextHead.y === dropObj.y) {
                    s.score += dropObj.points;
                    willGrow = true;
                    brDrops.splice(dIdx, 1);
                    if (s.isPlayer) {
                        snakeGlowUntil = timestamp + 300;
                        scoreEl.classList.remove('score-pop');
                        void scoreEl.offsetWidth;
                        scoreEl.classList.add('score-pop');
                    }
                    break;
                }
            }
        }

        s.snake.unshift(nextHead);
        if (!willGrow) {
            s.snake.pop();
        }
    }

    const dyingSet = new Set();
    const killers = new Map();

    for (const s of brSnakes) {
        if (!s.isAlive) continue;
        const head = s.snake[0];

        if (head.x < 0 || head.x >= boardCols() || head.y < 0 || head.y >= boardRows()) {
            dyingSet.add(s.id);
            continue;
        }

        for (let i = 1; i < s.snake.length; i++) {
            if (head.x === s.snake[i].x && head.y === s.snake[i].y) {
                dyingSet.add(s.id);
                break;
            }
        }
    }

    for (const sA of brSnakes) {
        if (!sA.isAlive || dyingSet.has(sA.id)) continue;
        const headA = sA.snake[0];

        for (const sB of brSnakes) {
            if (!sB.isAlive || sA.id === sB.id) continue;
            for (let i = 1; i < sB.snake.length; i++) {
                if (headA.x === sB.snake[i].x && headA.y === sB.snake[i].y) {
                    dyingSet.add(sA.id);
                    killers.set(sA.id, sB);
                    break;
                }
            }
        }
    }

    for (let i = 0; i < brSnakes.length; i++) {
        const sA = brSnakes[i];
        if (!sA.isAlive || dyingSet.has(sA.id)) continue;
        const headA = sA.snake[0];
        const prevHeadA = sA.previousSnake[0] || headA;

        for (let j = i + 1; j < brSnakes.length; j++) {
            const sB = brSnakes[j];
            if (!sB.isAlive || dyingSet.has(sB.id)) continue;
            const headB = sB.snake[0];
            const prevHeadB = sB.previousSnake[0] || headB;

            const sameCell = headA.x === headB.x && headA.y === headB.y;
            const crossMove = headA.x === prevHeadB.x && headA.y === prevHeadB.y && headB.x === prevHeadA.x && headB.y === prevHeadA.y;

            if (sameCell || crossMove) {
                if (sA.snake.length > sB.snake.length) {
                    dyingSet.add(sB.id);
                    sA.eliminations++;
                    killers.set(sB.id, sA);
                } else if (sB.snake.length > sA.snake.length) {
                    dyingSet.add(sA.id);
                    sB.eliminations++;
                    killers.set(sA.id, sB);
                } else {
                    dyingSet.add(sA.id);
                    dyingSet.add(sB.id);
                }
            }
        }
    }

    if (dyingSet.size > 0) {
        for (const deadId of dyingSet) {
            const deadSnake = brSnakes[deadId];
            if (deadSnake && deadSnake.isAlive) {
                handleSnakeDeath(deadSnake, killers.get(deadId), timestamp);
            }
        }
    }

    level = Math.min(5, Math.max(1, 8 - brAliveCount));
    gameSpeed = Math.max(130, 230 - (level - 1) * 25);

    if (brSnakes[0]) {
        score = brSnakes[0].score;
        snake = brSnakes[0].snake;
    }

    updateUI();

    const playerDead = !brSnakes[0].isAlive;
    if (playerDead) {
        gameOverBattleRoyale(false);
    } else if (brAliveCount <= 1) {
        gameOverBattleRoyale(true);
    }
}

function updateBotAI(bot) {
    if (!bot.isAlive) return;

    const head = bot.snake[0];
    const directions = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
    ];

    const validDirs = directions.filter((d) => !(d.dx === -bot.dx && d.dy === -bot.dy));
    const candidates = [];

    for (const d of validDirs) {
        const nextX = head.x + d.dx;
        const nextY = head.y + d.dy;

        if (nextX < 0 || nextX >= boardCols() || nextY < 0 || nextY >= boardRows()) continue;

        let hitsBody = false;
        for (const s of brSnakes) {
            if (!s.isAlive) continue;
            const checkLength = s.snake.length - 1;
            for (let i = 0; i < checkLength; i++) {
                if (s.snake[i].x === nextX && s.snake[i].y === nextY) {
                    hitsBody = true;
                    break;
                }
            }
            if (hitsBody) break;
        }
        if (hitsBody) continue;

        let headRisk = 0;
        for (const s of brSnakes) {
            if (!s.isAlive || s.id === bot.id) continue;
            const enemyHead = s.snake[0];
            const dist = Math.abs(enemyHead.x - nextX) + Math.abs(enemyHead.y - nextY);
            if (dist <= 1 && s.snake.length >= bot.snake.length) {
                headRisk += bot.personality === 'defensive' ? 50 : 25;
            }
        }

        const openSpace = getFloodFillSize(nextX, nextY, bot.id);
        if (openSpace < Math.min(bot.snake.length, 5)) {
            headRisk += 40;
        }

        let closestDist = 999;
        let targetPoints = 10;

        for (const p of brPlanets) {
            const dDist = Math.abs(p.x - nextX) + Math.abs(p.y - nextY);
            if (dDist < closestDist) {
                closestDist = dDist;
                targetPoints = p.points;
            }
        }

        for (const dr of brDrops) {
            const dDist = Math.abs(dr.x - nextX) + Math.abs(dr.y - nextY);
            if (dDist < closestDist) {
                closestDist = dDist;
                targetPoints = dr.points;
            }
        }

        let scoreVal = 100 - closestDist * 5 + targetPoints - headRisk + openSpace * 2;

        if (bot.personality === 'aggressive') {
            for (const s of brSnakes) {
                if (!s.isAlive || s.id === bot.id) continue;
                if (s.snake.length < bot.snake.length) {
                    const eHead = s.snake[0];
                    const eDist = Math.abs(eHead.x - nextX) + Math.abs(eHead.y - nextY);
                    if (eDist < 5) scoreVal += 15 - eDist * 2;
                }
            }
        } else if (bot.personality === 'collector') {
            scoreVal += targetPoints * 0.5;
        }

        candidates.push({ dir: d, score: scoreVal });
    }

    if (candidates.length > 0) {
        candidates.sort((a, b) => b.score - a.score);
        let chosen = candidates[0];
        if (candidates.length > 1 && Math.random() < 0.1) {
            chosen = candidates[1];
        }
        bot.nextDx = chosen.dir.dx;
        bot.nextDy = chosen.dir.dy;
    } else {
        for (const d of validDirs) {
            const nx = head.x + d.dx;
            const ny = head.y + d.dy;
            if (nx >= 0 && nx < boardCols() && ny >= 0 && ny < boardRows()) {
                bot.nextDx = d.dx;
                bot.nextDy = d.dy;
                break;
            }
        }
    }
}

function getFloodFillSize(startX, startY, botId) {
    const visited = new Set();
    const queue = [{ x: startX, y: startY }];
    visited.add(`${startX},${startY}`);
    let count = 0;
    const maxCheck = 15;

    while (queue.length > 0 && count < maxCheck) {
        const current = queue.shift();
        count++;

        const neighbors = [
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 }
        ];

        for (const n of neighbors) {
            const key = `${n.x},${n.y}`;
            if (n.x >= 0 && n.x < boardCols() && n.y >= 0 && n.y < boardRows() && !visited.has(key)) {
                visited.add(key);
                let blocked = false;
                for (const s of brSnakes) {
                    if (!s.isAlive) continue;
                    for (let i = 0; i < s.snake.length - 1; i++) {
                        if (s.snake[i].x === n.x && s.snake[i].y === n.y) {
                            blocked = true;
                            break;
                        }
                    }
                    if (blocked) break;
                }
                if (!blocked) {
                    queue.push(n);
                }
            }
        }
    }
    return count;
}

function spawnDeathDrops(snakeObj) {
    for (let i = 0; i < snakeObj.snake.length; i++) {
        const seg = snakeObj.snake[i];
        if (seg.x >= 0 && seg.x < boardCols() && seg.y >= 0 && seg.y < boardRows()) {
            brDrops.push({
                x: seg.x,
                y: seg.y,
                points: 10,
                color: snakeObj.color.accent || '#ff70df'
            });
        }
    }
    if (brDrops.length > 40) brDrops.splice(0, brDrops.length - 40);
}

function handleSnakeDeath(snakeObj, killerObj, timestamp) {
    snakeObj.isAlive = false;
    brAliveCount = Math.max(0, brAliveCount - 1);
    spawnDeathDrops(snakeObj);

    if (snakeObj.isPlayer) {
        if (canvas) {
            const boardBounds = canvas.getBoundingClientRect();
            deathParticles.style.left = `${boardBounds.left + ((snakeObj.snake[0].x + 0.5) / boardCols()) * boardBounds.width}px`;
            deathParticles.style.top = `${boardBounds.top + ((snakeObj.snake[0].y + 0.5) / boardRows()) * boardBounds.height}px`;
        }
        showToast('YOU WERE ELIMINATED', 1500, timestamp);
    } else {
        const killedByPlayer = killerObj && killerObj.isPlayer;
        if (killedByPlayer) {
            brSnakes[0].eliminations++;
            showToast('KILL +1', 1200, timestamp);
        } else {
            showToast('BOT ELIMINATED', 1200, timestamp);
        }
    }
}

function gameOverBattleRoyale(playerWon) {
    isGameRunning = false;
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    isPaused = false;
    isRespawning = false;
    pauseScreen.classList.add('hidden');
    respawnScreen.classList.add('hidden');

    const player = brSnakes[0] || { score: 0, snake: [{}, {}, {}], eliminations: 0 };
    finalScoreEl.textContent = player.score;
    finalLengthEl.textContent = player.snake.length;

    const eyebrowEl = document.getElementById('gameOverEyebrow');
    const titleEl = document.getElementById('gameOverTitle');
    const copyEl = document.getElementById('gameOverCopy');
    const stat2Label = document.getElementById('finalStat2Label');
    const stat4Label = document.getElementById('finalStat4Label');

    if (playerWon) {
        if (eyebrowEl) eyebrowEl.textContent = 'BATTLE ROYALE COMPLETE';
        if (titleEl) {
            titleEl.textContent = 'VICTORY!';
            titleEl.className = 'retro-title victory-title';
        }
        if (copyEl) copyEl.innerHTML = '<span aria-hidden="true">👑</span> YOU ARE THE LAST SNAKE STANDING';
        if (stat2Label) stat2Label.textContent = 'KILLS';
        finalPlanetEl.textContent = player.eliminations;
        if (stat4Label) stat4Label.textContent = 'PLAYERS ALIVE';
        finalHighScoreEl.textContent = '1 / 7';
        restartBtn.innerHTML = '<span aria-hidden="true">↻</span> PLAY AGAIN';
    } else {
        if (eyebrowEl) eyebrowEl.textContent = 'BATTLE ROYALE';
        if (titleEl) {
            titleEl.textContent = 'ELIMINATED';
            titleEl.className = 'retro-title gameover-title';
        }
        if (copyEl) copyEl.innerHTML = '<span aria-hidden="true">☠</span> YOUR SNAKE WAS ELIMINATED IN SPACE';
        if (stat2Label) stat2Label.textContent = 'KILLS';
        finalPlanetEl.textContent = player.eliminations;
        if (stat4Label) stat4Label.textContent = 'PLAYERS ALIVE';
        finalHighScoreEl.textContent = `${brAliveCount} / 7`;
        restartBtn.innerHTML = '<span aria-hidden="true">↻</span> PLAY AGAIN';
    }

    newHighScoreMsg.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    restartBtn.focus();
}

function drawBattleRoyale(progress = 1, timestamp = 0) {
    drawSolarEnvironment(timestamp);
    drawGridLines();
    drawBattleRoyalePlanets(timestamp);
    drawBattleRoyaleDrops(timestamp);
    drawBattleRoyaleSnakes(progress, timestamp);
    drawFoodBurst(timestamp);
}

function drawBattleRoyalePlanets(timestamp = 0) {
    for (const p of brPlanets) {
        const centerX = p.x * GRID_SIZE + GRID_SIZE / 2;
        const centerY = p.y * GRID_SIZE + GRID_SIZE / 2;
        const pulse = 1 + Math.sin(timestamp * 0.005 + p.x * 3) * 0.08;
        const accent = p.color;

        ctx.save();
        ctx.shadowColor = accent;
        ctx.shadowBlur = 18;

        ctx.strokeStyle = `${accent}bb`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8.5 * pulse, 0, Math.PI * 2);
        ctx.stroke();

        const core = ctx.createRadialGradient(centerX - 2, centerY - 2, 0.5, centerX, centerY, 7.5 * pulse);
        core.addColorStop(0, '#ffffff');
        core.addColorStop(0.35, accent);
        core.addColorStop(1, p.atmosphere || accent);
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 7.5 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

function drawBattleRoyaleDrops(timestamp = 0) {
    for (const d of brDrops) {
        const centerX = d.x * GRID_SIZE + GRID_SIZE / 2;
        const centerY = d.y * GRID_SIZE + GRID_SIZE / 2;
        const pulse = 1 + Math.sin(timestamp * 0.008 + d.x * 2 + d.y) * 0.12;

        ctx.save();
        ctx.shadowColor = d.color;
        ctx.shadowBlur = 12;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3.5 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = d.color;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5.5 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

function drawBattleRoyaleSnakes(progress = 1, timestamp = 0) {
    for (const sObj of brSnakes) {
        if (!sObj.isAlive) continue;
        const protectedSpawn = isRespawning || timestamp < spawnProtectionUntil;
        const shieldAlpha = 0.58 + (Math.sin(timestamp * 0.012) + 1) * 0.12;

        sObj.snake.forEach((segment, index) => {
            const isHead = index === 0;
            const priorSegment = sObj.previousSnake[index] || segment;
            const x = (priorSegment.x + (segment.x - priorSegment.x) * progress) * GRID_SIZE;
            const y = (priorSegment.y + (segment.y - priorSegment.y) * progress) * GRID_SIZE;

            ctx.globalAlpha = (index >= sObj.previousSnake.length ? Math.min(1, progress * 2) : 1) * (protectedSpawn ? shieldAlpha : 1);
            ctx.fillStyle = isHead ? sObj.color.head : sObj.color.body;
            ctx.shadowColor = protectedSpawn ? '#b5f4ff' : sObj.color.accent;
            ctx.shadowBlur = sObj.isPlayer
                ? protectedSpawn ? (isHead ? 30 : 18) : (timestamp < snakeGlowUntil ? (isHead ? 28 : 16) : (isHead ? 18 : 8))
                : (isHead ? 10 : 4);

            ctx.beginPath();
            ctx.roundRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2, 6);
            ctx.fill();
            ctx.shadowBlur = 0;

            if (isHead) {
                ctx.fillStyle = '#081020';
                const eyeSize = 3;
                let eye1X, eye1Y, eye2X, eye2Y;
                if (sObj.dx === 1) {
                    eye1X = x + 13; eye1Y = y + 4; eye2X = x + 13; eye2Y = y + 13;
                } else if (sObj.dx === -1) {
                    eye1X = x + 4; eye1Y = y + 4; eye2X = x + 4; eye2Y = y + 13;
                } else if (sObj.dy === -1) {
                    eye1X = x + 4; eye1Y = y + 4; eye2X = x + 13; eye2Y = y + 4;
                } else {
                    eye1X = x + 4; eye1Y = y + 13; eye2X = x + 13; eye2Y = y + 13;
                }
                ctx.fillRect(eye1X, eye1Y, eyeSize, eyeSize);
                ctx.fillRect(eye2X, eye2Y, eyeSize, eyeSize);

                if (sObj.isPlayer) {
                    ctx.save();
                    ctx.fillStyle = '#70f0df';
                    ctx.shadowColor = '#70f0df';
                    ctx.shadowBlur = 8;
                    ctx.font = '800 9px Outfit, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('YOU', x + GRID_SIZE / 2, y - 4);
                    ctx.restore();
                }
            }
            ctx.globalAlpha = 1;
        });
    }
}

function updateUI() {
    if (gameMode === 'battle') {
        const player = (brSnakes && brSnakes[0]) ? brSnakes[0] : { score: 0, snake: [{}, {}, {}], eliminations: 0 };
        scoreEl.textContent = player.score;
        highScoreEl.textContent = `${brAliveCount} / 7`;
        snakeLengthEl.textContent = battlePhaseLabel();
        levelEl.textContent = player.eliminations;

        const statLabel2 = document.getElementById('statLabel2');
        if (statLabel2) statLabel2.textContent = 'PLAYERS ALIVE';
        const statLabel3 = document.getElementById('statLabel3');
        if (statLabel3) statLabel3.textContent = 'CURRENT PHASE';
        const statLabel4 = document.getElementById('statLabel4');
        if (statLabel4) statLabel4.textContent = 'KILLS';

        planetNameEl.textContent = 'BATTLE ROYALE';
        planetDifficultyEl.textContent = `${brAliveCount} ALIVE`;
        const visualClass = 'planet-visual planet-saturn';
        if (planetVisualEl.className !== visualClass) {
            planetVisualEl.className = visualClass;
        }
        planetVisualEl.setAttribute('aria-label', 'Battle Royale Arena');

        const activeStep = Math.min(5, Math.max(0, 7 - brAliveCount));
        planetSteps.forEach((step, index) => {
            step.classList.toggle('visited', index < activeStep);
            step.classList.toggle('active', index === activeStep);
            if (index === activeStep) step.setAttribute('aria-current', 'step');
            else step.removeAttribute('aria-current');
        });

        const progress = Math.min(100, Math.round(((7 - brAliveCount) / 6) * 100));
        levelProgressBar.style.width = `${progress}%`;
        levelProgressBar.parentElement.setAttribute('aria-valuenow', progress);
        nextLevelLabel.textContent = brAliveCount > 1 ? `${brAliveCount} REMAINING` : 'FINAL SHOWDOWN';
        return;
    }

    const statLabel2 = document.getElementById('statLabel2');
    if (statLabel2) statLabel2.textContent = 'HIGH SCORE';
    const statLabel3 = document.getElementById('statLabel3');
    if (statLabel3) statLabel3.textContent = 'LENGTH';
    const statLabel4 = document.getElementById('statLabel4');
    if (statLabel4) statLabel4.textContent = 'LEVEL';

    scoreEl.textContent = score;
    highScoreEl.textContent = highScore;
    snakeLengthEl.textContent = snake.length;
    levelEl.textContent = level;
    const planetIndex = currentPlanetIndex();
    const planet = PLANETS[planetIndex];
    planetNameEl.textContent = planet.name;
    planetDifficultyEl.textContent = planet.difficulty;
    const visualClass = `planet-visual planet-${planet.kind}`;
    if (planetVisualEl.className !== visualClass) {
        planetVisualEl.classList.remove('planet-arrive');
        planetVisualEl.className = visualClass;
        void planetVisualEl.offsetWidth;
        planetVisualEl.classList.add('planet-arrive');
    }
    planetVisualEl.setAttribute('aria-label', `${planet.name} planet`);
    planetSteps.forEach((step, index) => {
        step.classList.toggle('visited', index < planetIndex);
        step.classList.toggle('active', index === planetIndex);
        if (index === planetIndex) step.setAttribute('aria-current', 'step');
        else step.removeAttribute('aria-current');
    });
    const levelStartLength = level === 1 ? 3 : (level - 1) * 5 + 1;
    const nextLevelLength = level * 5 + 1;
    const progress = Math.min(100, ((snake.length - levelStartLength) / (nextLevelLength - levelStartLength)) * 100);
    levelProgressBar.style.width = `${progress}%`;
    levelProgressBar.parentElement.setAttribute('aria-valuenow', Math.round(progress));
    nextLevelLabel.textContent = level >= PLANETS.length ? 'MAX PLANET' : `NEXT: ${nextLevelLength}`;
    document.documentElement.style?.setProperty('--planet-accent', planet.accent);
    document.documentElement.style?.setProperty('--planet-atmosphere', planet.atmosphere);
}

function gameOver() {
    const stat2Label = document.getElementById('finalStat2Label');
    const stat4Label = document.getElementById('finalStat4Label');
    const titleEl = document.getElementById('gameOverTitle');
    const eyebrowEl = document.getElementById('gameOverEyebrow');
    const copyEl = document.getElementById('gameOverCopy');
    if (stat2Label) stat2Label.textContent = 'PLANET REACHED';
    if (stat4Label) stat4Label.textContent = 'BEST HIGH SCORE';
    if (eyebrowEl) eyebrowEl.textContent = 'RUN COMPLETE';
    if (titleEl) {
        titleEl.textContent = 'GAME OVER';
        titleEl.className = 'retro-title gameover-title';
    }
    if (copyEl) copyEl.innerHTML = '<span aria-hidden="true">☠</span> YOUR SNAKE HAS BEEN LOST IN SPACE';
    restartBtn.innerHTML = '<span aria-hidden="true">↻</span> RESPAWN';

    isGameRunning = false;
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    isPaused = false;
    isRespawning = false;
    pauseScreen.classList.add('hidden');
    respawnScreen.classList.add('hidden');
    finalScoreEl.textContent = score;
    finalLengthEl.textContent = snake.length;
    const planetName = PLANETS[currentPlanetIndex()].name;
    finalPlanetEl.textContent = `${planetName[0]}${planetName.slice(1).toLowerCase()}`;
    finalHighScoreEl.textContent = highScore;
    const boardBounds = canvas.getBoundingClientRect();
    deathParticles.style.left = `${boardBounds.left + ((snake[0].x + 0.5) / TILE_COUNT) * boardBounds.width}px`;
    deathParticles.style.top = `${boardBounds.top + ((snake[0].y + 0.5) / TILE_COUNT) * boardBounds.height}px`;
    if (achievedHighScore) newHighScoreMsg.classList.remove('hidden');
    else newHighScoreMsg.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    restartBtn.focus();
}

function togglePause() {
    if (!isGameRunning) return;
    if (!isPaused) {
        isPaused = true;
        pauseStartedAt = performance.now();
        if (animationFrame !== null) cancelAnimationFrame(animationFrame);
        animationFrame = null;
        document.querySelector('.game-container').classList.add('game-paused');
        headerPauseBtn.setAttribute('aria-label', 'Resume game');
        headerPauseBtn.title = 'Resume game (Esc)';
        respawnScreen.classList.add('hidden');
        pauseScreen.classList.remove('hidden');
        resumeBtn.focus();
        return;
    }

    isPaused = false;
    if (pauseStartedAt !== null) pausedDuration += performance.now() - pauseStartedAt;
    pauseStartedAt = null;
    document.querySelector('.game-container').classList.remove('game-paused');
    headerPauseBtn.setAttribute('aria-label', 'Open pause menu');
    headerPauseBtn.title = 'Open pause menu (Esc)';
    pauseScreen.classList.add('hidden');
    if (isRespawning) respawnScreen.classList.remove('hidden');
    headerPauseBtn.focus();
    runGameLoop();
}

function updateRespawnCountdown(timestamp) {
    if (respawnStartedAt === null) respawnStartedAt = timestamp;
    const elapsed = timestamp - respawnStartedAt;
    if (elapsed < 1000) respawnCounter.textContent = '3';
    else if (elapsed < 2000) respawnCounter.textContent = '2';
    else if (elapsed < 3000) respawnCounter.textContent = '1';
    else if (elapsed < 3600) {
        respawnMessage.textContent = 'LAUNCH!';
        respawnCounter.textContent = 'GO!';
    } else {
        isRespawning = false;
        spawnProtectionUntil = timestamp + 2500;
        respawnScreen.classList.add('hidden');
    }
}

function respawnGame() {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    startScreen.classList.add('hidden');
    if (gameMode === 'battle') {
        document.body.classList.add('battle-royale');
        fitBattleRoyaleCanvas();
        resetBattleRoyale();
        drawBattleRoyale();
    } else {
        resetGameVariables();
        drawGame();
    }
    isGameRunning = true;
    isPaused = false;
    isRespawning = true;
    respawnStartedAt = null;
    respawnMessage.textContent = 'RESPAWNING...';
    respawnCounter.textContent = '3';
    respawnScreen.classList.remove('hidden');
    runGameLoop();
}

function showToast(message, duration = 900, timestamp = performance.now() - pausedDuration) {
    toastBanner.textContent = message;
    toastBanner.classList.remove('hidden', 'toast-pop');
    void toastBanner.offsetWidth;
    toastBanner.classList.add('toast-pop');
    toastHideAt = timestamp + duration;
}

function handleKeyPress(event) {
    if (!mainMenu.classList.contains('hidden') && !mainMenu.classList.contains('menu-leaving')) {
        if (event.code === 'Escape' && !battleComingSoon.classList.contains('hidden')) {
            event.preventDefault();
            showMainMenu();
            return;
        }
        if ((event.code === 'ArrowDown' || event.code === 'ArrowUp') && battleComingSoon.classList.contains('hidden')) {
            event.preventDefault();
            const modeButtons = [singlePlayerBtn, battleRoyaleBtn];
            const currentIndex = modeButtons.indexOf(document.activeElement);
            const direction = event.code === 'ArrowDown' ? 1 : -1;
            modeButtons[(currentIndex + direction + modeButtons.length) % modeButtons.length].focus();
            return;
        }
        return;
    }
    if (event.code === 'Escape') {
        event.preventDefault();
        if (!gameOverScreen.classList.contains('hidden')) return;
        togglePause();
        return;
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'KeyP'].includes(event.code)) event.preventDefault();
    if (!gameOverScreen.classList.contains('hidden')) {
        if (event.code === 'KeyR') respawnGame();
        return;
    }
    if (event.code === 'KeyP' || event.key === 'p' || event.key === 'P') {
        togglePause();
        return;
    }
    if (!isGameRunning || isPaused || isRespawning || changeDirectionLock) return;
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            if (gameMode === 'battle') {
                if (brSnakes[0] && brSnakes[0].dy === 0) queueDirection(0, -1);
            } else {
                if (dy === 0) queueDirection(0, -1);
            }
            break;
        case 'ArrowDown':
        case 'KeyS':
            if (gameMode === 'battle') {
                if (brSnakes[0] && brSnakes[0].dy === 0) queueDirection(0, 1);
            } else {
                if (dy === 0) queueDirection(0, 1);
            }
            break;
        case 'ArrowLeft':
        case 'KeyA':
            if (gameMode === 'battle') {
                if (brSnakes[0] && brSnakes[0].dx === 0) queueDirection(-1, 0);
            } else {
                if (dx === 0) queueDirection(-1, 0);
            }
            break;
        case 'ArrowRight':
        case 'KeyD':
            if (gameMode === 'battle') {
                if (brSnakes[0] && brSnakes[0].dx === 0) queueDirection(1, 0);
            } else {
                if (dx === 0) queueDirection(1, 0);
            }
            break;
    }
}

function queueDirection(x, y) {
    if (gameMode === 'battle') {
        if (brSnakes.length > 0 && brSnakes[0].isAlive) {
            const p = brSnakes[0];
            p.nextDx = x;
            p.nextDy = y;
            changeDirectionLock = true;
        }
    } else {
        nextDx = x;
        nextDy = y;
        changeDirectionLock = true;
    }
}

function setDirection(x, y) {
    if (!isGameRunning || isPaused || isRespawning || changeDirectionLock) return;
    if (gameMode === 'battle') {
        if (brSnakes.length > 0 && brSnakes[0].isAlive) {
            const p = brSnakes[0];
            if ((x !== 0 && p.dx === 0) || (y !== 0 && p.dy === 0)) queueDirection(x, y);
        }
    } else {
        if ((x !== 0 && dx === 0) || (y !== 0 && dy === 0)) queueDirection(x, y);
    }
}

window.addEventListener('resize', onBattleViewportChange);
window.addEventListener('fullscreenchange', onBattleViewportChange);
window.addEventListener('keydown', handleKeyPress);
singlePlayerBtn.addEventListener('click', launchSinglePlayer);
battleRoyaleBtn.addEventListener('click', launchBattleRoyale);
menuBackBtn.addEventListener('click', showMainMenu);
headerPauseBtn.addEventListener('click', togglePause);
startBtn.addEventListener('click', startGame);
resumeBtn.addEventListener('click', togglePause);
pauseRestartBtn.addEventListener('click', restartGame);
pauseMainMenuBtn.addEventListener('click', exitToMainMenu);
restartBtn.addEventListener('click', respawnGame);
gameOverMainMenuBtn.addEventListener('click', exitToMainMenu);
btnUp.addEventListener('click', () => setDirection(0, -1));
btnDown.addEventListener('click', () => setDirection(0, 1));
btnLeft.addEventListener('click', () => setDirection(-1, 0));
btnRight.addEventListener('click', () => setDirection(1, 0));
btnPause.addEventListener('click', togglePause);

initHighScore();
resetGameVariables();
drawGame();
