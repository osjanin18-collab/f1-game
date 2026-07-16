// F-1 Race Game - Web Implementation

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.difficulty = 1;
        this.currentTrack = 1;
        this.gameState = 'menu'; // menu, difficulty, game, gameOver
        this.gameRunning = false;
        this.timeLimitReached = false;
        
        this.setupTracks();
        this.player = null;
        this.opponents = [];
        this.track = null;
        this.timeLeft = 0;
        this.gameTime = 0;
        this.elapsedTime = 0;
        this.finished = false;
        this.finishPosition = 0;
        
        this.keys = {};
        this.setupEventListeners();
        this.setupGameScreenEventListeners();
        
        this.lastFrameTime = 0;
        this.requestAnimationFrameId = null;
    }
    
    setupTracks() {
        // Define 5 tracks per difficulty level
        this.tracks = {
            1: [
                { name: 'Tokyo', timeLimit: 120, difficulty: 0.8, width: 100 },
                { name: 'Paris', timeLimit: 130, difficulty: 0.85, width: 110 },
                { name: 'London', timeLimit: 125, difficulty: 0.9, width: 105 },
                { name: 'New York', timeLimit: 140, difficulty: 0.95, width: 115 },
                { name: 'Sydney', timeLimit: 150, difficulty: 1.0, width: 120 }
            ],
            2: [
                { name: 'Tokyo', timeLimit: 100, difficulty: 1.2, width: 90 },
                { name: 'Paris', timeLimit: 110, difficulty: 1.3, width: 95 },
                { name: 'London', timeLimit: 105, difficulty: 1.4, width: 100 },
                { name: 'New York', timeLimit: 120, difficulty: 1.5, width: 105 },
                { name: 'Sydney', timeLimit: 130, difficulty: 1.6, width: 110 }
            ],
            3: [
                { name: 'Tokyo', timeLimit: 80, difficulty: 1.6, width: 80 },
                { name: 'Paris', timeLimit: 90, difficulty: 1.7, width: 85 },
                { name: 'London', timeLimit: 85, difficulty: 1.8, width: 90 },
                { name: 'New York', timeLimit: 100, difficulty: 1.9, width: 95 },
                { name: 'Sydney', timeLimit: 110, difficulty: 2.0, width: 100 }
            ]
        };
    }
    
    setupEventListeners() {
        // Menu buttons
        document.getElementById('startBtn').addEventListener('click', () => this.showDifficulty());
        document.getElementById('instructionsBtn').addEventListener('click', () => this.showInstructions());
        document.getElementById('aboutBtn').addEventListener('click', () => this.showAbout());
        
        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.difficulty = parseInt(e.currentTarget.dataset.difficulty);
                this.startGame();
            });
        });
        
        document.getElementById('backBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('backFromInstructionsBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('backFromAboutBtn').addEventListener('click', () => this.showMenu());
        
        // Game over buttons
        document.getElementById('retryBtn').addEventListener('click', () => this.resetTrack());
        document.getElementById('menuBtn').addEventListener('click', () => {
            this.stopGame();
            this.showMenu();
        });
        
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') e.preventDefault();
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    setupGameScreenEventListeners() {
        // Game screen is setup in the main HTML
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }
    
    showMenu() {
        this.showScreen('menuScreen');
        this.gameState = 'menu';
    }
    
    showDifficulty() {
        this.showScreen('difficultyScreen');
        this.gameState = 'difficulty';
    }
    
    showInstructions() {
        this.showScreen('instructionsScreen');
    }
    
    showAbout() {
        this.showScreen('aboutScreen');
    }
    
    startGame() {
        this.currentTrack = 1;
        this.startTrack();
    }
    
    startTrack() {
        this.showScreen('gameScreen');
        this.gameState = 'game';
        this.gameRunning = true;
        this.finished = false;
        this.finishPosition = 0;
        this.timeLimitReached = false;
        this.elapsedTime = 0;
        
        const trackData = this.tracks[this.difficulty][this.currentTrack - 1];
        this.track = new Track(trackData, this.width, this.height);
        this.timeLeft = trackData.timeLimit;
        
        // Create player
        this.player = new Player(
            this.width / 2 - 20,
            this.height - 100,
            trackData.difficulty
        );
        
        // Create opponents
        this.opponents = [];
        const opponentStarts = [
            { x: this.width / 2 + 20, y: this.height - 100 },
            { x: this.width / 2 - 60, y: this.height - 100 },
            { x: this.width / 2 + 60, y: this.height - 100 }
        ];
        
        for (let i = 0; i < 3; i++) {
            const opp = new Opponent(
                opponentStarts[i].x,
                opponentStarts[i].y,
                trackData.difficulty * (0.8 + i * 0.1)
            );
            this.opponents.push(opp);
        }
        
        this.lastFrameTime = Date.now();
        this.gameLoop();
    }
    
    resetTrack() {
        this.stopGame();
        this.startTrack();
    }
    
    stopGame() {
        this.gameRunning = false;
        if (this.requestAnimationFrameId) {
            cancelAnimationFrame(this.requestAnimationFrameId);
        }
    }
    
    gameLoop() {
        const now = Date.now();
        const deltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
        
        if (!this.gameRunning) return;
        
        // Update
        this.update(deltaTime);
        
        // Draw
        this.draw();
        
        this.requestAnimationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        if (!this.finished) {
            this.elapsedTime += deltaTime;
            this.timeLeft = Math.max(0, this.track.trackData.timeLimit - this.elapsedTime);
            
            if (this.timeLeft === 0 && !this.timeLimitReached) {
                this.timeLimitReached = true;
                this.endRace();
                return;
            }
        }
        
        // Update player
        this.updatePlayerInput();
        this.player.update(deltaTime, this.track);
        
        // Check collisions
        this.checkPlayerCollisions();
        
        // Update opponents
        this.opponents.forEach(opp => {
            opp.update(deltaTime, this.track);
            this.checkOpponentCollisions(opp);
        });
        
        // Check if player finished
        if (!this.finished && this.player.progress >= 1 && this.player.y > this.height - 50) {
            this.finishRace();
        }
        
        // Update UI
        this.updateUI();
    }
    
    updatePlayerInput() {
        const keys = this.keys;
        
        if (keys['arrowup'] || keys['w']) this.player.moveForward();
        if (keys['arrowdown'] || keys['s']) this.player.moveBackward();
        if (keys['arrowleft'] || keys['a']) this.player.turnLeft();
        if (keys['arrowright'] || keys['d']) this.player.turnRight();
        
        // Throttle
        if (keys['a'] || keys['z']) this.player.throttle();
        // Brake
        if (keys['s'] || keys['x']) this.player.brake();
        
        // Gear change
        if (keys['g'] && !this.lastGKey) {
            this.player.toggleGear();
        }
        this.lastGKey = keys['g'];
    }
    
    checkPlayerCollisions() {
        const pos = this.player.getGridPosition();
        
        // Check track bounds
        if (!this.track.isPositionValid(pos.gridX, pos.gridY)) {
            this.player.crash();
        }
        
        // Check opponent collisions
        this.opponents.forEach(opp => {
            const oppPos = opp.getGridPosition();
            if (Math.abs(pos.gridX - oppPos.gridX) < 2 && Math.abs(pos.gridY - oppPos.gridY) < 2) {
                this.player.crash();
            }
        });
    }
    
    checkOpponentCollisions(opp) {
        const oppPos = opp.getGridPosition();
        
        if (!this.track.isPositionValid(oppPos.gridX, oppPos.gridY)) {
            opp.crash();
        }
    }
    
    finishRace() {
        this.finished = true;
        
        // Calculate position
        const positions = [this.player, ...this.opponents].sort((a, b) => {
            const diff = b.progress - a.progress;
            if (diff !== 0) return diff;
            return b.y - a.y;
        });
        
        this.finishPosition = positions.indexOf(this.player) + 1;
        
        setTimeout(() => this.endRace(), 2000);
    }
    
    endRace() {
        this.gameRunning = false;
        
        if (this.finishPosition <= 3 && this.timeLeft > 0) {
            // Advance to next track
            if (this.currentTrack < 5) {
                this.currentTrack++;
                setTimeout(() => this.startTrack(), 1000);
            } else {
                // Game complete
                this.showGameOver(true);
            }
        } else {
            // Game Over
            this.showGameOver(false);
        }
    }
    
    showGameOver(success) {
        this.showScreen('gameOverScreen');
        this.gameState = 'gameOver';
        
        const title = document.getElementById('gameOverTitle');
        if (success) {
            title.textContent = 'CONGRATULATIONS!';
        } else {
            title.textContent = this.timeLimitReached ? 'TIME UP!' : 'RACE OVER';
        }
        
        document.getElementById('finalPosition').textContent = this.finishPosition;
        document.getElementById('finalTime').textContent = this.formatTime(this.elapsedTime);
        document.getElementById('finalTrack').textContent = this.currentTrack;
    }
    
    updateUI() {
        document.getElementById('position').textContent = `${this.finishPosition}/${this.opponents.length + 1}`;
        document.getElementById('timer').textContent = this.formatTime(this.timeLeft);
        document.getElementById('speed').textContent = Math.round(this.player.speed * 10);
        document.getElementById('gear').textContent = this.player.gear === 'LOW' ? 'LOW' : 'HI';
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    draw() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw track
        this.track.draw(this.ctx, this.player);
        
        // Draw game objects
        this.player.draw(this.ctx);
        this.opponents.forEach(opp => opp.draw(this.ctx));
    }
}

