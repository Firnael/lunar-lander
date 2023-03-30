import { FakeEngine } from './FakeEngine';
import { LanderStatus, LanderData, LanderDangerStatus, PlayerActions, LanderRotation } from '../../Models/player';

export class FakeShip extends Phaser.GameObjects.Container {
    public playerName: string;
    public playerUuid: string;
    public playerEmoji: string;
    public playerColor: string;
    public usedFuel: number;
    public altitude: number;
    public status: LanderStatus;
    private previousStatus: LanderStatus;
    public vx: number;
    public vy: number;
    public dangerStatus: LanderDangerStatus;
    public actions: PlayerActions;

    // Keep children references for kick access and typings
    private fakeShipSprite: Phaser.GameObjects.Sprite;
    private enginesContainer: Phaser.GameObjects.Container;
    private fakeMainEngine!: FakeEngine;
    private fakeAuxEngineLeft!: FakeEngine;
    private fakeAuxEngineRight!: FakeEngine;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        name: string,
        uuid: string,
        emoji: string,
        color: string
    ) {
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;

        // player preferencies
        this.playerName = name;
        this.playerUuid = uuid;
        this.playerEmoji = emoji;
        this.playerColor = color;
        this.status = LanderStatus.SPAWNED;
        this.previousStatus = LanderStatus.SPAWNED;
        this.dangerStatus = LanderDangerStatus.SAFE;
        this.usedFuel = 0;
        this.altitude = 0;
        this.vx = 0;
        this.vy = 0;
        this.actions = { thrust: false, rotate: LanderRotation.NONE };

        this.fakeShipSprite = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'fake_ship');
        this.fakeMainEngine = new FakeEngine(scene, 0, 30, 'fakeMainEngine', 'main');
        this.fakeAuxEngineLeft = new FakeEngine(scene, -14, 26, 'fakeAuxEngine', 'left');
        this.fakeAuxEngineRight = new FakeEngine(scene, 14, 26, 'fakeAuxEngine', 'right');
        this.enginesContainer = this.scene.add.container(0, 0, [
            this.fakeMainEngine,
            this.fakeAuxEngineLeft,
            this.fakeAuxEngineRight
        ]);

        this.add(this.fakeShipSprite);
        this.add(this.enginesContainer);

        this.scene.add.existing(this);
    }

    setParameters(data: LanderData): void {
        this.altitude = data.altitude;
        this.vx = data.vx;
        this.vy = data.vy;
        this.angle = data.angle;
        this.altitude = data.altitude;
        this.usedFuel = data.usedFuel;
        this.previousStatus = this.status;
        this.status = data.status;
        this.dangerStatus = data.dangerStatus;

        // TODO pas giga concaincu de ce fonctionnement
        if (this.previousStatus !== this.status) {
            if (this.status === LanderStatus.DEAD) {
                // si le précedent état c'était autre chose que DEAD,
                // alors le vaisseau vient tout juste d'exploser
                this.explode();
            } else if (this.status === LanderStatus.SPAWNED) {
                // si le précédent état c'était autre chose que SPAWNED,
                // alors le vaisseau vient tout juste de réapparaitre
                this.each((c: any) => c.setVisible(true));
            }
        }
    }

    setActions(actions: PlayerActions): void {
        this.actions = actions;
    }

    explode(): void {
        // hide evey elements of the ship (because it exploded you know)
        this.each((c: any) => c.setVisible(false));

        // send 'fake' parts flying
        for (let i = 0; i < 15; i++) {
            const partSprite = this.scene.physics.add.sprite(0, 0, 'fake_ship').setScale(0.5);
            partSprite.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
            partSprite.setAngularVelocity(Phaser.Math.Between(-100, -100));
            const tw = this.scene.tweens.add({
                targets: partSprite,
                alpha: 0,
                ease: 'linear',
                duration: 2000,
                yoyo: false,
                loop: 0
            });
            tw.on('complete', () => partSprite.destroy());
            this.add(partSprite);
        }
    }

    update(): void {
        // update ship parameters
        this.setAngle(this.angle);

        // update engine visibility
        this.enginesContainer.each((e: FakeEngine) => {
            e.update(this.actions);
        });
    }

    getHeight(): number {
        return this.fakeShipSprite.height;
    }
}
