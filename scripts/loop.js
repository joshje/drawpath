define([
    'canvas',
    'grid',
    'vectors',
    'mouse',
    'keyboard',
    'code',
    'controls'
],function(
    canvas,
    grid,
    vectors,
    mouse,
    keyboard,
    code,
    controls
){
    var Loop = function() {
        this.fps = 30;

        this.loop = function() {
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

            setTimeout(this.loop.bind(this), 1000 / this.fps);
        };

        this.init = function() {
            this.loop();
        };
    };

    return new Loop();
});
