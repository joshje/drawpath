/* globals Vector2 */

var fps = 30;

var canvas,
    ctx,
    grid,
    vectors,
    mouse,
    keyboard,
    code,
    controls;

var setup = function() {
    canvas = new Canvas('drawpath-canvas');

    initObjects();
    loop();
};

var loop = function() {
    canvas.clear();
    canvas.setCursor('none');
    code.clear();

    grid.update();
    controls.update();
    vectors.update();
    mouse.update();
    canvas.update();

    grid.render();
    vectors.render();
    code.render();
    controls.render();
    mouse.render();

    mouse.flush();

    setTimeout(loop, 1000 / fps);
};

var initObjects = function() {
    grid = new Grid();
    vectors = new Vectors();
    mouse = new Mouse();
    code = new Code();
    keyboard = new Keyboard();
    controls = new Controls();
};

var Canvas = function(className) {
    this.el = createEl('canvas', className);

    ctx = this.ctx = this.el.getContext('2d');

    this.clear = function() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    };

    this.setCursor = function(cursor) {
        if (this.cursor !== cursor) {
            this.cursor = cursor;
            this.newCursor = cursor;
        }
    };

    this.update = function() {
        if (this.newCursor) {
            this.el.style.cursor = this.newCursor;
            this.newCursor = false;
        }
    };

    this.resize = function() {
        var width = window.innerWidth;
        var height = window.innerHeight;

        if (width !== this.width || height !== this.height) {
            this.width = width;
            this.height = height;

            this.half = new Vector2(this.width, this.height).multiplyEq(0.5).floor();

            this.el.width = this.width;
            this.el.height = this.height;
        }
    };

    this.resize();
    setInterval(this.resize.bind(this), 200);
};

var Mouse = function() {
    this.offset = new Vector2(canvas.el.offsetTop, canvas.el.offsetLeft);
    this.pos = new Vector2();
    this.centerPos = new Vector2();
    this.clicks = [];
    this.radius = 5;
    this.strokeStyle = '#000';

    this.update = function() {
        if (vectors.active) {
            this.strokeStyle = hsl(vectors.active.hue, 50, 50);
        }
    };

    this.render = function() {
        if (! this.insideCanvas || canvas.cursor !== 'none') return;

        ctx.save();

        ctx.translate(this.pos.x - 0.5, this.pos.y - 0.5);

        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-2, 0);
        ctx.moveTo(2, 0);
        ctx.lineTo(6, 0);
        ctx.moveTo(0, -6);
        ctx.lineTo(0, -2);
        ctx.moveTo(0, 2);
        ctx.lineTo(0, 6);

        ctx.strokeStyle = this.strokeStyle;
        ctx.stroke();

        ctx.restore();
    };

    this.onMove = function(e) {
        this.updatePos(e.clientX, e.clientY);

        this.snapToStart();
    };

    this.onMouseOver = function() {
        this.insideCanvas = true;
    };

    this.onMouseOut = function() {
        this.insideCanvas = false;
    };

    this.onClick = function(e) {
        if (! this.insideCanvas) return;

        this.updatePos(e.clientX, e.clientY);
        this.snapToStart();

        this.clicks.push({
            pos: this.pos.clone(),
            centerPos: this.centerPos.clone()
        });
    };

    this.updatePos = function(x, y) {
        this.pos.reset(x, y).minusEq(this.offset);
        this.centerPos = this.pos.clone().minusEq(canvas.half);
        if (this.snapToGrid) {
            this.centerPos.divideEq(10).round().multiplyEq(10);
            this.pos = this.centerPos.clone().plusEq(canvas.half);
        }
    };

    this.snapToStart = function() {
        if (! this.insideCanvas) return;

        var lastVector = vectors.getLast();
        if (! lastVector) return;

        var firstPoint = lastVector.getFirst();
        if (! firstPoint) return;

        if (this.centerPos.isCloseTo(firstPoint.pos, 5)) {
            this.centerPos = firstPoint.pos.clone();
            this.pos = this.centerPos.clone().plusEq(canvas.half);
        }
    };

    this.toggleSnapToGrid = function() {
        this.snapToGrid = !this.snapToGrid;
    };

    this.flush = function() {
        this.clicks = [];
    };

    window.addEventListener('mousemove', this.onMove.bind(this));
    canvas.el.addEventListener('mouseover', this.onMouseOver.bind(this));
    canvas.el.addEventListener('mouseout', this.onMouseOut.bind(this));
    window.addEventListener('click', this.onClick.bind(this));
};

var Keyboard = function() {
    this.key = {
        S: 83,
        UP: 38,
        LEFT: 37,
        RIGHT: 39,
        DOWN: 40
    };

    this.onKeydown = function(e) {
        var nudgeAmount = e.shiftKey? 10 : 1;
        if (e.keyCode == this.key.S) {
            mouse.toggleSnapToGrid();
        } else if (e.keyCode == this.key.UP) {
            vectors.nudgeActivePoint(0, -nudgeAmount);
        } else if (e.keyCode == this.key.DOWN) {
            vectors.nudgeActivePoint(0, nudgeAmount);
        } else if (e.keyCode == this.key.LEFT) {
            vectors.nudgeActivePoint(-nudgeAmount, 0);
        } else if (e.keyCode == this.key.RIGHT) {
            vectors.nudgeActivePoint(nudgeAmount, 0);
        }
    };

    window.addEventListener('keydown', this.onKeydown.bind(this));
};

