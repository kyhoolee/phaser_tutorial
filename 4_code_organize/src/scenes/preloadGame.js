

export default class preloadGame extends Phaser.Scene {
    constructor() {
        super("PreloadGame");
    }


    preload() {
        this.load.tilemapTiledJSON("level", "../assets/level.json");
        this.load.image("tile", "../assets/tile.png");
        this.load.image("hero", "../assets/hero.png");

    }


    create() {
        this.scene.start("PlayGame");
    }
}

