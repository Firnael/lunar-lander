import { Physics } from 'phaser';
import { Explosion } from './Explosion';
import { Flag } from './Flag';
import { Indicator } from './Indicator';
import { Hud } from './Hud';
import { PlayerActions, LanderRotation, LanderStatus, LanderDangerStatus } from '../../Models/player';
import { ShipType } from '../Types/ShipType';

export class Ship extends Physics.Arcade.Sprite {
    // From server config
    private SHIP_MAX_VELOCITY: number;
    private SHIP_ACCELERATION: number;
    private USE_ANGULAR_ACCELERATION: boolean;
    private SHIP_ANGULAR_ACCELERATION: number;
    private SHIP_ANGULAR_VELOCITY: number;
    private LANDING_MAX_ANGLE: number;
    private LANDING_MAX_VELOCITY: Phaser.Math.Vector2;
    private FUEL_TANK_SIZE: number;
    private DANGER_ZONE_HEIGHT: number;
    
    private INITIAL_ANGLE = 0 // pointing up
    private DRAG = 0 // no drag in space
    private BOUNCE = 0 // no bounce (maybe later)
    private FLYING_PARTS_FADE_DURATION = 3000;
    private RESET_CALLBACK_DELAY = 3000;
    private ENGINES_PARTICULES_OFFSET = 5;
    private MAIN_ENGINE_TINTS = new Map<ShipType, number[]>([
        [ShipType.DISPLAY, [0xff0000, 0xff6600, 0xffff00]], // orange fire
        [ShipType.TRAINING, [0x043F97, 0x1064C1, 0x66BEF9]] // blue fire
    ]);

    private canvasWidth: number
    private canvasHeight: number
    private groundSpriteHeight: number;
    private shipType: ShipType;
    private isInvincible: boolean
    private indicator: Indicator
    private flag: Flag
    private hud: Hud
    private velocityHistory: Phaser.Math.Vector2[]

    private enginesContainer: Phaser.GameObjects.Container
    private mainEngine: Phaser.GameObjects.Particles.ParticleEmitter
    private leftEngine: Phaser.GameObjects.Particles.ParticleEmitter
    private rightEngine: Phaser.GameObjects.Particles.ParticleEmitter

    public playerName: string
    public playerUuid: string
    public playerEmoji: string
    public playerColor: string
    public usedFuel: number
    public altitude: number
    public status: LanderStatus
    public dangerStatus: LanderDangerStatus;
    public actions: PlayerActions
    public parts: Phaser.GameObjects.Group

