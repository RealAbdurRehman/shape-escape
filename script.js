const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const CANVAS_WIDTH = (canvas.width = window.innerWidth);
const CANVAS_HEIGHT = (canvas.height = window.innerHeight);

let score = 0;
let enemies = [];
let gameOver = false;
let shapesEscaped = 0;

const scoreEl = document.getElementById("score");
const interface = document.getElementById("interface");
const startGameEl = document.getElementById("startGameEl");
const secondScoreEl = document.getElementById("secondScore");
const scoreWrapper = document.getElementById("scoreWrapper");
const startGameBtn = document.getElementById("startGameBtn");
const restartGameEl = document.getElementById("restartGameEl");
const restartGameBtn = document.getElementById("restartGameBtn");
const shapesEscapedEl = document.getElementById("shapesEscaped");
const secondShapesEscapedEl = document.getElementById("secondShapesEscaped");
const shapesEscapedWrapper = document.getElementById("shapesEscapedWrapper");

const backgroundAudio = new Audio();
backgroundAudio.src = "./Public/Audio/background.mp3";
backgroundAudio.loop = true;

class InputHandler {
  constructor() {
    this.keys = [];
    window.addEventListener("keydown", ({ key }) => {
      key = key.toLowerCase();
      if (
        (key === "w" || key === "a" || key === "d") &&
        !this.keys.includes(key)
      ) {
        this.keys.push(key);
      }
    });
    window.addEventListener("keyup", ({ key }) => {
      if (key === "w" || key === "a" || key === "d") {
        this.keys.splice(this.keys.indexOf(key), 1);
      }
    });
    startGameBtn.addEventListener("click", () => {
      backgroundAudio.play();
      startGameEl.style.display = "none";
      init();
    });
    restartGameBtn.addEventListener("click", () => {
      restartGameEl.style.display = "none";
      init();
    });
  }
}

class Player {
  constructor() {
    this.width = 100;
    this.height = 100;
    this.x = CANVAS_WIDTH * 0.5 - this.width * 0.5;
    this.y = CANVAS_HEIGHT - this.height;
    this.vx = 0;
    this.vy = 0;
    this.weight = 1;
    this.color = `hsl(${Math.random() * 361}, 100%, 50%)`;
  }
  update(pressedKeys) {
    this.draw();
    this.move();
    this.addWeight();
    this.handleInput(pressedKeys);
  }
  handleInput(keys) {
    if (keys.includes("d")) this.vx = 8;
    else if (keys.includes("a")) this.vx = -8;
    else this.vx = 0;
    if (keys.includes("w") && this.onGround()) {
      this.vy = -20;
      const jumpSound = new Audio("./Public/Audio/jump.wav");
      jumpSound.play();
    }
  }
  move() {
    this.x += this.vx;
    this.y += this.vy;
    this.handleHorizontalBoundaries();
  }
  addWeight() {
    if (!this.onGround()) this.vy += this.weight;
    else this.vy = 0;
    this.handleVerticalBoundaries();
  }
  handleHorizontalBoundaries() {
    if (this.x <= 0) this.x = 0;
    else if (this.x >= CANVAS_WIDTH - this.width)
      this.x = CANVAS_WIDTH - this.width;
  }
  handleVerticalBoundaries() {
    if (this.y <= 0) this.y = 0;
    else if (this.y >= CANVAS_HEIGHT - this.height)
      this.y = CANVAS_HEIGHT - this.height;
  }
  onGround() {
    return this.y >= CANVAS_HEIGHT - this.height;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Enemy {
  constructor() {
    this.width = Math.random() * 80 + 20;
    this.height = Math.random() * 80 + 20;
    this.x = Math.random() * CANVAS_WIDTH;
    this.y = -this.height;
    this.vy = Math.random() * 15 + 5;
    this.color = `hsl(${Math.random() * 361}, ${
      Math.random() * 50 + 50
    }%, 50%)`;
  }
  update() {
    this.draw();
    this.y += this.vy;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

function spawnEnemies(deltaTime) {
  if (timeToNewEnemy >= enemyInterval) {
    enemies.push(new Enemy());
    timeToNewEnemy = 0;
    enemyInterval = Math.random() * 150 + 100;
  } else {
    timeToNewEnemy += deltaTime;
  }
}

function addScore(deltaTime) {
  if (timeToScoreIncrement >= scoreInterval) {
    score++;
    scoreEl.innerHTML = score;
    timeToScoreIncrement = 0;
  } else {
    timeToScoreIncrement += deltaTime;
  }
}

function init() {
  gameOver = false;
  interface.style.display = "block";
  shapesEscaped = 0;
  shapesEscapedEl.innerHTML = shapesEscaped;
  shapesEscapedWrapper.style.display = "block";
  score = 0;
  scoreEl.innerHTML = shapesEscaped;
  scoreWrapper.style.display = "block";
  player.vx = 0;
  player.vy = 0;
  player.x = CANVAS_WIDTH * 0.5 - player.width * 0.5;
  player.y = CANVAS_HEIGHT - player.height;
  enemies = [];
  animate(0);
}

const player = new Player();
const input = new InputHandler();

let lastTime = 0;
let timeToNewEnemy = 0;
let enemyInterval = 1000;
let scoreInterval = 250;
let timeToScoreIncrement = 0;
function animate(timestamp) {
  if (!gameOver) requestAnimationFrame(animate);
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  ctx.fillStyle = "#6B728066";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  player.update(input.keys);
  enemies.forEach((enemy, enemyIndex) => {
    if (enemy.y > CANVAS_HEIGHT + enemy.height) {
      shapesEscaped++;
      shapesEscapedEl.innerHTML = shapesEscaped;
      enemies.splice(enemyIndex, 1);
    } else enemy.update();
    if (
      enemy.x + enemy.width > player.x &&
      enemy.x < player.x + player.width &&
      enemy.y + enemy.height > player.y &&
      enemy.y < player.y + player.height
    ) {
      gameOver = true;
      secondScoreEl.innerHTML = score;
      secondShapesEscapedEl.innerHTML = shapesEscaped;
      scoreWrapper.style.display = "none";
      restartGameEl.style.display = "block";
      shapesEscapedWrapper.style.display = "none";
    }
  });
  spawnEnemies(deltaTime);
  addScore(deltaTime);
}