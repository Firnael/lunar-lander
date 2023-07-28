import { Socket } from 'socket.io'

export default class Client {

    constructor(public name: string, public uuid: string, public emoji: string, public color: string, public socket: Socket) {}
}