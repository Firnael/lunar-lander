import 'phaser'
import explosion_spritesheet_url from '../Assets/images/explosion.png'
import ship_parts_spritesheet_url from '../Assets/images/ship_parts.png'
import ship_sprite_url from '../Assets/images/ship.png'
import background_sprite_url from '../Assets/images/background.png'
import ground_sprite_url from '../Assets/images/ground.png'
import indicator_sprite_url from '../Assets/images/indicator.png'
import flag_sprite_url from '../Assets/images/flag.png'
import hud_line_sprite_url from '../Assets/images/hud_line.png'
import danger_sign_sprite_url from '../Assets/images/danger_sign.png'
import smoke_particule_sprite_url from '../Assets/images/smoke_particule.png'
import fire_particule_sprite_url from '../Assets/images/fire_particule.png'
import { Ship } from '../Models/Ship'

export class GameScene extends Phaser.Scene {
	private CANVAS!: Phaser.Game["canvas"]
	private GRAVITY = 50

	private ships: Ship[] = []
	private shipsCollisionGroup!: Phaser.GameObjects.Group

	private dataHeartBeat!: Phaser.Time.TimerEvent
	
	private groundY = 0
	private groundGroup!: Phaser.GameObjects.Group

	constructor() {
		super({
			key: 'LunarLanderScene'
		})
	}

	preload(): void {
		this.load.spritesheet('explosion', explosion_spritesheet_url, { frameWidth: 128, frameHeight: 128 })
		this.load.spritesheet('shipParts', ship_parts_spritesheet_url, { frameWidth: 25, frameHeight: 16 })
		this.load.image('ship', ship_sprite_url)
		this.load.image('background', background_sprite_url)
		this.load.image('ground', ground_sprite_url)
		this.load.image('indicator', indicator_sprite_url)
		this.load.image('flag', flag_sprite_url)
		this.load.image('hudLine', hud_line_sprite_url)
		this.load.image('dangerSign', danger_sign_sprite_url)
		// particules
		this.load.image('smoke_particule', smoke_particule_sprite_url)
		this.load.image('fire_particule', fire_particule_sprite_url)
	}

	create(): void {
		// Init event listeners (use from outside Phaser to communicate with React)
		this.initEventListeners()

		// DEBUG - teleport first player ship and give it a bump
		this.input.on('pointerdown', (pointer: any) => {
			console.log('down');
			this.ships[0]?.setPosition(pointer.x, pointer.y);
			this.ships[0]?.setVelocityX(200);
		});

		// Create the data heartbeat
		this.dataHeartBeat = this.time.addEvent({
			callback: this.sendShipsDataToServer,
			callbackScope: this,
			delay: 50, // in ms
			loop: true
		});

		// Retrieve canvas width and height
		this.CANVAS = this.sys.game.canvas;

		// Set world gravity
		this.physics.world.gravity.y = this.GRAVITY;

		// Set background image
		const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0)
		const scaleX = this.cameras.main.width / backgroundImage.width
		const scaleY = this.cameras.main.height / backgroundImage.height
		const scale = Math.max(scaleX, scaleY)
		backgroundImage.setScale(scale).setScrollFactor(0)

		// Create some ground for the ship to land on
		this.groundGroup = this.add.group()
		for (let x = 0; x < this.CANVAS.width; x += 60) {
			// Add the ground blocks, enable physics on each, make them immovable
			const groundBlock = this.physics.add.sprite(x, this.groundY, 'ground').setOrigin(0, 0)
			groundBlock.setPosition(x, this.CANVAS.height - groundBlock.height)
			groundBlock.body.setImmovable(true)
			groundBlock.body.setAllowGravity(false)
			this.groundGroup.add(groundBlock)
		}

		// Create the ships collision group
		this.shipsCollisionGroup = this.add.group()
	}

	update(): void {
		for(const ship of this.ships) {
			// update ships
			ship.update()
			// keep ships on screen
			if (ship.x > this.CANVAS.width) ship.x = 0
			if (ship.x < 0) ship.x = this.CANVAS.width
		}
	}

	private createShip(data: any, x = 0, y = 0) {
		// Add the ship to the stage
		const ship: Ship = new Ship(this, x, y, 'ship', data.name, data.emoji, data.name === 'Croclardon')
		// Choose a random starting angle and velocity for the ship
		ship.reset()
		// Enable collisions between ship and ground
		this.physics.add.collider(ship, this.groundGroup)
		// Enable collisions betweend ships
		this.physics.add.collider(ship, this.shipsCollisionGroup, (s1, s2) => {
			const ship1 = s1 as Ship
			const ship2 = s2 as Ship
			ship1.explode(true)
			ship2.explode(true)
		});
		// Enable collisions between ship parts and ground
		this.physics.add.collider(ship.parts, this.groundGroup)
		// Add to ship array
		this.ships.push(ship)
		this.shipsCollisionGroup.add(ship)
	}

	private destroyShip(data: any) {
		const index = this.ships.findIndex(s => s.playerName === data.name)
		this.ships[index].explode(false)
		this.ships[index].destroy()
		this.ships.splice(index, 1)
	}

	private updateShip(data: any) {
		const index = this.ships.findIndex(s => s.playerName === data.name)
		this.ships[index].changeActions(data.actions)
	}

	private initEventListeners(): void {
		this.game.events.on('CREATE_LANDER', (data: any) => this.createShip(data), this)
		this.game.events.on('DESTROY_LANDER', (data: any) => this.destroyShip(data), this)
		this.game.events.on('UPDATE_LANDER', (data: any) => this.updateShip(data), this)
	}

	private sendShipsDataToServer(): void {
		const data = this.ships.map(s => {
			return {
				name: s.playerName,
				vx: s.body.velocity.x,
				vy: s.body.velocity.y,
				angle: s.angle,
				altitude: this.groundY - s.y - s.height / 2,
				usedFuel: s.usedFuel,
			}
		})
		this.game.events.emit('LANDERS_DATA', { landersData: data })
	}
}