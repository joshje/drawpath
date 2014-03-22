define([
    'vec2',
    'utils'
], function(
    Vector2,
    utils
) {
    var Code = function() {
        this.el = utils.createEl('div', 'drawpath-code');
        this.el.setAttribute("contentEditable", true);

        this.clear = function() {
            this.lines = [];
        };

        this.addLine = function(line) {
            this.lines.push(line || '');
        };

        this.render = function() {
            this.code = this.lines.join('\n<br>');

            if (this.lastCode && this.lastCode == this.code) return;

            this.el.innerHTML = this.code;
            this.lastCode = this.code;
        };

        this.onClick = function(e) {
            e.stopPropagation();
        };

        this.onFocus = function() {
            setTimeout(function() {
                var range = document.createRange();
                range.selectNodeContents(this.el);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }.bind(this), 0);
        };

        this.el.addEventListener('click', this.onClick.bind(this));
        this.el.addEventListener('focus', this.onFocus.bind(this));
    };

    return new Code();
});
