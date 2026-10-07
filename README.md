# Solar System Snake

A polished Solar System arcade game built with HTML5 Canvas, CSS, and vanilla JavaScript. Guide your growing snake from Earth through six distinct planetary environments with responsive controls, persistent high scores, and a difficulty curve tied to progress.

---

## 🎮 Features

- **Solar System Journey**: Progress from EARTH through MARS, JUPITER, SATURN, URANUS, and NEPTUNE, each with recognizable Canvas-rendered details and a dedicated difficulty.
- **Planet Transitions**: Smooth 1.5-second arrival fades, planet messages, destination-matched snake colors, and a corner planet indicator.
- **Layered Starfield**: Twinkling parallax stars and drifting particles become denser as the journey advances.
- **Cosmic Energy Orbs**: Planet-colored pickups pulse and burst into particles when collected.
- **Smooth Arcade Gameplay**: Interpolated movement with responsive keyboard or touch controls.
- **Progressive Difficulty**: Starts at 210 ms per move and speeds up gradually with snake length, capped at 80 ms to keep later levels playable.
- **Score & High Score Tracking**: Persistent high scores saved locally via browser `localStorage`.
- **Level Progression**: Earth is level 1; each destination advances one level every five segments, ending at expert level 6.
- **Pause & Resume**: Press `P` or use the pause button anytime to pause or resume the game.
- **Game Over Screen**: Displays score, length, level, and high score, with a new-record celebration and quick restart.
- **Responsive Controls**: Supports **Arrow Keys**, **WASD**, and on-screen **D-pad** buttons for touch users.
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

1. **Collect Energy**: Guide the snake to collect glowing cosmic orbs to grow longer and increase your score (+10 points per pickup).
2. **Avoid Collisions**: The game ends if the snake hits the outer walls or runs into its own body.
3. **Explore the Solar System**: Earth is the starting world; every five segments takes you to the next planetary destination.
4. **Level Up**: Movement starts at 210 ms per tile and gradually gets faster with growth, with an 80 ms minimum interval cap.
