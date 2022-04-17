///////////////////////// Canvas/DOM settings /////////////////////////

const canvas1 = document.querySelector("#canvas-1");
const timerElement = document.querySelector("#timer");

const c1 = canvas1.getContext("2d");

const canvasWrapper = document.querySelector(".canvas-wrapper");

///////////////////////// Application state /////////////////////////
const boardSize = 10;
const unit = 60;

const colors = [
    "red",
    "yellow",
    "blue",
    "green",
    "orange",
    "purple",
    "white",
    "brown",
];

const SUCCESS = "red";
const PARTIAL = "blue";

canvas1.width = unit * 5;
canvas1.height = unit * boardSize;

let gameStarted = false;
let winCondition = false;
let guessCount = 9;
let solution = [];
let board = [];
let rowScores = [];
let secondsPassed = 0;
let timer;
let blinker;
let timeElapsed = "";

function initialize() {
    gameStarted = false;
    winCondition = false;
    document.querySelector(".bottom").style.backgroundColor = "transparent";
    guessCount = 9;
    solution = getSolution();
    board = [];
    rowScores = [];
    for (let i = 0; i < boardSize; i++) {
        const row = [];
        for (let j = 0; j <= 3; j++) {
            row[j] = new Tile(j, i);
        }
        row[4] = new ScoreTile(4, i);
        board[i] = row;
    }
}

function drawBoard() {
    board.forEach((row) => {
        row.forEach((tile) => tile.draw());
    });
    for (let i = 1; i < boardSize; i++) {
        c1.strokeStyle = "black";
        c1.lineWidth = 4;
        c1.beginPath();
        c1.moveTo(0, i * unit);
        c1.lineTo(5 * unit, i * unit);
        c1.stroke();
    }
    c1.strokeRect(0, 0, unit * 5, unit * boardSize);
}

function getSolution() {
    const result = [
        Math.floor(Math.random() * 8),
        Math.floor(Math.random() * 8),
        Math.floor(Math.random() * 8),
        Math.floor(Math.random() * 8),
    ].map((x) => colors[x]);
    // console.log(result);
    return result;
}

///////////////////////// Logic /////////////////////////

///// Initialize /////

function start() {
    board[boardSize - 1].forEach((t) => {
        if (!t.isScoreTile) {
            t.addFill = true;
        }
    });
    drawBoard();
    stopBlink();
    if (!timer) {
        let savedTime
        if (!timeElapsed) {
            savedTime = window.localStorage.getItem('ancientLock') || 0;
        }
        startTimer(savedTime);
    }
    gameStarted = true;
}

///////////////////////// Component definitions /////////////////////////

///// Base Class and Methods /////

class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = "grey";
        this.colorCounter = -1;
        this.addFill = false;
    }

    initCount() {
        this.count = this.getSurrounding().filter((t) => t.isMine).length;
        this.image = images[this.count];
        return this.count < 5;
    }

    toggleColor() {
        this.colorCounter++;
        if (this.colorCounter >= colors.length) {
            this.colorCounter = 0;
        }
        this.color = colors[this.colorCounter];
    }

    draw() {
        c1.strokeStyle = "black";
        c1.lineWidth = 4;
        c1.fillStyle = "grey";
        c1.fillRect(this.x * unit, this.y * unit, unit, unit);
        if (this.addFill) {
            c1.fillStyle = this.color;
            c1.fillRect(
                this.x * unit + unit * 0.125,
                this.y * unit + unit * 0.125,
                unit * 0.75,
                unit * 0.75
            );
            c1.strokeRect(
                this.x * unit + unit * 0.125,
                this.y * unit + unit * 0.125,
                unit * 0.75,
                unit * 0.75
            );
        }
    }
}

class ScoreTile extends Tile {
    constructor(x, y) {
        super(x, y);
        this.isScoreTile = true;
    }

    toggleColor() {
        return;
    }

    draw() {
        c1.lineWidth = 4;
        c1.fillStyle = "grey";
        c1.fillRect(this.x * unit, this.y * unit, unit, unit);
        c1.strokeStyle = "black";
        c1.strokeRect(this.x * unit, this.y * unit, unit, unit);
        if (this.addFill) {
            if (
                rowScores[boardSize - (1 + this.y)] &&
                rowScores[boardSize - (1 + this.y)][0]
            ) {
                c1.fillStyle = rowScores[boardSize - (1 + this.y)][0];
                c1.fillRect(
                    this.x * unit + unit * 0.1,
                    this.y * unit + unit * 0.1,
                    unit * 0.3,
                    unit * 0.3
                );
            }
            c1.strokeRect(
                this.x * unit + unit * 0.1,
                this.y * unit + unit * 0.1,
                unit * 0.3,
                unit * 0.3
            );
            if (
                rowScores[boardSize - (1 + this.y)] &&
                rowScores[boardSize - (1 + this.y)][1]
            ) {
                c1.fillStyle = rowScores[boardSize - (1 + this.y)][1];
                c1.fillRect(
                    this.x * unit + unit * 0.6,
                    this.y * unit + unit * 0.1,
                    unit * 0.3,
                    unit * 0.3
                );
            }
            c1.strokeRect(
                this.x * unit + unit * 0.6,
                this.y * unit + unit * 0.1,
                unit * 0.3,
                unit * 0.3
            );
            if (
                rowScores[boardSize - (1 + this.y)] &&
                rowScores[boardSize - (1 + this.y)][2]
            ) {
                c1.fillStyle = rowScores[boardSize - (1 + this.y)][2];
                c1.fillRect(
                    this.x * unit + unit * 0.1,
                    this.y * unit + unit * 0.6,
                    unit * 0.3,
                    unit * 0.3
                );
            }
            c1.strokeRect(
                this.x * unit + unit * 0.1,
                this.y * unit + unit * 0.6,
                unit * 0.3,
                unit * 0.3
            );
            if (
                rowScores[boardSize - (1 + this.y)] &&
                rowScores[boardSize - (1 + this.y)][3]
            ) {
                c1.fillStyle = rowScores[boardSize - (1 + this.y)][3];
                c1.fillRect(
                    this.x * unit + unit * 0.6,
                    this.y * unit + unit * 0.6,
                    unit * 0.3,
                    unit * 0.3
                );
            }
            c1.strokeRect(
                this.x * unit + unit * 0.6,
                this.y * unit + unit * 0.6,
                unit * 0.3,
                unit * 0.3
            );
        }
    }
}

