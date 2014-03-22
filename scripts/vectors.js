define([
    'vec2',
    'canvas',
    'vector',
    'mouse'
], function(
    Vector2,
    canvas,
    Vector,
    mouse
) {
    var ctx = canvas.ctx;
    var url;

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
                        this.addVector(clickPos);
                        return;
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
            this.makeActive(vector);
            this.updateURL();

            return vector;
        };

        this.nudgeActivePoint = function(x, y) {
            if (! this.active || ! this.active.active) return;

            this.active.active.nudge(x, y);
        };

        this.makeActive = function(vector){
            if (this.active) this.active.deactivate();
            mouse.hue = vector.hue;

            this.active = vector;
        };

        this.updateURL = function() {
            url = url || require('url');
            url.update();
        };
    };

    return new Vectors();
});
