import Phaser from 'phaser';
import { LanderDangerStatus, LanderStatus } from '../../Models/player';
import { FakeShip } from './FakeShip';
import { ResizeButton } from './ResizeButton';
import { Speedometer } from './Speedometer';

/**
 * MonitoginUnit  
 * Used inside a {@link MonitoringGrid} to display the ship state.
 * 
 * TODO :
 * - add more line (with a low alpha, or dotted if possible) to display height
 * - uses RULESET instead of copypasta the CONSTANTS
 */
export class MonitoringUnit extends Phaser.GameObjects.Container {
    // TODO mettre en conf
    private TWEEN_INTERVAL: number = 200;
    private UNIT_SIZE: number = 240;
    private UNIT_BACKGROUND_COLOR: number = 0x001301;
    private UNIT_STROKE_COLOR: number = 0x76ce81;
    private textOffset = { x: 10, y: 90 };
    private dangerSignsOffest = { x: 60, y: 0 };
    private textOptions = { font: '14px Greenscr', color: '#dddddd' };

    public shipRef: FakeShip | undefined;

    // Keep references
    private backgroundRectangle: Phaser.GameObjects.Rectangle;
    private playerColorRectangle: Phaser.GameObjects.Rectangle;
    private resizeButton: ResizeButton;
    private playerNameText: Phaser.GameObjects.Text;
    private groundLine: Phaser.GameObjects.Line;
    private speedometer: Speedometer;
    private statusText!: Phaser.GameObjects.Text; 
    private angleText!: Phaser.GameObjects.Text;
    private altitudeText!: Phaser.GameObjects.Text;
    private fuelUsedText!: Phaser.GameObjects.Text;
    private dangerVelocitySprite!: Phaser.GameObjects.Sprite;
    private dangerAngleSprite!: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        this.scene = scene;
        this.x = x;
        this.y = y;

        // create background rectangle
        this.backgroundRectangle = this.scene.add.rectangle(0, 0, this.UNIT_SIZE, this.UNIT_SIZE, this.UNIT_BACKGROUND_COLOR)
            .setStrokeStyle(2, this.UNIT_STROKE_COLOR)
            .setName('backgroundRectangle');

        // create player color rectangle
        this.playerColorRectangle = this.scene.add.rectangle(-this.UNIT_SIZE / 2 + 4, -this.UNIT_SIZE / 2 + 4, 20, 20, 0xdddddd)
            .setOrigin(0, 0)
            .setStrokeStyle(1, this.UNIT_STROKE_COLOR)
            .setName('playerColorRectangle');

        // create player name text
        this.playerNameText = this.scene.add.text(
            0, -100, '[---]', {
            font: '24px Greenscr',
            color: '#' + this.UNIT_STROKE_COLOR.toString(16),
            align: 'center'
        }).setOrigin(0.5, 0).setName('playerNameText');

        // create ground line
        this.groundLine = scene.add.line(0, 0, 0, 0, this.UNIT_SIZE, 0, this.UNIT_STROKE_COLOR, 0.5)
            .setName('groundLine');

        // create telemetry elements
        this.statusText = scene.add.text(this.textOffset.x, -30 + this.textOffset.y, '', this.textOptions).setOrigin(0, 0.5);
        this.angleText = scene.add.text(this.textOffset.x, -15 + this.textOffset.y, '', this.textOptions).setOrigin(0, 0.5);
        this.altitudeText = scene.add.text(this.textOffset.x, this.textOffset.y, '', this.textOptions).setOrigin(0, 0.5);
        this.fuelUsedText = scene.add.text(this.textOffset.x, 15 + this.textOffset.y, '', this.textOptions).setOrigin(0, 0.5);
        this.dangerVelocitySprite = scene.add.sprite(this.dangerSignsOffest.x, this.dangerSignsOffest.y, 'dangerVelocity')
            .setScale(0.3).setVisible(false);
        this.dangerAngleSprite = scene.add.sprite(this.dangerSignsOffest.x + 32, this.dangerSignsOffest.y, 'dangerAngle')
            .setScale(0.3).setVisible(false);

        // create speedometer
        this.speedometer = new Speedometer(scene, -70, 40);

        // create resize button
        this.resizeButton = new ResizeButton(this.scene, this.UNIT_SIZE / 2 - 2, - this.UNIT_SIZE / 2 + 2);

        // add elements to container
        this.add(this.backgroundRectangle);
        this.add(this.playerColorRectangle);
        this.add(this.playerNameText);
        this.add(this.groundLine);
        this.add(this.statusText);
        this.add(this.angleText);
        this.add(this.altitudeText);
        this.add(this.fuelUsedText);
        this.add(this.dangerVelocitySprite);
        this.add(this.dangerAngleSprite);
        this.add(this.speedometer);
        this.add(this.resizeButton);

        // set interactible :)
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
        // display nothing if this unit has no ship attached
        if (!this.shipRef) {
            this.each((c: any) => { c.setVisible(false); });
            this.backgroundRectangle.setVisible(true);
            this.playerNameText.setText('[NO SIGNAL]').setVisible(true);
            return;
        }

        // otherwise, display everything and update values
        this.each((c: any) => { c.setVisible(true); });
        this.playerNameText.setText(`[${this.shipRef.playerName}]`);
        this.playerColorRectangle.setFillStyle(parseInt(this.shipRef.playerColor, 16), 1);

        this.speedometer.update(this.shipRef.vx, this.shipRef.vy);

        // update ground line visibility and height
        if (this.shipRef.altitude < this.backgroundRectangle.height / 2 - this.shipRef.height / 2) {
            this.groundLine.setVisible(true);
            this.scene.tweens.add({
                targets: this.groundLine,
                y: this.shipRef.altitude + this.shipRef.getHeight() / 2,
                ease: 'linear',
                duration: this.TWEEN_INTERVAL
            });
        } else {
            this.groundLine.setVisible(false);
        }

        // update telemetry elements
        this.statusText.setText('sta:  ' + LanderStatus[this.shipRef.status].substring(0, 5));
        this.angleText.setText('ang:  ' + this.shipRef.angle.toFixed());
        this.altitudeText.setText('alt:  ' + this.shipRef.altitude.toFixed());
        this.fuelUsedText.setText('fuel: ' + this.shipRef.usedFuel);

        // update danger signs visibility
        switch (this.shipRef.dangerStatus) {
            case LanderDangerStatus.SAFE: 
                this.dangerVelocitySprite.setVisible(false);
                this.dangerAngleSprite.setVisible(false);
                break;
            case LanderDangerStatus.TOO_FAST:
                this.dangerVelocitySprite.setVisible(true);
            case LanderDangerStatus.BAD_ANGLE:
                this.dangerAngleSprite.setVisible(true);
        }
    }

    setShipRef(shipRef: FakeShip) {
        this.shipRef = shipRef;
        this.add(shipRef);
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }
}
