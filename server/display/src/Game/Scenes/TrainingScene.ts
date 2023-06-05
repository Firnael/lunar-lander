import 'phaser';
import { LanderRotation } from '../../Models/player';
import { Ship } from '../GameObjects/Ship';

export class TrainingScene extends Phaser.Scene {
    private CANVAS!: HTMLCanvasElement;
    private ship!: Ship;
    private blockFrame!: Phaser.Textures.Frame;
    private blocksGroup!: Phaser.GameObjects.Group
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
        // disabled debug
        this.physics.world.drawDebug = false;

        // get game canvas
        this.CANVAS = this.sys.game.canvas;

        // get blocks frame (for further dimensions computing)
        this.blockFrame = this.textures.get('trainingBlocks').get(0);

        // Set background image
        const backgroundImage = this.add.image(0, 0, 'trainingBackgroundDark').setOrigin(0, 0);
        const scaleX = this.cameras.main.width / backgroundImage.width;
        const scaleY = this.cameras.main.height / backgroundImage.height;
        const scale = Math.max(scaleX, scaleY);
        backgroundImage.setScale(scale).setScrollFactor(0);

        this.createBlocks();
        this.createShip();
        this.enableCollisionsBetweenShipAndBlocks();

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
        
        // keep ships on screen
        if (this.ship.x > this.CANVAS.width) this.ship.x = 0;
        if (this.ship.x < 0) this.ship.x = this.CANVAS.width;
    }

    private createBlocks() {
        this.blocksGroup = this.add.group();

        // horizontal
		for (let x = 0; x < this.CANVAS.width; x += this.blockFrame.width) {
            // ceiling
            this.createAndAddBlockToGroup(x, 0, 3);
            // floor
            this.createAndAddBlockToGroup(x, this.CANVAS.height - this.blockFrame.height, 0);
		}
	}

    private createAndAddBlockToGroup(x: number, y: number, frameIndex: number) {
        const block = this.physics.add.sprite(x, y, 'trainingBlocks', frameIndex).setOrigin(0,0);
        block.body.setImmovable(true);
        block.body.setAllowGravity(false);
        this.blocksGroup.add(block);
    }

    private createShip() {
        this.ship = new Ship(
            this, 0, 0, 'trainingShip', this.blockFrame.height,
            'TRAINING', '12345678', '🪆', '#FECB00', 'training'
        ).setScale(2);
        this.ship.setPosition(
            this.CANVAS.width / 2 - this.ship.width / 2,
            this.CANVAS.height / 2 - this.ship.height / 2
        );
    }

    private enableCollisionsBetweenShipAndBlocks() {
		this.physics.add.collider(this.ship, this.blocksGroup);
    }
}
