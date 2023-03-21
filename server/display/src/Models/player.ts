/** Used by the webapp to rank players  */
export interface PlayerStats {
    name: string             // the player name
    attempts: number         // the attempts count
    firstLandingAttemptCount: number // the attemps count when first landing occured
    successAttempts: number  // the attempts count
    landed?: number          // is a timestamp, set during the player's ship first landing
    rank?: number            // the player rank
    usedFuelBest?: number    // the least amount of fuel used for a landing
    usedFuelAvg?: number     // the average amount of fuel used for a landing
    successRate?: number     // the player success rate over the N last landing
    history: number[]        // the player attempts history (0 is a failed attempt, 1 is a success)
}

export enum LanderStatus {
    SPAWNED, // 0
    ALIVE,   // 1
    LANDED,  // 2
    DEAD     // 3
}

export interface Player {
    name: string
    uuid: string
    emoji: string
    lander: LanderData,
    actions?: PlayerActions
}

export interface LanderData {
    name?: string
    vx: number
    vy: number
    angle: number
    altitude: number
    usedFuel: number
    status: LanderStatus
}

export interface PlayerActions {
    thrust: boolean
    rotate: LanderRotation
}

export enum LanderRotation {
    CLOCKWISE,
    COUNTERCLOCKWISE,
    NONE
}

// === SocketIO payloads

export interface PlayerJoins {
    name: string
    uuid: string
    emoji: string
}

export interface PlayerLeaves {
    name: string
    uuid: string
}

// Comes from any client, update actions server-side and send them to the 'display' 
export interface PlayerUpdates {
    name: string
    uuid: string
    emoji: string
    actions: PlayerActions
}

/**
 * Comes from the 'display' where the simulation takes place.
 * Update data server-side and send them to all clients
 */
export interface UpdatePlayersData {
    landersData: LanderData[]
}