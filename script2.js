const canvas = document.getElementById('gamecnv');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;

let bubbles = [];
let rotatingBubble = null; // Für die rotierende Blase
let score = 0;
let missedBubbles = 0;
let level = 1;
const BASE_MAX_BUBBLES = 3;
const MAX_MISSES = 3;
let explosionParticles = [];
let lastRotatingBubbleTime = 0; // Für den Timer der rotierenden Blase

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
        const rotation = 0
    }
}


// Rotierende Blase erstellen
function createRotatingBubble() {
    const radius = Math.random() * 20 + 10;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = canvas.height + radius;

    // Neue Eigenschaften für die Rotation
    const rotation = 0; // Startwinkel
    const rotationSpeed = Math.random() * 0.05 + 0.02; // Geschwindigkeit der Rotation
    const direction = Math.random() < 0.5 ? 1 : -1; // 1 für rechts, -1 für links

    rotatingBubble = { x, y, radius, rotation, rotationSpeed, direction, hasRotatedCorrectly: false };
}
function createRotatingBubble() {
    const radius = Math.random() * 20 + 10;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = canvas.height + radius;

    // Neue Eigenschaften für die Rotation
    const rotation = 0; // Startwinkel
    const rotationSpeed = Math.random() * 0.05 + 0.02; // Geschwindigkeit der Rotation
    const direction = Math.random() < 0.5 ? 1 : -1; // 1 für rechts, -1 für links

    rotatingBubble = { x, y, radius, rotation, rotationSpeed, direction, hasRotatedCorrectly: false };
}

// Funktion zum Aktualisieren der rotierenden Blase
function updateRotatingBubble() {
    if (rotatingBubble) {
        rotatingBubble.y -= 1; // Blase nach oben bewegen
        rotatingBubble.rotation += rotatingBubble.rotationSpeed * rotatingBubble.direction; // Rotation aktualisieren

        // Wenn die rotierende Blase aus dem Sichtfeld verschwindet
        if (rotatingBubble.y + rotatingBubble.radius < 0) {
            rotatingBubble = null; // Blase entfernen
        }
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

    updateRotatingBubble();

    // Explosionsanimationen aktualisieren
    explosionParticles.forEach((particle, index) => {
        particle.radius *= 0.9;
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.radius < 0.5) {
            explosionParticles.splice(index, 1);
        }
    });
}

// Funktion zum Zeichnen der rotierenden Blase
function drawRotatingBubble() {
    if (rotatingBubble) {
        ctx.save();
        ctx.translate(rotatingBubble.x, rotatingBubble.y);
        ctx.rotate(rotatingBubble.rotation);

        ctx.beginPath();
        ctx.arc(0, 0, rotatingBubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)'; // Farbe für die rotierende Blase
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    }
}

// Blasen und Animationen zeichnen
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

    // Zeichne die rotierende Blase
    drawRotatingBubble();

    // Explosionspartikel zeichnen
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
    // Überprüfen, ob die rotierende Blase getroffen wird
    if (rotatingBubble) {
        const dist = Math.sqrt((rotatingBubble.x - x) ** 2 + (rotatingBubble.y - y) ** 2);
        if (dist < rotatingBubble.radius) {
            // Überprüfen, ob die Blase richtig rotiert wurde
            if (rotatingBubble.hasRotatedCorrectly) {
                createExplosion(rotatingBubble.x, rotatingBubble.y, rotatingBubble.radius);
                score += 10; // Punkte für das Treffen der rotierenden Blase
                rotatingBubble = null; // Entfernt die rotierende Blase nach dem Treffer
            } else {
                alert('Die Blase wurde nicht richtig gedreht!'); // Fehlerfall
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
    if (Math.random() < 0.08) { // Erhöht Blasenerzeugung 
        createBubble();
    }

    // Erstelle eine rotierende Blase alle 20 Sekunden, wenn das Level mindestens 2 ist
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


document.addEventListener('keydown', (event) => {
    if (event.key === 'r') { // Zum Beispiel die 'r'-Taste
        toggleRotationDirection();
    }
});

// Funktion zur Kontrolle der Rotationsrichtung
function toggleRotationDirection() {
    if (rotatingBubble) {
        rotatingBubble.hasRotatedCorrectly = !rotatingBubble.hasRotatedCorrectly; // Wechselt die Richtung
    }
}

// Spiel zurücksetzen
function resetGame() {
    bubbles = [];
    score = 0;
    missedBubbles = 0;
    explosionParticles = [];
    lastRotatingBubbleTime = 0; // Zurücksetzen der Zeit
    rotatingBubble = null; // Rotierende Blase zurücksetzen
}

gameLoop();
