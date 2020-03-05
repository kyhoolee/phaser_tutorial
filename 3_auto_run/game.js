// Follow better template of object-oriented javascript

var game;

var gameOptions = {
    // player gravity
    playerGravity: 900,
    // player friction when on wall
    playerGrip: 100,
    // player horizontal speed
    playerSpeed: 200,
    // player jump force
    playerJump: 400,
    // player double jump force
    playerDoubleJump: 300 
};

// By default, it is fired when the entire page loads, 
// including its content (images, CSS, scripts, etc.).
window.onload = function() {
    var gameConfig = {
        type: Phaser.CANVAS,
        width: 640,
        height: 480,
        backgroundColor: 0x444444,
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 0
                },
                debug: true
            }
        }, 
        // two scene: preload --> playGame 
        scene: [preloadGame, playGame]
    };

    game = new Phaser.Game(gameConfig);
}




class preloadGame extends Phaser.Scene {
    constructor() {
        super("PreloadGame");
    }


    preload() {
        this.load.tilemapTiledJSON("level", "assets/level.json");
        this.load.image("tile", "assets/tile.png");
        this.load.image("hero", "assets/hero.png");

    }


    create() {
        this.scene.start("PlayGame");
    }
}


class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }

    create() {
        this.initMap();
        this.initHero();
        this.initInput();
        this.initCamera();
    }




    initHero() {
        // adding hero and enable physics
        this.hero = this.physics.add.sprite(300, 376, "hero");
        // setting hero horizontal speed 
        this.hero.body.velocity.x = gameOptions.playerSpeed;
        // the hero can jump 
        this.canJump = true;
        this.canDoubleJump = false;
        this.onWall = false;
    }

    initMap() {
        // create level-tilemap
        this.map = this.make.tilemap({
            key:"level"
        });
        // Adding tile to tilemap
        var tile = this.map.addTilesetImage("tileset01", "tile")
        
        // which layer should render - layer01
        this.layer = this.map.createStaticLayer("layer01", tile);
        // tile 1 has collision enabled
        // Update: collision tile 1 to 2
        this.layer.setCollisionBetween(1, 2);

    }


    initCamera() {
        this.cameras.main.setBounds(0,0,1920, 1440);
        this.cameras.main.startFollow(this.hero);
    }

    initInput() {
        this.input.on("pointerdown", this.handleJump, this);
    }

    handleJump() {
        // hero can jump conditions
        if(
            (this.canJump && this.hero.body.blocked.down)
            || this.onWall
        ) {
            // apply jump force
            this.hero.body.velocity.y = -gameOptions.playerJump;
            
            if(this.onWall) {
                // change horizontal velocity - jump off wall
                this.setPlayerXVelocity(true);
            }
            this.canJump = false;
            this.onWall = false;
            // now can double jump
            this.canDoubleJump = true;
        } else {

            // handle double-jump case
            if(this.canDoubleJump) {
                this.canDoubleJump = false;
                this.hero.body.velocity.y = -gameOptions.playerDoubleJump;
            }
        }
    }

    update() {
        this.setDefaultValues();
        // handle collisions 
        this.checkCollision();
    }

    setDefaultValues() {
        this.hero.body.gravity.y = gameOptions.playerGravity;
        this.onWall = false;
        this.setPlayerXVelocity(true);
    }

    checkCollision() {
        this.physics.world.collide(this.hero, this.layer, this.draftCheck, null, this);
    }



    setPlayerXVelocity(sameDirection, shouldStop) {
        if(shouldStop) {
            this.hero.body.velocity.x = 0;
        } else {
            this.hero.body.velocity.x = gameOptions.playerSpeed 
                // hero-facing
                * (this.hero.flipX ? -1: 1)
                // keep direction or not
                * (sameDirection ? 1: -1);
        }
    }
    
    
    draftCheck(hero, layer){
        var shouldStop = false;

        var blockedDown = hero.body.blocked.down;
        var blockedLeft = hero.body.blocked.left;
        var blockedRight = hero.body.blocked.right;

        // if the hero hits something, no double jump is allowed
        this.canDoubleJump = false;

        // hero on the ground
        if(blockedDown) {
            this.canJump = true;
            this.onWall = false;

            // if touch stop-tile
            if(layer.index == 2) {
                shouldStop = true;
            }
        

            // hero on the ground and touching a wall on the right
            if(blockedRight) {
                // flip hero-sprite
                hero.flipX = true;
            }

            // hero on the ground and touching a wall on the right
            if(blockedLeft) {
                // default orientation of sprite 
                hero.flipX = false;
            }

            // Because user change face --> so keep moving the same direction 
            this.setPlayerXVelocity(true, shouldStop);
            // console.log("grounded-position::", JSON.stringify(hero.body.center));
            // console.log("grounded-velocity:: ", hero.body.velocity);
            // console.log("grounded-blocked:: ", hero.body.blocked);
        } else {

            // change facing depend on wall-side
            if(blockedRight){
                // horizontal flipping hero sprite
                hero.flipX = true;
            }
            // hero on the ground and touching a wall on the right
            if(blockedLeft){
                // default orientation of hero sprite
                hero.flipX = false;
            }

            // hero NOT on the ground and touching a wall
            if((blockedRight || blockedLeft)) {
                hero.scene.onWall = true;
                this.canDoubleJump = false;
                
                hero.body.gravity.y = 0;
                hero.body.velocity.y = gameOptions.playerGrip;

                // if on the wall mean that moving stick to wall --> opposite to facing
                this.setPlayerXVelocity(false, shouldStop);
            } else {
                this.setPlayerXVelocity(true, shouldStop);
            }
            
            console.log("off-position::", JSON.stringify(hero.body.center));
            console.log("off-velocity:: ", hero.body.velocity);
            console.log("off-blocked:: ", hero.body.blocked);
        }

    }




}