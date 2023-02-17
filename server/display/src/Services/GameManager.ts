import io, { Socket } from "socket.io-client"
import { Player, PlayerJoins, PlayerLeaves, LanderRotation, UpdatePlayerActions, UpdatePlayersData } from "../Models/player"

const SERVER_URL = 'http://127.0.0.1:4000'
const CLIENT_NAME = 'display'
const CLIENT_UID = '0000'
let socket: Socket

let game: Phaser.Game
const players: Player[] = []

const service = {

    start: function (gameInstance: Phaser.Game) {
        game = gameInstance
        socket = io(SERVER_URL, {
            query: {
                clientName: CLIENT_NAME,
                clientUid: CLIENT_UID
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

        socket.on("playerList", (data: PlayerJoins[]) => {
            console.log('Retrieving player list', data)
            data.forEach((d: PlayerJoins) => {
                const index = players.findIndex(p => p.uid === d.uid)
                if(index < 0) {
                    createPlayer(d.name, d.uid)
                    // TODO marche pas
                    game.events.emit('CREATE_LANDER', d)
                }
            })
        })
        
        socket.on("playerJoins", (payload: PlayerJoins) => {
            console.log('Create new player', payload.name)
            createPlayer(payload.name, payload.uid)
            game.events.emit('CREATE_LANDER', payload)
        })

        socket.on("playerLeaves", (payload: PlayerLeaves) => {
            console.log('Delete player', payload)
            deletePlayer(payload.uid)
            game.events.emit('DESTROY_LANDER', payload)
        })

        socket.on("updatePlayerActions", (payload: UpdatePlayerActions) => {
            const playerIndex = players.findIndex(p => p.uid === payload.uid)
            if (playerIndex < 0) {
                // le joueur est inconnu du display, il faut le créer (possible si le display s'est déco/reco)
                createPlayer(payload.name, payload.uid)
            } else {
                players[playerIndex].actions = payload.actions
            }
            game.events.emit('UPDATE_LANDER', payload)
        })
    },

    // From the 'display'
    updatePlayersData: function (payload: UpdatePlayersData) {
        if (players.length === 0) {
            // console.log('Waiting for players to connect')
            // TODO afficher ça dans la webapp
            return
        }
        // console.log("Updating players data", payload.landersData)
        payload.landersData.forEach((d: any) => {
            const playerIndex = players.findIndex(p => p.name === d.name)
            players[playerIndex].lander = { vx: d.vx, vy: d.vy, angle: d.angle, altitude: d.altitude, usedFuel: d.usedFuel }
        })
        socket.emit('landersData', payload.landersData)
    }
}

function createPlayer(name: string, uid: string) {
    const player: Player = {
        uid: uid,
        name: name,
        lander: {
            vx: 0,
            vy: 0,
            angle: 0,
            altitude: 0,
            usedFuel: 0
        },
        actions: {
            thrust: false,
            rotate: LanderRotation.NONE
        }
    }
    players.push(player)
}

function deletePlayer(uid: string) {
    players.splice(players.findIndex(p => p.uid === uid), 1)
}

export default service