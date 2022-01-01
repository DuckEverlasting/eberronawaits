///////////////////////// Canvas/DOM settings /////////////////////////

const canvas1 = document.querySelector("#canvas-1");

const c1 = canvas1.getContext("2d");

const canvasWrapper = document.querySelector(".canvas-wrapper")

const images = [
    new Image(),
    new Image(),
    new Image(),
    new Image(),
    new Image(),
]
images[0].src = "./assets/0mines.png"
images[1].src = "./assets/1mine.png"
images[2].src = "./assets/2mines.png"
images[3].src = "./assets/3mines.png"
images[4].src = "./assets/4mines.png"

blankImage = new Image();
blankImage.src = "./assets/greenstone.png"

mineImage = new Image();
mineImage.src = "./assets/mine.png"

///////////////////////// Application state /////////////////////////
const mineCount = 20;
const boardSize = 12;
const unit = 40;

canvas1.width = unit * boardSize;
canvas1.height = unit * boardSize;

let gameStarted = false;
let winCondition = false;
let score = 0;
let board = []

function initialize() {
  gameStarted = false;
  winCondition = false;
  document.querySelector(".bottom").style.backgroundColor = "transparent";
  score = 0;
  board = [];
  mineNums = getMines();
  for (let i = 0; i < boardSize; i++) {
    const row = [];
    for (let j = 0; j < boardSize; j++) {
      if (mineNums.includes(i * boardSize + j)) {
        row[j] = new Mine(i, j);
      } else {
        row[j] = new Tile(i, j);
      }
    }
    board[i] = row;
  }
  reset = false;
  board.forEach(row => {
      row.forEach(tile => {
          if (tile.isMine) {
              return;
          }
          const res = tile.initCount();
          if (!res) {
            reset = true;
          }
      })
  })
  if (reset) {
      initialize();
  } else {
    drawBoard();
  }
}

function drawBoard(revealOverride = false) {
  board.forEach(row => {
      row.forEach(tile => tile.draw(revealOverride))
  })
}

function getMines() {
    function shuffle(array) {
        var i = array.length,
            j = 0,
            temp;
    
        while (i--) {
            j = Math.floor(Math.random() * (i+1));
            // swap randomly chosen element with current element
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    
        return array;
    }
    const integers = [];
    for (let i = 0; i < boardSize * boardSize; i++) {
        integers.push(i);
    }
    
    var ranNums = shuffle(integers);
    return ranNums.slice(0, mineCount);
}

///////////////////////// Logic /////////////////////////

///// Initialize /////

function start() {
  initialize();
  gameStarted = true;
}

///////////////////////// Component definitions /////////////////////////

///// Base Class and Methods /////

class Tile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.atTop = y == 0;
    this.atBottom = y == boardSize - 1;
    this.atLeft = x == 0;
    this.atRight = x == boardSize - 1;
    this.isMine = false;
    this.isRevealed = false;
    this.count = null;
    this.image = null;
  }

  initCount() {
    this.count = this.getSurrounding().filter(t => t.isMine).length;
    this.image = images[this.count];
    return this.count < 5;
  }

  reveal() {
    this.isRevealed = true;
    score++;
    if (this.count == 0) {
        const queue = [];
        function chain(tile) {
            tile.getSurrounding().forEach(tile => {
                if (tile.isRevealed) {
                    return;
                }
                tile.isRevealed = true;
                score++;
                if (tile.count == 0) {
                    queue.push(tile);
                }
            })    
        }
        chain(this);
        while (queue.length) {
            const next = queue.shift();
            chain(next);
        }
    }
  }

  draw(revealOverride = false) {
    if (this.isRevealed || revealOverride) {
        c1.drawImage(this.image, this.x * unit, this.y * unit, unit, unit);
    } else {
        c1.drawImage(blankImage, this.x * unit, this.y * unit, unit, unit);
    }
  }

  getSurrounding() {
    const results = []
    if (!this.atTop) {
        results.push(board[this.x][this.y - 1])
        if (!this.atLeft) {
            results.push(board[this.x - 1][this.y - 1])
        }
        if (!this.atRight) {
            results.push(board[this.x + 1][this.y - 1])
        }
    }
    if (!this.atBottom) {
        results.push(board[this.x][this.y + 1])
        if (!this.atLeft) {
            results.push(board[this.x - 1][this.y + 1])
        }
        if (!this.atRight) {
            results.push(board[this.x + 1][this.y + 1])
        }
    }
    if (!this.atLeft) {
        results.push(board[this.x - 1][this.y])
    }
    if (!this.atRight) {
        results.push(board[this.x + 1][this.y])
    }
    return results
  }
}

///// Subtype Definitions /////

class Mine extends Tile {
  constructor(x, y) {
    super(x, y);
    this.isMine = true;
    this.count = 5;
    this.image = mineImage;
  }

  reveal() {
      triggerGameOver();
  }
}

function triggerGameOver() {
    gameStarted = false;
    document.querySelector(".bottom").style.backgroundColor = winCondition ? "rgb(185, 67, 67)" : "rgb(180,180,60)";
}

canvas1.addEventListener("click", mouseHandler);

function mouseHandler(ev) {
    if (ev.button != 0 || gameStarted == false) {
        return;
    }
    const x = Math.floor(ev.offsetX / unit)
    const y = Math.floor(ev.offsetY / unit)
    board[x][y].reveal();
    console.log("SCORE: " + score)
    if ((boardSize * boardSize - mineCount) <= score) {
        winCondition = true;
        triggerGameOver();
    }
    drawBoard(!gameStarted);
}

window.addEventListener("load", () => start());