function Dice(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'dice');

    this.anchor.set(0.5);
    this.x += this.width / 2;
    this.y += this.height / 2;

    this.onRollStopped = new Phaser.Signal();
}

Dice.prototype = Object.create(Phaser.Sprite.prototype);
Dice.prototype.constructor = Dice;

Dice.ROLLS = 2;

Dice.prototype.init = function() {
    let values = Phaser.ArrayUtils.numberArray(0, 5);

    let frames = new Array();
    for (let i=0; i<Dice.ROLLS; i++) {
        /* Always be sure that NO number are the same when 2 loops are merged */
        let newFrames = new Array();
        do {
            newFrames = Phaser.ArrayUtils.shuffle(values);
        } while(frames.length > 0 && newFrames[0] == frames[frames.length-1]);
        frames = frames.concat(newFrames);
    }

    /* Pick, store and add at the end the value */
    this.valueIndex = Phaser.ArrayUtils.shuffle(values)[0];
    frames.push(this.valueIndex);

    /* Let's do this */
    let rollAnimation = this.animations.add('roll', frames, 15, false, true);
    rollAnimation.onComplete.add(this.onComplete, this);
    this.animations.play('roll');
};

Dice.prototype.onComplete = function() {
   this.onRollStopped.dispatch(this, this.valueIndex+1); 
};
