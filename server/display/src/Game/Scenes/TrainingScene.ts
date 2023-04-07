import 'phaser';

export class TrainingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TrainingScene' });
    }

    preload(): void {
        console.log(this.scene.key);
    }

    create(): void {
        // Set background image
        const backgroundImage = this.add.image(0, 0, 'trainingBackground').setOrigin(0, 0);
        const scaleX = this.cameras.main.width / backgroundImage.width;
        const scaleY = this.cameras.main.height / backgroundImage.height;
        const scale = Math.max(scaleX, scaleY);
        backgroundImage.setScale(scale).setScrollFactor(0);
    }

    update(): void {
        // TODO
    }
}
