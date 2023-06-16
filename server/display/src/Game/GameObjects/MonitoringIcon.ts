import Phaser from 'phaser';
import { MonitoringIconClicked } from '../../Models/gameEvents';

/**
 * Used inside a {@link MonitoringScreen} to represent a connected player.
 */
export class MonitoringIcon extends Phaser.GameObjects.Container {
    public static readonly SIZE = new Phaser.Math.Vector2(150, 100);
    private BACKGROUND_COLOR: number = 0x001301;
    private STROKE_COLOR: number = 0x76ce81;

    /**
     * When this is false, it means the player represented by this icon has been disconnected.    
     * Therefore this icon should not be clickable.
     */
    public isConnected: boolean;

    public playerName: string;
    public playerUuid: string;
    public playerEmoji: string;
    public playerColor: string;

    public folderPage: number;

    // Keep references
    private backgroundRectangle: Phaser.GameObjects.Rectangle;
    private playerColorRectangle: Phaser.GameObjects.Rectangle;
    private playerNameText: Phaser.GameObjects.Text;
    private connectionLostText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        console.log(`MonitoringIcon constructor, x: ${x}, y: ${y}`);
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;

        // init data state
        this.playerName = '';
        this.playerUuid = '';
        this.playerEmoji = '';
        this.playerColor = '';
        this.isConnected = false;
        this.folderPage = -1;

        // create background rectangle
        this.backgroundRectangle = this.scene.add.rectangle(0, 0, MonitoringIcon.SIZE.x, MonitoringIcon.SIZE.y, this.BACKGROUND_COLOR)
            .setStrokeStyle(2, this.STROKE_COLOR)
            .setOrigin(0, 0);

        // create player color rectangle
        this.playerColorRectangle = this.scene.add.rectangle(0, 0, MonitoringIcon.SIZE.x, MonitoringIcon.SIZE.y, 0xdddddd)
            .setAlpha(0.3)
            .setOrigin(0, 0);

        // create player name text
        this.playerNameText = this.scene.add.text(
            this.backgroundRectangle.x + this.backgroundRectangle.width / 2,
            this.backgroundRectangle.y + this.backgroundRectangle.height / 2,
            '[---]',
            {
                font: '16px Greenscr',
                color: '#' + this.STROKE_COLOR.toString(16),
                align: 'center',
            }
        ).setOrigin(0.5, 0.5).setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 2);

        // create connection lost text
        this.connectionLostText = this.scene.add.text(
            this.backgroundRectangle.x + this.backgroundRectangle.width / 2,
            this.backgroundRectangle.y + this.backgroundRectangle.height - 10,
            '[SIGNAL LOST]',
            {
                font: '17px Greenscr',
                color: '#' + this.STROKE_COLOR.toString(16),
                backgroundColor: '#FF0000',
                align: 'center',
            }
        ).setOrigin(0.5, 0.5).setDepth(1);

        // add elements to container
        this.add([
            this.backgroundRectangle,
            this.playerColorRectangle,
            this.playerNameText,
            this.connectionLostText,
        ]);

        // set interactible (can be clicked to open monitoring unit)
        this.backgroundRectangle.setInteractive();
        this.backgroundRectangle.on('pointerdown', (pointer: Phaser.Input.Pointer, x: number, y: number) => {
            if (!this.isConnected) {
                console.log(`Cannot turn on unit for player <${this.playerName}>, connection is lost`);
            } else {
                this.scene.game.events.emit('MONITORING_ICON_CLICKED', {
                    name: this.playerName, uuid: this.playerEmoji, emoji: this.playerEmoji, color: this.playerColor,
                } as MonitoringIconClicked);
            }
        });
        
        this.scene.add.existing(this);
    }

    init(name: string, uuid: string, emoji: string, color: string): void {
        this.playerNameText.setText(name.toUpperCase());
        this.playerColorRectangle.setFillStyle(parseInt(color, 16));
        this.connectionLostText.setVisible(false);
    }

    disconnect(): void {
        this.connectionLostText.setVisible(true);
        this.isConnected = false;
    }

    reconnect(uuid: string, emoji: string, color: string): void {
        this.playerUuid = uuid;
        this.playerEmoji = emoji;
        this.playerColor = color;
        this.isConnected = true;
        this.connectionLostText.setVisible(false);
    }
}
