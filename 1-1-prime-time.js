const net = require('node:net')
const readline = require('node:readline')

const server = net.createServer()
  .listen(5000, '0.0.0.0', () => {
    console.log('Server listening on port 5000')
  })

server.on('connection', (socket) => {
  const rl = readline.createInterface({
    input: socket
  })

  rl.on('line', (line) => {
    try {
      const json = JSON.parse(line)

      if (json.method !== 'isPrime' || typeof json.number !== 'number') {
        throw 'malformed'
      }

      socket.write(`{"method": "isPrime", "prime":${isPrime(json.number).toString()}}\n`)
    } catch (err) {
      socket.write('malformed\n')
      socket.destroy()
    }
  })

  socket.on('error', (err) => {
    console.error(`Error: ${err}`)
  })
})

function isPrime(n) {
  if (!Number.isInteger(n)) {
    return false
  }

  if (n <= 1) {
    return false
  }
  if (n === 2 || n === 3) {
    return true;
  }
  else if ((n % 2 === 0) || (n % 3 === 0)) {
    return false;
  }
  else {
    var p = 5;
    var w = 2;
    while (p * p <= n) {
      if (n % p === 0) { return false; }
      p += w;
      w = 6 - w;
    }
    return true;
  }
}