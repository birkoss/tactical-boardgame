function Unit(game, x, y, sprite) {
    Phaser.Sprite.call(this, game, x, y, 'unit:'+sprite);

    this.scale.setTo(RATIO, RATIO);
    this.anchor.set(0.5, 0.5);

    this.x += this.width/2;
    this.y += this.height/2;

    game.physics.enable(this);

    this.animations.add('idle', [0, 1], 2, true);

    this.animations.play('idle');
}

Unit.prototype = Object.create(Phaser.Sprite.prototype);
Unit.prototype.constructor = Unit;


