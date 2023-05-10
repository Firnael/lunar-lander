import 'phaser';
import { LanderRotation } from '../../Models/player';
import { Ship } from '../GameObjects/Ship';

export class TrainingScene extends Phaser.Scene {
    private ship!: Ship;
    private mainEngineKey!: Phaser.Input.Keyboard.Key;
    private leftAuxEngineKey!: Phaser.Input.Keyboard.Key;
    private rightAuxEngineKey!: Phaser.Input.Keyboard.Key;

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

        // Create ship
        this.ship = new Ship(this, 600, 600, 'ship', 'TRAINING', '12345678', '🪆', '#FECB00');

        // Create key-binding
        this.mainEngineKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.leftAuxEngineKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.rightAuxEngineKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    update(): void {
        // update actions manualy
        let rotate = LanderRotation.NONE;
        if (this.leftAuxEngineKey.isDown && this.rightAuxEngineKey.isUp) {
            rotate = LanderRotation.COUNTERCLOCKWISE;
        } else if (this.leftAuxEngineKey.isUp && this.rightAuxEngineKey.isDown) {
            rotate = LanderRotation.CLOCKWISE;
        }

        this.ship.actions = {
            thrust: this.mainEngineKey.isDown,
            rotate: rotate
        };

        this.ship.update();
    }
}
