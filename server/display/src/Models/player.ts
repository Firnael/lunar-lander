/** Used by the webapp to rank players  */
export interface PlayerStats {
    name: string            // the player name
    color: string           // the player chosen color (in hexa string without the #)
    attempts: number        // the attempts count
    firstLandingAttemptCount: number // the attemps count when first landing occured
    successAttempts: number // the successful attempts count
    landed?: number         // is a timestamp, set during the player's ship first landing
    rank?: number           // the player rank
    usedFuelBest?: number   // the least amount of fuel used for a landing
    usedFuelAvg?: number    // the average amount of fuel used for a landing
    successRate?: number    // the player success rate over the N last landing
    attemptsHistory: AttemptsHistory[] // the player attempts history
}

/**  Represents a player landing history */
export interface AttemptsHistory {
    success: boolean // the result of the landing (true if lander didn't explode)
    usedFuel: number // the fuel used to land
}

export enum LanderStatus {
    SPAWNED, // 0
    ALIVE,   // 1
    LANDED,  // 2
    DEAD     // 3
}

export enum LanderDangerStatus {
    SAFE = 0,           // 0
    BAD_ANGLE = 1 << 0, // 0001
    TOO_FAST = 1 << 1   // 0010
    // ... could be more dangers in the future, we'll keep bitshifting then
}

export interface Player {
    name: string
    uuid: string
    emoji: string
    color: string
    lander: LanderData,
    actions?: PlayerActions
}

/**
 * Used at two separate places (this is bad) :
 * - by the 'Player' type to store player's lander state
 * - by the 'SimulationData' type to send game's landers state to server
 */
export interface LanderData {
    name?: string
    uuid?: string
    vx: number
    vy: number
    angle: number
    altitude: number
    usedFuel: number
    status: LanderStatus
    dangerStatus: LanderDangerStatus
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
    color: string
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
    color: string
    actions: PlayerActions
}

/**
 * Comes from the 'display' where the simulation takes place.
 * Update data server-side and send them to all clients
 */
export interface SimulationData {
    landersData: LanderData[]
}

export interface ShipLanded {
    name: string
    usedFuel: number
}