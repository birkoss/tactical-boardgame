function Spinner(game, x, y) {
    Phaser.Sprite.call(this, game, x, y);

    this.wheel = this.game.add.sprite(0, 0, 'spinner:wheel');
    this.wheel.anchor.set(0.5);
    this.addChild(this.wheel);

    this.x += this.wheel.width / 2;
    this.y += this.wheel.height / 2;

    this.pin = this.game.add.sprite(0, 0, 'spinner:pin');
    this.pin.anchor.set(0.5);
    this.addChild(this.pin);

    this.inputEnabled = true;

    this.canSpin = true;
    this.events.onInputDown.add(this.spin, this);

    this.value = this.game.add.bitmapText(-8, -7, 'font:gui', '', 16);
    this.value.tint = 0x000000;
    this.addChild(this.value);
}

Spinner.prototype = Object.create(Phaser.Sprite.prototype);
Spinner.prototype.constructor = Spinner;

Spinner.SLICES = 6;
Spinner.PRIZES = [3, 4, 5, 6, 1, 2];

Spinner.prototype.spin = function() {
    if (this.canSpin) {
        this.canSpin = false;
        var loop = this.game.rnd.between(2, 4);

        var degrees = this.game.rnd.between(0, 360);

        this.prize = Spinner.SLICES - 1 - Math.floor(degrees / (360 / Spinner.SLICES));

        var spinTween = this.game.add.tween(this.getChildAt(0)).to({angle: 360 * loop + degrees}, 3000, Phaser.Easing.Quadratic.Out, this);
        spinTween.onComplete.add(this.onStopped, this);
    }
};

Spinner.prototype.onStopped = function() {
    this.canSpin = true;
    this.value.text = Spinner.PRIZES[this.prize];
};
