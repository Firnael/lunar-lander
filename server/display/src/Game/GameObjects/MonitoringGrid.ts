import { MonitoringUnit } from "./MonitoringUnit";

/**
 * Used inside the {@link MonitoringScene} to create and manage a grid of {@link MonitoringUnit}.
 */
export class MonitoringGrid extends Phaser.GameObjects.Container {

    private STEP: number = 250;
    private ROWS: number = 3;
    private COLUMNS: number = 6;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;

        for (let i = 0; i < this.ROWS * this.STEP; i += this.STEP) {
            for (let j = 0; j < this.COLUMNS * this.STEP; j+= this.STEP) {
                const unit = new MonitoringUnit(this.scene, j, i);
                unit.setName(`monitoring-unit-${j}-${i}`);
                this.add(unit);
            }
        }

        this.scene.add.existing(this);
    }

    update(): void {
        this.getUnits().forEach(u => u.update());
    }

    /**
     * Try to find an available unit for the player's ship :
     * - if a unit already exists with this player data, re-use it
     * - if not, try to find an empty one
     * - if there is none, return nothing
     * @param playerName explicit
     * @returns an available unit, if found
     */
    getAvailableUnit(playerName: string): MonitoringUnit | undefined {
        let unit;
        for (const u of this.getUnits()) {
            // if it exists, use the same unit for this player
            if (u.shipRef && u.shipRef.playerName === playerName) {
                return u;
            }
            // if it doesn't, take the first empty unit
            else if (!u.shipRef && !unit) {
                unit = u;
            }
            
        }
        return unit;
    }

    getUnits(): MonitoringUnit[] {
        return this.list.filter(u => u.name.startsWith('monitoring-unit-')) as MonitoringUnit[];
    }

}