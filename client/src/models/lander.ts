/** Représente les informations de votre lander provenant du serveur */
export interface LanderData {
    vx: number;       // vélocité en X, en px/s (- gauche, + droite)
    vy: number;       // vélocité en Y, en px/s (- haut, + bas)
    va: number;       // vélocité angulaire, en radian/s (+ clockwise, - counterclockwise)
    angle: number;    // angle par rapport au sol, en radian (vaut 0 lorsque le vaisseau est parfaitement droit)
    altitude: number; // distance par rapport au sol, en px
    usedFuel: number; // quantité de combustible utilisé, unité arbitraire
    status: number;   // état actuel (vivant, atteri, explosé, vient de respawn)
    dangerStatus: string; // situation de danger potentielle (trop rapide, mauvais angle, ou tout va bien)
}

/** Représente les différents états de rotation possible du lander */
export enum LanderRotation {
    CLOCKWISE,
    COUNTERCLOCKWISE,
    NONE
}