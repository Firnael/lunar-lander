import { Socket } from 'socket.io'

export default class Client {

    constructor(public name: string, public uid: string, public emoji: string, public socket: Socket) {}
}