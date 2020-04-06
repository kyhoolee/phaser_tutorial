//import 'phaser';
import preloadGame from './scenes/preloadGame';
import playGame from './scenes/playGame';


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

const game = new Phaser.Game(gameConfig);



