const http = require('http')
const routes = require('./router')
const port = 3000

const server = http.createServer(routes)
server.listen(port)
console.log('Started server on port ' + port)