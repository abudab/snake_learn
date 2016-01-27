var COLS = ROWS = 20;
var EMPTY = 0, SNAKE = 1, FRUIT = 2;
var LEFT = 0, UP = 1, RIGHT = 2, DOWN = 3;
var KEY_LEFT = 37, KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN = 40;


var canvas, ctx, keystate, frames, score = 0;

var game = {
    _on: false,

    isOn: function(){
        return this._on;
    },

    on: function(state){
        this._on=state;
    }
}

var grid = {
    width: null,
    height: null,
    _grid: null,

    init: function (defaultVal, cols, rows) {
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
    }

};

function setFruit() {
    var empty = [];
    for (var x = 0; x < grid.width; x++) {
        for (var y = 0; y < grid.height; y++) {
            if (grid.get(x, y) === EMPTY) {
                empty.push({x: x, y: y});
            }
        }
    }
    var randpos = empty[Math.floor(Math.random() * empty.length)];
    grid.set(FRUIT, randpos.x, randpos.y);
}


var messages = {
    init: function () {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#0095DD";
    },

    drawScore: function () {
        this.init();
        ctx.fillText("Score: " + score, 8, 20);
    },

    drawMessage: function (msg) {
        this.init();
        ctx.fillText(msg, 8,20);
    }

}

function init() {
    game.on(true);

    grid.init(EMPTY, COLS, ROWS);
    var sp = {x: Math.floor(COLS / 2), y: ROWS - 1};

    snake.init(UP, sp.x, sp.y);
    grid.set(SNAKE, sp.x, sp.y);

    setFruit();
    messages.init();
}

function loop() {
    update();

    if(game.isOn()) {
        draw.redraw();
        window.requestAnimationFrame(loop, canvas);
    }
}

function lost() {
    draw.redrawElements();
    messages.drawMessage("Game over! with a score: " + score);
    game.on(false);
}

function update() {
    frames++;

    if (keystate[KEY_LEFT] && snake.direction !== RIGHT)
        snake.direction = LEFT;
    if (keystate[KEY_UP] && snake.direction !== DOWN)
        snake.direction = UP;
    if (keystate[KEY_RIGHT] && snake.direction !== LEFT)
        snake.direction = RIGHT;
    if (keystate[KEY_DOWN] && snake.direction !== UP)
        snake.direction = DOWN;

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
            return lost();
        }

        if (grid.get(nx, ny) === FRUIT) {
            score++;
            var tail = {y: ny, x: nx};
            setFruit();
        } else if (grid.get(nx, ny) === SNAKE) {
            return lost();
        } else {
            var tail = snake.remove();
            grid.set(EMPTY, tail.x, tail.y);
            tail.x = nx;
            tail.y = ny;
        }

        grid.set(SNAKE, tail.x, tail.y);
        snake.insert(tail.x, tail.y);
    }
}

var draw = {
    redrawElements:function() {
        var tw = canvas.width / grid.width;
        var th = canvas.height / grid.width;

        for (var x = 0; x < grid.width; x++) {
            for (var y = 0; y < grid.height; y++) {
                switch (grid.get(x, y)) {
                    case EMPTY:
                        ctx.fillStyle = "#FFFACD";

                        break;
                    case SNAKE:
                        ctx.fillStyle = "#ADFF2F";

                        break;
                    case FRUIT:
                        ctx.fillStyle = "#FF4500";
                        break;

                }
                ctx.fillRect(x * tw, y * th, tw, th);
            }
        }
    },


    redraw: function(){
        this.redrawElements();
        messages.drawScore();
    }

}

function main() {
    function setCanvasParams() {
        canvas = document.getElementById("canvas");
        canvas.width = COLS * 20;
        canvas.height = ROWS * 20;
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