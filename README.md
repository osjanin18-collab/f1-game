# F-1 Race - Web Game

A faithful recreation of the classic 1984 racing game F-1 Race developed by HAL Laboratory for the Nintendo Family Computer (Famicom), now playable in your web browser.

## Overview

F-1 Race is a top-down racing game that brings the excitement of Formula 1 racing to life with a simple yet engaging gameplay experience. Compete on tracks inspired by world capitals and battle against AI opponents.

## Features

- 🏎️ **Three Difficulty Levels** - Easy, Normal, and Hard
- 🏁 **15 Unique Tracks** - 5 tracks per difficulty level
- 🤖 **AI Opponents** - Challenge 3 computer-controlled racers
- ⚙️ **Two-Speed Transmission** - Switch between LOW (fast acceleration) and HI (high speed)
- 💥 **Collision Physics** - Realistic crash mechanics and track interactions
- 🎮 **Intuitive Controls** - Easy-to-learn keyboard controls
- 📊 **Real-time Statistics** - Position, speed, time, and gear display

## How to Play

### Objective
- Complete each track within the time limit
- Finish in the top 3 positions to advance to the next track
- Complete all 5 tracks in a difficulty level to win

### Controls

| Action | Key |
|--------|-----|
| Steer Left | ← or A |
| Steer Right | → or D |
| Move Forward | ↑ or W |
| Move Backward | ↓ or S |
| Accelerate | A or Z |
| Brake | S or X |
| Toggle Gear | G |

### Gears

- **LOW**: Lower speed but faster acceleration - ideal for starting and sharp turns
- **HI**: Higher speed but slower acceleration - better for straightaways

## Game Mechanics

### Two-Speed Manual Transmission
Switch between gears to adapt to different track conditions. Use LOW gear for better control on tight curves and HI gear for speed on open straightaways.

### Collision System
- Hitting walls or opponents causes a brief crash
- You lose speed but recover quickly
- Time penalty is minimal - recovery and positioning are key

### Time Management
- Each track has a time limit
- You must complete the track before time runs out
- Finishing position determines advancement (must place 1st, 2nd, or 3rd)

### Difficulty Levels

1. **Easy** - Generous time limits, wider tracks, slower AI
2. **Normal** - Balanced gameplay with moderate challenges
3. **Hard** - Tight time limits, narrow tracks, aggressive AI

## Game States

- **Main Menu** - Start game, view instructions, or learn about the game
- **Difficulty Selection** - Choose your challenge level
- **Racing** - Main gameplay
- **Game Over** - View results and retry or return to menu

## Technical Details

### Architecture
- Pure JavaScript (no external libraries)
- HTML5 Canvas for graphics
- CSS3 for styling and animations
- LocalStorage for future save functionality

### Classes

- **Game** - Main game controller and state manager
- **Track** - Track layout and collision detection
- **Player** - Player-controlled car with input handling
- **Opponent** - AI-controlled opponent vehicles

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Original Game Information

- **Developer**: HAL Laboratory
- **Publisher**: Nintendo
- **Original Platform**: Family Computer (Famicom)
- **Release Date**: November 2, 1984 (Japan)
- **Genre**: Racing

## Gameplay Tips

1. **Master Gear Switching** - Learn when to use LOW and HI gear for optimal performance
2. **Smooth Turns** - Avoid sharp turns at high speed to prevent crashes
3. **Plan Your Route** - Know the track layout in advance
4. **Manage Time** - Don't waste time recovering from crashes
5. **Study AI** - Learn opponent patterns to anticipate their moves

## Future Enhancements

- [ ] Multiplayer support (local and online)
- [ ] Additional track themes
- [ ] Power-ups and special items
- [ ] Leaderboard system
- [ ] Sound effects and music
- [ ] Different car models
- [ ] Track editor

## License

This is a fan-made recreation inspired by the original F-1 Race game. Created for educational and entertainment purposes.

---

**Start your engines and race to victory!** 🏁