class Track {
    constructor(trackData, canvasWidth, canvasHeight) {
        this.trackData = trackData;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.gridSize = 20;
        this.generateTrack();
    }
    
    generateTrack() {
        // Generate a simple track layout
        this.trackGrid = [];
        const rows = Math.ceil(this.canvasHeight / this.gridSize) + 2;
        const cols = Math.ceil(this.canvasWidth / this.gridSize);
        
        for (let y = 0; y < rows; y++) {
            this.trackGrid[y] = [];
            for (let x = 0; x < cols; x++) {
                // Create track with some variation
                let isTrack = false;
                
                // Main track down the middle
                const centerX = cols / 2;
                if (Math.abs(x - centerX) < this.trackData.width / this.gridSize / 2) {
                    isTrack = true;
                }
                
                // Add some curves
                const waveAmount = Math.sin(y * 0.1) * 2;
                if (Math.abs(x - centerX - waveAmount) < this.trackData.width / this.gridSize / 2) {
                    isTrack = true;
                }
                
                this.trackGrid[y][x] = isTrack ? 'track' : 'wall';
            }
        }
    }
    
    isPositionValid(gridX, gridY) {
        if (gridY < 0 || gridY >= this.trackGrid.length || gridX < 0 || gridX >= this.trackGrid[0].length) {
            return false;
        }
        return this.trackGrid[gridY][gridX] === 'track';
    }
    
