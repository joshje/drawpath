define([
    'vec2',
    'canvas',
    'mouse',
    'utils'
], function(
    Vector2,
    canvas,
    mouse,
    utils
) {
    var ctx = canvas.ctx;

    var Controls = function() {
        this.buttons = [];

        this.buttons.push(new Button({
            name: 'snapToGrid',
            icon: function() {
                ctx.beginPath();
                ctx.moveTo(7, 3);
                ctx.lineTo(7, 17);
                ctx.moveTo(13, 3);
                ctx.lineTo(13, 17);
                ctx.moveTo(3, 7);
                ctx.lineTo(17, 7);
                ctx.moveTo(3, 13);
                ctx.lineTo(17, 13);
            },
            checkActive: function() {
                this.active = mouse.snapToGrid;
            },
            onClick: function() {
                mouse.snapToGrid = !mouse.snapToGrid;
            },
            x: 10,
            y: 10
        }));

        this.update = function() {
            this.hovered = null;
            this.buttons.forEach(function(button) {
                button.update();
                if (button.hovered) this.hovered = button;
            }.bind(this));
        };

        this.render = function() {
            this.buttons.forEach(function(button) {
                if (! button.hovered) button.render();
            });

            if (this.hovered) this.hovered.render();
        };
    };

    var Button = function(params) {
        this.pos = new Vector2(params.x, params.y);
        this.icon = params.icon;
        this.checkActive = params.checkActive;
        this.onClick = params.onClick;
        this.fillIcon = params.fillIcon;
        this.size = 26;

        this.update = function() {
            if (this.checkActive) this.checkActive();

            this.hovered = utils.withinRect(mouse.pos, this.pos, this.size, this.size);

            if (this.hovered) {
                canvas.setCursor('pointer');
            }

            mouse.clicks.forEach(function(click) {
                if (! click.hasFired && utils.withinRect(click.pos, this.pos, this.size, this.size)) {
                    this.onClick();
                    click.hasFired = true;
                }
            }.bind(this));
        };

        this.render = function() {
            ctx.save();
            ctx.translate(this.pos.x - 0.5, this.pos.y - 0.5);

            ctx.beginPath();
            ctx.rect(2, 2, this.size, this.size);
            ctx.fillStyle = 'rgba(0,0,0,0.1';
            ctx.fill();

            ctx.beginPath();
            ctx.rect(0, 0, this.size, this.size);
            ctx.fillStyle = this.active? '#EEE' : '#FFF';
            ctx.fill();
            ctx.strokeStyle = (this.hovered)? '#AAA' : '#CCC';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.translate(3, 3);
            if (this.icon) this.icon();

            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.stroke();

            ctx.restore();
        };
    };

    return new Controls();
});