var Grid = function() {
    this.spacing = 10;
    this.pos = new Vector2();

    this.update = function() {
        this.pos.reset(canvas.half.x - 0.5, canvas.half.y - 0.5);
    };

    this.render = function() {
        ctx.save();

        ctx.translate(this.pos.x, this.pos.y);

        ctx.beginPath();

        var i = Math.ceil(canvas.width / this.spacing * 0.5);
        while (--i) {
            var x = i * this.spacing;
            ctx.moveTo(x, -canvas.half.y);
            ctx.lineTo(x, canvas.half.y);
            ctx.moveTo(-x, canvas.half.y);
            ctx.lineTo(-x, -canvas.half.y);
        }

        i = Math.ceil(canvas.height / this.spacing * 0.5);
        while (--i) {
            var y = i * this.spacing;
            ctx.moveTo(-canvas.half.x, y);
            ctx.lineTo(canvas.half.x, y);
            ctx.moveTo(canvas.half.x, -y);
            ctx.lineTo(-canvas.half.x, -y);
        }

        ctx.strokeStyle = '#EEE';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -canvas.half.y);
        ctx.lineTo(0, canvas.half.y);
        ctx.moveTo(-canvas.half.x, 0);
        ctx.lineTo(canvas.half.x, 0);

        ctx.strokeStyle = '#CCC';
        ctx.stroke();

        ctx.restore();
    };

};

var Code = function() {
    this.el = createEl('div', 'drawpath-code');
    this.el.setAttribute("contentEditable", true);

    this.clear = function() {
        this.lines = [];
    };

    this.addLine = function(line) {
        this.lines.push(line || '');
    };

    this.render = function() {
        this.code = this.lines.join('\n<br>');

        if (this.lastCode && this.lastCode == this.code) return;

        this.el.innerHTML = this.code;
        this.lastCode = this.code;
    };

    this.onClick = function(e) {
        e.stopPropagation();
    };

    this.onFocus = function() {
        setTimeout(function() {
            var range = document.createRange();
            range.selectNodeContents(this.el);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }.bind(this), 0);
    };

    this.el.addEventListener('click', this.onClick.bind(this));
    this.el.addEventListener('focus', this.onFocus.bind(this));
};

var Vectors = function() {
    this.list = [];
    this.pos = new Vector2();

    this.update = function() {
        this.pos.reset(canvas.half.x - 0.5, canvas.half.y - 0.5);

        mouse.clicks.forEach(function(c) {
            if (c.hasFired) return;

            var clickPos = c.centerPos.clone();
            var lastVector = this.getLast();

            if (!lastVector || lastVector.isClosed) {
                lastVector = this.addVector(clickPos);
            }

            var firstPoint = lastVector.getFirst();

            if (firstPoint && firstPoint.pos.equals(clickPos)) {
               lastVector.closePath();
            } else {
                lastVector.addPoint(clickPos);
            }
        }.bind(this));
    };

    this.render = function() {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

        this.forEach(function(vector, i){
            var withMouseLine = (canvas.cursor == 'none' && i == this.list.length - 1 && mouse.insideCanvas && !vector.isClosed);
            vector.render(withMouseLine);
        }.bind(this));


        ctx.restore();
    };

    this.getFirst = function() {
        return this.list[0];
    };

    this.getLast = function() {
        if (! this.list.length) return;

        return this.list[this.list.length - 1];
    };

    this.forEach = function(callback) {
        if (typeof callback != 'function') return;
        for (var i =0, len = this.list.length; i < len; i++) {
            callback(this.list[i], i);
        }
    };

    this.addVector = function(pos) {
        var hue = this.list.length * 100;
        var vector = new Vector(pos, hue);
        this.list.push(vector);
        this.active = vector;

        return vector;
    };

    this.nudgeActivePoint = function(x, y) {
        if (! this.active || ! this.active.active) return;

        this.active.active.nudge(x, y);
    };
};

