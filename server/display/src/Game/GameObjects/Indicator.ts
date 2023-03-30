import Phaser from 'phaser';

/* Set ship indicator sprite and text (when ship is out of window, when too high) */
export class Indicator extends Phaser.GameObjects.Sprite {

    private altitudeText!: Phaser.GameObjects.Text
    private nameText!: Phaser.GameObjects.Text
    
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, name: string, color: string) {
        super(scene, x, y, texture)
        scene.add.existing(this)

        const textOptions = { font: 'bold 16px Arial', color: '#dddddd' }
        this.altitudeText = scene.add.text(0, 12, '', textOptions)
        this.altitudeText.setVisible(false)
        this.nameText = scene.add.text(0, 28, name, textOptions)
        this.nameText.setBackgroundColor('#' + color);
        this.nameText.setShadow(1, 1, '#111111', 1, false, true)
        this.nameText.setVisible(false)

        this.setVisible(false)
    }

    update(shipPosition: Phaser.Math.Vector2): void {
        if (shipPosition.y < 0) {
            this.x = shipPosition.x
            this.setVisible(true)
            this.altitudeText.setVisible(true)
            this.nameText.setVisible(true)

            let distance = Math.round(Math.abs(shipPosition.y))
            this.altitudeText.setText(distance + 'm')
            
            const posX = shipPosition.x - this.altitudeText.width / 2
            this.altitudeText.x = posX
            this.nameText.x = posX
        } else {
            this.setVisible(false)
            this.altitudeText.setVisible(false)
            this.nameText.setVisible(false)
        }
    }

    destroy(): void {
        this.altitudeText.destroy()
        this.nameText.destroy()
        super.destroy()
    }
}