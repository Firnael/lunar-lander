import 'phaser'
import { Ship } from '../GameObjects/Ship'
import { PlayerJoins, PlayerLeaves, PlayerUpdates } from '../../Models/player'
import { ShipCollisionMode } from '../Enums/admin'
import { ShipType } from '../Types/ShipType'
import { GameAi } from '../../Ai/game-ai';

export class GameScene extends Phaser.Scene {
	private CANVAS!: Phaser.Game["canvas"]
	private TOGGLE_DEBUG!: Phaser.Input.Keyboard.Key
	private CHANGE_SHIP_COLLISION_MODE!: Phaser.Input.Keyboard.Key

	private shipCollisionMode: ShipCollisionMode = ShipCollisionMode.NONE
	
	private ships: Ship[] = []
	private shipsCollisionGroup!: Phaser.GameObjects.Group
	private shipToShipColliders: Phaser.Physics.Arcade.Collider[] = []

	private groundBlockHeight!: number;
	private groundGroup!: Phaser.GameObjects.Group

	/** Server heartbeat timer */
	private dataHeartBeat!: Phaser.Time.TimerEvent

	private useAi = true;
	private gameAi!: GameAi;

	constructor() {
		super({
			key: 'LunarLanderScene'
		})
	}

	preload(): void {
		console.log(this.scene.key);
	}

	create(): void {
		// Retrieve canvas width and height
		this.CANVAS = this.sys.game.canvas;

		// --- DEBUG
		// teleport first player ship to mouse cursor and give it a bump
		this.input.on('pointerdown', (pointer: any) => {
			this.ships[0]?.setPosition(pointer.x, pointer.y);
			this.ships[0]?.setVelocityX(100);
			this.ships[0]?.setVelocityY(100);
		});
		// toggle 'debug' mode on a key press
		this.physics.world.drawDebug = false;
  		this.TOGGLE_DEBUG = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
		// --- DEBUG

		// Admin features key binding
		this.CHANGE_SHIP_COLLISION_MODE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

		// Create the data heartbeat
		this.dataHeartBeat = this.time.addEvent({
			callback: this.sendShipsDataToServer,
			callbackScope: this,
			delay: this.registry.get('SIMULATION_DATA_HEART_BEAT_RATE'),
			loop: true
		});

		// Set background image
		const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0)
		const scaleX = this.cameras.main.width / backgroundImage.width
		const scaleY = this.cameras.main.height / backgroundImage.height
		const scale = Math.max(scaleX, scaleY)
		backgroundImage.setScale(scale).setScrollFactor(0)

		// Create some ground for the ship to land on
		this.createGround();

		// Create the ships collision group
		this.shipsCollisionGroup = this.add.group()

