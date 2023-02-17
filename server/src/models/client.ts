import { Socket } from 'socket.io'

export default class Client {
    name: string
    uid: string
    socket: Socket

    constructor(name: string, uid: string, socket: Socket) {
        this.name = name
        this.uid = uid
        this.socket = socket
    }
}