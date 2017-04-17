var Tactical = Tactical || {};

Tactical.Game = function() {};

Tactical.Game.prototype = {
    /* Phaser */
    create: function() {
        this.createTiles();

        this.markers = this.game.add.group();
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
            }
        }

        this.tiles.x = (this.game.width - this.tiles.width) / 2;
        this.tiles.y = this.tiles.x;
    },
    createInterface() {
        this.interface = this.game.add.group();
        let background = this.interface.create(0, this.tiles.y + this.tiles.height + this.tiles.y, 'gui:position');
        background.x = (this.game.width - background.width) / 2;

        this.positions = new Array();
        this.positions.push( Math.floor((Math.random() * 6) + 1) );
        this.positions.push( Math.floor((Math.random() * 6) + 1) );
        let bmpText = this.game.add.bitmapText(background.x + 76, background.y + (background.height/2) - 4, 'font:gui', this.positions[0], 8);
        bmpText = this.game.add.bitmapText(background.x + 156, background.y + (background.height/2) - 4, 'font:gui', this.positions[1], 8);

        this.createMarkers();
    },
    createMarkers() {
        this.markers.removeAll();

        let main = new Array();
        main.push({x:this.positions[0], y:this.positions[1]});
        if (main[0].x != main[0].y) {
            main.push({x:this.positions[1], y:this.positions[0]});
        }

        for (let i=0; i<main.length; i++) {
            this.createCost(main[i].x, main[i].y, 1);
            let neighboors = this.findNeighboors(main[i].x, main[i].y);

            for (let j=0; j<neighboors.length; j++) {
                this.createCost(neighboors[j].x, neighboors[j].y, 5);
            }
            console.log(neighboors);
        }
    },
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
    },
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
    }
};