    constructor(
        scene: Phaser.Scene, x: number, y: number, texture: string, groundSpriteHeight: number,
        name: string, uuid: string, emoji: string, color: string, shipType: ShipType, invincible?: boolean) {
        super(scene, x, y, texture)

        // set from server config
        this.FUEL_TANK_SIZE = scene.registry.get('FUEL_TANK_SIZE');
        this.SHIP_MAX_VELOCITY = scene.registry.get('SHIP_MAX_VELOCITY');
        this.SHIP_ACCELERATION = scene.registry.get('SHIP_ACCELERATION');
        this.USE_ANGULAR_ACCELERATION = scene.registry.get('USE_ANGULAR_ACCELERATION');
        this.SHIP_ANGULAR_ACCELERATION = scene.registry.get('SHIP_ANGULAR_ACCELERATION');
        this.SHIP_ANGULAR_VELOCITY = scene.registry.get('SHIP_ANGULAR_VELOCITY');
        this.LANDING_MAX_ANGLE = scene.registry.get('LANDING_MAX_ANGLE');
        this.LANDING_MAX_VELOCITY = new Phaser.Math.Vector2(
            scene.registry.get('LANDING_MAX_VELOCITY_X'),
            scene.registry.get('LANDING_MAX_VELOCITY_Y')
        );
        this.DANGER_ZONE_HEIGHT = scene.registry.get('DANGER_ZONE_HEIGHT');

        scene.add.existing(this)
        scene.physics.add.existing(this)

        const { width, height } = this.scene.sys.canvas
        this.canvasWidth = width
        this.canvasHeight = height
        this.groundSpriteHeight = groundSpriteHeight;
        this.shipType = shipType;

        this.setName('ship')
        this.setOrigin(0.5, 0.5)
        this.angle = this.INITIAL_ANGLE
        this.setMaxVelocity(this.SHIP_MAX_VELOCITY, this.SHIP_MAX_VELOCITY)
        this.setDrag(this.DRAG, this.DRAG)
        this.setBounce(this.BOUNCE, this.BOUNCE)

        // player preferencies
        this.playerName = name
        this.playerUuid = uuid
        this.playerEmoji = emoji
        this.playerColor = color

        // apply outline with plugin
        const outlinePlugin = scene.plugins.get('rexOutlinePipeline') as any
        outlinePlugin.add(this, {
            thickness: 2,
            outlineColor: parseInt(color, 16)
        });

        this.parts = this.scene.add.group()

        this.actions = {
            thrust: false,
            rotate: LanderRotation.NONE
        }

        this.status = LanderStatus.ALIVE
        this.dangerStatus = LanderDangerStatus.SAFE
        this.usedFuel = 0
        this.isInvincible = invincible || false
        this.velocityHistory = []
        this.altitude = 0

        this.hud = new Hud(scene, 0, 0, this.FUEL_TANK_SIZE, this)

        // setup indicator
        this.indicator = new Indicator(scene, 0, 0, 'indicator', name, color)
        // setup flag
        this.flag = new Flag(scene, 0, 0, 'flag', emoji);
        this.flag.setVisible(false)

        // setup engines particules emitters
        const smokeParticles = scene.add.particles('smoke_particule')
        const fireParticles = scene.add.particles('fire_particule')

        const enginesParticulesOptions: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
            speed: 75,
            lifespan: { min: 100, max: 300 },
            frequency: 1,
            scale: { start: 1.5, end: 0.2 },
            angle: { min: 80, max: 100 },
            alpha: 0.5,
            blendMode: Phaser.BlendModes.ADD,
        }
        this.leftEngine = smokeParticles.createEmitter(enginesParticulesOptions)
        this.leftEngine.setPosition(this.width / 2, this.height / 2 + this.ENGINES_PARTICULES_OFFSET)
        this.rightEngine = smokeParticles.createEmitter(enginesParticulesOptions)
        this.rightEngine.setPosition(-this.width / 2, this.height / 2 + this.ENGINES_PARTICULES_OFFSET)
        this.mainEngine = fireParticles.createEmitter(enginesParticulesOptions)
        this.mainEngine.setPosition(0, this.height / 2 + this.ENGINES_PARTICULES_OFFSET)
        this.mainEngine.setTint(this.MAIN_ENGINE_TINTS.get(this.shipType) || 0xFF00FF);
        this.mainEngine.setSpeed(100)
        this.mainEngine.setScale({ start: 2.5, end: 0.2 })

