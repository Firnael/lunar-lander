import { FakeEngine } from './FakeEngine';
import { LanderStatus, PlayerActions } from '../../Models/player';
import { FakeEngineType } from '../Types/FakeEngineType';
import { GameObjects } from 'phaser';

/** Used inside a {@link MonitoringUnit} to display a ship state */
export class FakeShip extends Phaser.GameObjects.Container {
    // From server config
    private TWEEN_INTERVAL: number;
    // Constants
    private SPRITE_COLORS: Map<LanderStatus, number>;

    // Keep children references for kick access and typings
    private fakeShipSprite: Phaser.GameObjects.Sprite;
    private enginesContainer: Phaser.GameObjects.Container;
    private fakeMainEngine!: FakeEngine;
    private fakeAuxEngineLeft!: FakeEngine;
    private fakeAuxEngineRight!: FakeEngine;
    private angleTween!: Phaser.Tweens.Tween;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;

        // set from server config
        this.TWEEN_INTERVAL = this.scene.registry.get('MONITORING_HEART_BEAT_RATE');

        this.SPRITE_COLORS = new Map();
        this.SPRITE_COLORS.set(LanderStatus.SPAWNED, 0x888888);
        this.SPRITE_COLORS.set(LanderStatus.ALIVE, 0xdddddd);
        this.SPRITE_COLORS.set(LanderStatus.CRASHED, 0xff0000);
        this.SPRITE_COLORS.set(LanderStatus.LANDED, 0x76ce81);

        this.fakeShipSprite = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'fake_ship');
        this.fakeMainEngine = new FakeEngine(scene, 0, 30, 'fakeMainEngine', FakeEngineType.MAIN);
        this.fakeAuxEngineLeft = new FakeEngine(scene, -14, 26, 'fakeAuxEngine', FakeEngineType.LEFT);
        this.fakeAuxEngineRight = new FakeEngine(scene, 14, 26, 'fakeAuxEngine', FakeEngineType.RIGHT);
        this.enginesContainer = this.scene.add.container(0, 0, [
            this.fakeMainEngine,
            this.fakeAuxEngineLeft,
            this.fakeAuxEngineRight
        ]);

        this.add(this.fakeShipSprite);
        this.add(this.enginesContainer);

        this.scene.add.existing(this);
    }

    update(status: LanderStatus, targetAngle: number, actions: PlayerActions): void {
        // reset visibility if ship isn't crashed
        if (status !== LanderStatus.CRASHED) {
            this.each((c: GameObjects.Sprite) => c.setVisible(true));
        }

        // ugly hack : going from -180 to 180 (or inverse) with tween is a pain in the ass
        if (this.angle * targetAngle < 0 && Math.abs(this.angle) > 90) {
            this.angleTween?.stop();
            if (this.angle < 0 && targetAngle > 0) {
                // rotating COUNTERCLOCKWISE
                this.angle = 179;
            } else {
                // rotating CLOCKWISE
                this.angle = -179;
            }
        } else {
            console.log('non')
            this.angleTween = this.scene.tweens.add({
                targets: this,
                angle: targetAngle,
                ease: 'linear',
                duration: this.TWEEN_INTERVAL
            });
        }

        // update engine visibility
        this.enginesContainer.each((e: FakeEngine) => {
            e.update(actions);
        });

        // update ship color based on status
        this.fakeShipSprite.setTint(this.SPRITE_COLORS.get(status));
    }

    explode(): void {
        // hide the ship and its engines (because it exploded you know)
        this.each((c: GameObjects.Sprite) => c.setVisible(false));

        // send 'fake' parts flying
        for (let i = 0; i < 10; i++) {
            const partSprite = this.scene.physics.add.sprite(0, 0, 'fake_ship').setScale(0.5);
            partSprite.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
            partSprite.setAngularVelocity(Phaser.Math.Between(-100, -100));
            partSprite.setTint(0xff0000);
            const tw = this.scene.tweens.add({
                targets: partSprite,
                alpha: 0,
                ease: 'linear',
                duration: 2000,
                loop: 0
            });
            tw.on('complete', () => partSprite.destroy());
            this.add(partSprite);
        }
    }

    getHeight(): number {
        return this.fakeShipSprite.height;
    }
}
