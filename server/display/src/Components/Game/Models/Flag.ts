import Phaser from 'phaser';

export class Flag extends Phaser.GameObjects.Sprite {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame)
		this.setOrigin(0, 1)
        scene.add.existing(this)
    }
}