var Vector = function(pos, hue) {
    this.list = [];
    this.pos = pos;
    this.hue = hue;
    this.strokeStyle = hsl(this.hue, 100, 50);

    this.render = function(withMouseLine) {
        this.renderLines(withMouseLine);
        if (withMouseLine) this.renderMouseLine();
        if (mouse.insideCanvas) this.renderPoints();

        return this.code;
    };

    this.renderLines = function(withMouseLine) {
        var firstPoint = true;

        this.forEach(function(point) {
            if (firstPoint) {
                ctx.beginPath();
                code.addLine('ctx.beginPath();');
                ctx.strokeStyle = this.strokeStyle;
                //code.addLine('ctx.strokeStyle = \'' + this.strokeStyle + '\';');
                ctx.moveTo(point.pos.x, point.pos.y);
                code.addLine('ctx.moveTo(' + point.pos.x + ', ' + point.pos.y + ');');
                firstPoint = false;
            } else {
                ctx.lineTo(point.pos.x, point.pos.y);
                code.addLine('ctx.lineTo(' + point.pos.x + ', ' + point.pos.y + ');');
            }

        }.bind(this));

        if (withMouseLine && !this.getLast().pos.isCloseTo(mouse.centerPos, 5)) {
            code.addLine('ctx.lineTo(' + mouse.centerPos.x + ', ' + mouse.centerPos.y + ');');
        }

        if (this.isClosed) {
            ctx.closePath();
            code.addLine('ctx.closePath();');
        }

        ctx.stroke();
        //code.addLine('ctx.stroke();');
        code.addLine();
    };

    this.renderMouseLine = function() {
        var lastPoint = this.getLast();
        if (! lastPoint) return;

        ctx.moveTo(lastPoint.pos.x, lastPoint.pos.y);
        ctx.lineTo(mouse.centerPos.x, mouse.centerPos.y);
        ctx.strokeStyle = hsl(this.hue, 100, 75);
        ctx.stroke();
    };

    this.renderPoints = function() {
        this.forEach(function(point) {
            point.render();
        });
    };

    this.getFirst = function() {
        return this.list[0];
    };

    this.getLast = function() {
        if (! this.list.length) return;

        return this.list[this.list.length - 1];
    };

    this.forEach = function(callback) {
        if (typeof callback != 'function') return;
        for (var i =0, len = this.list.length; i < len; i++) {
            callback(this.list[i], i);
        }
    };

    this.addPoint = function(pos) {
        var point = new Point(pos, this.hue);
        this.list.push(point);
        this.makeActive(point);
    };

    this.closePath = function() {
        this.isClosed = true;
        this.active.deactivate();
    };

    this.makeActive = function(point) {
        if (this.active) this.active.deactivate();

        this.active = point;
        point.activate();
    };
};

var Point = function(pos, hue) {
    this.hue = hue;
    this.fillStyle = hsl(hue, 100, 50);
    this.pos = pos;
    this.radius = 3;

    this.render = function() {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI*2);
        if (this.active) {
            ctx.fillStyle = '#FFF';
            ctx.fill();
            ctx.strokeStyle = this.fillStyle;
            ctx.strokeWidth = 1;
            ctx.stroke();
        } else {
            ctx.fillStyle = this.fillStyle;
            ctx.fill();
        }
    };

    this.activate = function() {
        this.active = true;
    };

    this.deactivate = function() {
        this.active = false;
    };

    this.nudge = function(x, y) {
        this.pos.x += x;
        this.pos.y += y;
    };
};

var Controls = function() {
    this.buttons = [];

    this.buttons.push(new Button({
        icon: function() {
            ctx.beginPath();
            ctx.moveTo(7, 3);
            ctx.lineTo(7, 17);
            ctx.moveTo(13, 3);
            ctx.lineTo(13, 17);
            ctx.moveTo(3, 7);
            ctx.lineTo(17, 7);
            ctx.moveTo(3, 13);
            ctx.lineTo(17, 13);

            ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.stroke();
        },
        checkActive: function() {
            this.active = mouse.snapToGrid;
        },
        toggle: function() {
            mouse.snapToGrid = !mouse.snapToGrid;
        },
        x: 10,
        y: 10
    }));

    this.update = function() {
        this.buttons.forEach(function(button) {
            button.update();
        });
    };

    this.render = function() {
        this.buttons.forEach(function(button) {
            button.render();
        });
    };
};

var Button = function(params) {
    this.pos = new Vector2(params.x, params.y);
    this.icon = params.icon;
    this.checkActive = params.checkActive;
    this.toggle = params.toggle;
    this.update = function() {
        if (this.checkActive) this.checkActive();

        this.hovered = withinRect(mouse.pos, this.pos, 20, 20);

        if (this.hovered) {
            canvas.setCursor('pointer');
        }

        mouse.clicks.forEach(function(click) {
            if (! click.hasFired && withinRect(click.pos, this.pos, 20, 20)) {
                this.toggle();
                click.hasFired = true;
            }
        }.bind(this));
    };

    this.render = function() {
        ctx.save();
        ctx.translate(this.pos.x - 0.5, this.pos.y - 0.5);

        ctx.beginPath();
        ctx.rect(0, 0, 20, 20);

        ctx.fillStyle = this.active? '#EEE' : '#FFF';
        ctx.fill();
        ctx.strokeStyle = '#CCC';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (this.icon) this.icon();

        ctx.restore();
    };
};

var createEl = function(name, className) {
    var el = document.createElement(name);
    if (className) el.className = className;
    document.body.appendChild(el);

    return el;
};

var hsl = function(h, s, l) {
    return 'hsl('+h%360+', ' + Math.floor(s)+'%, ' + Math.floor(l) + '%)';
};

var withinRect = function(pos1, pos2, width, height) {
    return (pos1.x >= pos2.x &&
            pos1.x <= pos2.x + width &&
            pos1.y >= pos2.y &&
            pos1.y <= pos2.y + height);
};

setup();
