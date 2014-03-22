define(function() {
    return {
        createEl: function(name, className) {
            var el = document.createElement(name);
            if (className) el.className = className;
            document.body.appendChild(el);

            return el;
        },

        hsl: function(h, s, l) {
            return 'hsl('+h%360+', ' + Math.floor(s)+'%, ' + Math.floor(l) + '%)';
        },

        withinRect: function(pos1, pos2, width, height) {
            return (pos1.x >= pos2.x &&
                pos1.x <= pos2.x + width &&
                pos1.y >= pos2.y &&
                pos1.y <= pos2.y + height);
        }
    };
});
