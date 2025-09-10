var c = document.getElementById("gameCanvas");
var ctx = c.getContext("2d");

var mouseX = -1;
var mouseY = -1;
var mouseCoordinateX;
var mouseCoordinateY;
var prevMouseX = mouseX;
var prevMouseY = mouseY;
document.addEventListener("mousemove", function(event) {
    mouseX = (event.clientX - c.getBoundingClientRect().left);
    mouseY = (event.clientY - c.getBoundingClientRect().top);

    if (mouseDown && mouseButton == 2) {
        cameraX -= (mouseX - prevMouseX) / tileSize;
        cameraY -= (mouseY - prevMouseY) / tileSize;
    }

    mouseCoordinateX = Math.floor(((mouseX - ((c.clientWidth / 2) - (tileSize / 2))) / tileSize) + cameraX);
    mouseCoordinateY = Math.floor(((mouseY - ((c.clientHeight / 2) - (tileSize / 2))) / tileSize) + cameraY);

    prevMouseX = mouseX;
    prevMouseY = mouseY;
});

document.addEventListener("keydown", function(event) {
    if (event.key == "ArrowUp") {
        winCount++;
    } else if (event.key == "ArrowDown") {
        winCount--;
        if (winCount < 1) winCount = 1;
    }
    event.preventDefault();
});

document.addEventListener("wheel", function(event) {
    tileSize -= (event.deltaY / 100) * 4;
    event.preventDefault();
});

var waitUntilNextClick = false;

var mouseDown = false;
var mouseButton = -1;
document.addEventListener("mousedown", function(event) {
    if (!waitUntilNextClick) {
        mouseDown = true;
        mouseButton = event.button;
    }
});
document.addEventListener("mouseup", function(event) {
    mouseDown = false;
    waitUntilNextClick = false;
});

document.addEventListener('contextmenu', event => event.preventDefault());

const TILESTATE = {
    EMPTY: 0,
    NOUGHT: 1,
    CROSS: 2
}

var turn = TILESTATE.NOUGHT;
var placingTile = false;

var tileSize = 64;

var winSet = [];
var winWaterProgress = 0;

class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.state = TILESTATE.EMPTY;

        this.brightness = 1;
    }

    render() {
        // tile
        ctx.beginPath();
        if ((this.state == TILESTATE.EMPTY && !placingTile && (turn != TILESTATE.EMPTY)) && mouseX > ((this.x - cameraX) * tileSize) + ((c.clientWidth / 2) - (tileSize / 2)) && mouseX < ((this.x - cameraX) * tileSize) + ((c.clientWidth / 2) - (tileSize / 2)) + tileSize && mouseY > ((this.y - cameraY) * tileSize) + ((c.clientHeight / 2) - (tileSize / 2)) && mouseY < ((this.y - cameraY) * tileSize) + ((c.clientHeight / 2) - (tileSize / 2)) + tileSize) {
            this.brightness += ((0.7 - this.brightness) / 50) * deltaTime;
            if (mouseDown && mouseButton == 0 && turn != TILESTATE.EMPTY) {
                this.state = turn;
                if (checkWin(this.x, this.y)) {
                    turn = TILESTATE.EMPTY;
                } else {
                    placingTile = true;
                }
            }
        } else {
            this.brightness += ((1 - this.brightness) / 50) * deltaTime;
        }
        ctx.fillStyle = `rgba(0, ${170 * this.brightness}, 0, 1)`;
        ctx.roundRect(((this.x - cameraX) * tileSize) + ((c.clientWidth / 2) - (tileSize / 2)), ((this.y - cameraY) * tileSize) + ((c.clientHeight / 2) - (tileSize / 2)), tileSize, tileSize, (tileSize / 4));
        ctx.fill();

        // state
        if (this.state == TILESTATE.NOUGHT) {
            ctx.beginPath();
            ctx.strokeStyle = "#00ff00ff";
            ctx.lineWidth = (tileSize / 16);
            ctx.arc(((this.x - cameraX) * tileSize) + (c.clientWidth / 2), ((this.y - cameraY) * tileSize) + (c.clientHeight / 2), (tileSize / 3), 0, 2*Math.PI);
            ctx.stroke();
        } else if (this.state == TILESTATE.CROSS) {
            ctx.beginPath();
            ctx.strokeStyle = "#00ff00ff";
            ctx.lineWidth = (tileSize / 16);
            ctx.moveTo(((this.x - cameraX) * tileSize) + ((c.clientWidth / 2) - (tileSize / 3)), ((this.y - cameraY) * tileSize) + ((c.clientHeight / 2) - (tileSize / 3)));
            ctx.lineTo(((this.x - cameraX) * tileSize) + ((c.clientWidth / 2) + (tileSize / 3)), ((this.y - cameraY) * tileSize) + ((c.clientHeight / 2) + (tileSize / 3)))
            ctx.moveTo(((this.x - cameraX) * tileSize) + ((c.clientWidth / 2) - (tileSize / 3)), ((this.y - cameraY) * tileSize) + ((c.clientHeight / 2) + (tileSize / 3)));
            ctx.lineTo(((this.x - cameraX) * tileSize) + ((c.clientWidth / 2) + (tileSize / 3)), ((this.y - cameraY) * tileSize) + ((c.clientHeight / 2) - (tileSize / 3)))
            ctx.stroke();
        }
    }
}

var cameraX = 0;
var cameraY = 0;

var tileList = [new Tile(-1, -1), new Tile(0, -1), new Tile(1, -1), new Tile(-1, 0), new Tile(0, 0), new Tile(1, 0), new Tile(-1, 1), new Tile(0, 1), new Tile(1, 1)];

