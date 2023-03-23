import io from "socket.io"
import http from 'http'
import Client from "../models/client"

// the SocketIO Server instance
let server: io.Server
// the 'display' client socket ID
let displaySocketID: string
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
    const clientEmoji = socket.handshake.query['clientEmoji'] as string || '💩'
    const clientColor = socket.handshake.query['clientColor'] as string || 'FFFFFF'
    const client = new Client(clientName, clientUuid, clientEmoji, clientColor, socket)

    console.log(`[Socket 🌐 ${socket.id.substring(0, 5)}] Player <${client.name}> ${client.emoji} (UUID: ${client.uuid}) connected ⚡`)
    clients.set(socket.id, client)

    // store 'display' client socket ID for further exchanges
    if (client.uuid === '00000000') {
        displaySocketID = socket.id
        // send clients list to display (it may be oblivious of clients if you refreshed the page)
        const playerList: any[] = []
        clients.forEach((v, k) => {
            if(v.uuid !== '00000000') { // do not create lander for display
                playerList.push({ name: v.name, uuid: v.uuid })
            }
        });
        server.to(displaySocketID).emit('playerList', playerList)
    } else {
        server.emit('playerJoins', { name: client.name, uuid: client.uuid, emoji: client.emoji, color: client.color })
    }
}

const handleDisconnect = (socket: io.Socket) => {
    socket.on('disconnect', () => {
        const client = clients.get(socket.id)!
        console.log(`[Socket 🌐 ${socket.id.substring(0, 5)}] Player <${client.name}> (UUID: ${client.uuid}) disconnected 🔌`)
        server.emit('playerLeaves', { name: client.name, uuid: client.uuid })
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

        console.log(`[Socket 🌐 ${socket.id.substring(0, 5)}] Received player actions from <${client.name}>, sending to display`, data)
        server.to(displaySocketID).emit('playerUpdates', { name: client.name, uuid: client.uuid, actions: data })
    })

    // Réception des données venant du 'display', broadcast à tous les clients
    socket.on('landersData', (data: any) => {
        console.log(`[Socket 🌐 ${socket.id.substring(0, 5)}] Received lander's data from display, broadcasting to players`)
        server.emit('landersData', data)
    })
}

export default service