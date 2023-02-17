import express from 'express'
import bodyParser from 'body-parser'
import { createServer } from 'http'
import path from 'path'

const port = 4000
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, "../../display", "dist")));
const server = createServer(app)

const start = () => {
    try {
        server.listen(port, '0.0.0.0');
        console.log(`HTTP server ready on port ${port}`)
    } catch (e) {
        console.error('Could not start HTTP server', e)
    }
}

export { start, server };