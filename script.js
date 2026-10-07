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

function initHighScore() {
    try {
        const savedHighScore = Number(localStorage.getItem('snake_high_score'));
        if (Number.isFinite(savedHighScore) && savedHighScore >= 0) highScore = savedHighScore;
    } catch (error) {
        highScore = 0;
    }
    highScoreEl.textContent = highScore;
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
    document.body.classList.remove('game-active');
    mainMenu.classList.remove('hidden', 'menu-leaving');
    battleComingSoon.classList.add('hidden');
    menuHome.classList.remove('hidden');
    singlePlayerBtn.focus();
}

function launchSinglePlayer() {
    if (menuHideTimeout !== null) clearTimeout(menuHideTimeout);
    document.body.classList.add('game-active');
    mainMenu.classList.add('menu-leaving');
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

function restartGame() {
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
        drawGame(0, gameTimestamp);
        if (isGameRunning) animationFrame = requestAnimationFrame(gameLoopFrame);
        return;
    }

    if (previousFrameTime === 0) previousFrameTime = timestamp;
    moveAccumulator += Math.min(timestamp - previousFrameTime, 100);
    previousFrameTime = timestamp;
    while (moveAccumulator >= gameSpeed && isGameRunning) {
        previousSnake = snake.map((segment) => ({ ...segment }));
        updateGame(gameTimestamp);
        moveAccumulator -= gameSpeed;
        changeDirectionLock = false;
    }

    if (isGameRunning) {
        drawGame(moveAccumulator / gameSpeed, gameTimestamp);
        if (toastHideAt !== null && gameTimestamp >= toastHideAt) {
            toastBanner.classList.add('hidden');
            toastHideAt = null;
        }
        animationFrame = requestAnimationFrame(gameLoopFrame);
    } else {
        drawGame(1, gameTimestamp);
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
    ctx.strokeStyle = `rgba(152, 177, 255, ${0.035 + planetProgress() * 0.004})`;
    ctx.lineWidth = 0.5;
    for (let index = 0; index < TILE_COUNT; index++) {
        ctx.beginPath();
        ctx.moveTo(index * GRID_SIZE, 0);
        ctx.lineTo(index * GRID_SIZE, canvas.height);
        ctx.stroke();
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

function updateUI() {
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
    resetGameVariables();
    isGameRunning = true;
    isPaused = false;
    isRespawning = true;
    respawnStartedAt = null;
    respawnMessage.textContent = 'RESPAWNING...';
    respawnCounter.textContent = '3';
    respawnScreen.classList.remove('hidden');
    drawGame();
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
            if (dy === 0) queueDirection(0, -1);
            break;
        case 'ArrowDown':
        case 'KeyS':
            if (dy === 0) queueDirection(0, 1);
            break;
        case 'ArrowLeft':
        case 'KeyA':
            if (dx === 0) queueDirection(-1, 0);
            break;
        case 'ArrowRight':
        case 'KeyD':
            if (dx === 0) queueDirection(1, 0);
            break;
    }
}

function queueDirection(x, y) {
    nextDx = x;
    nextDy = y;
    changeDirectionLock = true;
}

function setDirection(x, y) {
    if (!isGameRunning || isPaused || isRespawning || changeDirectionLock) return;
    if ((x !== 0 && dx === 0) || (y !== 0 && dy === 0)) queueDirection(x, y);
}

window.addEventListener('keydown', handleKeyPress);
singlePlayerBtn.addEventListener('click', launchSinglePlayer);
battleRoyaleBtn.addEventListener('click', showBattleRoyale);
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
