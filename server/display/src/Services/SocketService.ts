import io, { Socket } from "socket.io-client"
import playersManager from "./PlayersService"
import { PlayerJoins, PlayerLeaves, PlayerUpdates, SimulationData, LanderData } from "../Models/player"

const SERVER_URL = 'http://127.0.0.1:4000'
let socket: Socket

let game: Phaser.Game

const service = {

    start: function (gameInstance: Phaser.Game) {
        game = gameInstance
        socket = io(SERVER_URL, {
            query: {
                clientName: 'display',
                clientUuid: '00000000',
                clientEmoji: '🤖',
                clientColor: 'FFFFFF'
            },
        })

        socket.on("connect", () => {
            console.log('[Socket 🌐] Connected to server ⚡')
        })

        socket.on("reconnect", data => {
            console.log('[Socket 🌐] Reconnected to server ♻️⚡')
        })

        socket.on("disconnect", data => {
            console.log('[Socket 🌐] Connection to server was lost 🔌')
        })

        socket.on("playerList", (payload: PlayerJoins[]) => {
            console.log('[Socket 🌐] Retrieving player list', payload.map(p => p.name));
            payload.forEach((d: PlayerJoins) => {
                // only create lander if it does not exist
                if(playersManager.playerExists(d.uuid) === false) {
                    playersManager.createPlayer(d.name, d.uuid, d.emoji, d.color)
                    game.events.emit('CREATE_LANDER', d)
                    game.events.emit('CREATE_LANDER_2', d)
                }
            })
        })
        
        socket.on("playerJoins", (payload: PlayerJoins) => {
            console.log('[Socket 🌐] Player joined', payload.name)
            playersManager.createPlayer(payload.name, payload.uuid, payload.emoji, payload.color)
            game.events.emit('CREATE_LANDER', payload)
        })

        socket.on("playerLeaves", (payload: PlayerLeaves) => {
            console.log('[Socket 🌐] Player left', payload.name)
            playersManager.deletePlayer(payload.uuid)
            game.events.emit('DESTROY_LANDER', payload)
        })

        socket.on("playerUpdates", (payload: PlayerUpdates) => {
            if (playersManager.playerExists(payload.uuid) === false) {
                // can happend if 'display' page was reloaded, losing the whole player list in the process
                playersManager.createPlayer(payload.name, payload.uuid, payload.emoji, payload.color)
                game.events.emit('CREATE_LANDER', payload)
            } else {
                playersManager.updatePlayerActions(payload.uuid, payload.actions)
                game.events.emit('UPDATE_LANDER', payload)
            }
        })
    },

    // TODO move this in dedicated service
    fetchLocalIps: async function () {
        return window.fetch(SERVER_URL + '/ips');
    },

    /**
     * Handle the simulation data sent by the game and send it to the server
     * @param {SimulationData} payload contains a list of every lander and their current state
     */
    handleSimulationData: function (payload: SimulationData) {
        if (playersManager.getPlayersCount() === 0) {
            // console.log('Waiting for players to connect')
            return;
        }
        payload.landersData.forEach((d: LanderData) => {
            playersManager.updatePlayerLander(d);
        })
        // send lander's data to server (to be broadcasted to players)
        socket.emit('simulationData', payload.landersData);
    }
}

export default service