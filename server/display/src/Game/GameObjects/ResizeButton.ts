export class ResizeButton extends Phaser.GameObjects.Sprite {

    private grown: boolean = false; 

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'growWindowButton');
        
        this.setOrigin(1, 0);
        this.setInteractive()
            .on('pointerover', () => { this.setTint(0x333333); })
            .on('pointerout', () => { this.setTint(0xffffff); })
            .on('pointerdown', () => { this.grow(); });
        this.input.hitArea.setTo(-10, 0, 20, 20);

        scene.add.existing(this);
    }

    grow(): void {
        // animate rectangle to grow in size
        this.parentContainer.parentContainer.bringToTop(this.parentContainer);

        if (this.grown) {
            this.scene.tweens.add({
                targets: this.parentContainer,
                duration: 300,
                scaleX: 1,
                scaleY: 1,
                x: this.parentContainer.x - this.parentContainer.width / 2,
                y: this.parentContainer.y - this.parentContainer.height / 2,
                texture: this.setTexture('growWindowButton'),
                ease: 'Power2',
                onComplete: () => { this.grown = false; }
            });
        } else {
            this.scene.tweens.add({
                targets: this.parentContainer,
                duration: 300,
                scaleX: 2,
                scaleY: 2,
                x: this.parentContainer.x + this.parentContainer.width / 2,
                y: this.parentContainer.y + this.parentContainer.height / 2,
                texture: this.setTexture('shrinkWindowButton'),
                ease: 'Power2',
                onComplete: () => { this.grown = true; }
            });
        }
    }
}
