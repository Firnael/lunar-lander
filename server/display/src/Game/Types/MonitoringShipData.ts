import { LanderDangerStatus, LanderStatus, PlayerActions } from "../../Models/player";

/**
 * Defines a monitored {@link FakeShip} status
 */
export interface MonitoringShipData {
    playerName: string;
    playerUuid: string;
    playerEmoji: string;
    playerColor: string;
    status: LanderStatus;
    previousStatus: LanderStatus;
    dangerStatus: LanderDangerStatus;
    usedFuel: number;
    altitude: number;
    vx: number;
    vy: number;
    angle: number;
    actions: PlayerActions;
} 