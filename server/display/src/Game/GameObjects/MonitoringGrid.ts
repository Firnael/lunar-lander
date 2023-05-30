import { LanderData, PlayerJoins, PlayerLeaves, PlayerUpdates } from '../../Models/player';
import { MonitoringUnit } from './MonitoringUnit';

/**
 * Used inside the {@link MonitoringScene} to create and manage a grid of {@link MonitoringUnit}.
 */
export class MonitoringGrid extends Phaser.GameObjects.Container {
    private OVERLAP_OFFSET = new Phaser.Math.Vector2(50, 50);

    private unitSize: number;
    private rows: number;
    private columns: number;
    private unitGeneratorInstance;

    constructor(scene: Phaser.Scene, x: number, y: number, unitSize: number) {
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.unitSize = unitSize;

        this.rows = Math.floor(this.scene.sys.canvas.height / this.unitSize);
        this.columns = Math.floor(this.scene.sys.canvas.width / this.unitSize);

        console.log(`rows: ${this.rows}, columns: ${this.columns}`);

        this.unitGeneratorInstance = this.unitGenerator(0, 0);

        this.scene.add.existing(this);
    }

    update(): void {
        this.getUnits().forEach((u) => u.update());
    }

    /**
     * Try to find an available unit for the player's ship :
     * - if a unit already exists with this player data, reconnect to it
     * - if not, create a new one
     * @param playerName explicit
     * @returns an available unit, if found
     */
    getOrCreateUnit(playerName: string): MonitoringUnit {
        // if possible, use the same unit this player used previously
        const units = this.getUnits();
        for (const u of units) {
            if (u.isIdle && u.monitoringShipData.playerName === playerName) {
                return u;
            }
        }

        const unit = this.unitGeneratorInstance.next().value;
        this.add(unit!);
        return unit!;
    }

    /**
     * Function generator that creates and return a {@link MonitoringUnit} at the right position.
     * It uses the ROWS and COLUMNS constants to compute the position based on the last unit created.
     * It should never return "null" since we are using "while(true)"
     */
    *unitGenerator(ix: number, iy: number): Generator<MonitoringUnit, void> {
        let initialX = ix;
        let initialY = iy;

        let lastUnitRow = 0;
        let lastUnitColumn = 0;
        let overlap = 0;

        while (true) {
            const x = initialX + (lastUnitColumn * this.unitSize) + (this.OVERLAP_OFFSET.x * overlap);
            const y = initialY + (lastUnitRow * this.unitSize) + (this.OVERLAP_OFFSET.y * overlap);
            const unit = new MonitoringUnit(this.scene, x, y);
            unit.setName(`monitoring-unit-${x}-${y}`);

            yield unit;

            // increase values for the next unit
            lastUnitColumn++;
            if (lastUnitColumn === this.columns) {
                lastUnitColumn = 0;
                lastUnitRow++;
                if (lastUnitRow === this.rows) {
                    lastUnitRow = 0;
                    overlap++;
                }
            }
        }
    }

    getUnits(): MonitoringUnit[] {
        return this.list.filter((u) => u.name.startsWith('monitoring-unit-')) as MonitoringUnit[];
    }

    turnOnUnit(data: PlayerJoins) {
        // Find an 'empty' monitorUnit
        const unit = this.getOrCreateUnit(data.name);
        if (unit.isIdle) {
            unit.reconnect(data.uuid, data.emoji, data.color);
        } else {
            unit.turnOn(data.name, data.uuid, data.emoji, data.color);
        }
    }

    setShipsParameters(data: LanderData[]) {
        data.forEach((d) => {
            const unit = this.getUnits().find((u) => u.monitoringShipData.playerName === d.name);
            unit?.setShipParameters(d);
        });
    }

    setShipActions(data: PlayerUpdates) {
        const unit = this.getUnits().find((u) => u.monitoringShipData.playerName === data.name);
        unit?.setShipActions(data.actions);
    }

    disconnectUnit(data: PlayerLeaves) {
        const unit = this.getUnits().find((u) => u.monitoringShipData.playerName === data.name);
        unit?.disconnect();
    }
}
