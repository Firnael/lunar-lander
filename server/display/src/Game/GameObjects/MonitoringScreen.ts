import { CloseButtonClicked, MonitoringIconClicked } from '../../Models/gameEvents';
import { LanderData, PlayerJoins, PlayerLeaves, PlayerUpdates } from '../../Models/player';
import { MonitoringScene } from '../Scenes/MonitoringScene';
import { MonitoringIconsFolder } from './MonitoringIconsFolder';
import { MonitoringIcon } from './MonitoringIcon';
import { MonitoringUnit } from './MonitoringUnit';

/**
 * Used inside the {@link MonitoringScene} to simulate a fake old computer screen.
 */
export class MonitoringScreen extends Phaser.GameObjects.Container {
    private UNIT_OVERLAP_OFFSET = new Phaser.Math.Vector2(50, 50);

    private unitSize: number;
    private unitGeneratorInstance: IterableIterator<MonitoringUnit>;

    private iconColumns = 4;
    private iconRows = 5;
    private iconGeneratorInstance;

    private iconMap: Map<string, MonitoringIcon> = new Map();
    private unitMap: Map<string, MonitoringUnit> = new Map();

    private iconsFolder: MonitoringIconsFolder;

    constructor(scene: Phaser.Scene, x: number, y: number, unitSize: number) {
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;

        this.unitSize = unitSize;
        this.unitGeneratorInstance = this.unitGenerator(this.scene.sys.canvas.width /2, this.unitSize / 2);

        this.iconGeneratorInstance = this.iconGenerator(0, 0);

        this.iconsFolder = new MonitoringIconsFolder(this.scene, 0, 0);

        this.add([
            this.iconsFolder
        ]);

        this.scene.add.existing(this);

        // init event listeners
        this.scene.game.events.on('MONITORING_ICON_CLICKED', (data: MonitoringIconClicked) => {
            this.turnOnUnit(data.name, data.uuid, data.emoji, data.color);
        }, this);
        this.scene.game.events.on('CLOSE_BUTTON_CLICKED', (data: CloseButtonClicked) => { this.destroyUnit(data) }, this);
    }

    update(): void {
        this.updateUnits();
    }

    /**
     * Try to find an available icon for the player :
     * - if an icon already exists with this player data, reconnect to it
     * - if not, create a new one
     * @param {PlayerJoins} data explicit
     * @returns an available icon, if found.
     */
    getOrCreateIcon(data: PlayerJoins): MonitoringIcon {
        // if possible, use the same icon this player used previously
        let icon = this.iconMap.get(data.name);
        if (icon) {
            return icon;
        }

        // if it doesn't exist, create it
        icon = this.iconGeneratorInstance.next().value as MonitoringIcon;
        icon.playerName = data.name;
        icon.playerUuid = data.uuid;
        icon.playerEmoji = data.emoji;
        icon.playerColor = data.color;
        icon.isConnected = true;

        this.iconMap.set(data.name, icon);
        this.iconsFolder.addIcon(icon);
        return icon;
    }

    /**
     * Try to find an available unit for the player :
     * - if a unit already exists with this player data, reconnect to it
     * - if not, create a new one
     * @param playerName explicit
     * @returns an available unit, if found
     */
    getOrCreateUnit(playerName: string): MonitoringUnit {
        // if possible, use the same unit this player used previously
        let unit = this.unitMap.get(playerName);
        if (unit) {
            return unit;
        }

        unit = this.unitGeneratorInstance.next().value as MonitoringUnit;
        this.unitMap.set(playerName, unit);
        this.add(unit);
        return unit;
    }

    connectPlayer(data: PlayerJoins) {
        this.createIcon(data);
    }

    disconnectPlayer(data: PlayerLeaves) {  
        this.disconnectUnit(data);
        this.disconnectIcon(data);
    }

