// testing
let ballSpeed = 2.0;
let paddleSpeed = 35;

// screen
let screenWidth = innerWidth;
let screenHeight = window.innerHeight - 200;

// board
let board;
let boardWidth = 500;
// let boardWidth = screenWidth - 100;

// let boardHeight = 750;
let boardHeight = boardWidth + (boardWidth / 2);
// let boardHeight = screenHeight

let context;

// global variables
let pixelsBtw = boardWidth * 0.02 ;
let pixelsLR = pixelsBtw / 2;

// stats
let xBoard = document.getElementById('xBoard');
let yBoard = document.getElementById('yBoard');

let xPos = document.getElementById('xPos');
let yPos = document.getElementById('yPos');

let player_width = document.getElementById('player-width');
let player_height = document.getElementById('player-height');

let block_width = document.getElementById('block-width');
let block_height = document.getElementById('block-height');
let pixels_btw = document.getElementById('pixels-btw');

let block_columns = document.getElementById('block-columns');
let block_rows = document.getElementById('block-rows');

let bx_speed = document.getElementById('bx-speed');
let by_speed = document.getElementById('by-speed');
let paddle_speed = document.getElementById('paddle-speed');

let block_calc = document.getElementById('block-calc');
let block_count = document.getElementById('block-count');

let minBallX = 10;
let maxBallX = boardWidth - minBallX;

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

let randomBall = parseInt(getRandomArbitrary(minBallX, maxBallX));

// player
// let playerWidth = 500; // 500 for testing, 80 normal
let playerWidth = boardWidth * 0.16; // 500 for testing, 80 normal

let playerHeight = 10;
let playerVelocityX = paddleSpeed;

let player = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX
}

// ball variables
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityY = ballSpeed; // 10 for testing, 2 normal
let ballVelocityX = (ballVelocityY + (ballVelocityY / 2)); // 15 for testing, 3 normal

// ball object
let ball = {
    x: randomBall,
    y: boardHeight / 2 - 200,
    width: ballWidth,
    height: ballHeight,
    velocityX: ballVelocityX,
    velocityY: ballVelocityY
}

// blocks
let blockArray = [];
let blockWidth = boardWidth / 10; // 500px boardWidth / 10 blockWidth = 50px
let blockHeight = blockWidth * 0.2; // 10px boardHeight / 20% blockWidth = 10px
let blockColumns = 8;

// starting level
let level = 1;
let blockRows = level + 2; // add more as game continues
let blockMaxRows = 25; // maximum rows
let blockCount = 0;
let blockX = pixelsBtw + pixelsLR; // padding 10 + 5 on each side
let blockY = 45;
let score = 0;
let gameOver = false;

