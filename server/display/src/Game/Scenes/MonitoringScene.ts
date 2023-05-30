import 'phaser';
import { MonitoringGrid } from '../GameObjects/MonitoringGrid';
import { LanderData, PlayerJoins, PlayerLeaves, PlayerUpdates } from '../../Models/player';
import monitoring_cursor_url from '../Assets/images/monitoring_cursor.png';

export class MonitoringScene extends Phaser.Scene {
    private UNIT_SIZE: number = 250;
    private MINIMAL_ROW_OFFSET: number = 200;
    
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
        const unitsInARow = Math.floor(this.sys.canvas.width / this.UNIT_SIZE);
        const x = (this.sys.canvas.width - this.UNIT_SIZE * unitsInARow);
        this.monitoringGrid = new MonitoringGrid(this, x < this.MINIMAL_ROW_OFFSET ? this.MINIMAL_ROW_OFFSET : x, 250, this.UNIT_SIZE);

        // Init event listeners (use from outside Phaser to communicate with React)
        this.initEventListeners();
    }

    update(): void {
        this.monitoringGrid.update();
    }

    private initEventListeners(): void {
        this.game.events.on('CREATE_LANDER', (data: PlayerJoins) => this.monitoringGrid.turnOnUnit(data), this);
        this.game.events.on('UPDATE_LANDER', (data: PlayerUpdates) => this.monitoringGrid.setShipActions(data), this);
        this.game.events.on('PLAYER_LEFT', (data: PlayerLeaves) => this.monitoringGrid.disconnectUnit(data), this);
        this.game.events.on('LANDERS_DATA', (data: LanderData[]) => this.monitoringGrid.setShipsParameters(data), this);
        // notify webapp the game is ready to handle events
        this.game.events.emit('GAME_READY', {});
    }
   
}
