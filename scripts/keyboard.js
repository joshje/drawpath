define([
    'mouse',
    'vectors'
], function(
    mouse,
    vectors
) {
    var Keyboard = function() {
        this.key = {
            UP: 38,
            LEFT: 37,
            RIGHT: 39,
            DOWN: 40,
            S: 83,
            PLUS: 187,
            MINUS: 189
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

    return new Keyboard();
});