    draw(ctx, player) {
        const scrollY = Math.max(0, player.y - this.canvasHeight / 2);
        
        for (let y = 0; y < this.trackGrid.length; y++) {
            for (let x = 0; x < this.trackGrid[y].length; x++) {
                const screenY = y * this.gridSize - scrollY;
                const screenX = x * this.gridSize;
                
                if (screenY > -this.gridSize && screenY < this.canvasHeight) {
                    if (this.trackGrid[y][x] === 'track') {
                        ctx.fillStyle = '#333';
                        ctx.fillRect(screenX, screenY, this.gridSize, this.gridSize);
                        
                        // Draw track markings
                        if (y % 3 === 0) {
                            ctx.fillStyle = '#555';
                            ctx.fillRect(screenX, screenY, this.gridSize, 2);
                        }
                    } else {
                        ctx.fillStyle = '#1a1a1a';
                        ctx.fillRect(screenX, screenY, this.gridSize, this.gridSize);
                    }
                }
            }
        }
        
        // Draw track borders
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        for (let y = 0; y < this.trackGrid.length; y++) {
            for (let x = 0; x < this.trackGrid[y].length; x++) {
                const screenY = y * this.gridSize - scrollY;
                const screenX = x * this.gridSize;
                
                if (screenY > -this.gridSize && screenY < this.canvasHeight) {
                    if (this.trackGrid[y][x] === 'wall') {
                        // Check if adjacent to track
                        let isEdge = false;
                        if ((x > 0 && this.trackGrid[y][x-1] === 'track') ||
                            (x < this.trackGrid[y].length - 1 && this.trackGrid[y][x+1] === 'track') ||
                            (y > 0 && this.trackGrid[y-1][x] === 'track') ||
                            (y < this.trackGrid.length - 1 && this.trackGrid[y+1][x] === 'track')) {
                            isEdge = true;
                        }
                        
                        if (isEdge) {
                            ctx.strokeRect(screenX, screenY, this.gridSize, this.gridSize);
                        }
                    }
                }
            }
        }
    }
}

