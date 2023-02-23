import { Physics } from 'phaser';
import { Explosion } from './Explosion';
import { Flag } from './Flag';
import { Indicator } from './Indicator';
import { Hud } from './Hud';
import { PlayerActions, LanderRotation } from '../../../Models/player';

export class Ship extends Physics.Arcade.Sprite {

    private INITIAL_ANGLE = 0 // pointing up
    private ROTATION_SPEED = 80
    private ANGULAR_ACCELERATION = 10
    private ACCELERATION = 200
    private MAX_SPEED = 250
    private DRAG = 0 // no drag in space duhh
    private BOUNCE = 0
    private LANDING_MAX_SPEED = new Phaser.Math.Vector2(40, 40)
    private LANDING_MAX_ANGLE = 15

    public playerName: string
    public playerEmoji: string
    public usedFuel: number
    public actions: PlayerActions
    public parts: Phaser.GameObjects.Group

    private isOnTheGround: boolean
    private isInvincible: boolean
    private isAlive: boolean
    private hasLanded: boolean
    private indicator: Indicator
    private flag: Flag
    private hud: Hud
    private velocityHistory: Phaser.Math.Vector2[]

    private enginesContainer: Phaser.GameObjects.Container
    private mainEngine: Phaser.GameObjects.Particles.ParticleEmitter
    private leftEngine: Phaser.GameObjects.Particles.ParticleEmitter
    private rightEngine: Phaser.GameObjects.Particles.ParticleEmitter

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, playerName: string, playerEmoji: string, invincible?: boolean) {
        super(scene, x, y, texture)
        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.setName('ship')
        this.setOrigin(0.5, 0.5)
        this.angle = this.INITIAL_ANGLE
        this.setMaxVelocity(this.MAX_SPEED, this.MAX_SPEED)
        this.setDrag(this.DRAG, this.DRAG)
        this.setBounce(this.BOUNCE, this.BOUNCE)
        // this.setTint(0xff00ff)

        this.parts = this.scene.add.group()

        this.actions = {
            thrust: false,
            rotate: LanderRotation.NONE
        }

        this.playerName = playerName
        this.playerEmoji = playerEmoji
        this.usedFuel = 0
        this.isAlive = true
        this.hasLanded = false
        this.isOnTheGround = false
        this.isInvincible = invincible || false
        this.velocityHistory = []

        this.hud = new Hud(scene, 0, 0, 'hudLine', this)

        // setup indicator
        this.indicator = new Indicator(scene, 0, 0, 'indicator', playerName)
        // setup flag
        this.flag = new Flag(scene, 0, 0, 'flag', playerEmoji)
        this.flag.setVisible(false)

        // setup engines particules emitters
        const smokeParticles = scene.add.particles('smoke_particule')
        const fireParticles = scene.add.particles('fire_particule')

        const enginesParticulesOptions: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
            speed: 50,
            lifespan: 200,
            frequency: 1,
            scale: { start: 1, end: 0.2 },
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
        this.mainEngine.setScale({ start: 2, end: 0.2 })

        this.enginesContainer = scene.add.container(0, 0, [smokeParticles, fireParticles])
    }

    update(): void {
        // do nothing if ship is dead
        if (!this.isAlive) {
            return
        }

        // do nothing if ship has already landed
        if (this.hasLanded) {
            return
        }

        // update velocity history
        this.velocityHistory.push(new Phaser.Math.Vector2(this.body.velocity.x, this.body.velocity.y))
        if (this.velocityHistory.length > 2) {
            this.velocityHistory.shift()
        }

        // update HUD
        this.hud.update()

        // update indicator
        this.indicator.update(this.body.position)

        this.isOnTheGround = this.body.touching.down

        if (this.isOnTheGround) {
            if (this.isTooFastToLand() || this.isBadAngleToLand()) {
                // The ship hit the ground too hard, or with too great angle with the ground, blow it up and start over
                return this.explode(true)
            } else {
                // we've landed !
                return this.land()
            }
        }

        // update container position
        this.enginesContainer.setPosition(this.x, this.y)
        this.enginesContainer.setAngle(this.angle)

        // handle player actions
        switch (this.actions.rotate) {
            case LanderRotation.COUNTERCLOCKWISE:
                // rotate left
                this.setAngularAcceleration(-this.ANGULAR_ACCELERATION)
                this.setAngularVelocity(-this.ROTATION_SPEED)
                this.leftEngine.start()
                break;
            case LanderRotation.CLOCKWISE:
                // rotate right
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
            this.usedFuel++
            // Calculate acceleration vector based on this.angle and this.ACCELERATION
            this.setAccelerationX(Math.cos(this.rotation - 90) * this.ACCELERATION)
            this.setAccelerationY(Math.sin(this.rotation - 90) * this.ACCELERATION)
            // Start main engine !
            this.mainEngine.start()
        } else {
            // Otherwise, stop thrusting
            this.setAcceleration(0, 0)
            // Stop main engine
            this.mainEngine.stop()
        }
    }

    reset(): void {
        // Reset usedFuel
        this.usedFuel = 0
        // hide flag
        this.flag.setVisible(false)
        // hide ship & hud until ship becomes landable again
        this.setVisible(false)
        this.hud.setContainerVisible(false)
        this.enginesContainer.setVisible(false)

        // Move the ship back to the top of the stage, at a random X position
        const { width, height } = this.scene.sys.canvas
        this.setPosition(Phaser.Math.Between(40, width - 40), 32)
        this.setAcceleration(0, 0)
        this.setAngularAcceleration(0)

        // Select a random starting angle and velocity
        this.setAngle(Phaser.Math.Between(-180, 180))
        this.setVelocity(Phaser.Math.Between(-100, 200), 0)
        this.setAngularVelocity(Phaser.Math.Between(-100, 100))

        // ship becomes alive / landable again after a small time offset
        this.scene.time.addEvent({
            callback: () => {
                if (this.scene) {
                    this.isAlive = true
                    this.hasLanded = false
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
        this.isAlive = false
        this.setVisible(false)
        this.hud.setContainerVisible(false)
        this.enginesContainer.setVisible(false)

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
            this.setResetCallback()
            //explosion.once('animationcomplete', () => )
        }
        this.scene.game.events.emit('SHIP_EXPLODED', { name: this.playerName })
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

        const vx = Math.abs(this.velocityHistory[0].x) - Math.abs(this.velocityHistory[1].x)
        const vy = Math.abs(this.velocityHistory[0].y) - Math.abs(this.velocityHistory[1].y)

        if (vx > this.LANDING_MAX_SPEED.x || vy > this.LANDING_MAX_SPEED.y) {
            return true
        }
        return false
    }

    isBadAngleToLand(): boolean {
        if (this.isInvincible) {
            return false
        }

        if (Math.abs(this.angle) > this.LANDING_MAX_ANGLE) {
            return true
        }
        return false
    }

    isInDangerZone(): boolean {
        if (this.y > this.scene.sys.canvas.height - 200) {
            return this.isTooFastToLand() || this.isBadAngleToLand()
        }
        return false
    }

    setResetCallback(): void {
        this.scene.time.addEvent({
            callback: () => { if (this.scene) this.reset() }, // ship could have been destroyed during that time
            callbackScope: this,
            delay: 3000,
            loop: false
        })
    }

    private land(): void {
        // ship has landed
        this.hasLanded = true
        this.actions = {
            thrust: false,
            rotate: LanderRotation.NONE
        }
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
        this.setResetCallback();
    }
}