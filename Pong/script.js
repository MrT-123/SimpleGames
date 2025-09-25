const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const PADDLE_MARGIN = 10;
const BALL_RADIUS = 10;
const PLAYER_COLOR = '#0ff';
const AI_COLOR = '#f0f';
const BALL_COLOR = '#00ffff'; // Make the ball visible

// Initial state
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: 5,
    velocityX: 5,
    velocityY: 4
};
let animationId;

// Draw paddles and ball
function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw divider
    ctx.strokeStyle = '#555';
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player paddle
    ctx.fillStyle = PLAYER_COLOR;
    ctx.fillRect(PADDLE_MARGIN, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // AI paddle
    ctx.fillStyle = AI_COLOR;
    ctx.fillRect(canvas.width - PADDLE_WIDTH - PADDLE_MARGIN, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = BALL_COLOR;
    ctx.fill();
}

// Ball & paddle logic
function update() {
    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Wall collision (top/bottom)
    if (ball.y - BALL_RADIUS < 0 || ball.y + BALL_RADIUS > canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    // Player paddle collision
    if (
        ball.x - BALL_RADIUS < PADDLE_MARGIN + PADDLE_WIDTH &&
        ball.y > playerY &&
        ball.y < playerY + PADDLE_HEIGHT
    ) {
        ball.velocityX = -ball.velocityX;
        // Add a bit of "spin"
        let collidePoint = (ball.y - (playerY + PADDLE_HEIGHT / 2));
        collidePoint = collidePoint / (PADDLE_HEIGHT / 2);
        let angleRad = collidePoint * (Math.PI / 4);
        let direction = 1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
    }

    // AI paddle collision (FIXED)
    if (
        ball.x + BALL_RADIUS > canvas.width - PADDLE_WIDTH - PADDLE_MARGIN &&
        ball.y > aiY &&
        ball.y < aiY + PADDLE_HEIGHT
    ) {
        ball.velocityX = -ball.velocityX;
        // Add a bit of "spin"
        let collidePoint = (ball.y - (aiY + PADDLE_HEIGHT / 2));
        collidePoint = collidePoint / (PADDLE_HEIGHT / 2);
        let angleRad = collidePoint * (Math.PI / 4);
        let direction = -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
    }

    // Score or reset ball if out of bounds
    if (ball.x - BALL_RADIUS < 0 || ball.x + BALL_RADIUS > canvas.width) {
        // Reset ball
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
        ball.velocityY = (Math.random() * 2 - 1) * ball.speed;
    }

    // Simple AI: follow the ball
    let center = aiY + PADDLE_HEIGHT / 2;
    if (center < ball.y - 10) {
        aiY += 5;
    } else if (center > ball.y + 10) {
        aiY -= 5;
    }
    // Prevent AI paddle from going out of bounds
    aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}

// Mouse movement for player paddle
canvas.addEventListener('mousemove', function (evt) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    // Clamp paddle inside canvas
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// Game loop
function gameLoop() {
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();