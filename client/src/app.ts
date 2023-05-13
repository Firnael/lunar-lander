import { PlayerActions } from './models/player';
import { LanderData, LanderRotation } from './models/lander'
import io from './services/socket'

const SERVER_URL = process.env.SERVER_URL || 'http://127.0.0.1:4000';
const PLAYER_NAME = process.env.PLAYER_NAME || 'NO_NAME';
const PLAYER_EMOJI = process.env.PLAYER_EMOJI || '💩';
const PLAYER_COLOR = process.env.PLAYER_COLOR || 'FFFFFF';

(async () => {
    io.start(SERVER_URL, PLAYER_NAME, PLAYER_EMOJI, PLAYER_COLOR)
    io.handleLander((data: LanderData) => {
        // Ici vous faites ce que vous voulez, mais vous DEVEZ return un objet LanderAction
        let actions: PlayerActions = {
            thrust: false,
            rotate: LanderRotation.NONE
        }

        const ACCEPTABLE_ANGLE = 8;
        const TOO_GREAT_AA = 120;
        const MAX_STRAIGHTEN_AA = 20;
        const ALWAYS_THRUST_ABOVE_THIS_VY = 150;
        const DANGER_ALTITUDE = 100;

        // fail-safe : cancel too great va
        if (Math.abs(data.va) > TOO_GREAT_AA) {
            if (data.va > 0) {
                actions.rotate = LanderRotation.COUNTERCLOCKWISE;
            } else {
                actions.rotate = LanderRotation.CLOCKWISE;
            }
        }
        // fail-safe : tete en bas
        else if (Math.abs(data.angle) > 80) {
            if (data.va > 0 && data.va < 100) {
                // rotating right
                actions.rotate = LanderRotation.CLOCKWISE;
            } else if (data.va < 0 && data.va > -100) {
                actions.rotate = LanderRotation.COUNTERCLOCKWISE;
            }
        }
        // cancel vx as soon as possible
        else if (Math.abs(data.vx) > 35) {
            return cancelVx(actions, data);
        }

        // fail-safe : protect the ship if we are falling too fast
        if (Math.abs(data.angle) < 60 && data.vy > ALWAYS_THRUST_ABOVE_THIS_VY) {
            actions.thrust = true;
        }

        if (data.altitude < DANGER_ALTITUDE && (Math.abs(data.vx) > 30 || data.vy > 30)) {
            actions.thrust = true;
        }

        // straighten out the ship
        if (Math.abs(data.angle) > ACCEPTABLE_ANGLE) {
            if (data.angle > 0) {
                // rotated too much to the right
                actions.rotate = LanderRotation.COUNTERCLOCKWISE;
                if (Math.abs(data.va) > MAX_STRAIGHTEN_AA && data.va < 0) { // we over did it
                    actions.rotate = LanderRotation.NONE;
                }
            } else { // data.angle < 0
                // rotated too much to the left
                actions.rotate = LanderRotation.CLOCKWISE;
                if (Math.abs(data.va) > MAX_STRAIGHTEN_AA && data.va > 0) { // we over did it
                    actions.rotate = LanderRotation.NONE;
                }
            } 
        }

        // angle is fine
        // cancel rotation if needed
        // if (Math.abs(data.va) > MIN_AA) {
        //     if (data.va > 0) {
        //         // rotating right
        //         actions.rotate = LanderRotation.COUNTERCLOCKWISE;
        //     } else {
        //         // rotating left
        //         actions.rotate = LanderRotation.CLOCKWISE;
        //     }
        // }
        
        

        return actions
    })
})()

function cancelVx(actions: PlayerActions, data: LanderData): PlayerActions {
    const a: PlayerActions = {
        thrust: actions.thrust,
        rotate: actions.rotate
    }

    if (data.vx > 0) {
        // going right
        if (data.angle <= -20 && data.angle >= -80) {
            // already a good angle
            a.thrust = true;
            if (Math.abs(data.va) > 10) {
                // need to stop rotating
                if (data.va > 0) {
                    // rotating toward right
                    a.rotate = LanderRotation.COUNTERCLOCKWISE;
                } else {
                    // rotating toward right
                    a.rotate = LanderRotation.CLOCKWISE;
                }
            }
        } else {
            // need to reach the good angle by rotating
            if (Math.abs(data.va) < 50) {
                if (data.va > 0) {
                    // rotating right
                    a.rotate = LanderRotation.CLOCKWISE;
                } else {
                    a.rotate = LanderRotation.COUNTERCLOCKWISE;
                }
            }
        }
    }
    else { // vx < 0
        // going left
        if (data.angle >= 20 && data.angle <= 80) {
            // already a good angle
            a.thrust = true;
            if (Math.abs(data.va) > 10) {
                // need to stop rotating
                if (data.va > 0) {
                    // rotating toward right
                    a.rotate = LanderRotation.COUNTERCLOCKWISE;
                } else {
                    // rotating toward right
                    a.rotate = LanderRotation.CLOCKWISE;
                }
            }
        } else {
            // need to reach the good angle by rotating
            if (Math.abs(data.va) < 50) {
                if (data.va > 0) {
                    // rotating right
                    a.rotate = LanderRotation.CLOCKWISE;
                } else {
                    a.rotate = LanderRotation.COUNTERCLOCKWISE;
                }
            }
        }
    }

    return a;
}