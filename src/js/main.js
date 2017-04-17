var Tactical = Tactical || {};

Tactical.game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, '');
//Tactical.game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.CANVAS, '');

Tactical.game.state.add('Boot', Tactical.Boot);
Tactical.game.state.add('Preload', Tactical.Preload);
Tactical.game.state.add('Game', Tactical.Game);

Tactical.game.state.start('Boot');

const RATIO = 3;
console.log("Ratio:" + RATIO);
