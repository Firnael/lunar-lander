import { randomUUID } from "crypto"
import { io, Socket } from "socket.io-client"
import { LanderData, LanderAction } from "../models/lander"

let socket: Socket
let clientUuid: string
let clientName: string
let clientEmoji: string
let clientColor: string

const service = {

    start: function (endpoint: string, playerName: string, playerEmoji: string, playerColor: string) {
        clientName = playerName.substring(0, 12)
        clientUuid = randomUUID().split('-')[0],
        clientEmoji = /\p{Extended_Pictographic}/ug.test(playerEmoji) ? playerEmoji : '💩'
        clientColor = playerColor.match(/[0-9A-Fa-f]{6}/g) ? playerColor : Math.floor(Math.random()*16777215).toString(16);

        console.log('Connecting to server...')
        socket = io(endpoint, {
            query: {
                clientName,
                clientUuid,
                clientEmoji,
                clientColor
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

    handleLander: function (callback: (data: LanderData) => LanderAction) {
        socket.on("landerData", (payload: LanderData) => {
            console.log('Your lander data arrived from the moon: ', payload);
            // if simulator crashes and restarts, this may be undefined
            if (payload) {
                const actions: LanderAction = callback(payload);
                socket.emit('playerActions', actions);
            }
        })
    }
}

export default service