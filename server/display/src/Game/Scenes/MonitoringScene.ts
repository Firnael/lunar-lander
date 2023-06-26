import 'phaser';
import { MonitoringScreen } from '../GameObjects/MonitoringScreen';
import { LanderData, PlayerJoins, PlayerLeaves, PlayerUpdates } from '../../Models/player';
import monitoring_cursor_url from '../Assets/images/monitoring_cursor.png';

export class MonitoringScene extends Phaser.Scene {
    private STROKE_COLOR: number = 0x76ce81;
    private UNIT_SIZE: number = 250;
    private SKIP_BOOT_SEQUENCE: boolean = false;
    
    private monitoringScreen!: MonitoringScreen;
    private titleText!: Phaser.GameObjects.Text;
    private typeWriterText!: Phaser.GameObjects.Text;

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
            vhsEnable: true, vhsStrength: 0.4,
            // Bloom (coûte trop cher en GPU)
            //bloomEnable: true, bloomRadius: 0.3, bloomIntensity: 0.5,
            //bloomThreshold: 0.2, bloomTexelWidth: 0.5, bloomTexelHeight: 0.5
            // Vignette
            vignetteEnable: false, vignetteStrength: 1, vignetteIntensity: 0.2
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
        this.titleText = this.add.text(this.cameras.main.width / 2, 40, titleContent, {
            font: '22px Greenscr',
            color: '#76CE81',
            align: 'center'
        })
        .setLineSpacing(6).setOrigin(0.5, 0).setVisible(false);

        // create screen
        this.monitoringScreen = new MonitoringScreen(this, 250, 250, this.UNIT_SIZE)
            .setVisible(false);

        // Init event listeners (use from outside Phaser to communicate with React)
        this.initEventListeners();

        if (this.SKIP_BOOT_SEQUENCE) {
            this.titleText.setVisible(true);
            this.monitoringScreen.setVisible(true);
            return;
        }

        // Set type writer text
        this.typeWriterText = this.add.text(250, 250, '', {
            font: '16px Greenscr',
            color: '#' + this.STROKE_COLOR.toString(16),
            align: 'left',
        });
        this.typewriteText(this.removeIndentation`
            WELCOME TO CROCLARDON INDUSTRIES (TM) TERMLINK
            COPYRIGHT 1991-2023 CROCLARDON INDUSTRIES
            
            > BOOT SEQUENCE INITIATED. 
            > REQUESTING CONNECTION TO SERVER... 
            > CONNECTED. 
            > LAUNCHING MONITORING SYSTEM... 
            > SYSTEM READY. 
            > `, () => {
                this.typeWriterText.setVisible(false);
                this.titleText.setVisible(true);
                this.monitoringScreen.setVisible(true);
            }, 3000);
    }

    update(): void {
        this.monitoringScreen.update();
    }

    private initEventListeners(): void {
        this.game.events.on('CREATE_LANDER', (data: PlayerJoins) => this.monitoringScreen.connectPlayer(data), this);
        this.game.events.on('PLAYER_LEFT', (data: PlayerLeaves) => this.monitoringScreen.disconnectPlayer(data), this);

        this.game.events.on('UPDATE_LANDER', (data: PlayerUpdates) => this.monitoringScreen.setPlayerActions(data), this);
        this.game.events.on('LANDERS_DATA', (data: LanderData[]) => this.monitoringScreen.setShipsParameters(data), this);
        // notify webapp the game is ready to handle events
        this.game.events.emit('GAME_READY', {});
    }

    private typewriteText(text: string, onComplete: () => void, callbackDelay: number): void {
        const length = text.length;
        let i = 0;
        const addCharacter = () => {
            if (i > 0) {
                this.typeWriterText.text = this.typeWriterText.text.slice(0, -1);
            }
            this.typeWriterText.text += text[i];
            this.typeWriterText.text += '\u2588';
            i++;

            if (i === length) {
                setTimeout(() => {
                    // Call this when the entire text is printed and the callback delay is over
                    onComplete(); 
                }, callbackDelay);
                this.time.addEvent({ callback: makeCursorBlink, delay: 500 });
            } else {
                // Calculate the delay based on the character being added
                const delay = text[i - 1] === '.' ? 200 : 10;
                this.time.addEvent({ callback: addCharacter, delay });
            }
        };
        const makeCursorBlink = () => {
            const lastChar = this.typeWriterText.text[this.typeWriterText.text.length - 1];
            this.typeWriterText.text = this.typeWriterText.text.slice(0, -1);
            if (lastChar === '\u2588') {
                this.typeWriterText.text += ' ';
            } else {
                this.typeWriterText.text += '\u2588';
            }
            this.time.addEvent({ callback: makeCursorBlink, delay: 500 });
        };

        addCharacter();
        //this.time.addEvent({ callback: addCharacter, delay: 0 });
    }

    private removeIndentation(strings: TemplateStringsArray, ...values: any[]): string {
        const result = strings[0].replace(/^\s+/gm, '');
        return result;
    }
}