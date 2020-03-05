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
}
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
                }
            }
        },
       scene: [preloadGame, playGame]
    }
    game = new Phaser.Game(gameConfig);
}
class preloadGame extends Phaser.Scene{
    constructor(){
        super("PreloadGame");
    }
    preload(){
        this.load.tilemapTiledJSON("level", "level.json");
        this.load.image("tile", "tile.png");
        this.load.image("hero", "hero.png");
    }
    create(){
        this.scene.start("PlayGame");
    }
}
class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
    }
    create(){
        // creation of "level" tilemap
        this.map = this.make.tilemap({
            key: "level"
        });

        // adding tiles (actually one tile) to tilemap
        var tile = this.map.addTilesetImage("tileset01", "tile");

        // tile 1 (the black tile) has the collision enabled
        this.map.setCollision(1);

        // which layer should we render? That's right, "layer01"
        this.layer = this.map.createStaticLayer("layer01", tile);

        // adding the hero sprite and enabling ARCADE physics for the hero
        this.hero = this.physics.add.sprite(300, 376, "hero");

        // setting hero horizontal speed
        this.hero.body.velocity.x = gameOptions.playerSpeed;

        // the hero can jump
        this.canJump = true;

        // the hern cannot double jump
        this.canDoubleJump = false;

        // the hero is not on the wall
        this.onWall = false;

        // waiting for player input
        this.input.on("pointerdown", this.handleJump, this);

        // set workd bounds to allow camera to follow the player
        this.cameras.main.setBounds(0, 0, 1920, 1440);

        // making the camera follow the player
        this.cameras.main.startFollow(this.hero);
    }
    handleJump(){
        // the hero can jump when:
        // canJump is true AND the hero is on the ground (blocked.down)
        // OR
        // the hero is on the wall
        if((this.canJump && this.hero.body.blocked.down) || this.onWall){

            // applying jump force
            this.hero.body.velocity.y = -gameOptions.playerJump;

            // is the hero on a wall?
            if(this.onWall){

                // change the horizontal velocity too. This way the hero will jump off the wall
                this.setPlayerXVelocity(true);
            }

            // hero can't jump anymore
            this.canJump = false;

            // hero is not on the wall anymore
            this.onWall = false;

            // the hero can now double jump
            this.canDoubleJump = true;
        }
        else{

            // cam the hero make the doubple jump?
            if(this.canDoubleJump){

                // the hero can't double jump anymore
                this.canDoubleJump = false;

                // applying double jump force
                this.hero.body.velocity.y = -gameOptions.playerDoubleJump;
            }
        }
    }
    update(){

        // set some default gravity values. Look at the function for more information
        this.setDefaultValues();

        // handling collision between the hero and the tiles
        this.physics.world.collide(this.hero, this.layer, function(hero, layer){

            // some temporary variables to determine if the player is blocked only once
            var blockedDown = hero.body.blocked.down;
            var blockedLeft = hero.body.blocked.left
            var blockedRight = hero.body.blocked.right;

            // if the hero hits something, no double jump is allowed
            this.canDoubleJump = false;

            // hero on the ground
            if(blockedDown){

                // hero can jump
                this.canJump = true;
            }

            // hero on the ground and touching a wall on the right
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
            if((blockedRight || blockedLeft) && !blockedDown){

                // hero on a wall
                hero.scene.onWall = true;

                // remove gravity
                hero.body.gravity.y = 0;

                // setting new y velocity
                hero.body.velocity.y = gameOptions.playerGrip;
            }

            // adjusting hero speed according to the direction it's moving
            this.setPlayerXVelocity(!this.onWall || blockedDown);
        }, null, this)
    }

    // default values to be set at the beginning of each update cycle,
    // which may be changed according to what happens into "collide" callback function
    // (if called)
    setDefaultValues(){
        this.hero.body.gravity.y = gameOptions.playerGravity;
        this.onWall = false;
        this.setPlayerXVelocity(true);
    }

    // sets player velocity according to the direction it's facing, unless "defaultDirection"
    // is false, in this case multiplies the velocity by -1
    setPlayerXVelocity(defaultDirection){
        this.hero.body.velocity.x = gameOptions.playerSpeed * (this.hero.flipX ? -1 : 1) * (defaultDirection ? 1 : -1);
    }
}
