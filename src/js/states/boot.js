var Tactical = Tactical || {};

Tactical.Boot = function() {};

Tactical.Boot.prototype = {
    preload: function() {
        this.load.image('gui:preloader', 'images/gui/preloader.png');
    },
    create: function() {
        this.game.backgroundColor = '#fff';

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        this.game.renderer.renderSession.roundPixels = true;  
        this.game.stage.smoothed = false;

        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.state.start('Preload');
    }
};
