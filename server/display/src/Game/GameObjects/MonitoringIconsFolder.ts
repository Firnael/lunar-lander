import Phaser, { GameObjects } from 'phaser';
import { MonitoringIcon } from './MonitoringIcon';

/**
 * Used inside a {@link MonitoringScreen} to store icons of connected players.
 */
export class MonitoringIconsFolder extends Phaser.GameObjects.Container {
    private BACKGROUND_RECTANGLE_SIZE = new Phaser.Math.Vector2(600, 500);
    private TITLE_RECTANGLE_SIZE = new Phaser.Math.Vector2(100, 30);
    private CHANGE_PAGE_RECTANGLE_SIZE = new Phaser.Math.Vector2(30, 30);
    private TITLE_TEXT_OFFSET = new Phaser.Math.Vector2(4, 4);
    private PAGES_TEXT_OFFSET = new Phaser.Math.Vector2(8, 5);
    private BACKGROUND_COLOR = 0x001301;
    private STROKE_COLOR = 0x76ce81;
    private TEXTS_OPTIONS = {
        font: '20px Greenscr',
        align: 'center',
        color: '#' + this.STROKE_COLOR.toString(16),
    };
    private ICONS_PER_PAGE = 20;

    // Keep references
    private backgroundRectangle: Phaser.GameObjects.Rectangle;
    private titleRectangle: Phaser.GameObjects.Rectangle;
    private titleText: Phaser.GameObjects.Text;
    private previousPageRectangle: Phaser.GameObjects.Rectangle;
    private previousPageText: Phaser.GameObjects.Text;
    private nextPageRectangle: Phaser.GameObjects.Rectangle;
    private nextPageText: Phaser.GameObjects.Text;
    private currentPageRectangle: Phaser.GameObjects.Rectangle;
    private currentPageText: Phaser.GameObjects.Text;
    
    // Local stuff
    private initialPosition: Phaser.Math.Vector2;
    private currentPage: number = 1;
    private icons: MonitoringIcon[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.initialPosition = new Phaser.Math.Vector2(x, y);

        // create background rectangle
        this.backgroundRectangle = this.scene.add.rectangle(
            0, 0, this.BACKGROUND_RECTANGLE_SIZE.x, this.BACKGROUND_RECTANGLE_SIZE.y, this.BACKGROUND_COLOR)
            .setStrokeStyle(2, this.STROKE_COLOR)
            .setOrigin(0, 0);

        // create player color rectangle
        this.titleRectangle = this.scene.add.rectangle(
            this.backgroundRectangle.x, -this.TITLE_RECTANGLE_SIZE.y,
            this.TITLE_RECTANGLE_SIZE.x, this.TITLE_RECTANGLE_SIZE.y, this.BACKGROUND_COLOR)
            .setStrokeStyle(2, this.STROKE_COLOR)
            .setOrigin(0, 0);

        // create title text
        this.titleText = this.scene.add.text(
            this.titleRectangle.x + this.TITLE_TEXT_OFFSET.x,
            this.titleRectangle.y + this.TITLE_TEXT_OFFSET.y,
            'PLAYERS', this.TEXTS_OPTIONS
        ).setOrigin(0, 0).setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 2);

        // create "previous page" rectangle and text
        this.previousPageRectangle = this.scene.add.rectangle(
            this.backgroundRectangle.x + this.backgroundRectangle.width - this.CHANGE_PAGE_RECTANGLE_SIZE.x * 3, // x
            this.backgroundRectangle.height, // y
            this.CHANGE_PAGE_RECTANGLE_SIZE.x, this.CHANGE_PAGE_RECTANGLE_SIZE.y, this.BACKGROUND_COLOR)
            .setStrokeStyle(2, this.STROKE_COLOR)
            .setOrigin(0, 0);

