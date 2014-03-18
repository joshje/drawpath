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
    code.clear();

    mouse.update();
    grid.update();
    controls.update();
    vectors.update();

    grid.render();
    vectors.render();
    code.render();
    controls.render();
    mouse.render();

    canvas.updateCursor();
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

    this.updateCursor = function() {
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
        canvas.setCursor('none');
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

    this.onDown = function(e) {
        if (! this.insideCanvas) return;

        this.updatePos(e.clientX, e.clientY);
        this.snapToStart();

        this.startPos = this.centerPos.clone();

        this.clicks.push({
            pos: this.pos.clone(),
            centerPos: this.centerPos.clone()
        });
    };

    this.onMove = function(e) {
        this.updatePos(e.clientX, e.clientY);

        if (this.startPos) {
            this.dragPos = this.centerPos.clone();
        }

        this.snapToStart();
    };

    this.onUp = function(e) {
        this.updatePos(e.clientX, e.clientY);

        this.startPos = this.dragPos = null;

        this.snapToStart();
    };

    this.onOver = function() {
        this.insideCanvas = true;
    };

    this.onOut = function() {
        this.insideCanvas = false;
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

        var activeVector = vectors.active;
        if (! activeVector) return;

        var firstPoint = activeVector.getFirst();
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

    window.addEventListener('mousedown', this.onDown.bind(this));
    window.addEventListener('mousemove', this.onMove.bind(this));
    window.addEventListener('mouseup', this.onUp.bind(this));
    canvas.el.addEventListener('mouseover', this.onOver.bind(this));
    canvas.el.addEventListener('mouseout', this.onOut.bind(this));
};

var Keyboard = function() {
    this.key = {
        UP: 38,
        LEFT: 37,
        RIGHT: 39,
        DOWN: 40,
        S: 83
    };

    this.onKeydown = function(e) {
        var nudgeAmount = e.shiftKey? 10 : 1;

        switch (e.keyCode) {
            case this.key.UP:
                vectors.nudgeActivePoint(0, -nudgeAmount);
                break;
            case this.key.DOWN:
                vectors.nudgeActivePoint(0, nudgeAmount);
                break;
            case this.key.LEFT:
                vectors.nudgeActivePoint(-nudgeAmount, 0);
                break;
            case this.key.RIGHT:
                vectors.nudgeActivePoint(nudgeAmount, 0);
                break;
            case this.key.S:
                mouse.toggleSnapToGrid();
                break;
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

        this.forEach(function(vector){
            vector.update();
        });

        if (canvas.cursor == 'none') {
            mouse.clicks.forEach(function(c) {
                if (c.hasFired) return;

                var clickPos = c.centerPos.clone();
                var activeVector = this.active;

                if (activeVector) activeVector.deactivate();

                if (!activeVector || activeVector.isClosed) {
                    activeVector = this.addVector(clickPos);
                }

                var firstPoint = activeVector.getFirst();

                if (firstPoint && firstPoint.pos.equals(clickPos)) {
                   activeVector.closePath();
                } else {
                    activeVector.addPoint(clickPos);
                }
            }.bind(this));
        }
    };

    this.render = function() {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

        this.forEach(function(vector){
            var withMouseLine = (canvas.cursor == 'none' && vector.active && mouse.insideCanvas && !vector.isClosed);
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

    this.makeActive = function(vector){
        if (this.active) this.active.deactivate();

        this.active = vector;
    };
};

var Vector = function(pos, hue) {
    this.list = [];
    this.pos = pos;
    this.hue = hue;
    this.strokeStyle = hsl(this.hue, 100, 50);

    this.update = function() {
        this.forEach(function(point) {
            if ((point.isDragging && mouse.dragPos) || (mouse.startPos && mouse.startPos.isCloseTo(point.pos, 5))) {
                this.makeActive(point);
                point.isDragging = true;
                if (mouse.dragPos) point.moveTo(mouse.dragPos);
            } else {
                point.isDragging = false;
            }

            point.hovered = false;
            if (mouse.centerPos.isCloseTo(point.pos, 5)) {
                point.hovered = true;

                if ((!point.isFirst) || this.isClosed) canvas.setCursor('pointer');
            }
        }.bind(this));
    };

    this.render = function(withMouseLine) {
        this.renderLines(withMouseLine);
        if (withMouseLine) this.renderMouseLine();
        if (mouse.insideCanvas) this.renderPoints();

        return this.code;
    };

    this.renderLines = function(withMouseLine) {

        this.forEach(function(point) {
            if (point.isFirst) {
                ctx.beginPath();
                code.addLine('ctx.beginPath();');
                ctx.strokeStyle = this.strokeStyle;
                //code.addLine('ctx.strokeStyle = \'' + this.strokeStyle + '\';');
                ctx.moveTo(point.pos.x, point.pos.y);
                code.addLine('ctx.moveTo(' + point.pos.x + ', ' + point.pos.y + ');');
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
        if (! this.list.length) point.isFirst = true;
        this.list.push(point);
        this.makeActive(point);
    };

    this.closePath = function() {
        this.isClosed = true;
        if (this.active) this.active.deactivate();
    };

    this.deactivate = function() {
        if (this.active) this.active.deactivate();
        this.active = null;
    };

    this.makeActive = function(point) {
        if (vectors) vectors.makeActive(this);

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
        if (this.active || this.hovered) {
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

    this.moveTo = function(pos) {
        this.pos = pos.clone();
    };

    this.nudge = function(x, y) {
        this.pos.x += x;
        this.pos.y += y;
    };
};

var Controls = function() {
    this.buttons = [];

    this.buttons.push(new Button({
        name: 'snapToGrid',
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
        },
        checkActive: function() {
            this.active = mouse.snapToGrid;
        },
        onClick: function() {
            mouse.snapToGrid = !mouse.snapToGrid;
        },
        x: 10,
        y: 10
    }));

    this.update = function() {
        this.hovered = null;
        this.buttons.forEach(function(button) {
            button.update();
            if (button.hovered) this.hovered = button;
        }.bind(this));
    };

    this.render = function() {
        this.buttons.forEach(function(button) {
            if (! button.hovered) button.render();
        });

        if (this.hovered) this.hovered.render();
    };
};

var Button = function(params) {
    this.pos = new Vector2(params.x, params.y);
    this.icon = params.icon;
    this.checkActive = params.checkActive;
    this.onClick = params.onClick;
    this.fillIcon = params.fillIcon;
    this.size = 26;

    this.update = function() {
        if (this.checkActive) this.checkActive();

        this.hovered = withinRect(mouse.pos, this.pos, this.size, this.size);

        if (this.hovered) {
            canvas.setCursor('pointer');
        }

        mouse.clicks.forEach(function(click) {
            if (! click.hasFired && withinRect(click.pos, this.pos, this.size, this.size)) {
                this.onClick();
                click.hasFired = true;
            }
        }.bind(this));
    };

    this.render = function() {
        ctx.save();
        ctx.translate(this.pos.x - 0.5, this.pos.y - 0.5);

        ctx.beginPath();
        ctx.rect(2, 2, this.size, this.size);
        ctx.fillStyle = 'rgba(0,0,0,0.1';
        ctx.fill();

        ctx.beginPath();
        ctx.rect(0, 0, this.size, this.size);
        ctx.fillStyle = this.active? '#EEE' : '#FFF';
        ctx.fill();
        ctx.strokeStyle = (this.hovered)? '#AAA' : '#CCC';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.translate(3, 3);
        if (this.icon) this.icon();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.stroke();

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