// onload
window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); // used for drawing on the board

    // draw inital player
    drawPlayer();

    setupSpeedStats()

    updateSpeedStats();

    drawPlayer();
    requestAnimationFrame(update);
    document.addEventListener('keydown', movePlayer);

    // create blocks
    createBlocks();
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    drawPlayer();
    drawBall();

    // bounce ball off walls
    if (ball.y <= 0 + 30) {
        // if ball touches top of canvas
        ball.velocityY *= -1;
    } else if (ball.x <=0 || (ball.x + ball.width) >= boardWidth) {
        // if ball touches left of right of canvas
        ball.velocityX *= -1;
        // if ball touches bottom of canvas
    } else if (ball.y + ball.height >= board.height) {
        // game over
        context.font = "20px 'Wix Madefor Display', sans-serif";
        context.textAlign = 'center'
        context.fillText("Game Over: Press 'Space' to Restart", boardWidth /2, boardHeight /2);
        gameOver = true;
    }

    // update ball coordinates to Board
    xPos.innerHTML = parseInt(ball.x);
    yPos.innerHTML = parseInt(ball.y);
    
    // bounce ball off paddle
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1; // flip y direction up or down
    } else if (leftCollision(ball, player) || rightCollision(ball, player)) {
        ball.velocityX *= -1; // flip y direction up or down
    }

    // blocks
    let color_level = (level % 6);
    
    if (color_level == 1) {
        context.fillStyle = 'skyblue';
    } else if (color_level == 2) {
        context.fillStyle = '#e74c3c';
    } else if (color_level == 3) {
        context.fillStyle = '#e67e22';
    } else if (color_level == 4) {
        context.fillStyle = '#f1c40f';
    } else if (color_level == 5) {
        context.fillStyle = '#27ae60';
    }

    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break) {
            // checks for a collision
            if (topCollision(ball, block) || bottomCollision(ball, block)) {
                block.break = true;
                ball.velocityY *= -1; // flip y direction up or down
                blockCount -= 1;
                score += 100;
            } else if (topCollision(ball, block) || bottomCollision(ball, block)) {
                block.break = true;
                ball.velocityX *= -1; // flip x direction left or right
                blockCount -= 1;
                score += 100;
            }
            // draws block
            context.fillRect(block.x, block.y, block.width, block.height);
            block_count.innerHTML = parseInt(blockCount);
        }
    }

    // score
    context.font = "20px 'Wix Madefor Display', sans-serif";
    context.textAlign = "start";
    context.fillText('Score: ' + score, 10, 25);
    
    // level
    context.font = "20px 'Wix Madefor Display', sans-serif";
    context.textAlign = "end";
    context.fillText('Level: ' + level, boardWidth - 10, 25);
    
    // next level
    if (blockCount == 0) {
        score += 100 * blockRows * blockColumns; // bonus points
        level += 1; // level up
        
        blockRows = level + 2;
        blockRows = Math.min(blockRows, blockMaxRows);
        block_rows.innerHTML = blockRows;

        ballVelocityY += 0.2;
        ballVelocityX = (ballVelocityY + (ballVelocityY / 2));
        
        playerVelocityX += 2;

        checkColorLevel();
        updateSpeedStats();
        createBlocks();
    }
}

function drawPlayer() {
    // draw player
    context.fillStyle = 'lightgreen';
    context.fillRect(player.x, player.y, player.width, player.height);
}

function drawBall() {
    context.fillStyle = 'white';
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    // context.fillRect(ball.x, ball.y, ball.width, ball.height);
    context.beginPath();
    context.arc(ball.x, ball.y, 7.5, 0, Math.PI*2);
    context.fillStyle = 'FFF000';
    context.fill();
    context.closePath();
}

function setupSpeedStats() {
    player_width.innerHTML = player.width;
    player_height.innerHTML = player.height;
    
    block_width.innerHTML = blockWidth;
    block_height.innerHTML = blockHeight;
    pixels_btw.innerHTML = pixelsBtw;

    block_columns.innerHTML = blockColumns;
    block_rows.innerHTML = blockRows;

    let blockCalc = (blockWidth * blockColumns) + (blockColumns * pixelsBtw) + (pixelsBtw * 2);
    block_calc.innerHTML = parseInt(blockCalc);
}

function bounceBall() {
    // bounce ball off walls
    if (ball.y <= 0) {
        // if ball touches top of canvas
        ball.velocityY *= -1;
    } else if (ball.x <=0 || (ball.x + ball.width) >= boardWidth) {
        // if ball touches left of right of canvas
        ball.velocityX *= -1;
        // if ball touches bottom of canvas
    } else if (ball.y + ball.height >= board.height) {
        // game over
        context.font = "20px 'Wix Madefor Display', sans-serif";
        context.fillText("Game Over: Press 'Space' to Restart", 80, boardHeight /2);
        gameOver = true;
    }

    // update ball coordinates to Board
    xPos.innerHTML = parseInt(ball.x);
    yPos.innerHTML = parseInt(ball.y);
    
    // bounce ball off paddle
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1; // flip y direction up or down
    } else if (leftCollision(ball, player) || rightCollision(ball, player)) {
        ball.velocityX *= -1; // flip y direction up or down
    }
}

