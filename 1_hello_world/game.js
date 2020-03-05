
// 1. Main config for game 
var config = {
    type: Phaser.AUTO, // Type auto scale 
    width: 800, // default width
    height: 600, // default height
    physics: { // physics declaration 
        default: 'arcade', // arcade physic model
        arcade: {
            gravity: { y: 200 } // gravity on y-axis
        }
    },
    scene: { // game scene using preload and create --> can use more other 
        preload: preload,
        create: create
    }
};

// 2. Init game with this config
var game = new Phaser.Game(config);


// Declare preload 
function preload ()
{
    // object 'this' is the main game 
    // Loading resource 
    this.load.setBaseURL('http://labs.phaser.io');

    this.load.image('sky', 'assets/skies/space3.png');
    this.load.image('logo', 'assets/sprites/phaser3-logo.png');
    this.load.image('red', 'assets/particles/red.png');
}


// Declare create 
function create ()
{
    // load sky as background
    this.add.image(400, 300, 'sky');

    // create particle effect 
    var particles = this.add.particles('red');

    // particle emitter properties 
    var emitter = particles.createEmitter({
        speed: 100,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD'
    });

    // 
    var logo = this.physics.add.image(400, 100, 'logo');

    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);

    emitter.startFollow(logo);
}