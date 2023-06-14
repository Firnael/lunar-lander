import Phaser from 'phaser';

/**
 * Used inside a {@link MonitoringScreen} to store icons of connected players.
 */
export class MonitoringIconsFolder extends Phaser.GameObjects.Container {
    private BACKGROUND_RECTANGLE_SIZE: Phaser.Math.Vector2 = new Phaser.Math.Vector2(600, 500);
    private TITLE_RECTANGLE_SIZE: Phaser.Math.Vector2 = new Phaser.Math.Vector2(100, 30);
    private TITLE_TEXT_OFFSET: Phaser.Math.Vector2 = new Phaser.Math.Vector2(4, 4);

    private BACKGROUND_COLOR: number = 0x001301;
    private STROKE_COLOR: number = 0x76ce81;

    // Keep references
    private backgroundRectangle: Phaser.GameObjects.Rectangle;
    private titleRectangle: Phaser.GameObjects.Rectangle;
    private titleText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;

        // create background rectangle
        this.backgroundRectangle = this.scene.add.rectangle(0, 0, this.BACKGROUND_RECTANGLE_SIZE.x, this.BACKGROUND_RECTANGLE_SIZE.y, this.BACKGROUND_COLOR)
            .setStrokeStyle(2, this.STROKE_COLOR)
            .setOrigin(0, 0);

        // create player color rectangle
        this.titleRectangle = this.scene.add.rectangle(0, -this.TITLE_RECTANGLE_SIZE.y, this.TITLE_RECTANGLE_SIZE.x, this.TITLE_RECTANGLE_SIZE.y, this.BACKGROUND_COLOR)
            .setStrokeStyle(2, this.STROKE_COLOR)
            .setOrigin(0, 0);

        // create player name text
        this.titleText = this.scene.add.text(
            this.titleRectangle.x + this.TITLE_TEXT_OFFSET.x, this.titleRectangle.y + this.TITLE_TEXT_OFFSET.y, 'PLAYERS', {
            font: '20px Greenscr',
            align: 'center',
            color: '#' + this.STROKE_COLOR.toString(16),
        }).setOrigin(0, 0).setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 2);

        // add elements to container
        this.add([
            this.backgroundRectangle,
            this.titleRectangle,
            this.titleText,
        ]);

        this.scene.add.existing(this);
    }
}
