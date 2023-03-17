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
            rotate: LanderRotation.CLOCKWISE
        }

        // ...

        return actions
    })
})()