var winCount = 4;
function checkWin(placedX, placedY) {
    var check = true;
    winSet = [];
    for (var i = -(winCount - 1); i <= 0; i++) {
        winSet = [];
        // horizontal
        check = true;
        for (var j = 0; j < winCount; j++) {
            winSet.push([placedX + i + j, placedY]);
            if (getTileState(placedX + i + j, placedY) != turn) {
                check = false;
            }
        }
        if (check) return true;
        winSet = [];

        // vertical
        check = true;
        for (var j = 0; j < winCount; j++) {
            winSet.push([placedX, placedY + i + j]);
            if (getTileState(placedX, placedY + i + j) != turn) {
                check = false;
            }
        }
        if (check) return true;
        winSet = [];

        // diagonal top left to bottom right
        check = true;
        for (var j = 0; j < winCount; j++) {
            winSet.push([placedX + i + j, placedY + i + j]);
            if (getTileState(placedX + i + j, placedY + i + j) != turn) {
                check = false;
            }
        }
        if (check) return true;
        winSet = [];

        // diagonal bottom left to top right
        check = true;
        for (var j = 0; j < winCount; j++) {
            winSet.push([placedX + i + j, placedY - i - j]);
            if (getTileState(placedX + i + j, placedY - i - j) != turn) {
                check = false;
            }
        }
        if (check) return true;
    }
    winSet = [];
    return false;
}

function getTileState(x, y) {
    for (var i = 0; i < tileList.length; i++) {
        if (tileList[i].x == x && tileList[i].y == y) {
            return tileList[i].state;
        }
    }
    return -1;
}

function isAdjacentToTile(x, y) {
    // check not is tile
    for (var i = 0; i < tileList.length; i++) {
        if (tileList[i].x == x && tileList[i].y == y) {
            return false;
        }
    }
    // check adjacent
    for (var i = 0; i < tileList.length; i++) {
        if (tileList[i].x == x) {
            if (Math.abs(tileList[i].y - y) == 1) {
                return true;
            }
        }
        if (tileList[i].y == y) {
            if (Math.abs(tileList[i].x - x) == 1) {
                return true;
            }
        }
    }
    return false;
}

function main() {
    // background
    ctx.beginPath();
    ctx.fillStyle = `rgba(${1 * winWaterProgress}, ${1 * winWaterProgress + 34 * (1-winWaterProgress)}, ${48 * winWaterProgress}, 1)`;
    ctx.fillRect(0, 0, 512, 512);

    // render tiles
    for (var i = 0; i < tileList.length; i++) {
        tileList[i].render();
    }

    // place tile
    if (placingTile) {
        if (isAdjacentToTile(mouseCoordinateX, mouseCoordinateY)) {
            ctx.beginPath();
            ctx.fillStyle = "#000000ff";
            ctx.roundRect(((mouseCoordinateX - cameraX) * tileSize) + ((c.clientWidth / 2) - (tileSize / 2)), ((mouseCoordinateY - cameraY) * tileSize) + ((c.clientHeight / 2) - (tileSize / 2)), tileSize, tileSize, (tileSize / 4));
            ctx.fill();

            if (mouseDown && mouseButton == 0) {
                tileList.push(new Tile(mouseCoordinateX, mouseCoordinateY));
                placingTile = false;
                turn%=2;turn++;
                waitUntilNextClick = true;
                mouseDown = false;
            }
        }
    }

    // render win water
    if (winSet.length > 0) {
        winWaterProgress += ((1 - winWaterProgress) / 500) * deltaTime;

        ctx.beginPath();
        ctx.strokeStyle = "#0000ffff";
        ctx.lineWidth = (tileSize / 8);

        ctx.moveTo(((winSet[0][0] - cameraX) * tileSize) + (c.clientWidth / 2), ((winSet[0][1] - cameraY) * tileSize) + (c.clientHeight / 2));
        ctx.lineTo((((winSet[winCount - 1][0] * winWaterProgress + winSet[0][0] * (1 - winWaterProgress)) - cameraX) * tileSize) + (c.clientWidth / 2), (((winSet[winCount - 1][1] * winWaterProgress + winSet[0][1] * (1 - winWaterProgress)) - cameraY) * tileSize) + (c.clientHeight / 2));

        ctx.moveTo(((winSet[winCount - 1][0] - cameraX) * tileSize) + (c.clientWidth / 2), ((winSet[winCount - 1][1] - cameraY) * tileSize) + (c.clientHeight / 2));
        ctx.lineTo((((winSet[winCount - 1][0] * (1 - winWaterProgress) + winSet[0][0] * winWaterProgress) - cameraX) * tileSize) + (c.clientWidth / 2), (((winSet[winCount - 1][1] * (1 - winWaterProgress) + winSet[0][1] * winWaterProgress) - cameraY) * tileSize) + (c.clientHeight / 2));

        ctx.stroke();
    }

    // render coordinates
    ctx.beginPath();
    ctx.fillStyle = "#ffffffff";
    ctx.font = "20px Comic Sans MS";
    ctx.fillText(`Position: ${Math.round(cameraX)}, ${Math.round(-cameraY)}`, 5, 20);
    ctx.fillText(`Turn: ${(turn == TILESTATE.NOUGHT) ? "O" : "X"}`, 5, 40);
    ctx.fillText(`Win Count: ${winCount}`, 5, 60);
}

var deltaTime = 1;
var prevTime = Date.now();
function loop() {
    deltaTime = Date.now() - prevTime;
    prevTime = Date.now();

    main();

    window.requestAnimationFrame(loop);
}
function init() {
    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(init);