        this.enginesContainer = scene.add.container(0, 0, [smokeParticles, fireParticles])
    }

    update(): void {
        this.isInvincible = true;
        // do nothing if ship status is different from 'ALIVE'
        if (this.status !== LanderStatus.ALIVE) {
            return
        }

        // update danger flags
        this.flagTooFastToLand();
        this.flagBadAngleToLand();

        // update velocity history
        this.velocityHistory.push(new Phaser.Math.Vector2(this.body.velocity.x, this.body.velocity.y))
        if (this.velocityHistory.length > 2) {
            this.velocityHistory.shift()
        }

        // update altitude information
        // we use 'displayHeight' to take scaling into account then divide it by 2 because we set origin to 0.5 
        this.altitude = this.canvasHeight - this.y - this.displayHeight / 2 - this.groundSpriteHeight;

        // update HUD
        this.hud.update()

        // update indicator
        this.indicator.update(this.body.position)

        // update container position
        this.enginesContainer.setPosition(this.x, this.y)
        this.enginesContainer.setAngle(this.angle)

        // no more fuel, sorry :D
        if (this.usedFuel >= this.FUEL_TANK_SIZE) {
            // stop rotation
            this.setAcceleration(0, 0)
            this.setAngularAcceleration(0)
            this.mainEngine.stop()
            this.leftEngine.stop()
            this.rightEngine.stop()
        } else {
            // handle player actions
            switch (this.actions.rotate) {
                case LanderRotation.COUNTERCLOCKWISE:
                    // rotate left
                    this.usedFuel++
                    if (this.USE_ANGULAR_ACCELERATION) {
                        this.setAngularAcceleration(-this.SHIP_ANGULAR_ACCELERATION);
                    } else {
                        this.setAngularVelocity(-this.SHIP_ANGULAR_VELOCITY);
                    }
                    this.leftEngine.start();
                    this.rightEngine.stop();
                    break;
                case LanderRotation.CLOCKWISE:
                    // rotate right
                    this.usedFuel++
                    if (this.USE_ANGULAR_ACCELERATION) {
                        this.setAngularAcceleration(this.SHIP_ANGULAR_ACCELERATION);
                    } else {
                        this.setAngularVelocity(this.SHIP_ANGULAR_VELOCITY);
                    }
                    this.rightEngine.start();
                    this.leftEngine.stop();
                    break;
                default:
                    // stop rotation
                    if (this.USE_ANGULAR_ACCELERATION) {
                        this.setAngularAcceleration(0);
                    } else {
                        this.setAngularVelocity(0);
                    }
                    this.rightEngine.stop();
                    this.leftEngine.stop();
            }

            if (this.actions.thrust) {
                this.usedFuel+=2 // main engine fuel cost is greater
                // Calculate acceleration vector based on this.angle and this.SHIP_ACCELERATION
                this.setAccelerationX(Math.sin(this.rotation) * this.SHIP_ACCELERATION)
                this.setAccelerationY(Math.sin(this.rotation - Math.PI/2) * this.SHIP_ACCELERATION)
                // Start main engine !
                this.mainEngine.start()
            } else {
                // Otherwise, stop thrusting
                this.setAcceleration(0, 0)
                // Stop main engine
                this.mainEngine.stop()
            }
        }
    }

    hitTheGround(): void {
        // do nothing if ship status if not ALIVE
        if (this.status !== LanderStatus.ALIVE) {
            return
        }

        if (this.isSafe()) {
            this.land();
        } else {
            // The ship hit the ground too hard,
            // or with too great angle with the ground,
            // blow it up and start over
            this.explode(true);
        }
    }

    reset(): void {
        this.status = LanderStatus.SPAWNED
        this.dangerStatus = LanderDangerStatus.SAFE
        // Reset usedFuel
        this.usedFuel = 0
        // hide flag
        this.flag.setVisible(false)
        // hide ship & hud until ship becomes landable again
        this.setVisible(false)
        this.hud.setVisible(false)
        this.enginesContainer.setVisible(false)

        // Move the ship back to the top of the stage, at a random X position
        const spawnPosition = new Phaser.Math.Vector2(
            Phaser.Math.Between(40, this.canvasWidth - 40),
            this.shipType === ShipType.DISPLAY ? 32 : 100 // training ground has a ceiling, and ship is bigger, so we need to spawn it lower
        );
        this.setPosition(spawnPosition.x, spawnPosition.y);

        // Select a random starting angle and velocity
        this.setAngle(Phaser.Math.Between(-180, 180))
        this.setVelocity(Phaser.Math.Between(-300, 300), 0)
        this.setAngularVelocity(Phaser.Math.Between(-300, 300))

        // ship becomes alive / landable again after a small time offset
        this.scene.time.addEvent({
            callback: () => {
                if (this.scene) {
                    this.status = LanderStatus.ALIVE
                    // Set collisions back
                    this.body.enable = true
                    // display ship and hud
                    this.setVisible(true)
                    this.hud.setVisible(true)
                    this.enginesContainer.setVisible(true)
                }
            },
            callbackScope: this,
            delay: 500,
            loop: false
        })
    }

    explode(respawn: boolean): void {
        this.status = LanderStatus.CRASHED
        this.setVisible(false)
        this.hud.setVisible(false)
        this.enginesContainer.setVisible(false)
        // disable collisions
        this.body.enable = false;

        // create explosion
        new Explosion(this.scene, this.x, this.y, this.shipType === ShipType.DISPLAY ? 'explosion' : 'blue_explosion');

        // send parts flying
        for (let i = 0; i < 4; i++) {
            const partSprite = this.scene.physics.add.sprite(
                this.x, this.y, this.shipType === ShipType.DISPLAY ? 'ship_parts' : 'training_ship_parts', i)
                .setScale(this.scale)
                .setBounce(0.5)
                .setVelocity(Phaser.Math.Between(-180, 180), Phaser.Math.Between(-50, -200))
                .setAngularVelocity(Phaser.Math.Between(-100, -100));

            this.scene.tweens.add({
                targets: partSprite,
                alpha: 0,
                ease: 'linear',
                duration: this.FLYING_PARTS_FADE_DURATION,
                loop: 0
            }).on('complete', () => partSprite.destroy());

            this.parts.add(partSprite)
        }

        if (respawn) {
            this.setResetCallback(this.RESET_CALLBACK_DELAY)
        }
        this.scene.game.events.emit('SHIP_EXPLODED', { name: this.playerName, usedFuel: this.FUEL_TANK_SIZE })
    }

    changeActions(actions: PlayerActions) {
        this.actions = actions
    }

    destroy(): void {
        this.hud.destroy()
        this.indicator.destroy()
        this.flag.destroy()
        this.enginesContainer.destroy()
        super.destroy()
    }

    flagTooFastToLand(): void {
        if (this.isInvincible) {
            this.dangerStatus = 0;
            return;
        }

        // cannot compute velocity if no history
        if (this.velocityHistory.length < 2) {
            return;
        }

        // medium speed for last 2 frames must be below threshold
        const vx = (Math.abs(this.velocityHistory[0].x) + Math.abs(this.velocityHistory[1].x)) / 2
        const vy = (Math.abs(this.velocityHistory[0].y) + Math.abs(this.velocityHistory[1].y)) / 2

        // flag vx
        if (vx > this.LANDING_MAX_VELOCITY.x) {
            this.dangerStatus |= LanderDangerStatus.TOO_FAST_X;
        } else {
            this.dangerStatus &= ~LanderDangerStatus.TOO_FAST_X;
        }

        // flag vy
        if (vy > this.LANDING_MAX_VELOCITY.y) {
            this.dangerStatus |= LanderDangerStatus.TOO_FAST_Y;
        } else {
            this.dangerStatus &= ~LanderDangerStatus.TOO_FAST_Y;
        }
    }

    flagBadAngleToLand(): boolean {
        if (this.isInvincible) {
            return false
        }

        if (Math.abs(this.angle) > this.LANDING_MAX_ANGLE) {
            this.dangerStatus |= LanderDangerStatus.BAD_ANGLE;
            return true;
        }
        this.dangerStatus &= ~LanderDangerStatus.BAD_ANGLE;
        return false;
    }
    
    isInDangerZone(): boolean {
        if (this.y > this.canvasHeight - this.DANGER_ZONE_HEIGHT) {
            return !this.isSafe();
        }
        return false;
    }

    isSafe(): boolean {
        return this.dangerStatus === 0;
    }

    setResetCallback(delay: number): void {
        this.scene.time.addEvent({
            callback: () => {
                // scene could have been destroyed during that time (page reload, etc.)
                if (this.scene) { this.reset() }
            }, 
            callbackScope: this,
            delay: delay,
            loop: false
        })
    }

    private land(): void {
        this.status = LanderStatus.LANDED
        // reset actions
        this.actions = {
            thrust: false,
            rotate: LanderRotation.NONE
        }
        // turn off engines
        this.mainEngine.stop()
        this.leftEngine.stop()
        this.rightEngine.stop()

        // stop the ship
        this.setAngularAcceleration(0)
        this.setAngularVelocity(0)
        this.setAcceleration(0)
        this.setVelocity(0, 0)
        this.angle = this.INITIAL_ANGLE

        // update the hud one last time to display last values
        this.hud.update()

        // plant flag
        this.flag.plant(this.x - this.displayWidth, this.y + this.displayHeight / 2)

        // send event to webapp
        this.scene.game.events.emit('SHIP_LANDED', { name: this.playerName, usedFuel: this.usedFuel })

        // reset ship in 3 seconds
        this.setResetCallback(this.RESET_CALLBACK_DELAY);
    }

    setScale(x: number, y?: number): this {
        super.setScale(x, y);
        this.enginesContainer.setScale(x, y);
        this.hud.setScale(x, y);
        this.flag.setScale(x, y);
        return this;
    }
}