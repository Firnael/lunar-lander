import io from "socket.io"
import http from 'http'
import Client from "../models/client"

// The 'display' client UUID is always the same
const DISPLAY_UUID = '00000000'
const MONITORING_UUID_PATTERN = /0000[\w\d]{4}/
const regex = new RegExp(MONITORING_UUID_PATTERN);

// the SocketIO Server instance
let server: io.Server
// the 'display' client socket ID
let displaySocketID: string
// the 'monitoring' clients socket IDs
const monitoringSockets: any = {}
// a list of every connected clients
let clients: Map<string, Client> = new Map()

const service = {
    start: function (httpServer: http.Server) {
        server = new io.Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        })
        console.log('WS server up and running')

        defineListeners()
    }
}

const defineListeners = () => {
    server.on("connection", (socket) => {
        handleConnection(socket)
        handleDisconnect(socket)
        handleGameEvents(socket)
    });
}

const handleConnection = (socket: io.Socket) => {
    const clientName = socket.handshake.query['clientName'] as string || 'MISSING_NAME'
    const clientUuid = socket.handshake.query['clientUuid'] as string || 'MISSING_UUID'
    const clientEmoji = socket.handshake.query['clientEmoji'] as string || '⛔'
    const clientColor = socket.handshake.query['clientColor'] as string || '444444'
    const client = new Client(clientName, clientUuid, clientEmoji, clientColor, socket)

    console.log(`[Socket 🌐 ${socket.id.substring(0, 5)}] Player <${client.name}> ${client.emoji} (UUID: ${client.uuid}) connected ⚡`)
    clients.set(socket.id, client)

    // The 'display' or a monitoring client is connected, store its socket ID for further exchanges
    if (regex.test(client.uuid)) {
        if (client.uuid === DISPLAY_UUID) {
            displaySocketID = socket.id
        } else {
            monitoringSockets[client.uuid] = socket.id;
        }
        
        // send clients list to display (it may be unaware of clients if you refreshed the page)
        const playerList: any[] = []
        clients.forEach((v, k) => {
            // never create a lander for the display nor the monitoring clients
            if(v.uuid !== DISPLAY_UUID && !(v.uuid in monitoringSockets)) { 
                playerList.push({ name: v.name, uuid: v.uuid, emoji: v.emoji, color: v.color })
            }
        });
        console.log(`[Socket 🌐 ${socket.id.substring(0, 5)}] Sending 'playerList' (${playerList.map(p => p.name)}) 📝`)
        server.to(socket.id).emit('playerList', playerList)
    } else {
        // another player joined, notify the connected clients so they can create a ship
        console.log(`[Socket 🌐 ${socket.id.substring(0, 5)}] Sending 'playerJoins' (${client.name}) ➕`)
        server.emit('playerJoins', { name: client.name, uuid: client.uuid, emoji: client.emoji, color: client.color })
    }
}

const handleDisconnect = (socket: io.Socket) => {
    socket.on('disconnect', () => {
        const client = clients.get(socket.id)!
        if (client.uuid in monitoringSockets) {
            console.log(`[Socket 🌐 ${socket.id.substring(0, 5)}] Monitoring client <${client.name}> (UUID: ${client.uuid}) disconnected 🔌`)
        } else {
            console.log(`[Socket 🌐 ${socket.id.substring(0, 5)}] Player <${client.name}> (UUID: ${client.uuid}) disconnected 🔌`)
            server.emit('playerLeaves', { name: client.name, uuid: client.uuid })
        }
        clients.delete(socket.id)
    });
}

const handleGameEvents = (socket: io.Socket) => {
    // Réception des données venant des clients, envoi au display
    socket.on('playerActions', (data) => {
        const client = clients.get(socket.id)
        if (!client) {
            handleConnection(socket)
            return
        }

        //console.log(`[Socket 🌐 ${socket.id.substring(0, 5)}] Received player actions from <${client.name}>, sending to display`, data)
        server.emit('playerUpdates', { name: client.name, uuid: client.uuid, actions: data })
    })

    // Réception des données venant du 'display', broadcast à tous les clients
    socket.on('simulationData', (data: any) => {
        //console.log(`[Socket 🌐 ${socket.id.substring(0, 5)}] Received simulation data from display, broadcasting to players`)
        server.emit('landersData', data)
    })
}

export default service