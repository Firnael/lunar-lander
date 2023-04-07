import Phaser from 'phaser';

export class Explosion extends Phaser.GameObjects.Sprite {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame)
		this.anims.create({
		  key: 'explode',
		  frames: this.anims.generateFrameNumbers(texture, { start: 0, end: 8 }),
		  frameRate: 24
		});

        scene.add.existing(this)
        this.play('explode', false)
        this.once('animationcomplete', () => {
            this.destroy()
        })
    }
}