define([
    'vec2',
    'canvas'
], function(
    Vector2,
    canvas
) {
    var ctx = canvas.ctx;

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

    return new Grid();
});
