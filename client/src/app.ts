import { LanderData, LanderRotation } from './models/lander'
import io from './services/socket'

const SERVER_URL = process.env.SERVER_URL || 'http://127.0.0.1:4000';
const PLAYER_NAME = process.env.PLAYER_NAME || 'NO_NAME';

(async () => {
    io.start(SERVER_URL, PLAYER_NAME)
    io.handleLander((data: LanderData) => {
        // Ici vous faites ce que vous voulez, mais vous DEVEZ return un objet LanderAction
        const actions = {
            thrust: false,
            rotate: LanderRotation.CLOCKWISE
        }

        // Cancel vx 
        if(Math.abs(data.vx) > 10) {
            if(data.vx > 0) {
                // on va a droite, il faut thruster vers la gauche
                if(data.angle >= -50 && data.angle < -40) {
                    actions.rotate = LanderRotation.NONE
                } else if (data.angle < -50) {
                    actions.rotate = LanderRotation.CLOCKWISE
                }
                else if (data.angle > -40) {
                    actions.rotate = LanderRotation.COUNTERCLOCKWISE
                }
            } else { // vx < 0
                // on va a gauche, il faut thruster vers la droite
                if(data.angle >= 40 && data.angle < 50) {
                    actions.rotate = LanderRotation.NONE
                } else if (data.angle < 40) {
                    actions.rotate = LanderRotation.CLOCKWISE
                }
                else if (data.angle > 50) {
                    actions.rotate = LanderRotation.COUNTERCLOCKWISE
                }
            }

            if (actions.rotate === LanderRotation.NONE) {
                actions.thrust = true
            }
        }
        // Land
        else {
            if(data.vy > 150) {
                actions.thrust = true
            }

            if(data.angle > 5) {
                actions.rotate = LanderRotation.COUNTERCLOCKWISE
            } else if (data.angle < -5) {
                actions.rotate = LanderRotation.CLOCKWISE
            }

            if(data.vy > 30 && data.altitude < 200) {
                actions.thrust = true
            }
        }

        return actions
    })
})()