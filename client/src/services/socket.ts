import { randomUUID } from "crypto"
import { io, Socket } from "socket.io-client"
import { LanderData } from "../models/lander"
import { PlayerActions } from "../models/player"

let socket: Socket

const service = {

    start: function (endpoint: string, playerName: string, playerEmoji: string, playerColor: string) {
        console.log('Connecting to server...')
        socket = io(endpoint, {
            query: {
                clientName: playerName,
                clientUuid: randomUUID().split('-')[0],
                clientEmoji: playerEmoji,
                clientColor: playerColor
            },
        })

        socket.on("connect", () => {
            console.log('Connected to server ⚡')
        })

        socket.on("reconnect", data => {
            console.log('Reconnected to server ♻️⚡')
        })

        socket.on("disconnect", data => {
            console.log('Connection to server was lost 🔌')
        })
    },

    handleLander: function (callback: (data: LanderData) => PlayerActions) {
        socket.on("landerData", (payload: LanderData) => {
            console.log('Your lander data arrived from the moon: ', payload);
            // if simulator crashes and restarts, this may be undefined
            if (payload) {
                const actions: PlayerActions = callback(payload);
                socket.emit('playerActions', actions);
            }
        })
    }
}

export default service