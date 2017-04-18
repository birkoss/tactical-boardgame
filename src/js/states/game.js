var Tactical = Tactical || {};

Tactical.Game = function() {};

Tactical.Game.prototype = {
    /* Phaser */
    create: function() {
        this.createTiles();

        this.markers = this.game.add.group();
        this.units = this.game.add.group();

        this.createInterface();

        this.currentTurn = 1;
        this.currentTurn = 0;
        this.nextTurn();
    },
    update: function() {
    },

    nextTurn() {
        this.currentTurn ^= 1;

        this.showInterface();
    },
    endTurn() {
        this.hideInterface();
        this.disableTilesClick();
        this.disableTilesFading();
        this.hideMarkers();

        this.nextTurn();
    },
    AIPickTile() {
        let primaryTiles = new Array();
        let secondaryTiles = new Array();

        this.markers.forEach(function(item) {
            if (item.text != undefined) {
                let position = {x:item.gridX-1, y:item.gridY-1};
                if (item.text == "1") {
                    primaryTiles.push(position);
                } else {
                    secondaryTiles.push(position);
                }
            }
        });

        /* Add a delay before letting the AI pick a tile */
        this.game.time.events.add(Phaser.Timer.SECOND * 1, function() {
            /* @TODO: Better AI (Oh rly!!!) */
            this.createUnit(primaryTiles[0].x, primaryTiles[0].y, 'skeleton');
            this.endTurn();
        }, this);
    },
    createTiles() {
        this.tiles = this.game.add.group();

        for (let x=0; x<6; x++) {
            for (let y=0; y<6; y++) {
                let tile = this.tiles.create(x, y, 'tile:grass');
                tile.scale.setTo(RATIO, RATIO);
                tile.x = x * (tile.width + 3);
                tile.y = y * (tile.height + 3);

                tile.gridX = x;
                tile.gridY = y;

                tile.inputEnabled = true;
            }
        }

        this.tiles.x = (this.game.width - this.tiles.width) / 2;
        this.tiles.y = this.tiles.x;
    },
    createInterface() {
        this.interface = this.game.add.group();
        this.positions = new Array();

        let interfaceX = (this.game.width/2);
        let interfaceY = (this.tiles.y * 2) + this.tiles.height;

        let dice = new Dice(this.game, (interfaceX/2)-35, interfaceY);
        dice.originalX = dice.x;
        dice.outsideX = dice.x - this.game.width;
        dice.onRollStopped.add(this.onDiceRollStopped, this);
        this.interface.addChild(dice);

        dice = new Dice(this.game, interfaceX + this.interface.getChildAt(0).x - 35, interfaceY);
        dice.originalX = dice.x;
        dice.outsideX = dice.x + this.game.width;
        dice.onRollStopped.add(this.onDiceRollStopped, this);
        this.interface.addChild(dice);

        this.interface.forEach(function(item) {
            item.x = item.outsideX;
        }, this);
    },
    createMarkers() {
        this.markers.removeAll();

        this.fadeTiles();
    },
    fadeTiles() {
        this.tilesFaded = 0;
        for (let i=0; i<this.tiles.length; i++) {
            let tween = this.game.add.tween(this.tiles.getChildAt(i)).to({alpha:0.7}, 200).start();
            tween.onComplete.add(function(item) {
                this.tilesFaded++;
                if (this.tilesFaded >= this.tiles.length) {
                    this.tilesFaded = 0;

                    let primary = new Array();
                    primary.push({x:this.positions[0], y:this.positions[1]});
                    if (primary[0].x != primary[0].y) {
                        primary.push({x:this.positions[1], y:this.positions[0]});
                    }

                    this.highlightTiles(primary, 1);
                }
            }, this);
        }
    },
    highlightTiles(tiles, costValue) {
        this.tilesFaded = 0;
        tiles.forEach(function(item) {
            let tween = this.game.add.tween(this.tiles.getChildAt(((item.y-1)*6)+(item.x-1))).to({alpha: 1}, 200).start();
            tween.onComplete.add(function() {
                this.createCost(item.x, item.y, costValue);
                this.tilesFaded++;

                if (this.tilesFaded >= tiles.length) {
                    /* Find secondary tiles */
                    if (costValue == 1) {
                        
                        /* Get all neighboors */
                        let neighboors = new Array();
                        tiles.forEach(function(item) {
                            /* @TODO: Pick only UNIQUE cell */
                            /* @TODO: Pick cell without an unit present */
                            let newNeighboors = this.findNeighboors(item.x, item.y);
                            neighboors = neighboors.concat(newNeighboors);
                        }, this);

                        this.highlightTiles(neighboors, 5);
                    } else {
                        /* If it's the AI turn */
                        if (this.currentTurn == 1) {
                            this.AIPickTile();
                        }
                    }
                }
            }, this);
        }, this);
    },
    /* Create a COST icon and label in a tile */
    createCost(costX, costY, costValue) {
        let coin = this.markers.create(0, 0, 'gui:cost-' + (costValue == 1 ? "primary" : "secondary"));
        coin.scale.setTo(RATIO, RATIO);
        coin.x = this.tiles.x;
        coin.y = this.tiles.y;

        coin.x += ((costX-1) * (coin.width+3));
        coin.y += ((costY-1) * (coin.height+3));

        let cost = this.game.add.bitmapText(0, 0, 'font:gui', costValue, 16);
        cost.gridX = costX;
        cost.gridY = costY;
        cost.x = coin.x + (coin.width/2) + 0;
        cost.y = coin.y + (coin.height/2) - 8;

        this.markers.addChild(cost);

        /* Also add a click marker on the tile */
        if (this.currentTurn == 0) {
            let tileIndex = ((costY-1) * 6) + (costX-1);
            this.tiles.getChildAt(tileIndex).events.onInputDown.add(this.onTileClicked, this);
        }
    },
    /* Get all available neighboors to a cell */
    findNeighboors(cellX, cellY) {
        let neighboors = new Array();

        for (let x=-1; x<=1; x++) {
            for (let y=-1; y<=1; y++) {
                if (Math.abs(x) != Math.abs(y)) {
                    let newX = (cellX-1) + x;
                    let newY = (cellY-1) + y;
                    if (newX >= 0 && newX < 6 && newY >= 0 && newY < 6 ) {
                        neighboors.push({x:newX+1, y:newY+1});
                    }
                }
            }
        }

        return neighboors;
    },
    createUnit(tileX, tileY, sprite) {
        let tileSize = this.tiles.getChildAt(0).width + 3;

        let unit = new Unit(this.game, this.tiles.x + (tileX * tileSize), this.tiles.y + (tileY * tileSize), sprite);
        this.units.addChild(unit);

        let emitter = this.game.add.emitter(unit.x + 12, unit.y, 25);
        emitter.makeParticles('gui:cost-primary');

        emitter.minParticleScale = emitter.maxParticleScale = RATIO;
        let speed = 100;

        emitter.minParticleSpeed.setTo(speed * -1, speed * -1);
        emitter.maxParticleSpeed.setTo(speed, speed);

        emitter.minRotation = 0;
        emitter.maxRotation = 0;

        emitter.start(true, 500, null, 10);
    },
    hideMarkers() {
        this.markers.forEach(function(item) {
            this.game.add.tween(item).to({alpha:0}, 100).start();
        }, this);
    },
    disableTilesClick() {
        for (let i=0; i<this.tiles.length; i++) {
            this.tiles.getChildAt(i).events.onInputDown.removeAll();
        }
    },
    disableTilesFading() {
        for (let i=0; i<this.tiles.length; i++) {
            this.game.add.tween(this.tiles.getChildAt(i)).to({alpha:1}).start();
        }
    },
    hideInterface() {
        this.interface.forEach(function(item) {
            let tween = this.game.add.tween(item).to({x:item.outsideX}, 530, Phaser.Easing.Bounce.Out).start();
        }, this);
    },
    showInterface() {
        this.positions = new Array();

        this.interface.forEach(function(item) {
            item.init();
            let tween = this.game.add.tween(item).to({x:item.originalX}, 530, Phaser.Easing.Bounce.Out).start();
        }, this);
    },
    /* Event called when a tile is clicked by the active player */
    onTileClicked(tile, pointer) {
        this.createUnit(tile.gridX, tile.gridY, 'peon');
        this.endTurn();
    },
    /* Event called when a dice stop rolling */
    onDiceRollStopped(dice, value) {
        this.positions.push(value);
        if (this.positions.length >= 2) {
            this.createMarkers();
        }
    }
};
