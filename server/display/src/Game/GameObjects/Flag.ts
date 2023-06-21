import Phaser from 'phaser';

export class Flag extends Phaser.GameObjects.Sprite {

    private emojiText: Phaser.GameObjects.Text

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, playerEmoji: string, frame?: string | number) {
        super(scene, x, y, texture, frame)
		this.setOrigin(0, 1)
        scene.add.existing(this)
        
        this.emojiText = scene.add.text(0, 0, playerEmoji, { font: 'bold 20px Arial' })
            .setOrigin(0.5, 0)
            .setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 2)
            .setVisible(false);
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
        this.emojiText.x = x + this.displayWidth / 2;
        this.emojiText.y = y - this.displayHeight / 2 - this.displayHeight / 3.5;
    }

    destroy(): void {
        this.emojiText.destroy()
        super.destroy()
    }

    setScale(x: number, y?: number): this {
        super.setScale(x, y);
        this.emojiText.setScale(x, y);
        return this;
    }

}