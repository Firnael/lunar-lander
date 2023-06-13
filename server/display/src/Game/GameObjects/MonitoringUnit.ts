import Phaser from 'phaser';
import { LanderDangerStatus, LanderData, LanderRotation, LanderStatus, PlayerActions } from '../../Models/player';
import { FakeShip } from './FakeShip';
import { ResizeButton } from './ResizeButton';
import { Speedometer } from './Speedometer';
import { MonitoringShipData } from '../Types/MonitoringShipData';
import { CloseButton } from './CloseButton';

/**
 * Used inside a {@link MonitoringGrid} to display the ship state.
 */
export class MonitoringUnit extends Phaser.GameObjects.Container {
    // From server config
    private TWEEN_INTERVAL: number;
    private DANGER_ZONE_HEIGHT: number;

    private UNIT_SIZE: number = 240;
    private UNIT_BACKGROUND_COLOR: number = 0x001301;
    private UNIT_STROKE_COLOR: number = 0x76ce81;
    private TEXT_OPTIONS = { font: '14px Greenscr', color: '#dddddd' };
    private TEXT_OFFSET = { x: 10, y: 90 };
    private DANGER_SIGN_OFFSET = { x: 80, y: 0 };
    private AFTERIMAGE_INTERVAL = 200;

    /**
     * When this is true, it means no player is connected to this unit, or disconnected a long time ago
     * Therefore this unit should not handle any updates
     */
    public isTurnedOn: boolean;
    /**
     * When this is true, it means the player previously connected to this unit has left    
     * Therefore this unit should not handle any updates
     */
    public isIdle: boolean;
    public fakeShip: FakeShip;
    public monitoringShipData: MonitoringShipData;

    // After image data
    private shipAfterImages: Phaser.GameObjects.Sprite[];
    private lastAfterImageElaspedTime: number;

    // Keep references
    private backgroundRectangle: Phaser.GameObjects.Rectangle;
    private playerColorRectangle: Phaser.GameObjects.Rectangle;
    private resizeButton: ResizeButton;
    private closeButton: CloseButton;
    private groundLine: Phaser.GameObjects.Line;
    private speedometer: Speedometer;
    private playerNameText: Phaser.GameObjects.Text;
    private connectionStateText: Phaser.GameObjects.Text;
    private statusText!: Phaser.GameObjects.Text; 
    private angleText!: Phaser.GameObjects.Text;
    private altitudeText!: Phaser.GameObjects.Text;
    private fuelUsedText!: Phaser.GameObjects.Text;
    private dangerSignSprite!: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;

        // set from server config
        this.TWEEN_INTERVAL = this.scene.registry.get('MONITORING_HEART_BEAT_RATE');
        this.DANGER_ZONE_HEIGHT = this.scene.registry.get('DANGER_ZONE_HEIGHT');

        // init data state
        this.isTurnedOn = false;
        this.isIdle = false;
        this.fakeShip = new FakeShip(this.scene, 0, 0);
        this.monitoringShipData = {
            playerName: '', playerUuid: '', playerEmoji: '', playerColor: '',
            status: LanderStatus.SPAWNED, previousStatus: LanderStatus.SPAWNED,
            dangerStatus: LanderDangerStatus.SAFE,
            usedFuel: 0, altitude: 0, vx: 0, vy: 0, angle: 0,
            actions: { thrust: false, rotate: LanderRotation.NONE }
        };

        // init after image arrays
        this.shipAfterImages = [];
        this.lastAfterImageElaspedTime = Date.now();

        // create background rectangle
        this.backgroundRectangle = this.scene.add.rectangle(0, 0, this.UNIT_SIZE, this.UNIT_SIZE, this.UNIT_BACKGROUND_COLOR)
            .setStrokeStyle(2, this.UNIT_STROKE_COLOR);

        // create player color rectangle
        this.playerColorRectangle = this.scene.add.rectangle(-this.UNIT_SIZE / 2 + 4, -this.UNIT_SIZE / 2 + 4, 20, 20, 0xdddddd)
            .setOrigin(0, 0)
            .setStrokeStyle(1, this.UNIT_STROKE_COLOR);

        // create player name text
        this.playerNameText = this.scene.add.text(
            0, -96, '[---]', {
            font: '24px Greenscr',
            color: '#' + this.UNIT_STROKE_COLOR.toString(16),
            align: 'center'
        }).setOrigin(0.5, 0);

        // create connection state text
        this.connectionStateText = this.scene.add.text(0, -70,
            '[SIGNAL LOST]', {
            font: '24px Greenscr',
            color: '#' + this.UNIT_STROKE_COLOR.toString(16),
            backgroundColor: '#FF0000',
            align: 'center',
        }).setOrigin(0.5, 0).setDepth(1);

        // create ground line
        this.groundLine = scene.add.line(0, 0, 0, 0, this.UNIT_SIZE, 0, this.UNIT_STROKE_COLOR, 0.5);

