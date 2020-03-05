
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y:500},
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create, 
        update: update
    }
};


var game = new Phaser.Game(config);
var gameOver = false;
var score = 0;
var scoreText;

function preload() {

    this.load.image('sky', './assets/sky.png');
    this.load.image('ground', './assets/platform.png');
    this.load.image('star', './assets/star.png');
    this.load.image('bomb', './assets/bomb.png');

    // this is special for loading spritesheet 
    this.load.spritesheet('dude', 
        './assets/dude.png', 
        {frameWidth: 32, frameHeight: 48});
}


function create() {
    // init keyboard
    cursors = this.input.keyboard.createCursorKeys();

    initBackground(this);
    initPlatform(this);
    initPlayer(this, platforms);
    initStar(this);
    initScore(this);
    initBomb(this);
}

function initBomb(game) {
    bombs = game.physics.add.group();
    game.physics.add.collider(bombs, platforms);
    game.physics.add.collider(player, bombs, hitBomb, null, game)
}

function hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}

function initScore(game) {
    scoreText = game.add.text(16, 16, 
        'score: 0', 
        {fontSize: '32px', fill: '#000'}
    );
}

function initStar(game) {
    stars = game.physics.add.group({
        key: 'star',
        repeat: 11, 
        setXY: {x:12, y:0, stepX: 70}
    });

    stars.children.iterate(function(child){
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    game.physics.add.collider(stars, platforms);
    game.physics.add.overlap(player, stars, collectStar, null, game);



}

function collectStar(player, star) {
    star.disableBody(true, true);
    //stars.remove(star);
    //star.destroy();

    console.log("stars::", stars.getLength(), stars.countActive(true));

    score += 10;
    scoreText.setText('Score: ' + score);
    var c = stars.countActive(true) == 0;
    console.log("check:: ", c);
    if(stars.countActive(true) == 0) {

        console.log("run here::", stars.getLength(), stars.countActive(true));
        stars.children.iterate(function(child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 400) ? 
            Phaser.Math.Between(400, 800) 
            : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }
}

function initPlayer(game) {

    // 1. Physic properties of sprite
    /*
    This creates a new sprite called player, 
    positioned at 100 x 450 pixels from the bottom of the game. 
    The sprite was created via the Physics Game Object Factory (this.physics.add) 
    which means it has a Dynamic Physics body by default. 
    */
    player = game.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);
    game.physics.add.collider(player, platforms);

    // 2. Animation properties of sprite

    // Left animation 
    game.anims.create({
        key: 'left',
        frames: game.anims.generateFrameNumbers(
            'dude',
            {
                start: 0, end: 3
            }
        ),
        frameRate: 10,
        repeat: -1
    });

    // Turn animation 
    game.anims.create({
        key: 'turn',
        frames: [{key: 'dude', frame: 4}],
        frameRate: 20
    });

    // Right animation 
    game.anims.create({
        key: 'right',
        frames: game.anims.generateFrameNumbers(
            'dude',
            {
                start: 5, end: 8
            }
        ),
        frameRate: 10,
        repeat: -1
    });

    // ... Can create more with jump, down, ... animations
}

function initBackground(game) {
    // Add background
    game.add.image(400, 300, 'sky');
    //this.add.image(400, 300, 'star');
}

function initPlatform(game) {
    // Create platform --> not using var --> auto-global variable 
    platforms = game.physics.add.staticGroup();

    //400 x 32
    // width: 800,
    // height: 600,
    platforms.create(400, 590, 'ground')
        .setScale(2)
        .refreshBody();

    /*
    Game coordinate 
    ----------------- width - x axis -->>>
    |
    |
    |
    height
    |
    y axis
    |
    Y
    Y
    Y
    |
    */    
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(700, 220, 'ground');

    return platforms;
}


function update() {
    if (gameOver) {
        return;
    }


    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }
    // current = Date.now()
    // if(current % 1211 == 0) {
        
    // }
    if (cursors.up.isDown && 
        (player.body.touching.down 
            // || player.body.touching.left
            // || player.body.touching.right
            )) {
        //player.setAccelerationY(-400);
        player.setVelocityY(-450);
        //console.log(JSON.stringify(player.body.touching));
    } 

    if(!player.body.touching.down) {
        //console.log("position::", JSON.stringify(player.body.center));
        //console.log("velocity::", JSON.stringify(player.body.velocity));
        if(player.body.velocity.y > 0) {
            player.setAccelerationY(70);
        }
    }

    if(cursors.down.isDown) {
        console.log("stars::", (stars.getLength()));
    }
}