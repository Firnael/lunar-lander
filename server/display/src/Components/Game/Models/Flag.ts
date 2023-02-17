import Phaser from 'phaser';

export class Flag extends Phaser.GameObjects.Sprite {

    private emojiText: Phaser.GameObjects.Text

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, playerEmoji: string, frame?: string | number) {
        super(scene, x, y, texture, frame)
		this.setOrigin(0, 1)
        scene.add.existing(this)
        
        const textOptions = { font: 'bold 20px Arial' }
        this.emojiText = scene.add.text(0, 0, playerEmoji, textOptions)
        this.emojiText.setVisible(false)
    }

    setVisible(value: boolean): this {
        super.setVisible(value)
        this.emojiText.setVisible(value)
        return this
    }

    plant(x: number, y: number): void {
        this.setVisible(true)
        this.x = x
        this.y = y
        this.emojiText.x = x + 25
        this.emojiText.y = y - 70
    }

    destroy(): void {
        this.emojiText.destroy()
        super.destroy()
    }

}