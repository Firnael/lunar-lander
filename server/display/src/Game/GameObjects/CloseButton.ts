import { CloseButtonClicked } from "../../Models/gameEvents";

/**
 * Represents a button that closes the {@link MonitoringUnit} it is in.
 */
export class CloseButton extends Phaser.GameObjects.Sprite {

    public static readonly SIZE = new Phaser.Math.Vector2(20, 20);

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'closeWindowButton');
        
        this.setOrigin(1, 0);
        this.setInteractive()
            .on('pointerover', () => { this.setTint(0x333333); })
            .on('pointerout', () => { this.setTint(0xffffff); })
            .on('pointerdown', () => { this.close(); });
        this.input.hitArea.setTo(-10, 0, CloseButton.SIZE.x, CloseButton.SIZE.y);

        scene.add.existing(this);
    }

    close(): void {
        // animate parent container to shrink to nothing, then destroy it
        this.parentContainer.parentContainer.bringToTop(this.parentContainer);
        this.scene.tweens.add({
            targets: this.parentContainer,
            duration: 200,
            scaleX: 0,
            scaleY: 0,
            ease: 'Power2',
            onComplete: () => {
                this.scene.game.events.emit('CLOSE_BUTTON_CLICKED',
                    { gameObjectName: this.parentContainer.name } as CloseButtonClicked
                );
            }
        });
    }
}
