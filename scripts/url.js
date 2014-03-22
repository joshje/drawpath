define([
    'vec2',
    'vectors',
    'utils'
], function(
    Vector2,
    vectors,
    utils
) {
    var URL = function() {
        this.update = function() {
            if (this.decoding) return;

            var arr = [];
            vectors.forEach(function(vector) {
                var points = [];
                vector.forEach(function(point){
                    var pos = this.encodePos(point.pos);
                    points.push(pos[0], pos[1]);
                }.bind(this));
                points = points.join('');
                points += (vector.isClosed)? ':' : ';';
                arr.push(points);
            }.bind(this));
            this.hash = arr.join('');
            window.location.hash = this.hash;
        };

        this.decode = function() {
            // Prevent calling url.update while we are decoding
            this.decoding = true;

            this.hash = window.location.hash.replace('#', '');

            if (! this.hash || this.hash === '') {
                this.decoding = false;
                return;
            }

            var vs = this.hash.match( /[^:;]+[:;]+/g );

            if (vs) {
                vs.forEach(function(points){
                    var closePath = (/\:$/.test(points))? true : false;
                    points = points.substring(0, points.length - 1);

                    points = points.match(/([-~][0-9a-zA-Z_]+)/g);
                    if (! points) return;

                    var pos = this.decodePos(points[0], points[1]);
                    var vector = vectors.addVector(pos);
                    for (var i = 2, len = points.length; i < len; i = i + 2) {
                        pos = this.decodePos(points[i], points[i + 1]);
                        vector.addPoint(pos);
                    }
                    if (closePath) vector.closePath();
                }.bind(this));
            }

            this.decoding = false;
        };

        this.encodePos = function(pos) {
            return [utils.num_to_sxg(pos.x), utils.num_to_sxg(pos.y)];
        };

        this.decodePos = function(x, y) {
            x = utils.sxg_to_num(x);
            y = utils.sxg_to_num(y);

            return new Vector2(x, y);
        };
    };

    return new URL();
});
