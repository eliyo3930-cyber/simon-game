
const colors = ['green', 'red', 'yellow', 'blue'];

let gameSequence = [];
let playerSequence = [];
let level = 0;
let highScore = Number(localStorage.getItem('simonHighScore')) || 0;
let isComputerPlaying = false;
let gameStarted = false;

// DOM Elements
const pads = document.querySelectorAll('.pad');
const startBtn = document.getElementById('start-btn');
const levelDisplay = document.getElementById('level');
const highScoreDisplay = document.getElementById('high-score');
const statusText = document.getElementById('status-text');
const board = document.querySelector('.board');

highScoreDisplay.textContent = highScore;

// Audio Setup
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const frequencies = {
    green: 329.63,
    red: 261.63,
    yellow: 220.00,
    blue: 164.81
};

// Play color sound
function playTone(color, duration = 300) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(
        frequencies[color],
        audioCtx.currentTime
    );

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + duration / 1000
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration / 1000);
}

// Error sound
function playErrorSound() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.5
    );

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
}

// Activate pad
function activatePad(color) {
    const pad = document.querySelector(`.pad.${color}`);

    if (!pad) return;

    pad.classList.add('active');
    playTone(color);

    setTimeout(() => {
        pad.classList.remove('active');
    }, 300);
}

// Start game
async function startGame() {
    if (isComputerPlaying) return;

    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }

    gameSequence = [];
    playerSequence = [];
    level = 0;

    gameStarted = true;
    startBtn.disabled = true;
    startBtn.textContent = 'PLAYING';

    levelDisplay.textContent = level;
    statusText.textContent = 'Get Ready!';

    nextRound();
}

// Next round
function nextRound() {
    level++;
    playerSequence = [];

    levelDisplay.textContent = level;
    statusText.textContent = 'Watch...';

    isComputerPlaying = true;

    const randomColor =
        colors[Math.floor(Math.random() * colors.length)];

    gameSequence.push(randomColor);

    playSequence();
}

// Play computer sequence
async function playSequence() {
    for (const color of gameSequence) {
        if (!gameStarted) return;

        activatePad(color);

        await new Promise(resolve => setTimeout(resolve, 650));
    }

    isComputerPlaying = false;
    statusText.textContent = 'Your Turn!';
}

// Handle player clicks
function handlePadClick(e) {
    if (!gameStarted || isComputerPlaying) return;

    const clickedColor = e.currentTarget.dataset.color;

    activatePad(clickedColor);

    playerSequence.push(clickedColor);

    const currentStep = playerSequence.length - 1;

    if (playerSequence[currentStep] !== gameSequence[currentStep]) {
        gameOver();
        return;
    }

    if (playerSequence.length === gameSequence.length) {
        isComputerPlaying = true;
        statusText.textContent = 'Good Job!';

        setTimeout(() => {
            if (gameStarted) nextRound();
        }, 1000);
    }
}

// Game over
function gameOver() {
    gameStarted = false;
    isComputerPlaying = false;

    playErrorSound();

    board.classList.add('shake');

    statusText.textContent = 'Game Over!';

    startBtn.disabled = false;
    startBtn.textContent = 'RETRY';

    if (level > highScore) {
        highScore = level;

        localStorage.setItem('simonHighScore', highScore);

        highScoreDisplay.textContent = highScore;
    }

    setTimeout(() => {
        board.classList.remove('shake');
    }, 400);
}

// Event listeners
startBtn.addEventListener('click', startGame);

pads.forEach(pad => {
    pad.addEventListener('click', handlePadClick);
});
