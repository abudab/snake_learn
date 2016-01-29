var COLS = ROWS = 20;
var CUBE_SIZE = 40; //px
var EMPTY = 0, LADY = 1, FRUIT = 2;
var LEFT = 0, UP = 1, RIGHT = 2, DOWN = 3;
var KEY_LEFT = 37, KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN = 40, KEY_SPACE = 32;


var canvas, ctx, keystate, frames;

var game = {
    _on: false,
    _score : 0,

    isOn: function () {
        return this._on;
    },

    on: function (state) {
        this._on = state;
    },

    getScore: function(){
        return this._score;
    },

    scoreIncrement: function(){
      this._score++;
    },

    lost: function(){
        draw.redrawElements();
        messages.drawMessage("Game over! with a score: " + this.getScore() + ". Hit space to continue!");
        this.on(false);
        this._score=0;
    }
}

var grid = {
    width: null,
    height: null,
    _grid: null,
    _LADY_IMG: new Image(),
    _BEATEN_IMG: new Image(),
    _FRUIT_IMG: new Image(),

    init: function (defaultVal, cols, rows) {
        this._BEATEN_IMG.src = "img/beaten.gif";
        this._FRUIT_IMG.src = "img/fruit.gif";
        this._LADY_IMG.src = "img/lady.png";
        this.width = cols;
        this.height = rows;
        this._grid = [];

        for (var x = 0; x < cols; x++) {
            this._grid.push([]);
            for (var y = 0; y < rows; y++) {
                this._grid[x].push(defaultVal);
            }
        }
    },

    set: function (val, x, y) {
        this._grid[x][y] = val;
    },

    get: function (x, y) {
        return this._grid[x][y];
    },

    canMove: function (x, y) {
        if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
            var state = this.get(x, y);
            return state != LADY && state != FRUIT;
        }
        return false;
    }
};

var snake = {
    direction: null,
    last: null,
    _queue: null,

    init: function (direction, x, y) {
        this.direction = direction;
        this._queue = [];
        this.insert(x, y);
    },

    remove: function () {
        return this._queue.pop();
    },

    insert: function (x, y) {
        this._queue.unshift({x: x, y: y});
        this.last = this._queue[0];
    },

    isHead: function (x, y) {
        return this._queue[0].x === x && this._queue[0].y === y;
    }

};

var fruit = {
    _x: null, _y: null,

    generate: function () {
        var empty = [];
        for (var x = 0; x < grid.width; x++) {
            for (var y = 0; y < grid.height; y++) {
                if (grid.get(x, y) === EMPTY) {
                    empty.push({x: x, y: y});
                }
            }
        }
        var randpos = empty[Math.floor(Math.random() * empty.length)];
        this._x = randpos.x, this._y = randpos.y;
        grid.set(FRUIT, this._x, this._y);
    },

    runRandomly: function () {
        var dx = Math.floor(Math.random() * 3) - 1;
        var dy = Math.floor(Math.random() * 3) - 1;
        if (grid.canMove(this._x + dx, this._y + dy)) {
            grid.set(EMPTY, this._x, this._y);
            this._x = this._x + dx;
            this._y = this._y + dy;
            grid.set(FRUIT, this._x, this._y);
        }
    }
}


var messages = {
    init: function () {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#0095DD";
    },

    drawScore: function () {
        this.init();
        ctx.fillText("Score: " + game.getScore(), 8, 20);
    },

    drawMessage: function (msg) {
        this.init();
        ctx.fillText(msg, 8, 20);
    }

}

function init() {
    game.on(true);

    grid.init(EMPTY, COLS, ROWS);
    var sp = {x: Math.floor(COLS / 2), y: ROWS - 1};

    snake.init(UP, sp.x, sp.y);
    grid.set(LADY, sp.x, sp.y);

    fruit.generate();
    messages.init();
}

function loop() {
    if (game.isOn()) {
        update();
    }
    if (game.isOn()) {
        draw.redraw();
    } else if (keystate[KEY_SPACE]) {
        init();
    }
    window.requestAnimationFrame(loop, canvas);
}


function update() {
    frames++;

    if (keystate[KEY_LEFT] && snake.direction !== RIGHT) {
        snake.direction = LEFT;
    } else if (keystate[KEY_UP] && snake.direction !== DOWN) {
        snake.direction = UP;
    } else if (keystate[KEY_RIGHT] && snake.direction !== LEFT) {
        snake.direction = RIGHT;
    } else if (keystate[KEY_DOWN] && snake.direction !== UP) {
        snake.direction = DOWN;
    }

    if (frames % 10 === 0) {
        fruit.runRandomly();
    }

    if (frames % 5 === 0) {
        var nx = snake.last.x;
        var ny = snake.last.y;
        switch (snake.direction) {
            case LEFT:
                nx--;
                break;
            case RIGHT:
                nx++;
                break;
            case UP:
                ny--;
                break;
            case DOWN:
                ny++;
                break;

        }


        if (0 > nx || nx > grid.width - 1 || ny < 0 || ny > grid.height - 1) {
            return game.lost();
        }

        if (grid.get(nx, ny) === FRUIT) {
            game.scoreIncrement();
            var tail = {y: ny, x: nx};
            fruit.generate();
        } else if (grid.get(nx, ny) === LADY) {
            return game.lost();
        } else {
            var tail = snake.remove();
            grid.set(EMPTY, tail.x, tail.y);
            tail.x = nx;
            tail.y = ny;
        }

        grid.set(LADY, tail.x, tail.y);
        snake.insert(tail.x, tail.y);
    }
}

var draw = {
    redrawElements: function () {
        var tw = canvas.width / grid.width;
        var th = canvas.height / grid.width;

        for (var x = 0; x < grid.width; x++) {
            for (var y = 0; y < grid.height; y++) {
                ctx.fillStyle = "#FFFACD";
                ctx.fillRect(x * tw, y * th, tw, th);
                switch (grid.get(x, y)) {
                    case LADY:
                        if (snake.isHead(x, y)) {
                            ctx.drawImage(grid._LADY_IMG, x * tw, y * th);
                        } else {
                            ctx.drawImage(grid._BEATEN_IMG, x * tw, y * th);
                        }
                        break;
                    case FRUIT:
                        ctx.drawImage(grid._FRUIT_IMG, x * tw, y * th);
                        break;

                }
            }
        }
    },


    redraw: function () {
        this.redrawElements();
        messages.drawScore();
    }

}

function main() {
    function setCanvasParams() {
        canvas = document.getElementById("canvas");
        canvas.width = COLS * CUBE_SIZE;
        canvas.height = ROWS * CUBE_SIZE;
        ctx = canvas.getContext("2d");
    }

    function addListeners() {
        keystate = {};
        document.addEventListener("keydown", function (e) {
            keystate[e.keyCode] = true;
        });
        document.addEventListener("keyup", function (e) {
            delete keystate[e.keyCode];
        });
    }

    setCanvasParams();
    addListeners();

    frames = 0;

    init();
    loop();
}