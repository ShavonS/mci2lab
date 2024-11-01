const canvas = document.getElementById('gamecnv');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;

let bubbles = [];
let score = 0;
let missedBubbles = 0;
let level = 1;
const BASE_MAX_BUBBLES = 3;
const MAX_MISSES = 3;
let explosionParticles = [];

function updateLevel() {
    level = Math.floor(score / 100) + 1; // Erhöht Level alle 100 Punkte
}

// Blase erstellen
function createBubble() {
    const MAX_SPEED = 3; // Maximale Geschwindigkeit für die Blasen
    const baseSpeed = Math.random() * 1 + 0.5; // Grundgeschwindigkeit der Blasen
    const levelSpeed = Math.min(level * 0.1, 2); // Erhöht sich pro Level, aber maximal +1.5

    // Finaler Geschwindigkeitswert mit einer Begrenzung
    const speed = Math.min(baseSpeed + levelSpeed, MAX_SPEED);

    // Prüfen, ob die Anzahl der Blasen das Limit erreicht hat
    if (bubbles.length < BASE_MAX_BUBBLES + Math.floor(score / 100)) {
        const radius = Math.random() * 20 + 10;
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = canvas.height + radius;
        const isPowerUp = Math.random() < 0.1; // 10% Chance auf ein Power-Up
        bubbles.push({ x, y, radius, speed, isPowerUp });
    }
}


// Blasen aktualisieren
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

    // Explosions-Animationen aktualisieren
    explosionParticles.forEach((particle, index) => {
        particle.radius *= 0.9;
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.radius < 0.5) {
            explosionParticles.splice(index, 1); // Entfernt Partikel, wenn zu klein
        }
    });
}

// Blasen und Animationen zeichnen
function drawBubbles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bubbles.forEach(bubble => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = bubble.isPowerUp ? 'orange' : 'rgba(0, 150, 255, 0.7)';
        ctx.fill();
        ctx.closePath();
    });

    // Partikel der Explosion zeichnen
    explosionParticles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
        ctx.fill();
        ctx.closePath();
    });

    // Score und verpasste Blasen anzeigen
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Missed: ${missedBubbles}`, 10, 60);
    ctx.fillText(`Level: ${level}`, 10, 90);
}

// Treffer-Logik und Power-Up-Explosion mit Animation
function checkBubbleHit(x, y) {
    bubbles = bubbles.filter((bubble, index) => {
        const dist = Math.sqrt((bubble.x - x) ** 2 + (bubble.y - y) ** 2);
        if (dist < bubble.radius) {
            if (bubble.isPowerUp) {
                // Explosions-Power-Up: alle Blasen in der Nähe zerstören und Animationen erstellen
                bubbles = bubbles.filter(b => {
                    const dist = Math.sqrt((bubble.x - b.x) ** 2 + (bubble.y - b.y) ** 2);
                    if (dist <= bubble.radius * 2) {
                        createExplosion(b.x, b.y, b.radius);
                        return false;
                    }
                    return true;
                });
                score += 20; // zusätzlicher Bonus
            } else {
                createExplosion(bubble.x, bubble.y, bubble.radius);
                score += 10;
            }
            return false; // Entfernt getroffene Blase
        }
        return true;
    });
}

// Explosionspartikel erstellen
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

// Ereignisse für Touch- und Mausklicks
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

// Hauptspiel-Loop
function gameLoop() {
    if (Math.random() < 0.08 ) { // Erhöht Blasenerzeugung 
        createBubble();
    }
    updateBubbles();
    updateLevel();
    drawBubbles();
    requestAnimationFrame(gameLoop);
}

// Spiel zurücksetzen
function resetGame() {
    bubbles = [];
    score = 0;
    missedBubbles = 0;
    explosionParticles = [];
}

gameLoop();