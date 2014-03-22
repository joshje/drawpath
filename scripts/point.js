define([
    'vec2',
    'canvas',
    'utils'
], function(
    Vector2,
    canvas,
    utils
) {
    var ctx = canvas.ctx;

    var Point = function(pos, hue) {
        this.hue = hue;
        this.fillStyle = utils.hsl(hue, 100, 50);
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

    return Point;
});