class Player {
    constructor(x, y, difficulty) {
        this.x = x;
        this.y = y;
        this.difficulty = difficulty;
        this.width = 20;
        this.height = 30;
        this.speed = 0;
        this.angle = -Math.PI / 2; // Facing up
        this.maxSpeed = 300;
        this.acceleration = 150;
        this.gear = 'LOW';
        this.gearMultiplier = 1;
        this.progress = 0;
        this.crashed = false;
        this.crashTimer = 0;
        this.gridSize = 20;
    }
    
    moveForward() {
        if (!this.crashed) {
            this.speed = Math.min(this.maxSpeed * this.gearMultiplier, this.speed + this.acceleration * 0.016);
        }
    }
    
    moveBackward() {
        this.speed = Math.max(-this.maxSpeed * 0.5, this.speed - this.acceleration * 0.5 * 0.016);
    }
    
    turnLeft() {
        if (this.speed !== 0) {
            const turnRate = (Math.abs(this.speed) / this.maxSpeed) * 0.1;
            this.angle -= turnRate;
        }
    }
    
    turnRight() {
        if (this.speed !== 0) {
            const turnRate = (Math.abs(this.speed) / this.maxSpeed) * 0.1;
            this.angle += turnRate;
        }
    }
    
    throttle() {
        this.moveForward();
    }
    
    brake() {
        this.speed = Math.max(0, this.speed - this.acceleration * 0.016);
    }
    
    toggleGear() {
        if (this.gear === 'LOW') {
            this.gear = 'HI';
            this.gearMultiplier = 1.5;
        } else {
            this.gear = 'LOW';
            this.gearMultiplier = 1;
        }
    }
    
    crash() {
        if (!this.crashed) {
            this.crashed = true;
            this.crashTimer = 1; // 1 second of invulnerability
            this.speed *= 0.3;
            
            // Slight position adjustment
            this.x += (Math.random() - 0.5) * 20;
            this.y += (Math.random() - 0.5) * 20;
        }
    }
    
    update(deltaTime, track) {
        // Update crash state
        if (this.crashed) {
            this.crashTimer -= deltaTime;
            if (this.crashTimer <= 0) {
                this.crashed = false;
            }
        }
        
        // Apply friction
        this.speed *= 0.98;
        
        // Update position
        this.x += Math.cos(this.angle) * this.speed * deltaTime;
        this.y += Math.sin(this.angle) * this.speed * deltaTime;
        
        // Update progress
        if (this.speed > 0) {
            this.progress = Math.min(1, this.progress + this.speed * deltaTime / 10000);
        }
        
        // Bounce off walls
        const pos = this.getGridPosition();
        if (!track.isPositionValid(pos.gridX, pos.gridY)) {
            this.x -= Math.cos(this.angle) * this.speed * deltaTime;
            this.y -= Math.sin(this.angle) * this.speed * deltaTime;
            this.speed *= 0.7;
        }
    }
    
    getGridPosition() {
        return {
            gridX: Math.floor(this.x / this.gridSize),
            gridY: Math.floor(this.y / this.gridSize)
        };
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI / 2);
        
        // Draw car body
        ctx.fillStyle = this.crashed ? '#ff4444' : '#00ff00';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Draw windshield
        ctx.fillStyle = '#00aaff';
        ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height / 3);
        
        ctx.restore();
    }
}

class Opponent extends Player {
    constructor(x, y, difficulty) {
        super(x, y, difficulty);
        this.aiTimer = 0;
        this.targetAngle = 0;
    }
    
    update(deltaTime, track) {
        // Simple AI
        this.aiTimer += deltaTime;
        
        // Decide action every 0.3 seconds
        if (this.aiTimer > 0.3) {
            this.aiTimer = 0;
            
            // Try to move forward
            if (Math.random() > 0.1) {
                this.moveForward();
            }
            
            // Random turning
            if (Math.random() > 0.5) {
                if (Math.random() > 0.5) {
                    this.turnLeft();
                } else {
                    this.turnRight();
                }
            }
        }
        
        // Call parent update
        super.update(deltaTime, track);
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI / 2);
        
        // Draw car body
        ctx.fillStyle = this.crashed ? '#ff4444' : '#ff0000';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Draw windshield
        ctx.fillStyle = '#00aaff';
        ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height / 3);
        
        ctx.restore();
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});