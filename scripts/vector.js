define([
    'vec2',
    'canvas',
    'vectors',
    'point',
    'utils',
    'mouse',
    'code'
], function(
    Vector2,
    canvas,
    vectors,
    Point,
    utils,
    mouse,
    code
) {
    var url;
    var ctx = canvas.ctx;

    var Vector = function(pos, hue) {
        this.list = [];
        this.hue = hue;
        this.strokeStyle = utils.hsl(this.hue, 100, 50);

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
            ctx.strokeStyle = utils.hsl(this.hue, 100, 75);
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
            this.updateMouseStartPos();
            this.updateURL();
        };

        this.closePath = function() {
            this.isClosed = true;
            if (this.active) this.active.deactivate();
            this.updateMouseStartPos();
            this.updateURL();
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
            this.updateMouseStartPos();
        };

        this.updateMouseStartPos = function() {
            if (this.isClosed) mouse.vectorStartPos = null;

            mouse.vectorStartPos = this.list[0] && this.list[0].pos;
        };

        this.updateURL = function() {
            url = url || require('url');
            url.update();
        };

        this.addPoint(pos);
    };

    return Vector;
});
