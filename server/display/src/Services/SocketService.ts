import io, { Socket } from "socket.io-client"
import PlayersService from "./PlayersService"
import { PlayerJoins, PlayerLeaves, PlayerUpdates, SimulationData, LanderData } from "../Models/player"
import { ClientConfig } from "../Models/socket"

let socket: Socket

let game: Phaser.Game

const service = {

    start: function (serverUrl: string, gameInstance: Phaser.Game, clientConfig: ClientConfig) {
        game = gameInstance

        console.log(`[Socket 🌐] Connecting to ${serverUrl}`);
        socket = io(serverUrl, { query: clientConfig });

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
                if(PlayersService.playerExists(d.uuid) === false) {
                    PlayersService.createPlayer(d.name, d.uuid, d.emoji, d.color)
                    game.events.emit('CREATE_LANDER', d)
                    game.events.emit('CREATE_LANDER_2', d)
                }
            })
        })
        
        socket.on("playerJoins", (payload: PlayerJoins) => {
            console.log('[Socket 🌐] Player joined', payload.name)
            PlayersService.createPlayer(payload.name, payload.uuid, payload.emoji, payload.color)
            game.events.emit('CREATE_LANDER', payload)
        })

        socket.on("playerLeaves", (payload: PlayerLeaves) => {
            console.log('[Socket 🌐] Player left', payload.name)
            PlayersService.deletePlayer(payload.uuid)
            game.events.emit('DESTROY_LANDER', payload)
        })

        socket.on("playerUpdates", (payload: PlayerUpdates) => {
            if (PlayersService.playerExists(payload.uuid) === false) {
                // can happend if 'display' page was reloaded, losing the whole player list in the process
                PlayersService.createPlayer(payload.name, payload.uuid, payload.emoji, payload.color)
                game.events.emit('CREATE_LANDER', payload)
            } else {
                PlayersService.updatePlayerActions(payload.uuid, payload.actions)
                game.events.emit('UPDATE_LANDER', payload)
            }
        })

        // send lander's data to "mission-control-center" scene 
        socket.on("landersData", (payload: LanderData[]) => {
            game.events.emit('LANDERS_DATA', payload)
        })
    },

    /**
     * Handle the simulation data sent by the game and send it to the server
     * @param {SimulationData} payload contains a list of every lander and their current state
     */
    handleSimulationData: function (payload: SimulationData) {
        if (PlayersService.getPlayersCount() === 0) {
            // console.log('Waiting for players to connect')
            return;
        }
        payload.landersData.forEach((d: LanderData) => {
            PlayersService.updatePlayerLander(d);
        })
        // send lander's data to server (to be broadcasted to players)
        socket.emit('simulationData', payload.landersData);
    }
}

export default service