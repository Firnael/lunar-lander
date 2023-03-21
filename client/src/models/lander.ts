/** Représente les informations de votre lander provenant du serveur */
export interface LanderData {
    vx: number
    vy: number
    angle: number
    altitude: number
    usedFuel: number
    status: string
}

/** Représente les informations que vous devez communiquer au serveur pour piloter votre lander */
export interface LanderAction {
    thrust: boolean
    rotate: LanderRotation,
}

/** Représente les différents états de rotation possible du lander */
export enum LanderRotation {
    CLOCKWISE,
    COUNTERCLOCKWISE,
    NONE
}