        // create telemetry elements
        this.statusText = scene.add.text(this.TEXT_OFFSET.x, -30 + this.TEXT_OFFSET.y, '', this.TEXT_OPTIONS).setOrigin(0, 0.5);
        this.angleText = scene.add.text(this.TEXT_OFFSET.x, -15 + this.TEXT_OFFSET.y, '', this.TEXT_OPTIONS).setOrigin(0, 0.5);
        this.altitudeText = scene.add.text(this.TEXT_OFFSET.x, this.TEXT_OFFSET.y, '', this.TEXT_OPTIONS).setOrigin(0, 0.5);
        this.fuelUsedText = scene.add.text(this.TEXT_OFFSET.x, 15 + this.TEXT_OFFSET.y, '', this.TEXT_OPTIONS).setOrigin(0, 0.5);
        this.dangerSignSprite = scene.add.sprite(this.DANGER_SIGN_OFFSET.x, this.DANGER_SIGN_OFFSET.y, 'dangerSign').setScale(0.5)

        // create speedometer
        this.speedometer = new Speedometer(scene, -70, 40);

        // create resize and close buttons
        this.resizeButton = new ResizeButton(this.scene, this.UNIT_SIZE / 2 - 2 - CloseButton.SIZE.x, - this.UNIT_SIZE / 2 + 2);
        this.closeButton = new CloseButton(this.scene, this.UNIT_SIZE / 2 - 2, - this.UNIT_SIZE / 2 + 2);

        // add elements to container
        this.add([
            this.backgroundRectangle,
            this.playerColorRectangle, this.playerNameText, this.connectionStateText,
            this.groundLine,
            this.statusText, this.angleText, this.altitudeText, this.fuelUsedText,
            this.dangerSignSprite,
            this.speedometer,
            this.resizeButton, this.closeButton,
            this.fakeShip
        ]);

        // set interactible (drag'n'drop & bring to top on click)
        this.setSize(this.UNIT_SIZE, this.UNIT_SIZE);
        this.setInteractive();
        this.scene.input.setDraggable(this);
        this.on('drag', (pointer: Phaser.Input.Pointer, x: number, y: number) => {
            this.x = x;
            this.y = y;
            this.parentContainer.bringToTop(this);
        });
        this.on('pointerdown', (pointer: Phaser.Input.Pointer, x: number, y: number) => {
            this.parentContainer.bringToTop(this);
        });
        
