define([
    'vec2',
    'vectors'
], function(
    Vector2,
    vectors
) {
    var URL = function() {
        this.vectorDivider = '_';
        this.vectorClose = '/';
        this.pointDivider = ',';
        this.update = function() {
            if (this.decoding) return;

            var arr = [];
            vectors.forEach(function(vector) {
                var points = [vector.pos.x, vector.pos.y];
                vector.forEach(function(point){
                    points.push(point.pos.x, point.pos.y);
                });
                points = points.join(this.pointDivider);
                if (vector.isClosed) points += this.vectorClose;
                arr.push(points);
            }.bind(this));
            this.hash = arr.join(this.vectorDivider);
            window.location.hash = this.hash;
        };

        this.decode = function() {
            // Prevent calling url.update while we are decoding
            this.decoding = true;

            this.hash = window.location.hash.replace('#', '');

            if (! this.hash || this.hash === '') return;

            var arr = this.hash.split(this.vectorDivider);
            arr.forEach(function(points){
                var closePath = false;
                if (/\/$/.test(points)) {
                    closePath = true;
                    points.replace(/\/$/, '');
                }
                points = points.split(this.pointDivider);

                var pos = this.createPos(points[0], points[1]);
                var vector = vectors.addVector(pos);
                for (var i = 2, len = points.length; i < len; i = i + 2) {
                    pos = this.createPos(points[i], points[i + 1]);
                    vector.addPoint(pos);
                }
                if (closePath) vector.closePath();
            }.bind(this));

            this.decoding = false;
        };

        this.createPos = function(x, y) {
            x = parseInt(x, 10);
            y = parseInt(y, 10);

            return new Vector2(x, y);
        };
    };

    return new URL();
});
