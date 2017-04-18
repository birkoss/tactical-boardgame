var Tactical = Tactical || {};

Tactical.Preload = function() {};

Tactical.Preload.prototype = {
    preload: function() {
        this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'gui:preloader');
        this.preloadBar.anchor.set(0.5);

        this.load.setPreloadSprite(this.preloadBar);

        this.load.image('tile:grass', 'images/tiles/grass.png');
        this.load.image('gui:position', 'images/gui/position.png');
        this.load.image('gui:cost-primary', 'images/money-primary.png');
        this.load.image('gui:cost-secondary', 'images/money-secondary.png');

        this.load.image('spinner:wheel', 'images/spinner/wheel.png');
        this.load.image('spinner:pin', 'images/spinner/pin.png');

        this.load.spritesheet('unit:peon', 'images/units/peon.png', 16, 16);
        this.load.spritesheet('unit:skeleton', 'images/units/skeleton.png', 16, 16);

        this.load.spritesheet('dice', 'images/dice.png', 70, 70);

        this.load.bitmapFont('font:gui', 'images/fonts/gui.png', 'images/fonts/gui.xml');

    },
    create: function() {
        this.state.start('Game');
    }
};