        this.scene.add.existing(this);
    }

    update(): void {
        if (!this.scene) {
            // this object has already been destroyed
            return;
        }
        // display nothing if this unit is turned off
        if (!this.isTurnedOn) {
            this.each((c: any) => { c.setVisible(false); });
            this.backgroundRectangle.setVisible(true);
            this.playerNameText.setText('[NO SIGNAL]').setVisible(true);
            return;
        }

        // do not update if unit is idle
        if (this.isIdle) {
            return;
        }

        // update status text first
        this.statusText.setText('sta:  ' + LanderStatus[this.monitoringShipData.status].substring(0, 5));

        // do not update the rest if ship crashed
        if (this.monitoringShipData.status === LanderStatus.CRASHED) {
            return;
        }

        // in other cases, display everything and update values
        this.each((c: any) => { c.setVisible(true); });
        this.connectionStateText.setVisible(false);
        this.playerNameText.setText(`[${this.monitoringShipData.playerName}]`);
        this.playerColorRectangle.setFillStyle(parseInt(this.monitoringShipData.playerColor, 16), 1);

        this.fakeShip.update(this.monitoringShipData.status, this.monitoringShipData.angle, this.monitoringShipData.actions);
        this.speedometer.update(this.monitoringShipData.vx, this.monitoringShipData.vy);

        // update ground line visibility and height
        if (this.monitoringShipData.status === LanderStatus.SPAWNED) {
            // reset ground line position if ship just respawned
            this.groundLine.setVisible(false);
            this.groundLine.setY(this.backgroundRectangle.height / 2);
            this.shipAfterImages.forEach(i => i.destroy());
            this.shipAfterImages = [];
        }
        else {
            if (this.monitoringShipData.altitude < this.backgroundRectangle.height / 2 - this.fakeShip.height / 2) {
                this.groundLine.setVisible(true);
                this.scene.tweens.add({
                    targets: this.groundLine,
                    y: this.monitoringShipData.altitude + this.fakeShip.getHeight() / 2,
                    ease: 'linear',
                    duration: this.TWEEN_INTERVAL
                });
            } else {
                this.groundLine.setVisible(false);
            }
        }

        // create afterimage, update positions & angles, remove out-of-bounds
        this.createShipAfterImage();
        const localVelocity = new Phaser.Math.Vector2(this.monitoringShipData.vx / 200, this.monitoringShipData.vy / 200);
        this.shipAfterImages.forEach(i => i.setPosition(i.x - localVelocity.x, i.y - localVelocity.y));
        this.shipAfterImages = this.shipAfterImages.filter(i => { 
            const withinBounds = Math.abs(i.x) <= (this.UNIT_SIZE/2 - i.width/2) && Math.abs(i.y) <= (this.UNIT_SIZE/2 - i.height/2);
            if (!withinBounds) {
                i.destroy();
            }
            return withinBounds;
        });

        // update telemetry elements
        this.angleText.setText('ang:  ' + this.monitoringShipData.angle.toFixed());
        this.altitudeText.setText('alt:  ' + this.monitoringShipData.altitude.toFixed());
        this.fuelUsedText.setText('fuel: ' + this.monitoringShipData.usedFuel);

        // update velocity and angle text color
        let vxTextColor = this.TEXT_OPTIONS.color;
        let vyTextColor = this.TEXT_OPTIONS.color;
        let angleTextColor = this.TEXT_OPTIONS.color;
        if ((this.monitoringShipData.dangerStatus & LanderDangerStatus.BAD_ANGLE) !== 0) {
            angleTextColor = this.monitoringShipData.altitude <= this.DANGER_ZONE_HEIGHT ? '#FF0000' : '#FFFF00';
        }
        if (this.monitoringShipData.dangerStatus & LanderDangerStatus.TOO_FAST_X) {
            vxTextColor = this.monitoringShipData.altitude <= this.DANGER_ZONE_HEIGHT ? '#FF0000' : '#FFFF00';
        }
        if (this.monitoringShipData.dangerStatus & LanderDangerStatus.TOO_FAST_Y) {
            vyTextColor = this.monitoringShipData.altitude <= this.DANGER_ZONE_HEIGHT ? '#FF0000' : '#FFFF00';
        }
        this.speedometer.setVxTextColor(vxTextColor);
        this.speedometer.setVyTextColor(vyTextColor);
        this.angleText.setColor(angleTextColor);

        // update danger sprite visibility
        this.dangerSignSprite.setVisible(
            this.monitoringShipData.altitude <= this.DANGER_ZONE_HEIGHT && this.monitoringShipData.dangerStatus !== 0);
    }

    turnOn(name: string, uuid: string, emoji: string, color: string): void {
        this.monitoringShipData = {
            ...this.monitoringShipData,
            playerName: name,
            playerUuid: uuid,
            playerEmoji: emoji,
            playerColor: color,
        };
        this.isTurnedOn = true;
        this.isIdle = false;
    }

    disconnect(): void {
        this.connectionStateText.setVisible(true);
        this.isIdle = true;
    }

    reconnect(uuid: string, emoji: string, color: string): void {
        this.monitoringShipData = {
            ...this.monitoringShipData,
            playerUuid: uuid,
            playerEmoji: emoji,
            playerColor: color,
        };
        this.isIdle = false;
    }

    setShipParameters(data: LanderData): void {
        this.monitoringShipData = {
            ...this.monitoringShipData,
            vx: data.vx,
            vy: data.vy,
            angle: data.angle,
            altitude: data.altitude,
            usedFuel: data.usedFuel,
            previousStatus: this.monitoringShipData.status, // replace previous status by current one
            status: data.status,
            dangerStatus: data.dangerStatus
        };
        
        // TODO pas giga concaincu de ce fonctionnement
        if (this.monitoringShipData.previousStatus !== this.monitoringShipData.status) {
            if (this.monitoringShipData.status === LanderStatus.CRASHED) {
                // si le précedent état c'était autre chose que CRASHED,
                // alors le vaisseau vient tout juste d'exploser
                this.fakeShip.explode();
            } else if (this.monitoringShipData.status === LanderStatus.SPAWNED) {
                // si le précédent état c'était autre chose que SPAWNED,
                // alors le vaisseau vient tout juste de réapparaitre
                this.each((c: any) => c.setVisible(true));
            }
        }
    }

    setPlayerActions(actions: PlayerActions): void {
        this.monitoringShipData.actions = actions;
    }

    createShipAfterImage(): void {
        if (Date.now() - this.lastAfterImageElaspedTime < this.AFTERIMAGE_INTERVAL) {
            return;
        }
        this.lastAfterImageElaspedTime = Date.now();

        const afterImage = this.scene.add.sprite(0, 0, 'acceleration_particule')
            .setAngle(this.monitoringShipData.angle)
            .setTint(this.UNIT_STROKE_COLOR)
            .setAlpha(1);
        this.shipAfterImages.push(afterImage);
        this.scene.tweens.add({
            targets: afterImage, alpha: 0, ease: 'linear', duration: 3000,
        }).on('complete', () => {
            afterImage?.destroy();
        });
        this.add(afterImage);
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    destroy(fromScene?: boolean | undefined): void {
        this.each((c: any) => c.destroy());
        super.destroy(fromScene);
    }
}
