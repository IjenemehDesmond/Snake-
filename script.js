const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let velocityX = 0;
let velocityY = 0;
let food = randomFoodPosition();
let score = 0;

function randomFoodPosition() {
  return {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
}

function gameLoop() {
  // Move snake head
  const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };

  // Wrap around edges
  if (head.x < 0) head.x = tileCount - 1;
  else if (head.x >= tileCount) head.x = 0;
  if (head.y < 0) head.y = tileCount - 1;
  else if (head.y >= tileCount) head.y = 0;

  // Check collision with body
  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y) {
      resetGame();
      return;
    }
  }

  snake.unshift(head);

  // Check if food eaten
  if (head.x === food.x && head.y === food.y) {
    score++;
    food = randomFoodPosition();
  } else {
    snake.pop();
  }

  drawGame();
}

function drawGame() {
  // Clear canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw food
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  // Draw snake
  ctx.fillStyle = 'lime';
  for (let segment of snake) {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
  }

  // Draw score
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 20);
}

function resetGame() {
  alert('Game over! Your score: ' + score);
  snake = [{ x: 10, y: 10 }];
  velocityX = 0;
  velocityY = 0;
  score = 0;
  food = randomFoodPosition();
}

window.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowUp':
      if (velocityY === 1) break;
      velocityX = 0;
      velocityY = -1;
      break;
    case 'ArrowDown':
      if (velocityY === -1) break;
      velocityX = 0;
      velocityY = 1;
      break;
    case 'ArrowLeft':
      if (velocityX === 1) break;
      velocityX = -1;
      velocityY = 0;
      break;
    case 'ArrowRight':
      if (velocityX === -1) break;
      velocityX = 1;
      velocityY = 0;
      break;
  }
});

setInterval(gameLoop, 100);

// This is the "Offline page" service worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-page";

// TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";
const offlineFallbackPage = "ToDo-replace-this-name.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {

        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});

