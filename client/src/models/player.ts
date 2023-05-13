import { LanderRotation } from "./lander";

/** Représente les informations que vous devez communiquer au serveur pour piloter votre lander */
export interface PlayerActions {
    thrust: boolean;
    rotate: LanderRotation;
}