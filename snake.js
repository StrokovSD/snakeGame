let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let width = canvas.width;
let height = canvas.height;

let blockSize = 10;
let widthInBlocks = width / blockSize;
let heightInBlocks = height / blockSize;

let score = 0;
let intervalId;
let game = true;
let time = 100;

let directions = {
    37: "left",
    38: "up",
    39: "right",
    40: "down"
};

function drawBorder () {
    ctx.fillStyle = "Gray";
    ctx.fillRect(0, 0, width, blockSize);
    ctx.fillRect(0, height - blockSize, width, blockSize);
    ctx.fillRect(0, 0, blockSize, height);
    ctx.fillRect(width - blockSize, 0, blockSize, height);
};

function drawScore () {
    ctx.font = "20px Courier";
    ctx.fillStyle = "Black";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + score, blockSize, blockSize);
};

function gameOver () {
    time = 1300;
    clearTimeout(intervalId);
    setTimeout(pause, 1300);
    document.getElementById('main').innerHTML = 'restart';
    ctx.font = "60px Courier";
    ctx.fillStyle = "Black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Конец игры", width / 2, height / 2);
};

function circle(x, y, radius, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    if (fillCircle) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
};

class Block {
    constructor(col, row){
        this.col = col;
        this.row = row;
    };

    drawSquare (color) {
        let x = this.col * blockSize;
        let y = this.row * blockSize;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, blockSize, blockSize);
    };

    drawCircle (color) {
        let centerX = this.col * blockSize + blockSize / 2;
        let centerY = this.row * blockSize + blockSize / 2;
        ctx.fillStyle = color;
        circle(centerX, centerY, blockSize / 2, true);
    };
};

class Snake {
    constructor(){
        this.segments = [
            new Block(7, 5),
            new Block(6, 5),
            new Block(5, 5)
        ];
        this.direction = "right";
        this.nextDirection = "right";
    };

    draw() {
      let x = true;
      this.segments[0].drawSquare("#2b312a");
        for (let i = 1; i < this.segments.length; i++) {
            if (x){
              this.segments[i].drawSquare("#007948");
              x = false;
            }
            else{
              this.segments[i].drawSquare("#806501");
              x = true;
            }
        }
    };

    move() {
        let head = this.segments[0];
        let newHead;
        this.direction = this.nextDirection;
        if (this.direction === "right") {
              if(head.col === widthInBlocks-1){
                  newHead = new Block(1, head.row );
              }
              else newHead = new Block(head.col + 1, head.row);
        } else if (this.direction === "down") {
              if(head.row === heightInBlocks - 1){
                  newHead = new Block(head.col, 1)
              }
              else newHead = new Block(head.col, head.row + 1);
        } else if (this.direction === "left") {
              if( head.col === 1){
                  newHead = new Block(widthInBlocks - 1, head.row)
              }
              else newHead = new Block(head.col - 1, head.row);
        } else if (this.direction === "up") {
              if(head.row === 1){
                newHead = new Block(head.col, heightInBlocks - 1)
              }
              else newHead = new Block(head.col, head.row - 1);
        }
        if (this.checkCollision(newHead)) {
            gameOver();
            game = false;
            return;
        }
        this.segments.unshift(newHead);
        if (newHead.col === apple.position.col && newHead.row === apple.position.row) {
            score=score+1;
            apple.move();
        } else {
            this.segments.pop();
        }
    };

    checkCollision(head) {
        let leftCollision = (head.col === 0);
        let topCollision = (head.row === 0);
        let rightCollision = (head.col === widthInBlocks - 1);
        let bottomCollision = (head.row === heightInBlocks - 1);
        let wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;
        let selfCollision = false;
        for (let i = 0; i < this.segments.length; i++) {
            if (head.col === this.segments[i].col && head.row === this.segments[i].row) {
                selfCollision = true;
            }
        }
        if(wall.checked){
            return wallCollision || selfCollision;
        }
        else return selfCollision;
    };

    setDirection(newDirection) {
        if (this.direction === "up" && newDirection === "down") {
            time = 250;
            return;
        } else if (this.direction === "right" && newDirection === "left") {
            time = 250;
            return;
        } else if (this.direction === "down" && newDirection === "up") {
            time = 250;
            return;
        } else if (this.direction === "left" && newDirection === "right") {
            time = 250;
            return;
        }
        this.nextDirection = newDirection;
        time = 50;
    };
};

$("body").keydown(function (event) {
    let newDirection = directions[event.keyCode];
    if (newDirection !== undefined) {
        snake.setDirection(newDirection);
    }
});

$("body").keyup(function(event){
    time = 100;
})

class Apple {
    constructor(){
        this.position = new Block(25, 25);
    };

    draw () {
        this.position.drawCircle("#f33f3f");
    };

    move() {
        let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
        let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
        for (let i = 0; i < snake.segments.length; i++){
            if(snake.segments[i].col === randomCol && snake.segments[i].row === randomRow){
               this.move();
            }
            else this.position = new Block(randomCol, randomRow);
        }
    };
};

let snake = new Snake();
let apple = new Apple();

drawScore();
drawBorder();

function go() {
    ctx.clearRect(0, 0, width, height);
    drawScore();
    snake.move();
    snake.draw();
    apple.draw();
    drawBorder();
};

function play(){
    document.getElementById('menu').style.display='none';
    document.getElementById('main').innerHTML = 'resume';
    if(game){
        intervalId = setTimeout(function tick() {
            go();
            intervalId = setTimeout(tick, time);
        }, time);
    }
    else{
        snake = new Snake();
        apple = new Apple();
        game = true;
        time = 100;
        play();
    }
};

function pause(){
    document.getElementById('menu').style.display='';
    clearTimeout(intervalId);
}
