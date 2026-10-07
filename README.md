# Classic Snake Game

A feature-rich, polished, and fully playable **Snake Game** built using HTML5, CSS3, and Vanilla JavaScript. Designed with a clean retro-modern arcade aesthetic, smooth rendering on an HTML5 Canvas, responsive controls, and persistent high scores.

---

## 🎮 Features

- **Smooth Arcade Gameplay**: Continuous snake movement with rounded segment graphics and animated eyes on the snake's head.
- **Dynamic Difficulty System**: Speed increases as your score increases (Easy, Medium, Hard, Expert).
- **Score & High Score Tracking**: Persistent high scores saved locally via browser `localStorage`.
- **Level Progression**: Leveling up every 50 points.
- **Pause & Resume**: Press `P` or use the pause button anytime to pause or resume the game.
- **Game Over Screen**: Displays your final score with high-score celebration notifications and a quick Restart button.
- **Responsive Controls**: Supports both **Arrow Keys**, **WASD**, and on-screen **D-pad** buttons for mobile/touch users.
- **Collision Detection**: Accurate detection for wall hits and self-collisions.

---

## 🛠️ Technologies Used

- **HTML5**: Structural markup and canvas container.
- **CSS3**: Modern styling, Flexbox/Grid layouts, custom variables, and sleek dark-mode arcade UI.
- **Vanilla JavaScript (ES6+)**: Game loop, physics, state management, collision detection, and DOM manipulation.
- **HTML5 Canvas API**: High-performance 2D game rendering.

---

## 🚀 How to Run the Game

1. Clone or download this repository.
2. Navigate to the `snake-game/` directory.
3. Open `index.html` directly in any modern web browser (Chrome, Firefox, Edge, Safari):
   - Simply double-click `index.html`, or drag and drop it into your browser window.
   - No servers, Node.js, or installations required!

---

## 🕹️ Controls

| Key / Action | Control |
|---|---|
| **Arrow Up / W** | Move Up |
| **Arrow Down / S** | Move Down |
| **Arrow Left / A** | Move Left |
| **Arrow Right / D** | Move Right |
| **P** | Pause / Resume Game |
| **Start / Restart Buttons** | Mouse click / Tap to start or restart |

---

## 📜 Game Rules

1. **Eat Food**: Guide the snake to eat red food pellets to grow longer and increase your score (+10 points per food).
2. **Avoid Collisions**: The game ends if the snake hits the outer walls or runs into its own body.
3. **Speed Up**: As your score crosses thresholds (50, 100, 180 points), the game speed increases, testing your reflexes!

---

## 🔮 Future Improvements

- Add sound effects (eat food, game over, level up) using Web Audio API.
- Add collectible power-ups (speed boost, extra points, slow down).
- Add custom theme color selector.
