function Unit(game, x, y, sprite) {
    Phaser.Sprite.call(this, game, x, y, 'unit:'+sprite);

    this.scale.setTo(RATIO, RATIO);
    this.anchor.set(0.5, 0.5);

    this.x += this.width/2;
    this.y += this.height/2;

    this.game.physics.enable(this);

    this.animations.add('idle', [0, 1], 2, true);

    this.animations.play('idle');

    this.isAlive = true;

    this.onDead = new Phaser.Signal();
}

Unit.prototype = Object.create(Phaser.Sprite.prototype);
Unit.prototype.constructor = Unit;

Unit.prototype.die = function() {
    this.body.enable = false;

    this.effect = this.game.add.sprite(this.x, this.y, 'effect:attack');
    this.effect.scale.setTo(RATIO, RATIO);
    this.effect.anchor.set(0.5, 0.5);

    this.effect.animations.add('attack', [0, 1, 0, 1, 0, 1], 4, false);
    this.effect.animations.killOnComplete = true;
    this.effect.events.onAnimationComplete.add(this.onEffectCompleted, this);

    this.effect.animations.play('attack');
};

Unit.prototype.onEffectCompleted = function() {
    this.effect.destroy();
    this.onDead.dispatch(this, true);

    this.loadTexture('effect:dead');
    /* @TODO: Choose a random frame (0-3) */

    this.isAlive = false;
};
