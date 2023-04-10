import { Physics } from 'phaser';
import { Explosion } from './Explosion';
import { Flag } from './Flag';
import { Indicator } from './Indicator';
import { Hud } from './Hud';
import { PlayerActions, LanderRotation, LanderStatus, LanderDangerStatus } from '../../Models/player';

export class Ship extends Physics.Arcade.Sprite {

    private INITIAL_ANGLE = 0 // pointing up
    private ROTATION_SPEED = 100
    private ANGULAR_ACCELERATION = 10
    private ACCELERATION = 300
    private MAX_SPEED = 300
    private SPACE_DRAG = 0
    private GROUND_DRAG = 0.05
    private BOUNCE = 0.5
    private EXPLOSION_SPEED = new Phaser.Math.Vector2(40, 40)
    private LANDING_MAX_SPEED = new Phaser.Math.Vector2(5, 5)
    private LANDING_MAX_ANGLE = 15
    private FUEL_TANK_SIZE = 3000

    private canvasWidth: number
    private canvasHeight: number
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

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, name: string, uuid: string, emoji: string, color: string, invincible?: boolean) {
        super(scene, x, y, texture)
        scene.add.existing(this)
        scene.physics.add.existing(this)

        const { width, height } = this.scene.sys.canvas
        this.canvasWidth = width
        this.canvasHeight = height

        this.setName('ship')
        this.setOrigin(0.5, 0.5)
        this.angle = this.INITIAL_ANGLE
        this.setMaxVelocity(this.MAX_SPEED, this.MAX_SPEED)
        this.setDrag(this.SPACE_DRAG, this.SPACE_DRAG)
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

        this.hud = new Hud(scene, 0, 0, 'hudLine', this.FUEL_TANK_SIZE, this)

        // setup indicator
        this.indicator = new Indicator(scene, 0, 0, 'indicator', name, color)
        // setup flag
        this.flag = new Flag(scene, 0, 0, 'flag', emoji)
        this.flag.setVisible(false)

        // setup engines particules emitters
        const smokeParticles = scene.add.particles('smoke_particule')
        const fireParticles = scene.add.particles('fire_particule')

        const enginesParticulesOptions: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
            speed: 75,
            lifespan: 300,
            frequency: 1,
            scale: { start: 1.5, end: 0.2 },
            alpha: 0.5,
            angle: 90,
            blendMode: Phaser.BlendModes.ADD,
        }
        this.leftEngine = smokeParticles.createEmitter(enginesParticulesOptions)
        this.leftEngine.setPosition(14, 15)
        this.rightEngine = smokeParticles.createEmitter(enginesParticulesOptions)
        this.rightEngine.setPosition(-14, 15)
        this.mainEngine = fireParticles.createEmitter(enginesParticulesOptions)
        this.mainEngine.setPosition(0, 15)
        this.mainEngine.setTint([0xff0000, 0xff6600, 0xffff00]) // fire tints !
        this.mainEngine.setSpeed(100)
        this.mainEngine.setScale({ start: 2.5, end: 0.2 })

        this.enginesContainer = scene.add.container(0, 0, [smokeParticles, fireParticles])
    }

    update(): void {
        // do nothing if ship status is different from 'ALIVE'
        if (this.status !== LanderStatus.ALIVE) {
            return
        }

        // update velocity history
        this.velocityHistory.push(new Phaser.Math.Vector2(this.body.velocity.x, this.body.velocity.y))
        if (this.velocityHistory.length > 2) {
            this.velocityHistory.shift()
        }

        // update altitude information
        this.altitude = this.canvasHeight - this.y - this.height - 24 // 24 is the ground sprite height...

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
                    this.setAngularAcceleration(-this.ANGULAR_ACCELERATION)
                    this.setAngularVelocity(-this.ROTATION_SPEED)
                    this.leftEngine.start()
                    break;
                case LanderRotation.CLOCKWISE:
                    // rotate right
                    this.usedFuel++
                    this.setAngularAcceleration(this.ANGULAR_ACCELERATION)
                    this.setAngularVelocity(this.ROTATION_SPEED)
                    this.rightEngine.start()
                    break;
                default:
                    // stop rotation
                    this.setAngularAcceleration(0)
                    this.leftEngine.stop()
                    this.rightEngine.stop()
            }

            if (this.actions.thrust) {
                this.usedFuel+=2 // main engine fuel cost is greater
                // Calculate acceleration vector based on this.angle and this.ACCELERATION
                this.setAccelerationX(Math.sin(this.rotation) * this.ACCELERATION)
                this.setAccelerationY(Math.sin(this.rotation - Math.PI/2) * this.ACCELERATION)
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

        if (this.isTooFastToLand() || this.isBadAngleToLand()) {
            // The ship hit the ground too hard, or with too great angle with the ground, blow it up and start over
            return this.explode(true)
        } else {
            // we apply some sort of a drag manualy to avoid changing the body drag
            this.body.velocity.x -= (Math.sign(this.body.velocity.x) * this.GROUND_DRAG);
            if (this.isSlowEnough()) {
                // we've landed !
                return this.land()
            }
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
        this.hud.setContainerVisible(false)
        this.enginesContainer.setVisible(false)

        // Move the ship back to the top of the stage, at a random X position
        this.setPosition(Phaser.Math.Between(40, this.canvasWidth - 40), 32)
        this.setAcceleration(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200))
        this.setAngularAcceleration(Phaser.Math.Between(-100, 100))

        // Select a random starting angle and velocity
        this.setAngle(Phaser.Math.Between(-180, 180))
        this.setVelocity(Phaser.Math.Between(-150, 150), 0)
        this.setAngularVelocity(Phaser.Math.Between(-100, 100))

        // ship becomes alive / landable again after a small time offset
        this.scene.time.addEvent({
            callback: () => {
                if (this.scene) {
                    this.status = LanderStatus.ALIVE
                    // Set collisions back
                    this.body.enable = true
                    // display ship and hud
                    this.setVisible(true)
                    this.hud.setContainerVisible(true)
                    this.enginesContainer.setVisible(true)
                }
            },
            callbackScope: this,
            delay: 500,
            loop: false
        })
    }

    explode(respawn: boolean): void {
        this.status = LanderStatus.DEAD
        this.setVisible(false)
        this.hud.setContainerVisible(false)
        this.enginesContainer.setVisible(false)
        // disable collisions
        this.body.enable = false;

        // create explosion
        const explosion = new Explosion(this.scene, this.x, this.y, 'explosion')

        // send parts flying
        for (let i = 0; i < 4; i++) {
            const partSprite = this.scene.physics.add.sprite(this.x, this.y, 'shipParts', i)
            partSprite.setBounce(0.5)
            partSprite.setVelocity(Phaser.Math.Between(-180, 180), Phaser.Math.Between(-50, -200))
            partSprite.setAngularVelocity(Phaser.Math.Between(-100, -100))
            const tw = this.scene.tweens.add({
                targets: partSprite,
                alpha: 0,
                ease: 'linear',
                duration: 3000,
                yoyo: false,
                loop: 0
            })
            tw.on('complete', () => partSprite.destroy())
            this.parts.add(partSprite)
        }

        if (respawn) {
            this.setResetCallback(3000)
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

    isTooFastToLand(): boolean {
        if (this.isInvincible) {
            return false
        }

        // medium speed for last 2 frames must be below threshold
        const vx = (Math.abs(this.velocityHistory[0].x) + Math.abs(this.velocityHistory[1].x)) / 2
        const vy = (Math.abs(this.velocityHistory[0].y) + Math.abs(this.velocityHistory[1].y)) / 2

        if (vx > this.EXPLOSION_SPEED.x || vy > this.EXPLOSION_SPEED.y) {
            // console.log(`Too fast to land : 
            //     x (${vx}) > this.EXPLOSION_SPEED.x (${this.EXPLOSION_SPEED.x})
            //     y (${vy}) > this.EXPLOSION_SPEED.y (${this.EXPLOSION_SPEED.y})`);
            this.dangerStatus = this.dangerStatus | LanderDangerStatus.TOO_FAST
            return true
        }
        this.dangerStatus = this.dangerStatus & LanderDangerStatus.TOO_FAST;
        return false
    }

    isBadAngleToLand(): boolean {
        if (this.isInvincible) {
            return false
        }

        if (Math.abs(this.angle) > this.LANDING_MAX_ANGLE) {
            this.dangerStatus = this.dangerStatus | LanderDangerStatus.BAD_ANGLE;
            return true
        }
        this.dangerStatus = this.dangerStatus & LanderDangerStatus.BAD_ANGLE;
        return false
    }
    
    isSlowEnough(): boolean {
        return Math.abs(this.body.velocity.x) < this.LANDING_MAX_SPEED.x
            && Math.abs(this.body.velocity.y) < this.LANDING_MAX_SPEED.y;
    }

    isInDangerZone(): boolean {
        if (this.y > this.canvasHeight - 200) {
            return this.isTooFastToLand() || this.isBadAngleToLand()
        }
        return false
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
        this.flag.plant(this.x - this.width, this.y + this.height / 2)

        // send event to webapp
        this.scene.game.events.emit('SHIP_LANDED', { name: this.playerName, usedFuel: this.usedFuel })

        // reset ship in 3 seconds
        this.setResetCallback(3000);
    }
}