function toggleStats() {
    var stats = document.getElementById("stats");
    if (stats.style.display === "none") {
      stats.style.display = "grid";
      stats.style.color = '#3ce74c';
      statsBtn.innerHTML = `<i class="fa-solid fa-chart-line"></i>&nbsp;Hide`;
    } else {
        stats.style.display = "none";
        stats.style.color = 'whitesmoke';
        statsBtn.innerHTML = `<i class="fa-solid fa-chart-line"></i>&nbsp;Show`;
    }
  }

function checkColorLevel() {
    color_level = (level % 6);
    console.log(color_level);
    
    if (color_level == 1) {
        context.fillStyle = 'skyblue';
    } else if (color_level == 2) {
        context.fillStyle = '#e74c3c';
    } else if (color_level == 3) {
        context.fillStyle = '#e67e22';
    } else if (color_level == 4) {
        context.fillStyle = '#f1c40f';
    } else if (color_level == 5) {
        context.fillStyle = '#27ae60';
    }
}
function updateSpeedStats() {
    bx_speed.innerHTML = parseFloat(ballVelocityX).toFixed(1);
    by_speed.innerHTML = parseFloat(ballVelocityY).toFixed(1);
    paddle_speed.innerHTML = parseFloat(playerVelocityX).toFixed(1);
}

function outOfBounds(xPosition) {
    return (xPosition < 0 || xPosition + playerWidth > boardWidth )
}

function movePlayer(e) {
    if (gameOver) {
        if (e.code === 'Space') {
            resetGame();
        }
    }

    if (e.code == "ArrowLeft") {
        // player.x -= playerVelocityX;
        let nextPlayerX = player.x - player.velocityX;
        if (!outOfBounds(nextPlayerX)) {
            player.x = nextPlayerX;
        }
    }
    if (e.code == "ArrowRight") {
        // player.x += playerVelocityX;
        let nextPlayerX = player.x + player.velocityX;
        if (!outOfBounds(nextPlayerX)) {
            player.x = nextPlayerX;
        }
    }

}

function detectCollision(a, b) {
    return a.x < b.x + b.width && // a's top left corner doesn't reach b's top right corner
            a.x + a.width > b.x && // a's top right corner passes b's top left corner
            a.y < b.y + b.height && // a's top left corner doesn't reach b's bottom left corner
            a.y + a.height > b.y; // a's bottom left corner passes b's top left corner
}

function topCollision(ball, block) {
    // a is above b (ball is above block)
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
}

function bottomCollision(ball, block) {
    // a is below b (ball is below block)
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) {
    // a is left of b (ball is left of block)
    return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rightCollision(ball, block) {
    // a is right of b (ball is right of block)
    return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
}

function createBlocks() {
    blockArray = []; // clears block array

    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x: blockX + c * blockWidth + c*pixelsBtw, // px between cols
                y: blockY + r * blockHeight + r*pixelsBtw, // px between rows
                width: blockWidth,
                height: blockHeight,
                break: false
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
    block_count.innerHTML = parseInt(blockCount);
}

function resetGame() {
    gameOver = false;
    ballVelocityY = 2.0;
    ballVelocityX = (ballVelocityY + (ballVelocityY / 2));
    randomBall = parseInt(getRandomArbitrary(minBallX, maxBallX));

    player = {
        x: boardWidth / 2 - playerWidth / 2,
        y: boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX: playerVelocityX
    }
    ball = {
        x: randomBall,
        y: boardHeight / 2 - 200,
        width: ballWidth,
        height: ballHeight,
        velocityX: ballVelocityX,
        velocityY: ballVelocityY
    }
    blockArray = [];
    let blockRows = level + 2;
    score = 0;
    level = 1;
    playerVelocityX = paddleSpeed
    createBlocks();
}

xBoard.innerHTML = boardWidth;
yBoard.innerHTML = boardHeight;