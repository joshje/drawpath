define([
    'vec2',
    'utils'
], function(
    Vector2,
    utils
) {
    var Canvas = function(className) {
        this.el = utils.createEl('canvas', className);

        this.ctx = this.el.getContext('2d');

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

    return new Canvas('drawpath-canvas');
});
