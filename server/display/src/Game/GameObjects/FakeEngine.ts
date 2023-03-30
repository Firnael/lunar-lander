import { LanderRotation, PlayerActions } from "../../Models/player";

/**
 * Used by a {@link FakeShip} to display it's engines state.
 */
export class FakeEngine extends Phaser.GameObjects.Sprite {

    private engineType: string;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, engineType: string) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        this.engineType = engineType;
    }

    update(actions: PlayerActions): void {
        if (this.engineType === 'main') {
            if (actions.thrust) {
                this.setVisible(true);
            } else {
                this.setVisible(false);
            }
        } else if (this.engineType === 'left') {
            if (actions.rotate === LanderRotation.CLOCKWISE) {
                this.setVisible(true);
            } else {
                this.setVisible(false);
            }
        } else if (this.engineType === 'right') {
            if (actions.rotate === LanderRotation.COUNTERCLOCKWISE) {
                this.setVisible(true);
            } else {
                this.setVisible(false);
            }
        } else {
            console.error('Unknown engine type');
        }
    }
}