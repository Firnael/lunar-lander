import * as http from './services/http'
import io from './services/socket'

http.start()
io.start(http.server)