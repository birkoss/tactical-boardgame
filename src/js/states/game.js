var Tactical = Tactical || {};

Tactical.Game = function() {};

Tactical.Game.prototype = {
    /* Phaser */
    create: function() {
        this.createTiles();

        this.markers = this.game.add.group();
        this.units = this.game.add.group();

        this.createInterface();

    },
    update: function() {
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

        let interfaceX = (this.game.width/2);
        let interfaceY = (this.tiles.y * 2) + this.tiles.height;

        let spinner = new Spinner(this.game, (interfaceX/2) - 50, interfaceY);
        this.interface.addChild(spinner);

        spinner = new Spinner(this.game, interfaceX + this.interface.getChildAt(0).x - 50, interfaceY);
        this.interface.addChild(spinner);

        //this.createMarkers();
    },
    createMarkers() {
        this.markers.removeAll();

        for (let i=0; i<this.tiles.length; i++) {
            this.tiles.getChildAt(i).alpha = 0.7;
        }

        let main = new Array();
        main.push({x:this.positions[0], y:this.positions[1]});
        if (main[0].x != main[0].y) {
            main.push({x:this.positions[1], y:this.positions[0]});
        }

        for (let i=0; i<main.length; i++) {
            this.createCost(main[i].x, main[i].y, 1);
            this.tiles.getChildAt(((main[i].y-1)*6)+(main[i].x-1)).alpha = 1;
            let neighboors = this.findNeighboors(main[i].x, main[i].y);

            for (let j=0; j<neighboors.length; j++) {
                this.createCost(neighboors[j].x, neighboors[j].y, 5);
                this.tiles.getChildAt(((neighboors[j].y-1)*6)+(neighboors[j].x-1)).alpha = 1;
            }
        }
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
        cost.x = coin.x + (coin.width/2) + 0;
        cost.y = coin.y + (coin.height/2) - 8;

        this.markers.addChild(cost);

        /* Also add a click marker on the tile */
        let tileIndex = ((costY-1) * 6) + (costX-1);
        this.tiles.getChildAt(tileIndex).events.onInputDown.add(this.onTileClicked, this);
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

        this.markers.removeAll();
        let unit = new Unit(this.game, this.tiles.x + (tileX * tileSize), this.tiles.y + (tileY * tileSize), 'peon');
        this.units.addChild(unit);
    },
    disableTilesClick() {
        for (let i=0; i<this.tiles.length; i++) {
            this.tiles.getChildAt(i).events.onInputDown.removeAll();
        }
    },
    disableTilesFading() {
        for (let i=0; i<this.tiles.length; i++) {
            this.tiles.getChildAt(i).alpha = 1;
        }
    },
    hideInterface() {
        console.log(this.interface);
        console.log(this.interface.x);
        console.log(this.interface.width);
        let tween = this.game.add.tween(this.interface).to({x:-this.game.width}, 130).start();
    },
    /* Event called when a tile is clicked by the active player */
    onTileClicked(tile, pointer) {
        this.createUnit(tile.gridX, tile.gridY, 'peon');
        this.disableTilesClick();
        this.disableTilesFading();
        this.hideInterface();
    }
};
