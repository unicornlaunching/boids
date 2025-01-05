// Setup canvas
const canvas = document.getElementById("boids");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const width = canvas.width;
const height = canvas.height;

// Boid properties
const numBoids = 200;
const boids = [];

// Create boids
for (let i = 0; i < numBoids; i++) {
  boids.push({
    x: Math.random() * width,
    y: Math.random() * height,
    dx: Math.random() * 4 - 2,
    dy: Math.random() * 4 - 2,
    history: []
  });
}

// Simulation settings
const waveFrequency = 0.05;
const waveAmplitude = 3;
const leader = { x: width / 2, y: height / 2, dx: 1, dy: 1 };

// Utility functions
function limitSpeed(boid, maxSpeed = 4) {
  const speed = Math.sqrt(boid.dx ** 2 + boid.dy ** 2);
  if (speed > maxSpeed) {
    boid.dx = (boid.dx / speed) * maxSpeed;
    boid.dy = (boid.dy / speed) * maxSpeed;
  }
}

function applyWaveMotion(boid, time) {
  boid.dx += waveAmplitude * Math.sin(waveFrequency * time + boid.y);
  boid.dy += waveAmplitude * Math.sin(waveFrequency * time + boid.x);
}

function influenceFlock(boid) {
  const influenceFactor = 0.01;
  boid.dx += (leader.x - boid.x) * influenceFactor;
  boid.dy += (leader.y - boid.y) * influenceFactor;
}

function keepWithinBounds(boid) {
  const margin = 50;
  const turnFactor = 1;
  if (boid.x < margin) boid.dx += turnFactor;
  if (boid.x > width - margin) boid.dx -= turnFactor;
  if (boid.y < margin) boid.dy += turnFactor;
  if (boid.y > height - margin) boid.dy -= turnFactor;
}

function getBoidColor(boid) {
  const speed = Math.sqrt(boid.dx ** 2 + boid.dy ** 2);
  const colorIntensity = Math.min(speed / 10, 1);
  return `rgba(${Math.floor(255 * colorIntensity)}, 100, ${Math.floor(255 * (1 - colorIntensity))}, 0.8)`;
}

function drawTrail(ctx, boid) {
  ctx.beginPath();
  for (let i = 0; i < boid.history.length; i++) {
    const opacity = i / boid.history.length;
    ctx.strokeStyle = `rgba(85, 140, 244, ${opacity})`;
    ctx.lineTo(boid.history[i][0], boid.history[i][1]);
  }
  ctx.stroke();
}

function drawBoidWithShading(ctx, boid) {
  const gradient = ctx.createLinearGradient(boid.x, boid.y, boid.x - 15, boid.y + 5);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
  gradient.addColorStop(1, getBoidColor(boid));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(boid.x, boid.y);
  ctx.lineTo(boid.x - 15, boid.y + 5);
  ctx.lineTo(boid.x - 15, boid.y - 5);
  ctx.closePath();
  ctx.fill();
}

function drawBackground(ctx, time) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  const hue = (time * 0.01) % 360;
  gradient.addColorStop(0, `hsl(${hue}, 80%, 60%)`);
  gradient.addColorStop(1, `hsl(${hue + 40}, 80%, 30%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawLighting(ctx) {
  const gradient = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height));
  gradient.addColorStop(0, "rgba(255, 255, 200, 0.3)");
  gradient.addColorStop(1, "rgba(0, 0, 50, 0.1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

// Animation loop
function animationLoop() {
  const time = performance.now() / 1000;

  // Update boids
  for (let boid of boids) {
    applyWaveMotion(boid, time);
    influenceFlock(boid);
    keepWithinBounds(boid);
    limitSpeed(boid);

    boid.x += boid.dx;
    boid.y += boid.dy;

    boid.history.push([boid.x, boid.y]);
    if (boid.history.length > 20) boid.history.shift();
  }

  // Draw scene
  drawBackground(ctx, time);
  drawLighting(ctx);

  for (let boid of boids) {
    drawTrail(ctx, boid);
    drawBoidWithShading(ctx, boid);
  }

  requestAnimationFrame(animationLoop);
}

// Start animation
animationLoop();
