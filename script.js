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
