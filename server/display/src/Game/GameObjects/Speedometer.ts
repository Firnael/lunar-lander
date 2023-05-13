import { MonitoringUnit } from "./MonitoringUnit";
import tinygradient from "tinygradient";

/**
 * Used inside a {@link MonitoringUnit} to display the ship speed in a cool way
 */
export class Speedometer extends Phaser.GameObjects.Container {
    // From server config
    private TWEEN_INTERVAL: number;
    private SHIP_MAX_VELOCITY: number;

    private CROSS_COLOR = 0x76ce81;
    private textOffset: number = 50;
    private size: number = 40; // size of the speedometer cross
    private barSize: number = 6;

    private velocityGradient: tinygradient.Instance;
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene);

        this.scene = scene;
        this.x = x;
        this.y = y;

        // set from server config
        this.TWEEN_INTERVAL = this.scene.registry.get('MONITORING_HEART_BEAT_RATE');
        this.SHIP_MAX_VELOCITY = this.scene.registry.get('SHIP_MAX_VELOCITY');

        // create lines
        const xLine = this.scene.add.line(0, 0, - this.size, 0, this.size, 0, this.CROSS_COLOR, 1)
            .setOrigin(0, 0).setDepth(1).setName('xLine');
        const yLine = this.scene.add.line(0, 0, 0, - this.size, 0, this.size, this.CROSS_COLOR, 1)
            .setOrigin(0, 0).setDepth(1).setName('yLine');

        // create bars
        const xBar = this.scene.add.rectangle(0, - this.barSize / 2, this.barSize, 0, 0xdddddd, 1)
            .setOrigin(0, 0.5).setDepth(2).setName('xBar');
        const yBar = this.scene.add.rectangle(0 - this.barSize / 2, 0, 0, this.barSize, 0xdddddd, 1)
            .setDepth(2).setOrigin(0.5, 0).setName('yBar');

        // create velocity text
        const textOptions = { font: '14px Greenscr', color: '#dddddd' };
        const vxText = this.scene.add.text(0, this.textOffset , '', textOptions)
            .setOrigin(0.5, 0.5).setName('vxText');
        const vyText = this.scene.add.text(0, this.textOffset + 16, '', textOptions)
            .setOrigin(0.5, 0.5).setName('vyText');

        // create gradient for bars (shouldn't I be doing something with my life ???)
        this.velocityGradient = tinygradient([ '#00ff00', '#FFFF00', '#ffa500', '#ff0000' ]); // green - yellow - orange - red 

        // add objects to container
        this.add(xLine);
        this.add(yLine);
        this.add(xBar);
        this.add(yBar);
        this.add(vxText);
        this.add(vyText);

        // add container to the scene
        this.scene.add.existing(this);
    }

    update(vx: number, vy: number): void {
        // normalize value velocity values (between 0 and 1)
        const nVx = vx / this.SHIP_MAX_VELOCITY;
        const nVy = vy / this.SHIP_MAX_VELOCITY;

        // update color and only change width for horizontal bar
        const xColor = this.velocityGradient.rgbAt(Math.abs(nVx)).toHex();
        const xBar = this.getByName('xBar') as Phaser.GameObjects.Rectangle;
        xBar.setFillStyle(parseInt(xColor, 16), 1);
        this.scene.tweens.add({
            targets: xBar,
            width: nVx * this.size,
            height: this.barSize,
            ease: 'linear',
            duration: this.TWEEN_INTERVAL,
            loop: 0
        });

        // update color and only change height for vertical bar
        const yColor = this.velocityGradient.rgbAt(Math.abs(nVy)).toHex();
        const yBar = this.getByName('yBar') as Phaser.GameObjects.Rectangle;
        yBar.setFillStyle(parseInt(yColor, 16), 1);
        this.scene.tweens.add({
            targets: yBar,
            width: this.barSize,
            height: nVy * this.size,
            ease: 'linear',
            duration: this.TWEEN_INTERVAL,
            loop: 0
        });

        // update velocity text
        const vxText = this.getByName('vxText') as Phaser.GameObjects.Text;
        vxText.setText('vx: ' + vx.toFixed());
        const vyText = this.getByName('vyText') as Phaser.GameObjects.Text;
        vyText.setText('vy: ' + vy.toFixed());
    }
}
