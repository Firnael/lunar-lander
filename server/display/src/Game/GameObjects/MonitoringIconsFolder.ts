import Phaser from 'phaser';

/**
 * Used inside a {@link MonitoringScreen} to store icons of connected players.
 */
export class MonitoringIconsFolder extends Phaser.GameObjects.Container {
    private BACKGROUND_RECTANGLE_SIZE = new Phaser.Math.Vector2(600, 500);
    private TITLE_RECTANGLE_SIZE = new Phaser.Math.Vector2(100, 30);
    private TITLE_TEXT_OFFSET = new Phaser.Math.Vector2(4, 4);
    private BACKGROUND_COLOR = 0x001301;
    private STROKE_COLOR = 0x76ce81;

    // Keep references
    private backgroundRectangle: Phaser.GameObjects.Rectangle;
    private titleRectangle: Phaser.GameObjects.Rectangle;
    private titleText: Phaser.GameObjects.Text;

    // Local stuff
    private initialPosition: Phaser.Math.Vector2;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.initialPosition = new Phaser.Math.Vector2(x, y);

        // create background rectangle
        this.backgroundRectangle = this.scene.add.rectangle(0, 0, this.BACKGROUND_RECTANGLE_SIZE.x, this.BACKGROUND_RECTANGLE_SIZE.y, this.BACKGROUND_COLOR)
            .setStrokeStyle(2, this.STROKE_COLOR)
            .setOrigin(0, 0);

        // create player color rectangle
        this.titleRectangle = this.scene.add.rectangle(this.backgroundRectangle.x, -this.TITLE_RECTANGLE_SIZE.y, this.TITLE_RECTANGLE_SIZE.x, this.TITLE_RECTANGLE_SIZE.y, this.BACKGROUND_COLOR)
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

        // set interactible (drag'n'drop & bring to top on click)
        this.titleRectangle.setInteractive();
        this.scene.input.setDraggable(this.titleRectangle);
        this.titleRectangle.on('dragstart', (pointer: Phaser.Input.Pointer) => {
            this.initialPosition = new Phaser.Math.Vector2(this.x, this.y);
            this.parentContainer.bringToTop(this);
        });
        this.titleRectangle.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            const offsetX = pointer.x - pointer.downX;
            const offsetY = pointer.y - pointer.downY;
            this.x = this.initialPosition.x + offsetX;
            this.y = this.initialPosition.y + offsetY;
        });
        this.titleRectangle.on('pointerdown', (pointer: Phaser.Input.Pointer, x: number, y: number) => {
            this.parentContainer.bringToTop(this);
        });

        this.scene.add.existing(this);
    }
}
