# 🌌 Solar System Snake

A modern **Solar System-themed Snake arcade game** built using **HTML5 Canvas, CSS3, and Vanilla JavaScript**.

Guide your growing cosmic snake through six planetary environments — **Earth, Mars, Jupiter, Saturn, Uranus, and Neptune** — while collecting energy orbs, avoiding collisions, and surviving increasingly difficult levels.

The game combines classic Snake gameplay with an immersive space-themed visual experience featuring animated stars, planetary environments, glowing energy orbs, particle effects, smooth transitions, and progressive difficulty.

---

## 🎮 Game Preview

> **Journey through the Solar System. Collect cosmic energy. Grow your snake. Reach Neptune.**

**Planet Journey:**

🌍 **EARTH** → 🔴 **MARS** → 🟠 **JUPITER** → 🪐 **SATURN** → 🔵 **URANUS** → 🔵 **NEPTUNE**

Each destination introduces a new environment, snake color, difficulty level, and visual atmosphere.

---

## ✨ Features

### 🌍 Solar System Journey

Travel through six unique planetary environments:

| Level | Planet     | Difficulty |
| ----- | ---------- | ---------- |
| 1     | 🌍 Earth   | Beginner   |
| 2     | 🔴 Mars    | Easy       |
| 3     | 🟠 Jupiter | Medium     |
| 4     | 🪐 Saturn  | Hard       |
| 5     | 🔵 Uranus  | Very Hard  |
| 6     | 🔵 Neptune | Expert     |

The game automatically progresses to the next planet as the snake grows.

---

### 🚀 Planet Transitions

* Smooth **1.5-second arrival transitions**
* Planet-specific messages
* Destination-matched snake colors
* Dynamic corner planet indicator
* Visual transition effects between environments

---

### ⭐ Dynamic Space Environment

The game features a layered animated space environment containing:

* Twinkling stars
* Parallax star layers
* Drifting cosmic particles
* Increasing star density as the player progresses
* Planet-specific visual atmosphere

---

### ⚡ Cosmic Energy Orbs

Collect glowing energy orbs to grow your snake.

Each successful pickup:

* Adds **10 points**
* Increases snake length
* Triggers a glowing collection effect
* Generates particle bursts
* Helps progress toward the next planet

---

### 🐍 Smooth Arcade Gameplay

The game uses interpolated movement to provide a smoother arcade experience while maintaining classic Snake mechanics.

Controls are responsive through:

* Keyboard controls
* WASD controls
* Arrow keys
* On-screen D-pad
* Touch-friendly controls

---

### 📈 Progressive Difficulty

The game becomes faster as the snake grows.

* Starting movement interval: **210 ms**
* Minimum movement interval: **80 ms**
* Speed increases progressively with snake length
* Later levels provide a significantly greater challenge

This creates a difficulty curve that rewards skill while keeping the game playable.

---

### 🏆 Score & High Score

The game includes persistent score tracking.

Features:

* Real-time score
* Current snake length
* Current planet/level
* Persistent high score
* High score stored using browser `localStorage`
* New-record celebration on the Game Over screen

Your high score remains available even after refreshing or reopening the game.

---

### ⏸️ Pause & Resume

The game can be paused at any time.

**Keyboard:**

```text
P
```

You can also use the on-screen pause button.

---

### 💥 Collision Detection

The game detects:

* Outer wall collisions
* Snake self-collisions

A collision ends the current run and displays the Game Over screen.

---

## 🕹️ Controls

| Action         | Keyboard       | Mobile / Touch |
| -------------- | -------------- | -------------- |
| Move Up        | `↑` / `W`      | D-pad Up       |
| Move Down      | `↓` / `S`      | D-pad Down     |
| Move Left      | `←` / `A`      | D-pad Left     |
| Move Right     | `→` / `D`      | D-pad Right    |
| Pause / Resume | `P`            | Pause Button   |
| Start Game     | Start Button   | Tap            |
| Restart        | Restart Button | Tap            |

---

## 📜 Game Rules

### 1. Collect Energy

Guide the snake toward glowing cosmic energy orbs.

Each orb:

```text
+10 Points
+1 Snake Segment
```

---

### 2. Avoid the Walls

If the snake hits the outer boundary of the game area, the game ends.

---

### 3. Avoid Yourself

The snake must not collide with its own body.

As the snake becomes longer, controlling it becomes increasingly difficult.

---

### 4. Explore the Solar System

The journey begins on **Earth**.

Every five additional snake segments advance the player toward the next planetary destination.

```text
Earth
  ↓
Mars
  ↓
Jupiter
  ↓
Saturn
  ↓
Uranus
  ↓
Neptune
```

---

### 5. Reach Neptune

Neptune is the final destination and represents **Level 6 / Expert difficulty**.

Can you survive the journey across the Solar System?

---

## 🛠️ Technologies Used

### Frontend

* **HTML5**
* **CSS3**
* **JavaScript ES6+**

### Graphics

* **HTML5 Canvas API**
* Canvas 2D rendering
* Particle effects
* Dynamic animations
* Parallax starfield

### Browser APIs

* `localStorage`
* Keyboard Events
* Touch / Pointer Events
* Canvas API
* DOM APIs

---

## 📂 Project Structure