    setShipsParameters(data: LanderData[]) {
        data.forEach((d: LanderData) => {
            if (d.name) {
                this.unitMap.get(d.name)?.setShipParameters(d);
            }
        });
    }

    setPlayerActions(data: PlayerUpdates) {
        this.unitMap.get(data.name)?.setPlayerActions(data.actions);
    }

    private updateUnits(): void {
        for (const unit of this.unitMap.values()){
            unit.update();
        }
    }

    /**
     * Function generator that creates and return a {@link MonitoringUnit} at the right position.
     * It uses the ROWS and COLUMNS constants to compute the position based on the last unit created.
     * It should never return "null" since we are using "while(true)"
     */
    private *unitGenerator(ix: number, iy: number): Generator<MonitoringUnit, void> {
        let initialX = ix;
        let initialY = iy;
        let unitCount = 0;

        while (true) {
            const x = initialX + (this.UNIT_OVERLAP_OFFSET.x * unitCount);
            const y = initialY + (this.UNIT_OVERLAP_OFFSET.y * unitCount);

            // create new column if we are at the end of the screen
            if (x >= this.scene.sys.canvas.width - this.unitSize * 2) {
                initialX = ix;
                initialY += this.UNIT_OVERLAP_OFFSET.y;
                unitCount = 0;
            }

            const unit = new MonitoringUnit(this.scene, x, y);
            unit.setName(`monitoring-unit-${x}-${y}`);
            unitCount++;

            yield unit;
        }
    }

    /**
     * Function generator that creates and return a {@link MonitoringIcon} at the right position.
     * It uses the ROWS and COLUMNS constants to compute the position based on the last unit created.
     * It should never return "null" since we are using "while(true)"
     */
    private *iconGenerator(ix: number, iy: number): Generator<MonitoringIcon, void> {
        let initialX = ix;
        let initialY = iy;

        let lastIconColumn = 0;
        let lastIconRow = 0;

        while (true) {
            const x = initialX + (lastIconColumn * MonitoringIcon.SIZE.x);
            const y = initialY + (lastIconRow * MonitoringIcon.SIZE.y);
            const icon = new MonitoringIcon(this.scene, x, y);
            icon.setName(`monitoring-icon-${x}-${y}`);

            yield icon;

            // increase values for the next unit
            lastIconColumn++;
            if (lastIconColumn === this.iconColumns) {
                lastIconColumn = 0;
                lastIconRow++;
            }

            if (lastIconRow === this.iconRows) {
                lastIconRow = 0;
            }
        }
    }

    private createIcon(data: PlayerJoins) {
        const icon = this.getOrCreateIcon(data);
        if (!icon.isConnected) {
            // reconnect icon
            icon.reconnect(data.uuid, data.emoji, data.color);
            // try to reconnect unit
            this.unitMap.get(data.name)?.reconnect(data.uuid, data.emoji, data.color);
        } else {
            icon.init(data.name, data.uuid, data.emoji, data.color);
        }
    }

    private turnOnUnit(name: string, uuid: string, emoji: string, color: string) {
        const unit = this.getOrCreateUnit(name);
        if (unit.isIdle) {
            unit.reconnect(uuid, emoji, color);
        } else if (!unit.isTurnedOn) {
            unit.turnOn(name, uuid, emoji, color);
        } else {
            console.log(`Unit for player <${name}> is already turned on`);
            this.bringToTop(unit);
        }
    }

    private disconnectUnit(data: PlayerLeaves) {
        this.unitMap.get(data.name)?.disconnect();
    }

    private disconnectIcon(data: PlayerLeaves) {
        this.iconMap.get(data.name)?.disconnect();
    }

    private destroyUnit(data: CloseButtonClicked) {
        const unit = this.list.find((unit) => unit.name === data.gameObjectName) as MonitoringUnit;
        // remove from map
        this.unitMap.delete(unit.monitoringShipData.playerName);
        // destroy from scene
        unit?.destroy();
    }
}