async function triggerGameOver() {
    gameStarted = false;
    await async function() {
        document.querySelector(".bottom").style.backgroundColor = winCondition
            ? "rgb(185, 67, 67)"
            : "rgb(180,180,60)";
    }();
    if (winCondition) {
        clearInterval(timer);
        timer = null;
        const name = prompt("Enter your name");
        const timeString = getTimeString(parseInt(localStorage.getItem('ancientLock')));
        const result = await pingWebhook(name, timeString);
        console.log(result);
        if (result.error) {
            console.error(result.error);
            alert(`Sorry, there was an error. Screenshot this for proof of your time:\n${name}: ${timeString}`)
        }
        localStorage.removeItem('ancientLock');
    } else {
        initialize();
        startBlink();
    }
}

canvas1.addEventListener("click", mouseHandler);

function mouseHandler(ev) {
    if (ev.button != 0 || gameStarted == false) {
        return;
    }
    const x = Math.floor(ev.offsetX / unit);
    const y = Math.floor(ev.offsetY / unit);
    if (guessCount == y) {
        board[y][x].toggleColor();
    }
    drawBoard();
}

function checkGuess(row) {
    let leftoversA = [];
    let leftoversB = [];
    let successCount = 0;
    let partialCount = 0;
    for (let i = 0; i <= 3; i++) {
        if (row[i].color == solution[i]) {
            successCount++;
        } else {
            leftoversA.push(row[i].color);
            leftoversB.push(solution[i]);
        }
    }
    leftoversA.forEach((color) => {
        if (leftoversB.includes(color)) {
            partialCount++;
            leftoversB.splice(leftoversB.indexOf(color), 1);
        }
    });
    const result = [];
    for (let i = 1; i <= successCount; i++) {
        result.push(SUCCESS);
    }
    for (let i = 1; i <= partialCount; i++) {
        result.push(PARTIAL);
    }
    while (result.length < 4) {
        result.push("grey");
    }
    return result;
}

function submitGuess() {
    if (!gameStarted && !winCondition) {
        return start();
    }
    if (board[guessCount].find((x) => !x.isScoreTile && x.color == "grey")) {
        return;
    }
    board[guessCount][4].addFill = true;
    const guess = checkGuess(board[guessCount]);
    if (guess.filter((x) => x != SUCCESS).length == 0) {
        winCondition = true;
    }
    rowScores.push(guess);
    guessCount--;
    if (winCondition || guessCount < 0) {
        triggerGameOver();
    } else {
        board[guessCount].forEach((t) => {
            if (!t.isScoreTile) {
                t.addFill = true;
            }
        });
    }
    drawBoard();
}

function startTimer(savedTime = 0) {
    const start = Date.now();
    if (timer) {
        clearInterval(timer);
    }
    timer = setInterval(() => {
        prevTime = timeElapsed;
        timeElapsed = getTimeString((Date.now() - start) + parseInt(savedTime));
        if (prevTime !== timeElapsed) {
            timerElement.innerHTML = timeElapsed;
            localStorage.setItem('ancientLock', (Date.now() - start) + parseInt(savedTime));
        }
    }, 100);
}

function getTimeString(ms) {
    return new Date(ms)
        .toISOString()
        .substring(11, 19);
}

async function pingWebhook(name, timeString) {
    const url = 'https://discordapp.com/api/webhooks/957582881016922192/SMmRtWNuNoRQt1mu5tBftchssvq_0aGP-2HQrBX0hWVYXAH42qH_ZbPq8SJno68mqYxJ'; // GENERAL
    // const url = 'https://discordapp.com/api/webhooks/958251593097183233/Gj-qXyzBmupxIq4bs2CgIRhg7u9n1Y8CoC-7i8IjLXMcLi14IQAT1YTu1fQ7UgbxNjje' // SECRET CHANNEL

    const data = JSON.stringify({
        username: "TIMER BOT",
        content: `${name}: ${timeString}`,
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: data
        });
        return response;
    } catch(e) {
        return { error: e };
    }
}

function startBlink() {
    if (blinker) {
        clearInterval(blinker);
        blinker = null;
    }
    let isBlue = false;
    blinker = setInterval(() => {
        const nextColor = isBlue ? 'cyan' : 'blanchedalmond';
        document.getElementById('submitButton').style.background = nextColor;
        isBlue = !isBlue;
    }, 1000);
}

function stopBlink() {
    clearInterval(blinker);
    blinker = null;
    document.getElementById('submitButton').style.background = 'blanchedalmond';
}

window.addEventListener("load", () => {
    initialize();
    drawBoard();
    startBlink();
    const savedTime = parseInt(window.localStorage.getItem('ancientLock')) || 0;
    timerElement.innerHTML = getTimeString(savedTime);
});
