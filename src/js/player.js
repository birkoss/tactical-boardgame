function Player(sprite) {
    this.sprite = sprite;

    this.coins = 100;
    this.units = 0;
};

Player.prototype = {
    removeCoins(amount) {
        this.coins = Math.max(0, this.coins - amount);
    },
    setUnits(amount) {
        this.units = amount;
    }
};
