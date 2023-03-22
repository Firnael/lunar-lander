import Phaser from 'phaser';
import { Ship } from './Ship';

export class Hud extends Phaser.GameObjects.Sprite {

    private hudContainer: Phaser.GameObjects.Container
    private nameText: Phaser.GameObjects.Text
    private vxText!: Phaser.GameObjects.Text
    private vyText!: Phaser.GameObjects.Text
    private angleText!: Phaser.GameObjects.Text
    private altitudeText!: Phaser.GameObjects.Text
    private fuelUsedText!: Phaser.GameObjects.Text
    private dangerSignSprite!: Phaser.GameObjects.Sprite

    // reference to the ship, to retrieve data about it
    private shipRef: Ship
    // we need this info to print warning sign if fuel tank is empty
    private fuelTankSize: number
    // needs the canvas width to know when to flip the HUD
    private canvasWidth: number
    private flipLimit: number

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, fuelTankSize: number, shipRef: Ship) {
        super(scene, x, y, texture)
        scene.add.existing(this)

        this.setOrigin(0, 1)
        this.shipRef = shipRef
        this.fuelTankSize = fuelTankSize

        const { width, height } = scene.sys.canvas
        this.canvasWidth = width

        this.flipLimit = this.canvasWidth / 2

        const textOptions = { font: '14px Arial', color: '#dddddd' }
        this.nameText = scene.add.text(0, -62, this.shipRef.playerName, { font: 'bold 16px Arial', color: '#dddddd', backgroundColor: '#' + shipRef.playerColor }).setOrigin(0, 0.5)
        this.nameText.setStroke('#' + shipRef.playerColor, 3)
        this.nameText.setShadow(1, 1, '#111111', 1, false, true)
        this.vxText = scene.add.text(0, -45, '', textOptions).setOrigin(0, 0.5)
        this.vyText = scene.add.text(0, -30, '', textOptions).setOrigin(0, 0.5)
        this.angleText = scene.add.text(0, -15, '', textOptions).setOrigin(0, 0.5)
        this.altitudeText = scene.add.text(0, 0, '', textOptions).setOrigin(0, 0.5)
        this.fuelUsedText = scene.add.text(0, 15, '', textOptions).setOrigin(0, 0.5)

        this.dangerSignSprite = scene.add.sprite(0, 0, 'dangerSign').setScale(0.5)

        this.hudContainer = scene.add.container(0, 0, [
            this.nameText, this.vxText, this.vyText, this.angleText, this.altitudeText, this.fuelUsedText, this.dangerSignSprite
        ])
    }

    update(): void {
        // check if we need to flip
        if (this.shipRef.x > this.canvasWidth - this.flipLimit) {
            this.setFlipX(true)
            this.setPosition(this.shipRef.x - this.shipRef.width / 2 - this.width, this.shipRef.y - this.shipRef.height / 2)
            this.dangerSignSprite.setPosition(90, 0)
            this.hudContainer.setPosition(this.x - this.width, this.y)
        } else {
            this.setFlipX(false)
            this.setPosition(this.shipRef.x + this.shipRef.width / 2, this.shipRef.y - this.shipRef.height / 2)
            this.dangerSignSprite.setPosition(-30, 0)
            this.hudContainer.setPosition(this.x + this.width, this.y)
        }

        // check if danger sign needs to be displayed
        if(this.shipRef.isInDangerZone()) {
            this.dangerSignSprite.setVisible(true)
        } else {
            this.dangerSignSprite.setVisible(false)
        }

        this.vxText.setText('vx:   ' + this.shipRef.body.velocity.x.toFixed())
        this.vyText.setText('vy:   ' + this.shipRef.body.velocity.y.toFixed())
        this.angleText.setText('ang:  ' + this.shipRef.angle.toFixed() + '°')
        this.altitudeText.setText('alt:   ' + this.shipRef.altitude.toFixed())
        this.fuelUsedText.setText(`fuel:  ${this.shipRef.usedFuel}${this.shipRef.usedFuel >= this.fuelTankSize ? '⚠️' : ''}`)
    }

    setContainerVisible(value: boolean): void {
        this.setVisible(value)
        this.hudContainer.setVisible(value)
    }

    destroy(): void {
        this.hudContainer.destroy()
        super.destroy()
    }
}
