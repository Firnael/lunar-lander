import io from "socket.io"
import http from 'http'
import Client from "../models/client"
import gameManager from '../../display/src/Services/GameManager'

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
    const clientUid = socket.handshake.query['clientUid'] as string || 'MISSING_UID'
    const client = new Client(clientName, clientUid, socket)

    console.log(`[Socket 🌐 ${socket.id.substring(0, 5)}] Player <${client.name}> (UID: ${client.uid}) connected ⚡`)
    clients.set(socket.id, client)

    // store 'display' client socket ID for further exchanges
    if (client.uid === '0000') {
        displaySocketID = socket.id
        // send clients list to display (it may be oblivious of clients if you refreshed the page)
        const playerList: any[] = []
        clients.forEach((v, k) => {
            if(v.uid !== '0000') { // do not create lander for display
                playerList.push({ name: v.name, uid: v.uid })
            }
        });
        server.to(displaySocketID).emit('playerList', playerList)
    } else {
        server.emit('playerJoins', { name: client.name, uid: client.uid })
    }
}

const handleDisconnect = (socket: io.Socket) => {
    socket.on('disconnect', () => {
        const client = clients.get(socket.id)!
        console.log(`[Socket 🌐 ${socket.id.substring(0, 5)}] Player <${client.name}> (UID: ${client.uid}) disconnected 🔌`)
        server.emit('playerLeaves', { name: client.name, uid: client.uid })
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
        server.to(displaySocketID).emit('updatePlayerActions', { name: client.name, uid: client.uid, actions: data })
    })

    // Réception des données venant du 'display', broadcast à tous les clients
    socket.on('landersData', (data: any) => {
        console.log(`[Socket 🌐 ${socket.id.substring(0, 5)}] Received lander's data from display, broadcasting to players`)
        server.emit('landersData', data)
    })
}

export default service