        this.previousPageText = this.scene.add.text(
            this.previousPageRectangle.x + this.PAGES_TEXT_OFFSET.x,
            this.previousPageRectangle.y + this.PAGES_TEXT_OFFSET.y,
            '<', this.TEXTS_OPTIONS
        ).setOrigin(0, 0).setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 2);

        // create "next page" rectangle and text
        this.nextPageRectangle = this.scene.add.rectangle(
            this.backgroundRectangle.x + this.backgroundRectangle.width - this.CHANGE_PAGE_RECTANGLE_SIZE.x, // x
            this.backgroundRectangle.height, // y
            this.CHANGE_PAGE_RECTANGLE_SIZE.x, this.CHANGE_PAGE_RECTANGLE_SIZE.y, this.BACKGROUND_COLOR)
            .setStrokeStyle(2, this.STROKE_COLOR)
            .setOrigin(0, 0);

        this.nextPageText = this.scene.add.text(
            this.nextPageRectangle.x + this.PAGES_TEXT_OFFSET.x,
            this.nextPageRectangle.y + this.PAGES_TEXT_OFFSET.y,
            '>',this.TEXTS_OPTIONS
        ).setOrigin(0, 0).setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 2);

        // create "current page" rectangle and text
        this.currentPageRectangle = this.scene.add.rectangle(
            this.backgroundRectangle.x + this.backgroundRectangle.width - this.CHANGE_PAGE_RECTANGLE_SIZE.x * 2, // x
            this.backgroundRectangle.height, // y
            this.CHANGE_PAGE_RECTANGLE_SIZE.x, this.CHANGE_PAGE_RECTANGLE_SIZE.y, this.BACKGROUND_COLOR)
            .setStrokeStyle(2, this.STROKE_COLOR)
            .setOrigin(0, 0);

        this.currentPageText = this.scene.add.text(
            this.currentPageRectangle.x + this.PAGES_TEXT_OFFSET.x,
            this.currentPageRectangle.y + this.PAGES_TEXT_OFFSET.y,
            this.currentPage.toString(),this.TEXTS_OPTIONS
        ).setOrigin(0, 0).setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 2);

        // add elements to container
        this.add([
            this.backgroundRectangle,
            this.titleRectangle,
            this.titleText,
            this.previousPageRectangle,
            this.previousPageText,
            this.nextPageRectangle,
            this.nextPageText,
            this.currentPageRectangle,
            this.currentPageText,
        ]);

        // set folder draggable by it's title tab
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

        // set page buttons clickable
        this.previousPageRectangle.setInteractive();
        this.previousPageRectangle.on('pointerdown', (pointer: Phaser.Input.Pointer, x: number, y: number) => {
            this.currentPage--;
            this.updateFolderState();
            this.parentContainer.bringToTop(this);
        });
        this.nextPageRectangle.setInteractive();
        this.nextPageRectangle.on('pointerdown', (pointer: Phaser.Input.Pointer, x: number, y: number) => {
            this.currentPage++;
            this.updateFolderState();
            this.parentContainer.bringToTop(this);
        });

        this.updateFolderState();
        this.scene.add.existing(this);
    }

    addIcon(icon: MonitoringIcon) {
        this.icons.push(icon);
        icon.folderPage = Math.ceil(this.icons.length / this.ICONS_PER_PAGE);

        // check if icon should be visible based on it's folder page and current page
        if (icon.folderPage !== this.currentPage) {
            icon.setVisible(false);
        }

        this.add(icon);
    }

    private updateFolderState() {
        if (this.currentPage < 2) {
            this.currentPage = 1;
            this.previousPageText.setAlpha(0.3);
        } else {
            this.previousPageText.setAlpha();
        }
        this.currentPageText.setText(this.currentPage.toString());

        // update icons visibility based on current page
        this.icons.forEach((icon: MonitoringIcon) => {
            if (icon.folderPage === this.currentPage) {
                icon.setVisible(true);
            } else {
                icon.setVisible(false);
            }
        });
    }
}
