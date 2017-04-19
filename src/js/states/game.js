var Tactical = Tactical || {};

Tactical.Game = function() {};

Tactical.Game.prototype = {
    /* Phaser */
    create: function() {
        this.createTiles();

        this.markersContainer = this.game.add.group();
        this.units = this.game.add.group();

        this.createInterface();

        this.currentTurn = 1;
        //this.currentTurn = 0;
        this.nextTurn();
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

        this.resolveMap();
    },
    resolveMap() {
        let attacker = this.units.children[this.units.children.length - 1];

        /* Setup our directions */
        let directions = [{x:-1, y:0}, {x:1, y:0}, {x:0, y:-1}, {x:0, y:1}];
        directions.forEach(function(direction) {
            direction.enemy = 0;
            direction.complete = false;
            direction.attacker = null;
        }, this);

        /* Let's do it ! */
        for (let i=1; i<6; i++) {
            directions.forEach(function(direction) {
                if (!direction.complete) {
                    let newX = attacker.gridX + (direction.x * i);
                    let newY = attacker.gridY + (direction.y * i);

                    if (newX >= 0 && newY >= 0 && newX < 6 && newY < 6) {
                        this.units.forEach(function(unit) {
                            if (unit.gridX == newX && unit.gridY == newY) {
                                if (unit.player == attacker.player) {
                                    direction.complete = true;
                                    direction.attacker = unit;
                                } else {
                                    direction.enemy++;
                                }
                            }
                        }, this);
                    } else {
                        direction.complete = true;
                        direction.enemy = 0;
                    }
                }
            }, this);
        }

        console.log(directions);
        /* Check horizontal matches */
        

        /* Check vertical matches */

        this.nextTurn();
    },
    AIPickTile() {
        let primaryTiles = new Array();
        let secondaryTiles = new Array();

        this.markersContainer.forEach(function(item) {
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

        for (let y=0; y<6; y++) {
            for (let x=0; x<6; x++) {
                let tile = this.tiles.create(x, y, 'tile:grass');
                tile.scale.setTo(RATIO, RATIO);
                tile.x = x * (tile.width + 3);
                tile.y = y * (tile.height + 3);

                tile.gridX = x;
                tile.gridY = y;

                tile.inputEnabled = false;
                tile.events.onInputDown.add(this.onTileClicked, this);
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
        /* Be sure no markers are present, should not be, but to be sure ... */
        this.markersContainer.removeAll();

        this.markers = new Array();

        /* Get primary tile */
        this.markers.push({x:this.positions[0], y:this.positions[1], cost:1, free:true});
        if (this.positions[0] != this.positions[1]) {
            this.markers.push({x:this.positions[1], y:this.positions[0], cost:1, free:true});
        }

        /* Get secondary tile */
        this.markers.forEach(function(item) {
            this.findNeighboors(item.x, item.y).forEach(function(neighboor) {
                let isUnique = true;
                this.markers.forEach(function(tile) {
                    if (tile.x == neighboor.x && tile.y == neighboor.y) {
                        isUnique = false;
                    }
                }, this);
                if (isUnique) {
                    this.markers.push({x:neighboor.x, y:neighboor.y, cost:5, free:true});
                }
            }, this);
        }, this);

        /* No units there ? */
        this.markers.forEach(function(tile) {
            this.units.forEach(function(unit) {
                if (unit.gridX == tile.x-1 && unit.gridY == tile.y-1) {
                    tile.free = false;
                }
            }, this);
        }, this);

        /* Create the non-occupied markers */
        this.markers.forEach(function(tile) {
            if (tile.free) {
                this.createCost(tile.x, tile.y, tile.cost);
            }
        }, this);

        this.fadeOutTiles();
    },
    fadeOutTiles() {
        let tilesFaded = 0;
        for (let i=0; i<this.tiles.length; i++) {
            let tween = this.game.add.tween(this.tiles.getChildAt(i)).to({alpha:0.7}, 200).start();
            tween.onComplete.add(function(item) {
                tilesFaded++;
                if (tilesFaded >= this.tiles.length) {
                    this.fadeInTiles(1);
                }
            }, this);
        }
    },
    fadeInTiles(costValue) {
        let tilesFadedCount = tilesFadedTotal = 0;

        this.markers.forEach(function(item) {
            if (item.cost === costValue) {
                tilesFadedTotal++;
                let tween = this.game.add.tween(this.tiles.getChildAt(((item.y-1)*6)+(item.x-1))).to({alpha: 1}, 200).start();
                tween.onComplete.add(function() {
                    if (++tilesFadedCount >= tilesFadedTotal) {
                        this.showMarkers(costValue);
                    }
                }, this);
            }
        }, this);
    },
    showMarkers(costValue) {
        let markersCount = markersTotal = 0;

        this.markersContainer.forEach(function(item) {
            if (item.value === costValue) {
                markersTotal++;

                this.game.add.tween(item.coin).to({alpha:1}, 200).start();
                let tween = this.game.add.tween(item).to({alpha: 1}, 200).start();
                tween.onComplete.add(function() {
                    if (++markersCount >= markersTotal) {
                        this.markersVisible(costValue);
                    }
                }, this);
            }
        }, this);

        /* When no markers are free ... */
        if (markersTotal == 0) {
            this.markersVisible(costValue);
        }
    },
    markersVisible(costValue) {
        if (costValue == 1 ) {
            this.fadeInTiles(5);
        } else {
            if (this.currentTurn == 1) {
                this.AIPickTile();
            }
        }

    },
    /* Create a COST icon and label in a tile */
    createCost(costX, costY, costValue) {
        let coin = this.markersContainer.create(0, 0, 'gui:cost-' + (costValue == 1 ? "primary" : "secondary"));
        coin.scale.setTo(RATIO, RATIO);
        coin.x = this.tiles.x;
        coin.y = this.tiles.y;
        coin.x += ((costX-1) * (coin.width+3));
        coin.y += ((costY-1) * (coin.height+3));
        coin.alpha = 0;

        let cost = this.game.add.bitmapText(0, 0, 'font:gui', costValue, 16);
        cost.gridX = costX;
        cost.value = costValue;
        cost.gridY = costY;
        cost.x = coin.x + (coin.width/2) + 0;
        cost.y = coin.y + (coin.height/2) - 8;
        this.markersContainer.addChild(cost);
        cost.alpha = 0;

        /* Cross-over for quick reference */
        coin.cost = cost;
        cost.coin = coin;

        /* If it's the player's turn, enable click */
        if (this.currentTurn == 0) {
            let tileIndex = ((costY-1) * 6) + (costX-1);
            this.tiles.getChildAt(tileIndex).inputEnabled = true;
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
        unit.gridX = tileX;
        unit.gridY = tileY;
        unit.player = this.currentTurn;
        this.units.addChild(unit);

        let emitter = this.game.add.emitter(unit.x + 12, unit.y, 25);
        emitter.makeParticles('gui:cost-primary');
        emitter.minParticleScale = emitter.maxParticleScale = RATIO;

        let speed = 100;
        emitter.minParticleSpeed.setTo(speed * -1, speed * -1);
        emitter.maxParticleSpeed.setTo(speed, speed);
        emitter.minRotation = emitter.maxRotation = 0;

        emitter.start(true, 500, null, 20);
    },
    hideMarkers() {
        this.markersContainer.forEach(function(item) {
            this.game.add.tween(item).to({alpha:0}, 100).start();
        }, this);
    },
    disableTilesClick() {
        for (let i=0; i<this.tiles.length; i++) {
            //this.tiles.getChildAt(i).events.onInputDown.remove(this.onTileClicked, this);
            this.tiles.getChildAt(i).inputEnabled = false;
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
            this.positions = [2, 1];
            this.createMarkers();
        }
    }
};
