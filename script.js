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
let touchPositions = [];
let blackHoleActivated = false;


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
    const rotation = Math.random() * Math.PI * 2; // Zufällige Startrotation
    const targetRotation = Math.random() * Math.PI * 2; // Zufällige Zielrotation
    const rotationSpeed = Math.random() * 0.05 + 0.02;
    const direction = Math.random() < 0.5 ? 1 : -1; // Links oder rechts drehen

    rotatingBubble = {
        x,
        y,
        radius,
        rotation,
        rotationSpeed,
        direction,
        targetRotation,
        hasRotatedCorrectly: false
    };
}




function updateRotatingBubble() {
    if (rotatingBubble) {
        rotatingBubble.y -= 1; 

        

        const rotationDifference = Math.abs(
            (rotatingBubble.rotation % (Math.PI * 2)) - rotatingBubble.targetRotation
        );

        if (rotationDifference < 0.2 || rotationDifference > Math.PI * 2 - 0.2) {
            rotatingBubble.hasRotatedCorrectly = true;
        } else {
            rotatingBubble.hasRotatedCorrectly = false;
        }

        // Entfernen, wenn die Blase den Bildschirm verlässt
        if (rotatingBubble.y + rotatingBubble.radius < 0) {
            missedBubbles++;
            if(missedBubbles >= MAX_MISSES) {
                alert('Game Over!');
                resetGame();
            }
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

    if (rotatingBubble) {
        updateRotatingBubble();
    }


    explosionParticles.forEach((particle, index) => {
        particle.radius *= 0.9;
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.radius < 0.5) {
            explosionParticles.splice(index, 1);
        }
    });
}


function drawRotationGuide() {
    if (!rotatingBubble) return;

    ctx.save();
    ctx.translate(rotatingBubble.x, rotatingBubble.y);

    // Blasen-Zustand anzeigen
    ctx.beginPath();
    ctx.arc(0, 0, rotatingBubble.radius, 0, Math.PI * 2);
    ctx.fillStyle = rotatingBubble.hasRotatedCorrectly
        ? 'rgba(0, 255, 0, 0.7)'
        : 'rgba(255, 0, 0, 0.7)';
    ctx.fill();
    ctx.closePath();

    // Berechne Position des Pfeils relativ zur aktuellen Rotation
    const guideRadius = rotatingBubble.radius + 25;
    const arrowAngle = rotatingBubble.targetRotation; // Absolute Zielrotation
    const arrowX = Math.cos(arrowAngle) * guideRadius;
    const arrowY = Math.sin(arrowAngle) * guideRadius;

    // Zeichne Zielkreis
    ctx.beginPath();
    ctx.arc(0, 0, guideRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Zeichne dynamischen Pfeil
    ctx.save();
    ctx.rotate(rotatingBubble.rotation); // Drehung der Blase berücksichtigen
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY); // Spitze des Pfeils
    const triangleSize = 15; // Größe des Dreiecks
    ctx.lineTo(
        arrowX - triangleSize * Math.cos(arrowAngle - Math.PI / 6),
        arrowY - triangleSize * Math.sin(arrowAngle - Math.PI / 6)
    );
    ctx.lineTo(
        arrowX - triangleSize * Math.cos(arrowAngle + Math.PI / 6),
        arrowY - triangleSize * Math.sin(arrowAngle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.fill();
    ctx.restore();

    ctx.restore();
}
    

function drawRotatingBubble() {
    if (rotatingBubble) {
        drawRotationGuide(rotatingBubble); // Dynamischer Kreis und Pfeil

        ctx.save();
        ctx.translate(rotatingBubble.x, rotatingBubble.y);
        ctx.rotate(rotatingBubble.rotation);

        // Effekt um die Blase, wenn korrekt gedreht
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
    if (event.touches.length === 2) {
        touchPositions = Array.from(event.touches).map(touch => ({
            x: touch.clientX - canvas.getBoundingClientRect().left,
            y: touch.clientY - canvas.getBoundingClientRect().top,
        }));
    } else {
        const touch = event.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        checkBubbleHit(x, y);
    }
});


/*
canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    if(event.touches.length === 2) {
        touchPositions = Array.from(event.touches).map(touch => ({
            x: touch.clientX - canvas.getBoundingClientRect().left,
            y: touch.clientY - canvas.getBoundingClientRect().top,
        }));
    }
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    checkBubbleHit(x, y);
});
*/

canvas.addEventListener('touchmove', (event) => {
    if (event.touches.length === 2 && touchPositions.length === 2) {
        const currentTouches = Array.from(event.touches).map(touch => ({
            x: touch.clientX - canvas.getBoundingClientRect().left,
            y: touch.clientY - canvas.getBoundingClientRect().top,
        }));

        // Berechne den Abstand zwischen den beiden Fingern
        const initialDistance = Math.hypot(
            touchPositions[0].x - touchPositions[1].x,
            touchPositions[0].y - touchPositions[1].y
        );
        const currentDistance = Math.hypot(
            currentTouches[0].x - currentTouches[1].x,
            currentTouches[0].y - currentTouches[1].y
        );

        // Aktiviere das schwarze Loch, wenn der Abstand stark zunimmt oder abnimmt
        if (!blackHoleActivated && Math.abs(currentDistance - initialDistance) > 50) {
            activateBlackHolePowerUp(
                (currentTouches[0].x + currentTouches[1].x) / 2,
                (currentTouches[0].y + currentTouches[1].y) / 2
            );
            blackHoleActivated = true;
        }
    }
});


canvas.addEventListener('touchend', () => {
    // Setze die Geste zurück, wenn die Berührung endet
    blackHoleActivated = false;
    touchPositions = [];
});



function activateBlackHolePowerUp() {
    const centerX = canvas.width / 2; // Mittelpunkt des Schwarzen Lochs
    const centerY = canvas.height / 2;
    const maxRadius = 150; // Maximaler Radius des Schwarzen Lochs (15 cm ~ 150 px)
    const expansionRate = 5; // Wachstumsrate des Radius pro Frame
    let currentRadius = 50; // Startgröße des Schwarzen Lochs
    const maxDuration = 5000; // Dauer in Millisekunden 
    const startTime = Date.now();

    function animateBlackHole() {
        const elapsedTime = Date.now() - startTime;

        // Beende das Schwarze Loch nach Ablauf der maximalen Dauer
        if (elapsedTime >= maxDuration) {
            blackHoleActivated = false;
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Bildschirm bereinigen
        drawBubbles(); // Vorhandene Blasen zeichnen

        // Zeichne das Schwarze Loch im Zentrum des Bildschirms
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fill();
        ctx.closePath();
        ctx.restore();

        // Ziehe Blasen zum Schwarzen Loch
        bubbles = bubbles.filter(bubble => {
            const dist = Math.hypot(bubble.x - centerX, bubble.y - centerY);

            if (dist < currentRadius) {
                // Blase wird verschluckt
                score += 10; // Punkte für jede verschluckte Blase
                return false;
            }


            // Bewegung der Blasen in Richtung des Schwarzen Lochs
            const angle = Math.atan2(centerY - bubble.y, centerX - bubble.x);
            bubble.x += Math.cos(angle) * 2; // Bewegungsgeschwindigkeit
            bubble.y += Math.sin(angle) * 2;

            return true;
        });

        if (rotatingBubble) {
            const dist = Math.hypot(rotatingBubble.x - centerX, rotatingBubble.y - centerY);
            if (dist < currentRadius) {
                rotatingBubble = null; // Verschlucke die rotierende Blase
                score += 15; // Bonuspunkte
            } else {
                const angle = Math.atan2(centerY - rotatingBubble.y, centerX - rotatingBubble.x);
                rotatingBubble.x += Math.cos(angle) * 2;
                rotatingBubble.y += Math.sin(angle) * 2;
            }
        }

        // Wachse bis zum maximalen Radius
        if (currentRadius < maxRadius) {
            currentRadius += expansionRate;
        }

        requestAnimationFrame(animateBlackHole);
    }

    animateBlackHole();
}



/*
function drawBlackHoleCountdown() {
    if (blackHoleActivated) {
        const elapsedTime = Date.now() - blackHoleStartTime;
        const remainingTime = Math.max(0, blackHoleDuration - elapsedTime);
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`Black Hole Active: ${(remainingTime / 1000).toFixed(1)}s`, 10, 50);

        // Deaktivieren Sie das schwarze Loch, wenn die Zeit abgelaufen ist
        if (remainingTime <= 0) {
            blackHoleActivated = false;
        }
    }
}
    */




document.addEventListener('keydown', (event) => {
    const currentTime = Date.now();
    if ((event.key === 'b' || event.key === 'B') && !blackHoleActivated && level >= 2 ) { 
        const centerX = canvas.width / 2; // Schwarzes Loch in der Mitte
        const centerY = canvas.height / 2;
        alert('Black Hole Activated!');
        activateBlackHolePowerUp(centerX, centerY);
    }
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
    //drawBlackHoleCountdown();
    requestAnimationFrame(gameLoop);
}

gameLoop();
