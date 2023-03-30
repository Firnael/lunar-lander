import 'phaser';
import { FakeShip } from '../GameObjects/FakeShip';
import { MonitoringGrid } from '../GameObjects/MonitoringGrid';
import { LanderData, PlayerJoins, PlayerLeaves, PlayerUpdates } from '../../Models/player';
import monitoring_cursor_url from '../Assets/images/monitoring_cursor.png';

export class MonitoringScene extends Phaser.Scene {
    private ships: FakeShip[] = [];
    private monitoringGrid!: MonitoringGrid;

    constructor() {
        super({
            key: 'MonitoringScene',
            physics: {
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            }
        });
    }

    preload(): void {
        console.log(this.scene.key);
    }

    create(): void {
        // Set custom cursor
        this.input.setDefaultCursor(`url(${monitoring_cursor_url}), auto`);

        // Apply horri-fi effect to whole camera
        const horrifiPlugin = this.plugins.get('rexHorrifiPipeline') as any;
        horrifiPlugin.add(this.cameras.main, {
            // VHS
            vhsEnable: true, vhsStrength: 0.3,
            // Bloom
            bloomEnable: true, bloomRadius: 0.3, bloomIntensity: 0.5,
            bloomThreshold: 0.2, bloomTexelWidth: 0.5, bloomTexelHeight: 0.5
        });

        // Set background image
        const backgroundImage = this.add.image(0, 0, 'monitorBackground').setOrigin(0, 0);
        const scaleX = this.cameras.main.width / backgroundImage.width;
        const scaleY = this.cameras.main.height / backgroundImage.height;
        const scale = Math.max(scaleX, scaleY);
        backgroundImage.setScale(scale).setScrollFactor(0);

        // Set title
        const titleContent = [
            'CROCLARDON INDUSTRIES UNIFIED OPERATING SYSTEM',
            'COPYRIGHT 1991-2023 CROCLARDON INDUSTRIES',
            '-Display 1-'
        ];
        this.add.text(this.cameras.main.width / 2, 40, titleContent, {
            font: '22px Greenscr',
            color: '#76CE81',
            align: 'center'
        })
        .setLineSpacing(6).setOrigin(0.5, 0);

        // create grid
        this.monitoringGrid = new MonitoringGrid(this, 250, 250);

        // Init event listeners (use from outside Phaser to communicate with React)
        this.initEventListeners();
    }

    update(): void {
        for (const ship of this.ships) {
            ship.update();
        }
        this.monitoringGrid.update();
    }

    private initEventListeners(): void {
        this.game.events.on('CREATE_LANDER', (data: PlayerJoins) => this.createShip(data), this);
        this.game.events.on('DESTROY_LANDER', (data: PlayerLeaves) => this.destroyShip(data), this);
        this.game.events.on('UPDATE_LANDER', (data: PlayerUpdates) => this.setShipActions(data), this);
        this.game.events.on('LANDERS_DATA', (data: LanderData[]) => this.setShipsParameters(data), this);
        // notify webapp the game is ready to handle events
        this.game.events.emit('GAME_READY', {});
    }

    // TODO refact ce truc pour pas gérer de ship dans la scene, ce uniquement sont des élements des monitoring units enfait
    private createShip(data: PlayerJoins, x = 0, y = 0) {
        console.log(`[Phaser.Monitoring] Create 'fake' ship`, data);
        
        // Find an 'empty' monitorUnit
        const unit = this.monitoringGrid.getAvailableUnit(data.name);
        if (!unit) {
            console.error('No available unit to monitor ship');
            return;
        }

        // Add the ship to the scene
        const ship: FakeShip = new FakeShip(this, 0, 0, data.name, data.uuid, data.emoji, data.color);
        unit.setShipRef(ship);
        this.ships.push(ship);
    }

    private destroyShip(data: PlayerLeaves) {
        const index = this.ships.findIndex((s) => s.playerName === data.name);
        this.ships[index].explode();
        this.ships[index].destroy();
        this.ships.splice(index, 1);
    }

    private setShipsParameters(data: LanderData[]) {
        this.ships.forEach((s) => {
            const index = data.findIndex((d) => d.name === s.playerName);
            s.setParameters(data[index]);
        });
    }

    private setShipActions(data: PlayerUpdates) {
        const index = this.ships.findIndex((s) => s.playerName === data.name);
        this.ships[index].setActions(data.actions);
    }
}
