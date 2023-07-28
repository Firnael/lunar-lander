import Phaser from 'phaser';
import { Ship } from './Ship';

export class Hud extends Phaser.GameObjects.Container {

    private dangerSignSprite!: Phaser.GameObjects.Sprite;
    private globalTextContainer: Phaser.GameObjects.Container;
    private leftTextContainer: Phaser.GameObjects.Container;
    private rightTextContainer: Phaser.GameObjects.Container;
    private nameText: Phaser.GameObjects.Text
    private vxLabelText!: Phaser.GameObjects.Text
    private vxValueText!: Phaser.GameObjects.Text
    private vyLabelText!: Phaser.GameObjects.Text
    private vyValueText!: Phaser.GameObjects.Text
    private angleLabelText!: Phaser.GameObjects.Text
    private angleValueText!: Phaser.GameObjects.Text
    private altitudeLabelText!: Phaser.GameObjects.Text
    private altitudeValueText!: Phaser.GameObjects.Text
    private usedFuelLabelText!: Phaser.GameObjects.Text
    private usedFuelValueText!: Phaser.GameObjects.Text
    private horizontalLine: Phaser.GameObjects.Line;
    private verticalLine: Phaser.GameObjects.Line;

    private DANGER_SIGN_OFFSET = new Phaser.Math.Vector2(40, -70);
    private TEXT_CONTAINER_OFFSET = new Phaser.Math.Vector2(100, 40);
    private HORIZONTAL_LINE_WIDTH = 60;

    // reference to the ship, to retrieve data about it
    private shipRef: Ship
    // we need this info to print warning sign if fuel tank is empty
    private fuelTankSize: number
    // needs the canvas width to know when to flip the HUD
    private canvasWidth: number
    private flipLimit: number

    constructor(scene: Phaser.Scene, x: number, y: number, fuelTankSize: number, shipRef: Ship) {
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;

        this.shipRef = shipRef
        this.fuelTankSize = fuelTankSize

        const { width, height } = scene.sys.canvas
        this.canvasWidth = width
        this.flipLimit = this.canvasWidth / 2

        // create elements
        this.dangerSignSprite = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'dangerSign').setScale(0.5)

        this.verticalLine = new Phaser.GameObjects.Line(this.scene, 0, 0, 0, 0, 0, 0, 0xffffff, 1);
        this.horizontalLine = new Phaser.GameObjects.Line(this.scene, 0, 0, 0, 0, 0, 0, 0xffffff, 1);

        const textOptions = { font: '14px Arial', color: '#dddddd' }
        this.nameText = scene.add.text(0, -62, this.shipRef.playerName,
            { font: 'bold 16px Arial', color: '#dddddd', backgroundColor: '#' + shipRef.playerColor }
        )
        .setOrigin(0.5, 0.5)
        .setShadow(1, 1, '#111111', 1, false, true);

        this.vxLabelText = scene.add.text(0, -45, 'vx: ', textOptions).setOrigin(1, 0.5);
        this.vyLabelText = scene.add.text(0, -30, 'vy: ', textOptions).setOrigin(1, 0.5);
        this.angleLabelText = scene.add.text(0, -15, 'ang: ', textOptions).setOrigin(1, 0.5);
        this.altitudeLabelText = scene.add.text(0, 0, 'alt: ', textOptions).setOrigin(1, 0.5);
        this.usedFuelLabelText = scene.add.text(0, 15, 'fuel: ', textOptions).setOrigin(1, 0.5);
        this.leftTextContainer = new Phaser.GameObjects.Container(this.scene, 0, 0, [
            this.vxLabelText, this.vyLabelText, this.angleLabelText, this.altitudeLabelText, this.usedFuelLabelText
        ]);
        
        this.vxValueText = scene.add.text(0, -45, '', textOptions).setOrigin(0, 0.5);
        this.vyValueText = scene.add.text(0, -30, '', textOptions).setOrigin(0, 0.5);
        this.angleValueText = scene.add.text(0, -15, '', textOptions).setOrigin(0, 0.5);
        this.altitudeValueText = scene.add.text(0, -0, '', textOptions).setOrigin(0, 0.5);
        this.usedFuelValueText = scene.add.text(0, 15, '', textOptions).setOrigin(0, 0.5);
        this.rightTextContainer = new Phaser.GameObjects.Container(this.scene, 0, 0, [
            this.vxValueText, this.vyValueText, this.angleValueText, this.altitudeValueText, this.usedFuelValueText
        ]);
        
        this.globalTextContainer = new Phaser.GameObjects.Container(this.scene, 0, 0, [
            this.nameText,
            this.leftTextContainer,
            this.rightTextContainer
        ]);

        // this.add(this.sprite);
        this.add(this.verticalLine);
        this.add(this.horizontalLine);
        this.add(this.dangerSignSprite);
        this.add(this.globalTextContainer);

        scene.add.existing(this);
    }

    update(): void {
        this.setPosition(this.shipRef.x, this.shipRef.y);

        // check on which side of the screen is the ship (determines further positions computing)
        let sign = 1;
        if (this.shipRef.x <= this.canvasWidth - this.flipLimit) {
            // left of the screen
            sign = -1;   
        }

        // update text position
        this.globalTextContainer.setPosition(-this.TEXT_CONTAINER_OFFSET.x * sign, -this.TEXT_CONTAINER_OFFSET.y);
        
        const joinPoint = new Phaser.Math.Vector2(
            this.globalTextContainer.x + this.HORIZONTAL_LINE_WIDTH * sign,
            this.globalTextContainer.y
        );

        // from text to join point
        this.horizontalLine.setTo(this.globalTextContainer.x + (this.HORIZONTAL_LINE_WIDTH / 2 * sign), this.globalTextContainer.y, joinPoint.x, joinPoint.y);
        // from join point to ship
        this.verticalLine.setTo(-this.shipRef.width/2 * sign, -this.shipRef.height/2, joinPoint.x, joinPoint.y);

        // update danger sign sprite position and visibility
        this.dangerSignSprite.setPosition(-this.DANGER_SIGN_OFFSET.x * sign, this.DANGER_SIGN_OFFSET.y);
        this.dangerSignSprite.setVisible(this.shipRef.isInDangerZone());

        // build 'usedFuel' text with appropriate emoji
        const usedFuel = this.shipRef.usedFuel;
        let usedFuelText = usedFuel.toString();
        if (usedFuel >= this.fuelTankSize / 1.25 && usedFuel < this.fuelTankSize) { // 20% fuel remaining
            usedFuelText += ' ⚠️';
        } else if (usedFuel >= this.fuelTankSize) { // 0% fuel remaining
            usedFuelText += ' 🚨';
        }

        // update texts
        this.vxValueText.setText(this.shipRef.body.velocity.x.toFixed())
        this.vyValueText.setText(this.shipRef.body.velocity.y.toFixed())
        this.angleValueText.setText(this.shipRef.angle.toFixed() + '°')
        this.altitudeValueText.setText(this.shipRef.altitude.toFixed())
        this.usedFuelValueText.setText(usedFuelText)
    }
}
