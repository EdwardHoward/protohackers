const net = require('node:net')

const server = net.createServer()

server.on('connection', handleConnection)

function handleConnection(socket) {
  let bytes = []
  let timestamps = []

  socket.on('data', (data) => {
    for (const value of data) {
      bytes.push(value)
    }

    while (bytes.length > 8) {
      const commands = bytes.splice(0, 9)

      const buff = Buffer.from(commands)

      const command = commands[0]
      const first = buff.readInt32BE(1)
      const second = buff.readInt32BE(5)
      
      // insert
      if (command === 73) {
        timestamps.push({
          time: first,
          amount: second
        })

        continue
      }

      // query
      if (command === 81) {
        const times = timestamps.filter(({ time }) => time >= first && time <= second)
        const sum = times.reduce((agg, { amount }) => agg + amount, 0)
        const mean = Math.round(sum / times.length)

        const buffer = Buffer.alloc(4)
        buffer.writeInt32BE(mean)

        socket.write(buffer)

        continue
      }
    }
  })

  socket.on('error', (err) => {
    console.log('Socket error', err)
  })

  socket.on('end', () => {
    console.log('client disconnected')
  })
}

server.listen(5000, '0.0.0.0', () => {
  console.log('server listening on 5000')
})
