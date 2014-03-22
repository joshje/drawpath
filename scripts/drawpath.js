require([
    'config',
    'canvas',
    'grid',
    'vectors',
    'mouse',
    'keyboard',
    'code',
    'controls',
    'url'
],function(
    config,
    canvas,
    grid,
    vectors,
    mouse,
    keyboard,
    code,
    controls,
    url
){
    url.decode();

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

        setTimeout(loop, 1000 / config.fps);
    };

    loop();
});
