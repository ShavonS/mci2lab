const canvas = document.getElementById('gamecnv');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;

let bubbles = [];
let rotatingBubble = null;
let score = 0;
let missedBubbles = 0;
let level = 1;
const BASE_MAX_BUBBLES = 3;
const MAX_MISSES = 3;
let explosionParticles = [];
let lastRotatingBubbleTime = 0;

function updateLevel() {
    level = Math.floor(score / 100) + 1;
}

function createBubble() {
    const MAX_SPEED = 3;
    const baseSpeed = Math.random() * 1 + 0.5;
    const levelSpeed = Math.min(level * 0.1, 2);
    const speed = Math.min(baseSpeed + levelSpeed, MAX_SPEED);

    if (bubbles.length < BASE_MAX_BUBBLES + Math.floor(score / 100)) {
        const radius = Math.random() * 20 + 10;
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = canvas.height + radius;
        const isPowerUp = Math.random() < 0.1;
        bubbles.push({ x, y, radius, speed, isPowerUp });
    }
}

function createRotatingBubble() {
    const radius = Math.random() * 20 + 10;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = canvas.height + radius;
    const rotation = 0;
    const rotationSpeed = Math.random() * 0.05 + 0.02;
    const direction = Math.random() < 0.5 ? 1 : -1;

    rotatingBubble = { x, y, radius, rotation, rotationSpeed, direction, hasRotatedCorrectly: false };
}

function updateRotatingBubble() {
    if (rotatingBubble) {
        rotatingBubble.y -= 1;

        const rotationThreshold = Math.abs(rotatingBubble.rotation % (Math.PI * 2));
        if (rotationThreshold < 0.2) {
            rotatingBubble.hasRotatedCorrectly = true;
        } else {
            rotatingBubble.hasRotatedCorrectly = false;
        }

        if (rotatingBubble.y + rotatingBubble.radius < 0) {
            rotatingBubble = null;
        }
    }
}

function updateBubbles() {
    bubbles = bubbles.filter(bubble => {
        bubble.y -= bubble.speed;

        if (bubble.y + bubble.radius < 0) {
            missedBubbles++;
            if (missedBubbles >= MAX_MISSES) {
                alert('Game Over!');
                resetGame();
            }
            return false;
        }
        return true;
    });

    updateRotatingBubble();

    explosionParticles.forEach((particle, index) => {
        particle.radius *= 0.9;
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.radius < 0.5) {
            explosionParticles.splice(index, 1);
        }
    });
}

function drawRotationGuide(bubble) {
    if (!bubble) return;

    ctx.save();
    ctx.translate(bubble.x, bubble.y);

    ctx.beginPath();
    ctx.arc(0, 0, bubble.radius + 15, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    const arrowLength = bubble.radius + 20;
    const arrowAngle = bubble.rotation + (bubble.direction > 0 ? Math.PI / 4 : -Math.PI / 4);
    const arrowHeadX = Math.cos(arrowAngle) * arrowLength;
    const arrowHeadY = Math.sin(arrowAngle) * arrowLength;

    ctx.beginPath();
    ctx.moveTo(Math.cos(bubble.rotation) * arrowLength, Math.sin(bubble.rotation) * arrowLength);
    ctx.lineTo(arrowHeadX, arrowHeadY);
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();

    ctx.restore();
}

function drawRotatingBubble() {
    if (rotatingBubble) {
        drawRotationGuide(rotatingBubble);

        ctx.save();
        ctx.translate(rotatingBubble.x, rotatingBubble.y);
        ctx.rotate(rotatingBubble.rotation);

        // Leuchtender Effekt um die Blase, wenn korrekt rotiert
        if (rotatingBubble.hasRotatedCorrectly) {
            ctx.beginPath();
            ctx.arc(0, 0, rotatingBubble.radius + 10, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.closePath();
        }

        // Blase zeichnen
        ctx.beginPath();
        ctx.arc(0, 0, rotatingBubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = rotatingBubble.hasRotatedCorrectly ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)';
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    }
}


function drawBubbles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bubbles.forEach(bubble => {
        ctx.save();
        ctx.translate(bubble.x, bubble.y);
        ctx.rotate(bubble.rotation);

        ctx.beginPath();
        ctx.arc(0, 0, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = bubble.isPowerUp ? 'orange' : 'rgba(0, 150, 255, 0.7)';
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    });

    drawRotatingBubble();

    explosionParticles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
        ctx.fill();
        ctx.closePath();
    });

    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Missed: ${missedBubbles}`, 10, 60);
    ctx.fillText(`Level: ${level}`, 10, 90);
}

function checkBubbleHit(x, y) {
    if (rotatingBubble) {
        const dist = Math.sqrt((rotatingBubble.x - x) ** 2 + (rotatingBubble.y - y) ** 2);
        if (dist < rotatingBubble.radius) {
            if (rotatingBubble.hasRotatedCorrectly) {
                createExplosion(rotatingBubble.x, rotatingBubble.y, rotatingBubble.radius);
                score += 10;
                rotatingBubble = null;
            } else {
                alert('Die Blase wurde nicht richtig gedreht!');
            }
            return;
        }
    }

    bubbles = bubbles.filter((bubble, index) => {
        const dist = Math.sqrt((bubble.x - x) ** 2 + (bubble.y - y) ** 2);
        if (dist < bubble.radius) {
            if (bubble.isPowerUp) {
                bubbles = bubbles.filter(b => {
                    const dist = Math.sqrt((bubble.x - b.x) ** 2 + (bubble.y - b.y) ** 2);
                    if (dist <= bubble.radius * 2) {
                        createExplosion(b.x, b.y, b.radius);
                        return false;
                    }
                    return true;
                });
                score += 20;
            } else {
                createExplosion(bubble.x, bubble.y, bubble.radius);
                score += 10;
            }
            return false;
        }
        return true;
    });
}

function createExplosion(x, y, radius) {
    const particleCount = 10 + Math.floor(radius);
    for (let i = 0; i < particleCount; i++) {
        explosionParticles.push({
            x,
            y,
            radius: Math.random() * 5 + 2,
            speedX: Math.random() * 4 - 2,
            speedY: Math.random() * 4 - 2
        });
    }
}

canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    checkBubbleHit(x, y);
});

canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    checkBubbleHit(x, y);
});

document.addEventListener('keydown', (event) => {
    if (rotatingBubble) {
        const rotationSpeed = 0.1;
        if (event.key === 'ArrowLeft') {
            rotatingBubble.rotation -= rotationSpeed;
        } else if (event.key === 'ArrowRight') {
            rotatingBubble.rotation += rotationSpeed;
        }
    }
});

function resetGame() {
    bubbles = [];
    score = 0;
    missedBubbles = 0;
    explosionParticles = [];
    lastRotatingBubbleTime = 0;
    rotatingBubble = null;
}

function gameLoop() {
    if (Math.random() < 0.08) {
        createBubble();
    }

    const currentTime = Date.now();
    if (level >= 2 && !rotatingBubble && currentTime - lastRotatingBubbleTime >= 20000) {
        createRotatingBubble();
        lastRotatingBubbleTime = currentTime;
    }

    updateBubbles();
    updateLevel();
    drawBubbles();
    requestAnimationFrame(gameLoop);
}

gameLoop();
