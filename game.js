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
        this.gearPressed = false; // Track gear key separately
        this.setupEventListeners();
        
        this.lastFrameTime = 0;
        this.requestAnimationFrameId = null;
    }
    
    setupTracks() {
        // Define 5 tracks per difficulty level
        this.tracks = {
            1: [
                { name: 'Tokyo', timeLimit: 60, difficulty: 0.8, width: 100 },
                { name: 'Paris', timeLimit: 65, difficulty: 0.85, width: 100 },
                { name: 'London', timeLimit: 70, difficulty: 0.9, width: 100 },
                { name: 'New York', timeLimit: 75, difficulty: 0.95, width: 100 },
                { name: 'Sydney', timeLimit: 80, difficulty: 1.0, width: 100 }
            ],
            2: [
                { name: 'Tokyo', timeLimit: 50, difficulty: 1.2, width: 80 },
                { name: 'Paris', timeLimit: 55, difficulty: 1.3, width: 80 },
                { name: 'London', timeLimit: 60, difficulty: 1.4, width: 80 },
                { name: 'New York', timeLimit: 65, difficulty: 1.5, width: 80 },
                { name: 'Sydney', timeLimit: 70, difficulty: 1.6, width: 80 }
            ],
            3: [
                { name: 'Tokyo', timeLimit: 40, difficulty: 1.6, width: 60 },
                { name: 'Paris', timeLimit: 45, difficulty: 1.7, width: 60 },
                { name: 'London', timeLimit: 50, difficulty: 1.8, width: 60 },
                { name: 'New York', timeLimit: 55, difficulty: 1.9, width: 60 },
                { name: 'Sydney', timeLimit: 60, difficulty: 2.0, width: 60 }
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
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            // Handle gear key with proper detection
            if (key === 'g' && !this.gearPressed) {
                this.gearPressed = true;
                if (this.player) {
                    this.player.toggleGear();
                }
            }
            if (e.key === ' ') e.preventDefault();
        });
        
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = false;
            
            if (key === 'g') {
                this.gearPressed = false;
            }
        });
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
        this.gearPressed = false;
        
        const trackData = this.tracks[this.difficulty][this.currentTrack - 1];
        this.track = new Track(trackData, this.width, this.height);
        this.timeLeft = trackData.timeLimit;
        
        // Create player
        this.player = new Player(
            this.width / 2,
            this.height - 150,
            trackData
        );
        
        // Create opponents with better starting positions
        this.opponents = [];
        const opponentStarts = [
            { x: this.width / 2 - 40, y: this.height - 150 },
            { x: this.width / 2 + 40, y: this.height - 150 },
            { x: this.width / 2, y: this.height - 100 }
        ];
        
        for (let i = 0; i < 3; i++) {
            const opp = new Opponent(
                opponentStarts[i].x,
                opponentStarts[i].y,
                trackData,
                i + 1
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
        const deltaTime = Math.min((now - this.lastFrameTime) / 1000, 0.016);
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
        
        // Update opponents
        this.opponents.forEach(opp => {
            opp.update(deltaTime, this.track, this.player);
        });
        
        // Calculate positions
        this.calculatePositions();
        
        // Check if player finished
        if (!this.finished && this.player.distanceTraveled >= this.track.trackLength && this.player.y < this.height - 80) {
            this.finishRace();
        }
        
        // Update UI
        this.updateUI();
    }
    
    calculatePositions() {
        const allCars = [this.player, ...this.opponents];
        allCars.sort((a, b) => b.distanceTraveled - a.distanceTraveled);
        
        this.finishPosition = allCars.indexOf(this.player) + 1;
    }
    
    updatePlayerInput() {
        const keys = this.keys;
        
        // Steering
        if (keys['arrowleft'] || keys['a']) this.player.turnLeft();
        if (keys['arrowright'] || keys['d']) this.player.turnRight();
        
        // Throttle and Brake
        if (keys['arrowup'] || keys['w'] || keys['z']) this.player.throttle();
        if (keys['arrowdown'] || keys['s'] || keys['x']) this.player.brake();
    }
    
    finishRace() {
        this.finished = true;
        setTimeout(() => this.endRace(), 1500);
    }
    
    endRace() {
        this.gameRunning = false;
        
        if (this.finishPosition <= 3 && this.timeLeft > 0) {
            // Advance to next track
            if (this.currentTrack < 5) {
                this.currentTrack++;
                setTimeout(() => this.startTrack(), 1500);
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
            title.textContent = this.timeLimitReached ? 'TIME UP!' : this.finishPosition > 3 ? 'TOO SLOW!' : 'RACE OVER';
        }
        
        document.getElementById('finalPosition').textContent = this.finishPosition;
        document.getElementById('finalTime').textContent = this.formatTime(this.elapsedTime);
        document.getElementById('finalTrack').textContent = this.currentTrack;
    }
    
    updateUI() {
        document.getElementById('position').textContent = `${this.finishPosition}/${this.opponents.length + 1}`;
        document.getElementById('timer').textContent = this.formatTime(this.timeLeft);
        document.getElementById('speed').textContent = Math.round(this.player.speed * 3.6); // km/h
        document.getElementById('gear').textContent = this.player.gear === 'LOW' ? 'LOW' : 'HI';
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    draw() {
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw track
        this.track.draw(this.ctx, this.player);
        
        // Draw game objects
        this.player.draw(this.ctx);
        this.opponents.forEach(opp => opp.draw(this.ctx));
        
        // Draw finish line indicator
        this.drawFinishLine();
    }
    
    drawFinishLine() {
        const finishY = -100;
        const screenY = finishY - this.player.y + this.height / 2;
        
        if (screenY > 0 && screenY < this.height) {
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 4;
            this.ctx.setLineDash([10, 10]);
            this.ctx.beginPath();
            this.ctx.moveTo(0, screenY);
            this.ctx.lineTo(this.width, screenY);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }
}

class Track {
    constructor(trackData, canvasWidth, canvasHeight) {
        this.trackData = trackData;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.trackLength = 3000; // Total track distance
        this.trackWidth = trackData.width;
        this.generateTrack();
    }
    
    generateTrack() {
        // Generate track waypoints
        this.waypoints = [];
        const numWaypoints = Math.floor(this.trackLength / 150);
        
        for (let i = 0; i < numWaypoints; i++) {
            const t = i / numWaypoints;
            const wave = Math.sin(t * Math.PI * 3) * 60;
            
            this.waypoints.push({
                x: this.canvasWidth / 2 + wave,
                y: -i * 150,
                width: this.trackWidth
            });
        }
        
        // Add finish line
        this.waypoints.push({
            x: this.canvasWidth / 2,
            y: -this.trackLength,
            width: this.trackWidth
        });
    }
    
    isPositionValid(x, y) {
        // Find closest waypoint
        let closestWaypoint = this.waypoints[0];
        let closestDist = Infinity;
        
        for (let wp of this.waypoints) {
            const dist = Math.abs(y - wp.y);
            if (dist < closestDist) {
                closestDist = dist;
                closestWaypoint = wp;
            }
        }
        
        // Check if within track bounds
        const distFromCenter = Math.abs(x - closestWaypoint.x);
        return distFromCenter < closestWaypoint.width / 2;
    }
    
    getTrackCenterX(y) {
        // Find closest waypoint
        let closest = this.waypoints[0];
        let closestDist = Infinity;
        
        for (let wp of this.waypoints) {
            const dist = Math.abs(y - wp.y);
            if (dist < closestDist) {
                closestDist = dist;
                closest = wp;
            }
        }
        
        return closest.x;
    }
    
    draw(ctx, player) {
        // Draw track
        ctx.fillStyle = '#2a2a2a';
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 3;
        
        const screenCenterY = ctx.canvas.height / 2;
        
        for (let i = 0; i < this.waypoints.length - 1; i++) {
            const wp1 = this.waypoints[i];
            const wp2 = this.waypoints[i + 1];
            
            const screenY1 = wp1.y - player.y + screenCenterY;
            const screenY2 = wp2.y - player.y + screenCenterY;
            
            if (screenY1 > -150 && screenY1 < ctx.canvas.height + 150) {
                // Draw track area
                ctx.fillStyle = '#2a2a2a';
                ctx.fillRect(
                    wp1.x - wp1.width / 2,
                    screenY1,
                    wp1.width,
                    Math.abs(screenY2 - screenY1) + 20
                );
                
                // Draw track borders
                ctx.strokeStyle = '#ff6b6b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(wp1.x - wp1.width / 2, screenY1);
                ctx.lineTo(wp1.x - wp1.width / 2, screenY2);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(wp1.x + wp1.width / 2, screenY1);
                ctx.lineTo(wp1.x + wp1.width / 2, screenY2);
                ctx.stroke();
                
                // Draw center line
                ctx.strokeStyle = '#555';
                ctx.setLineDash([20, 20]);
                ctx.beginPath();
                ctx.moveTo(wp1.x, screenY1);
                ctx.lineTo(wp1.x, screenY2);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }
    }
}

class Player {
    constructor(x, y, trackData) {
        this.x = x;
        this.y = y;
        this.trackData = trackData;
        this.width = 16;
        this.height = 24;
        this.speed = 0; // m/s
        this.angle = 0; // radians (0 = up)
        
        // Speed limits
        this.maxSpeedLow = 20; // m/s
        this.maxSpeedHi = 35; // m/s - increased for better racing
        this.maxSpeed = this.maxSpeedLow;
        this.acceleration = 15; // m/s^2 - increased
        this.brakeAccel = 25; // m/s^2
        
        this.gear = 'LOW';
        this.distanceTraveled = 0;
        
        this.crashed = false;
        this.crashTimer = 0;
        this.lastValidX = x;
        this.lastValidY = y;
    }
    
    turnLeft() {
        if (this.speed > 1) {
            const turnRate = (Math.min(Math.abs(this.speed), this.maxSpeed) / this.maxSpeed) * 0.08;
            this.angle -= turnRate;
        }
    }
    
    turnRight() {
        if (this.speed > 1) {
            const turnRate = (Math.min(Math.abs(this.speed), this.maxSpeed) / this.maxSpeed) * 0.08;
            this.angle += turnRate;
        }
    }
    
    throttle() {
        if (!this.crashed) {
            this.speed = Math.min(this.maxSpeed, this.speed + this.acceleration * 0.016);
        }
    }
    
    brake() {
        this.speed = Math.max(0, this.speed - this.brakeAccel * 0.016);
    }
    
    toggleGear() {
        if (this.gear === 'LOW') {
            this.gear = 'HI';
            this.maxSpeed = this.maxSpeedHi;
        } else {
            this.gear = 'LOW';
            this.maxSpeed = this.maxSpeedLow;
        }
    }
    
    crash() {
        if (!this.crashed) {
            this.crashed = true;
            this.crashTimer = 0.3;
            this.speed *= 0.5;
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
        this.speed *= 0.97;
        
        // Update position
        const newX = this.x + Math.sin(this.angle) * this.speed * deltaTime;
        const newY = this.y - Math.cos(this.angle) * this.speed * deltaTime;
        
        // Check track bounds
        if (track.isPositionValid(newX, newY)) {
            this.x = newX;
            this.y = newY;
            this.lastValidX = this.x;
            this.lastValidY = this.y;
        } else {
            // Keep position, bounce back
            this.x = this.lastValidX;
            this.y = this.lastValidY;
            this.crash();
        }
        
        // Update distance traveled (progress up the track)
        this.distanceTraveled = -this.y;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw car body
        ctx.fillStyle = this.crashed ? '#ff4444' : '#00ff00';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Draw windshield
        ctx.fillStyle = '#00aaff';
        ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height / 3);
        
        // Draw headlights
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(-this.width / 2 + 3, -this.height / 2 - 1, 2, 2);
        ctx.fillRect(this.width / 2 - 5, -this.height / 2 - 1, 2, 2);
        
        ctx.restore();
    }
}

class Opponent extends Player {
    constructor(x, y, trackData, id) {
        super(x, y, trackData);
        this.id = id;
        this.aiTimer = 0;
        this.aiDecisionTimer = 0;
        this.colors = ['#ff4444', '#ffff00', '#00ffff'];
        this.color = this.colors[id - 1];
        
        // Boost opponent speeds
        this.maxSpeedLow = 22; // Faster than player LOW
        this.maxSpeedHi = 40; // Significantly faster than player HI
        this.maxSpeed = this.maxSpeedLow;
        this.acceleration = 18; // Faster acceleration
    }
    
    update(deltaTime, track, player) {
        // AI decision making every 0.25 seconds
        this.aiDecisionTimer -= deltaTime;
        
        if (this.aiDecisionTimer <= 0) {
            this.aiDecisionTimer = 0.25;
            
            // Always accelerate aggressively
            this.throttle();
            
            // Smart steering to stay on track
            const trackCenterX = track.getTrackCenterX(this.y);
            const distFromCenter = this.x - trackCenterX;
            
            if (Math.abs(distFromCenter) > track.trackData.width / 2.5) {
                // Strong correction
                if (distFromCenter > 0) {
                    this.turnLeft();
                    this.turnLeft();
                } else {
                    this.turnRight();
                    this.turnRight();
                }
            } else if (Math.abs(distFromCenter) > track.trackData.width / 3) {
                // Gentle correction
                if (distFromCenter > 0) {
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
        ctx.rotate(this.angle);
        
        // Draw car body
        ctx.fillStyle = this.crashed ? '#ff4444' : this.color;
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
