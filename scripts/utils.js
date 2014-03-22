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
        },

        num_to_sxg: function(n) {
            var s = '';
            var m = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ_abcdefghijkmnopqrstuvwxyz';
            if (! n) return '~0';

            var neg = (n < 0)? true : false;
            n = Math.abs(n);

            while (n > 0) {
                var d = n % 60;
                s = m[d] + s;
                n = (n - d) / 60;
            }

            s = (neg? '-' : '~') + s;

            return s;
        },

        sxg_to_num: function(s) {
            var n = 0;

            var neg = (s[0] == '-')? true : false;
            s = s.substring(1);

            for (var i = 0, j = s.length; i < j; i++) {
                var c = s.charCodeAt(i);

                if (c >=48 && c <=57) c = c -48;
                else if (c >= 65 && c <= 72) c -= 55;
                else if (c == 73 || c == 108) c = 1; // typo capital I, lowercase l to 1
                else if (c >= 74 && c <= 78) c -= 56;
                else if (c == 79) c = 0; // error correct typo capital O to 0
                else if (c >= 80 && c <= 90) c -= 57;
                else if (c == 95) c = 34; // underscore
                else if (c >= 97 && c <= 107) c -= 62;
                else if (c >= 109 && c <= 122) c -= 63;
                else c = 0; // treat all other noise as 0

                n = 60*n + c;
            }
            if (neg) n *= -1;
            return n;
        }
    };
});