		// Init event listeners (use from outside Phaser to communicate with React)
		if(!this.useAi){
			this.initEventListeners()
		}
		//
		//OR
		// Use AI controller
		else{
			this.gameAi = new GameAi(20, this);
		}
	}

	update(): void {
		for(const ship of this.ships) {
			// update ships
			ship.update()
			// keep ships on screen
			if (ship.x > this.CANVAS.width) ship.x = 0
			if (ship.x < 0) ship.x = this.CANVAS.width
		}

		// -- ADMIN
		if (Phaser.Input.Keyboard.JustDown(this.CHANGE_SHIP_COLLISION_MODE)) {
			let newMode: ShipCollisionMode;
			switch (this.shipCollisionMode) {
				case ShipCollisionMode.NONE: newMode = ShipCollisionMode.BUMP; break;
				case ShipCollisionMode.BUMP: newMode = ShipCollisionMode.EXPLOSIVE; break;
				case ShipCollisionMode.EXPLOSIVE: newMode = ShipCollisionMode.NONE; break;
				default: newMode = ShipCollisionMode.NONE;
			}
			this.shipCollisionMode = newMode;
			console.log('[Phaser.Display] Setting collision mode to', this.shipCollisionMode);
			this.updateShipsColliders();
		}

		// --- DEBUG
		if (Phaser.Input.Keyboard.JustDown(this.TOGGLE_DEBUG)) {
			if (this.physics.world.drawDebug) {
				this.physics.world.drawDebug = false;
				this.physics.world.debugGraphic.clear();
			}
			else {
				this.physics.world.drawDebug = true;
			}
		}
	}

	private createGround() {
		this.groundGroup = this.add.group();
		// TODO pas ouf
		const groundBlock = this.add.sprite(0, 0, 'moonGround');
		const width = groundBlock.displayWidth;
		this.groundBlockHeight = groundBlock.displayHeight;
		console.log(`Ground block; w: ${width}, h: ${this.groundBlockHeight}`);
		groundBlock.destroy();

		for (let x = 0; x < this.CANVAS.width; x += width) {
			// Add the ground blocks to the bottom of canvas, enable physics on each, make them immovable
			const groundBlock = this.physics.add.sprite(x, 0, 'moonGround').setOrigin(0, 0)
			groundBlock.setPosition(x, this.CANVAS.height - this.groundBlockHeight)
			groundBlock.body.setImmovable(true)
			groundBlock.body.setAllowGravity(false)
			this.groundGroup.add(groundBlock)
		}
	}

	public createShip(data: PlayerJoins, x = 0, y = 0) {
		console.log(`[Phaser.Display] Create ship`, data);
		// Add the ship to the scene
		const ship: Ship = new Ship(
			this, x, y, 'ship', this.groundBlockHeight,
			data.name, data.uuid, data.emoji, data.color, ShipType.DISPLAY, data.name === 'Croclardon'
		);
		// Choose a random starting angle and velocity for the ship
		ship.reset()
		// Enable and handle collisions between ship and ground
		this.physics.add.collider(ship, this.groundGroup, (s, g) => {
			(s as Ship).hitTheGround()
		})
		// Enable collisions between ship parts and ground
		this.physics.add.collider(ship.parts, this.groundGroup)
		// Add to ship array
		this.ships.push(ship)
		// Add to ship collision group
		this.shipsCollisionGroup.add(ship)
		// Enable collisions betweend ships
		this.updateShipsColliders();
	}

	public resetShips(): void{
		this.ships.forEach((ship, i) => {
			ship.reset()
			/*if(i > 0){
				const pos = this.ships[0].getPosition();
				const vitess = this.ships[0].getVelocity();
				ship.setPosition(pos[0], pos[1]);
				ship.setAngle(this.ships[0].getAngle());
				ship.setVelocity(vitess[0], vitess[1]);
			}*/
		});
	}
	public resetShip(name: string): void{
		this.ships.find(x => x.name === name)?.reset();
	}

	private updateShip(data: PlayerUpdates) {
		const index = this.ships.findIndex(s => s.playerName === data.name)
		this.ships[index].changeActions(data.actions)
	}

	private destroyShip(data: PlayerLeaves) {
		const index = this.ships.findIndex(s => s.playerName === data.name)
		this.ships[index].explode(false)
		this.ships[index].destroy()
		this.ships.splice(index, 1)
	}

	/**
	 * Change collisions between ships based on current ship collision mode
	 * - NONE : ships don't collide at all
	 * - BUMP : ships bump into each others on collision, it's harmless
	 * - EXPLODE : ships explode on collision !
	 */
	private updateShipsColliders() {
		this.shipToShipColliders.forEach(c => this.physics.world.removeCollider(c));

		switch (this.shipCollisionMode) {
			case ShipCollisionMode.NONE:
			default: {
				this.shipToShipColliders = [];
			}
			break;
			case ShipCollisionMode.BUMP: {
				this.shipToShipColliders = [];
				this.shipsCollisionGroup.getChildren().forEach((s) => {
					const shipToShipCollider = this.physics.add.collider(s, this.shipsCollisionGroup);
					this.shipToShipColliders.push(shipToShipCollider);
				});
			}
			break;
			case ShipCollisionMode.EXPLOSIVE: {
				this.shipToShipColliders = [];
				this.shipsCollisionGroup.getChildren().forEach((s) => {
					const shipToShipCollider = this.physics.add.collider(s, this.shipsCollisionGroup, (s1, s2) => {
						(s1 as Ship).explode(true);
						(s2 as Ship).explode(true);
					});
					this.shipToShipColliders.push(shipToShipCollider);
				});
			}
			break;
		}
	}

	private initEventListeners(): void {
		this.game.events.on('CREATE_LANDER', (data: PlayerJoins) => this.createShip(data), this)
		this.game.events.on('PLAYER_LEFT', (data: PlayerLeaves) => this.destroyShip(data), this)
		this.game.events.on('UPDATE_LANDER', (data: PlayerUpdates) => this.updateShip(data), this)
		// notify webapp the game is ready to handle events
		this.game.events.emit('GAME_READY', {});
	}

	private sendShipsDataToServer(): void {
		const data = new Map(this.ships.map(s => {
			const body = s.body as Phaser.Physics.Arcade.Body;
			return [s.playerUuid, {
				name: s.playerName,
				uuid: s.playerUuid,
				vx: body.velocity.x,
				vy: body.velocity.y,
				va: body.angularVelocity,
				angle: s.angle,
				altitude: s.altitude,
				usedFuel: s.usedFuel,
				status: s.status,
				dangerStatus: s.dangerStatus
			}];
		}));

		if (data.size >= 0) {
			if(this.useAi){
				const shipsActions = this.gameAi.update(data);
				for (const shipActions of shipsActions) {
					this.updateShip({
						uuid: shipActions[0],
						actions: shipActions[1],
						color: '', emoji: '', name: 'AI' + shipActions[0]
					});
				}
			}else{
				this.game.events.emit('SIMULATION_DATA', { landersData: data });
			}
		}
	}

	getShip(i: number): Ship {
		return this.ships[i];
	}
}