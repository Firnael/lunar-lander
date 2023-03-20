import { PassThrough } from 'stream';
import { LanderData, LanderRotation } from './models/lander'
import io from './services/socket'

const SERVER_URL = process.env.SERVER_URL || 'http://127.0.0.1:4000';
const PLAYER_NAME = process.env.PLAYER_NAME || 'NO_NAME';
const PLAYER_EMOJI = process.env.PLAYER_EMOJI || '💩';

(async () => {
    io.start(SERVER_URL, PLAYER_NAME, PLAYER_EMOJI)
    io.handleLander((data: LanderData) => {
        // Ici vous faites ce que vous voulez, mais vous DEVEZ return un objet LanderAction
        const actions = {
            thrust: false,
            rotate: LanderRotation.NONE
        }

        // Annule la vélocité en X
        if (Math.abs(data.vx) > 35) {
            console.log('ANNULE')
            if (data.vx > 0) { // il va à droite
                if (data.angle < -20) {
                    actions.thrust = true
                }
                else {
                    actions.rotate = LanderRotation.COUNTERCLOCKWISE;
                }
            } else { // il va à gauche
                if (data.angle > 20) {
                    actions.thrust = true
                } else {
                    actions.rotate = LanderRotation.CLOCKWISE;
                }
            }
        } else {
            // Redresse le vaisseau
            if (data.angle > 10) { // tourné vers la droite
                console.log('GAUCHE')
                actions.rotate = LanderRotation.COUNTERCLOCKWISE;
            } else if (data.angle < -10) { // tourné vers la gauche
                console.log('DROITE')
                actions.rotate = LanderRotation.CLOCKWISE;
            }

            // Allume le réacteur si on va se crash
            if (data.altitude <= 300 && data.vy > 30) {
                actions.thrust = true
            }
        }

        if (data.altitude > 800) {
            actions.thrust = false
            actions.rotate = LanderRotation.NONE
        }

        return actions
    })
})()