// Space Invaders Game JavaScript

// Wait for the DOM to fully load before running the game
document.addEventListener('DOMContentLoaded', function() {
    // =============== GAME SETUP ===============
    
    // Get the canvas element and its context for drawing
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Game state variables
    let score = 0;
    let lives = 3;
    let gameRunning = false;
    let gamePaused = false;
    let gameTimer = 0; // Add a timer to track game progress
    
    // Game elements
    let player; // Will store our player ship
    let aliens = []; // Will store all aliens
    let bullets = []; // Will store all bullets
    
    // Game buttons
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resetButton = document.getElementById('resetButton');
    
    // Score and lives display elements
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');
    
    // =============== PLAYER SHIP ===============
    
    // Player ship class - represents the player's spaceship
    class Player {
        constructor() {
            // Position the player at the bottom center of the canvas
            this.width = 50;
            this.height = 30;
            this.x = (canvas.width / 2) - (this.width / 2);
            this.y = canvas.height - this.height - 20;
            this.speed = 5; // How fast the player moves
            this.color = '#00ff00'; // Bright green color
        }
        
        // Draw the player ship on the canvas
        draw() {
            ctx.fillStyle = this.color;
            
            // Draw a triangle for the ship shape
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y); // Top center point
            ctx.lineTo(this.x, this.y + this.height); // Bottom left
            ctx.lineTo(this.x + this.width, this.y + this.height); // Bottom right
            ctx.closePath();
            ctx.fill();
        }
        
        // Move the player left or right
        move(direction) {
            // Move left if there's room
            if (direction === 'left' && this.x > 0) {
                this.x -= this.speed;
            }
            // Move right if there's room
            if (direction === 'right' && this.x + this.width < canvas.width) {
                this.x += this.speed;
            }
        }
        
        // Create a new bullet when player shoots
        shoot() {
            // Create bullet at the top center of the player ship
            const bullet = new Bullet(
                this.x + this.width / 2,
                this.y,
                -8 // Negative speed means the bullet moves upward
            );
            bullets.push(bullet); // Add to bullets array
        }
    }
    
    // =============== ALIEN ENEMIES ===============
    
    // Alien class - represents each alien invader
    class Alien {
        constructor(x, y) {
            this.width = 40;
            this.height = 30;
            this.x = x;
            this.y = y;
            this.color = '#ff00ff'; // Purple color
            this.direction = 1; // 1 for right, -1 for left
            this.speed = 0.5; // Reduced from 1 to 0.5 to make game more playable
        }
        
        // Draw the alien on the canvas
        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Draw eyes (to make it look more like an alien)
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + 10, this.y + 10, 5, 5); // Left eye
            ctx.fillRect(this.x + this.width - 15, this.y + 10, 5, 5); // Right eye
        }
        
        // Move the alien (will be called in the game loop)
        move() {
            this.x += this.speed * this.direction;
        }
        
        // Make alien drop down and change direction
        dropAndReverse() {
            this.y += 15; // Reduced from 20 to 15 to make the drop more gradual
            this.direction *= -1; // Reverse direction
        }
        
        // Sometimes aliens will shoot
        shoot() {
            // Only allow shooting after 5 seconds of gameplay
            if (gameTimer < 300) return; // 60 frames per second * 5 seconds = 300 frames
            
            // Random chance to shoot (reduced from 0.003 to make it easier)
            // And gradually increase difficulty based on game progress
            let shootingChance = 0.0005 + (gameTimer / 6000) * 0.001; // Gradually increases over time
            
            // Cap the maximum shooting chance
            if (shootingChance > 0.002) shootingChance = 0.002;
            
            if (Math.random() < shootingChance && gameRunning && !gamePaused) {
                const bullet = new Bullet(
                    this.x + this.width / 2,
                    this.y + this.height,
                    5 // Positive speed means bullet moves downward
                );
                bullets.push(bullet);
            }
        }
    }
    
    // =============== BULLETS ===============
    
    // Bullet class - for both player and alien bullets
    class Bullet {
        constructor(x, y, speed) {
            this.width = 3;
            this.height = 15;
            this.x = x - this.width / 2; // Center the bullet
            this.y = y;
            this.speed = speed; // Negative = up, Positive = down
            this.color = speed < 0 ? '#00ffff' : '#ff0000'; // Player: cyan, Alien: red
        }
        
        // Draw the bullet
        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Move the bullet (called each frame)
        move() {
            this.y += this.speed;
        }
        
        // Check if bullet is off screen
        isOffScreen() {
            return this.y < 0 || this.y > canvas.height;
        }
    }
    
    // =============== COLLISION DETECTION ===============
    
    // Check if two objects overlap (collision detection)
    function isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    // =============== GAME FUNCTIONS ===============
    
    // Initialize the game
    function initGame() {
        // Create the player
        player = new Player();
        
        // Reset score and lives
        score = 0;
        lives = 3;
        gameTimer = 0; // Reset game timer
        updateScoreAndLives();
        
        // Clear existing aliens and bullets
        aliens = [];
        bullets = [];
        
        // Create the alien formation (5 rows, 8 columns)
        // Starting further left to give more horizontal movement space
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 8; col++) {
                const x = 80 + col * 60; // Adjusted position
                const y = 50 + row * 40; // Reduced vertical spacing
                aliens.push(new Alien(x, y));
            }
        }
    }
    
    // Update score and lives display
    function updateScoreAndLives() {
        scoreDisplay.textContent = score;
        livesDisplay.textContent = lives;
    }
    
    // Game loop - updates and draws everything
    function gameLoop() {
        // Clear the canvas for new frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Only process game logic if game is running and not paused
        if (gameRunning && !gamePaused) {
            // Increment game timer
            gameTimer++;
            
            // Check if all aliens are destroyed (win condition)
            if (aliens.length === 0) {
                gameWon();
                return;
            }
            
            // Move and draw player
            player.draw();
            
            // First move all aliens, then check for edge collision
            aliens.forEach(alien => {
                alien.move();
            });
            
            // Now check if any alien is at the edge
            let alienHitEdge = false;
            const padding = 10; // Add padding to prevent aliens from going off-screen
            
            for (let i = 0; i < aliens.length; i++) {
                const alien = aliens[i];
                if (alien.x <= padding || alien.x + alien.width >= canvas.width - padding) {
                    alienHitEdge = true;
                    break;
                }
            }
            
            // If any alien hit edge, make all aliens drop and reverse
            if (alienHitEdge) {
                aliens.forEach(alien => alien.dropAndReverse());
            }
            
            // Draw aliens and allow them to shoot
            aliens.forEach(alien => {
                alien.draw();
                alien.shoot();
            });
            
            // Check if aliens reached the bottom (lose condition)
            for (let i = 0; i < aliens.length; i++) {
                if (aliens[i].y + aliens[i].height >= player.y) {
                    gameOver();
                    return;
                }
            }
            
            // Process all bullets
            for (let i = bullets.length - 1; i >= 0; i--) {
                bullets[i].move();
                bullets[i].draw();
                
                // Remove bullets that go off screen
                if (bullets[i].isOffScreen()) {
                    bullets.splice(i, 1);
                    continue;
                }
                
                // Check if player bullet hits any alien
                if (bullets[i].speed < 0) {  // Player bullets go up
                    for (let j = aliens.length - 1; j >= 0; j--) {
                        if (isColliding(bullets[i], aliens[j])) {
                            // Increase score when alien is hit
                            score += 10;
                            updateScoreAndLives();
                            
                            // Remove the bullet and alien
                            bullets.splice(i, 1);
                            aliens.splice(j, 1);
                            break;
                        }
                    }
                } 
                // Check if alien bullet hits player
                else if (bullets[i].speed > 0) {  // Alien bullets go down
                    if (isColliding(bullets[i], player)) {
                        lives--;
                        updateScoreAndLives();
                        
                        // Remove the bullet
                        bullets.splice(i, 1);
                        
                        // Check if player lost all lives
                        if (lives <= 0) {
                            gameOver();
                            return;
                        }
                    }
                }
            }
        } else {
            // If game is paused or not running, still draw everything
            player.draw();
            aliens.forEach(alien => alien.draw());
            bullets.forEach(bullet => bullet.draw());
            
            // Show paused message if needed
            if (gamePaused) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#00ff00';
                ctx.font = '30px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('GAME PAUSED', canvas.width / 2, canvas.height / 2);
            }
        }
        
        // Continue the game loop
        requestAnimationFrame(gameLoop);
    }
    
    // Game over function
    function gameOver() {
        gameRunning = false;
        
        // Draw game over screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ff0000';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText('Press START to play again', canvas.width / 2, canvas.height / 2 + 50);
    }
    
    // Game won function
    function gameWon() {
        gameRunning = false;
        
        // Draw victory screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('YOU WON!', canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText('Press START for a new game', canvas.width / 2, canvas.height / 2 + 50);
    }
    
    // =============== EVENT LISTENERS ===============
    
    // Keyboard controls
    document.addEventListener('keydown', function(event) {
        if (!gameRunning || gamePaused) return;
        
        // Left arrow key
        if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
            player.move('left');
        }
        // Right arrow key
        else if (event.key === 'ArrowRight' || event.key === 'd' || event.key ==='D') {
            player.move('right');
        }
        // Space bar (shoot)
        else if (event.key === ' ' || event.key === 'Spacebar') {
            player.shoot();
            event.preventDefault(); // Prevent space from scrolling the page
        }
    });
    // Mouse controls
    let mouseX = 0;
    canvas.addEventListener('mousemove', function(event) {
        if (!gameRunning || gamePaused) return;
    
        // Get mouse position relative to canvas
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
    
        // Move player to mouse position (keeping player within canvas bounds)
        if (mouseX > 0 && mouseX < canvas.width) {
            // Center the player on the mouse position
            player.x = mouseX - (player.width / 2);
        
            // Keep player within bounds
            if (player.x < 0) player.x = 0;
            if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
        }
    });

    // Mouse click to shoot
    canvas.addEventListener('click', function(event) {
        if (!gameRunning || gamePaused) return;
        player.shoot();
    });

    // Additional option: right-click prevention (optional)
    canvas.addEventListener('contextmenu', function(event) {
        if (gameRunning) {
            event.preventDefault(); // Prevent context menu from appearing during gameplay
        }
    });
    
    // Button click handlers
    startButton.addEventListener('click', function() {
        if (!gameRunning) {
            initGame();
            gameRunning = true;
            gamePaused = false;
        } else if (gamePaused) {
            gamePaused = false;
        }
    });
    
    pauseButton.addEventListener('click', function() {
        if (gameRunning) {
            gamePaused = !gamePaused;
        }
    });
    
    resetButton.addEventListener('click', function() {
        initGame();
        gameRunning = false;
        gamePaused = false;
    });
    
    // Initialize the game and start the game loop
    initGame();
    gameLoop();
});