```text
solar-system-snake/
│
├── index.html
├── style.css
├── script.js
│
├── assets/
│   ├── images/
│   └── sounds/
│
└── README.md
```

> The exact structure may vary depending on the current implementation of the project.

---

## 🚀 Getting Started

### Prerequisites

No special software or dependencies are required.

You only need a modern web browser such as:

* Google Chrome
* Microsoft Edge
* Mozilla Firefox
* Safari

---

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/solar-system-snake.git
```

#### 2. Navigate to the project

```bash
cd solar-system-snake
```

#### 3. Open the game

Simply open:

```text
index.html
```

You can either:

* Double-click `index.html`
* Drag it into your browser
* Open it using VS Code with Live Server

No Node.js, database, backend, or external server is required.

---

## 💻 Running with VS Code

If you're using **Visual Studio Code**, you can install the **Live Server** extension.

Then:

1. Open the project folder in VS Code.
2. Open `index.html`.
3. Right-click the file.
4. Select **Open with Live Server**.
5. The game will launch in your browser.

Live Server is optional — the game can also run directly from `index.html`.

---

## 🧠 Game Logic

The game follows a classic Snake architecture with additional planetary progression.

### Core Game Loop

```text
Game Start
     ↓
Initialize Snake
     ↓
Generate Energy Orb
     ↓
Read Player Input
     ↓
Move Snake
     ↓
Check Collision
     ↓
Check Energy Collection
     ↓
Update Score & Length
     ↓
Check Planet Progression
     ↓
Increase Difficulty
     ↓
Render Game
     ↓
Repeat
```

---

## 📊 Progression System

The game uses snake length to determine planetary progression.

```text
Level 1 → Earth
Level 2 → Mars
Level 3 → Jupiter
Level 4 → Saturn
Level 5 → Uranus
Level 6 → Neptune
```

Movement speed gradually increases as the player progresses.

### Speed System

```text
Starting Speed
    ↓
210 ms
    ↓
Progressive Speed Increase
    ↓
80 ms Minimum
```

The speed is capped at **80 ms** to prevent the later stages from becoming unnecessarily difficult.

---

## 🏆 Scoring System

Players receive points by collecting energy orbs.

| Event              |        Score |
| ------------------ | -----------: |
| Collect Energy Orb |          +10 |
| Collision          |    Game Over |
| New High Score     | Record Saved |

The highest score is stored locally using the browser's `localStorage`.

---

## 🎨 Visual Design

The game uses a futuristic space-inspired interface featuring:

* Dark cosmic backgrounds
* Neon-style UI elements
* Glowing energy objects
* Animated stars
* Planet-specific environments
* Particle effects
* Smooth transitions
* Responsive game interface

The visual design is intended to create an arcade-style **deep-space experience** while keeping the gameplay simple and intuitive.

---

## 📱 Responsive Design

The game is designed to work across different screen sizes.

### Desktop

Keyboard controls:

```text
W A S D
```

or

```text
↑ ↓ ← →
```

### Mobile

Use the on-screen **D-pad** to control the snake.

---

## 💾 Local Storage

The game uses browser `localStorage` to save the player's high score.

This means the high score can persist between sessions without requiring:

* A database
* A backend server
* User accounts
* Internet connectivity

---

## 🔧 Future Improvements

Possible future additions include:

* 🔊 Background space music
* 🎵 Sound effects
* 🌌 More planetary environments
* 🛰️ Special space obstacles
* 👾 Enemy spacecraft
* 🚀 Power-ups
* 🏅 Achievement system
* 🌎 Multiple game modes
* 📊 Global leaderboard
* 👥 Multiplayer mode
* 🎮 Gamepad support
* 📱 Improved mobile controls
* 🌠 Special events and cosmic effects

---

## 🤝 Contributing

Contributions are welcome!

If you want to contribute:

### 1. Fork the repository

Create your own copy of the project.

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

### 3. Make your changes

Implement and test your feature.

### 4. Commit your changes

```bash
git add .
git commit -m "Add: your feature"
```

### 5. Push the branch

```bash
git push origin feature/your-feature
```

### 6. Create a Pull Request

Open a Pull Request and describe the changes you made.

---

## 🐛 Bug Reports & Suggestions

Found a bug or have an idea for improvement?

Open an **Issue** in the repository and include:

* Description of the problem
* Steps to reproduce it
* Expected behavior
* Actual behavior
* Browser/device information
* Screenshots, if applicable

---

## 📄 License

This project is created for **educational and project purposes**.

If you plan to reuse or distribute the project, add an appropriate open-source license such as **MIT License**.

---

## 👨‍💻 Author

**Dhyan Shaji**

B.Tech — Artificial Intelligence & Data Science

Interested in:

* Artificial Intelligence
* Data Science
* Web Development
* Game Development
* Software Engineering

---

## ⭐ Support the Project

If you enjoyed **Solar System Snake**, consider:

* ⭐ Starring the repository
* 🍴 Forking the project
* 🐛 Reporting bugs
* 💡 Suggesting new features
* 🤝 Contributing to development

---

# 🌌 Start Your Journey

> **From Earth to Neptune — how far can your snake go?**

**Collect energy. Grow stronger. Survive the cosmos.**

### 🚀 Play. Explore. Conquer the Solar System.
