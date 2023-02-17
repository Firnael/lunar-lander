export interface Player {
    name: string
    uid: string
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
    uid: string
    emoji: string
}

export interface PlayerLeaves {
    name: string
    uid: string
}

// Comes from any client, update actions server-side and send them to the 'game' 
export interface UpdatePlayerActions {
    name: string
    uid: string
    emoji: string
    actions: PlayerActions
}

// Comes from the 'game' where the simulation takes place, update data server-side and send them to clients
export interface UpdatePlayersData {
    landersData: LanderData[]
}