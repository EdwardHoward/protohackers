const net = require('node:net')

const server = net.createServer()
  .listen(5000, '0.0.0.0', () => {
    console.log('Server listening on port 5000')
  })

server.on('connection', (socket) => {
  console.log('Client connected')

  socket.on('data', (data) => {
    socket.write(data)
  })

  socket.on('end', () => {
    console.log('Closing connection with client')
  })

  socket.on('error', (err) => {
    console.error(`Error: ${err}`)
  })
})
