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

    var Mouse = function() {
        this.offset = new Vector2(canvas.el.offsetTop, canvas.el.offsetLeft);
        this.pos = new Vector2();
        this.centerPos = new Vector2();
        this.clicks = [];
        this.radius = 5;

        this.update = function() {
            canvas.setCursor('none');
            this.strokeStyle = (this.hue)? utils.hsl(this.hue, 50, 50) : '#000';
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
            if (! this.insideCanvas || ! this.vectorStartPos) return;

            if (this.centerPos.isCloseTo(this.vectorStartPos, 5)) {
                this.centerPos = this.vectorStartPos.clone();
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

    return new Mouse();
});
