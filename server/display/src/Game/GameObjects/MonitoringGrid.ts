import { LanderData, PlayerJoins, PlayerLeaves, PlayerUpdates } from "../../Models/player";
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
     * - if a unit already exists with this player data, reconnect to it
     * - if not, try to find an empty one
     * - if there is none, return nothing
     * @param playerName explicit
     * @returns an available unit, if found
     */
    getAvailableUnit(playerName: string): MonitoringUnit | undefined {
        let unit;
        for (const u of this.getUnits()) {
            // if possible, use the same unit this player used previously
            if (u.isIdle && u.monitoringShipData.playerName === playerName) {
                return u;
            }
            // if not, take the first turned off unit
            else if (!u.isTurnedOn && !unit) {
                unit = u;
            }
            
        }
        return unit;
    }

    getUnits(): MonitoringUnit[] {
        return this.list.filter(u => u.name.startsWith('monitoring-unit-')) as MonitoringUnit[];
    }

    turnOnUnit(data: PlayerJoins) {
        // Find an 'empty' monitorUnit
        const unit = this.getAvailableUnit(data.name);
        if (!unit) {
            console.error('No available unit to monitor ship');
            return;
        }
        if (unit.isIdle) {
            unit.reconnect(data.uuid, data.emoji, data.color);
        } else {
            unit.turnOn(data.name, data.uuid, data.emoji, data.color);
        }
    }

    setShipsParameters(data: LanderData[]) {
        data.forEach(d => {
            const unit = this.getUnits().find((u) => u.monitoringShipData.playerName === d.name);
            unit?.setShipParameters(d);
        })
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