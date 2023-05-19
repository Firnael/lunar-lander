import { LanderRotation, PlayerActions } from "../../Models/player";
import { FakeEngineType } from "../Types/FakeEngineType";

/**
 * Used by a {@link FakeShip} to display it's engines state.
 */
export class FakeEngine extends Phaser.GameObjects.Sprite {

    private engineType: FakeEngineType;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, engineType: FakeEngineType) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        this.engineType = engineType;
    }

    update(actions: PlayerActions): void {
        switch (this.engineType) {
            case FakeEngineType.MAIN:
                this.setVisible(actions.thrust);
                break;
            case FakeEngineType.LEFT:
                this.setVisible(actions.rotate === LanderRotation.CLOCKWISE);
                break;
            case FakeEngineType.RIGHT:
                this.setVisible(actions.rotate === LanderRotation.COUNTERCLOCKWISE);
                break;
            default:
                console.error('Unknown engine type');
        }
    }
}