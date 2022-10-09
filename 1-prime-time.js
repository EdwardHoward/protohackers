const net = require('node:net')

const server = net.createServer()
  .listen(5000, '0.0.0.0', () => {
    console.log('Server listening on port 5000')
  })

server.on('connection', handleConnection)

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

function handleData(data) {
  const json = JSON.parse(data)

  if (json.method !== 'isPrime' || typeof json.number !== 'number') {
    throw 'malformed'
  }

  return JSON.stringify({
    method: "isPrime",
    prime: isPrime(json.number)
  }) + '\n'
}

function parseData(json) {
  let index = 0;
  let str = ''
  let parts = []
  let openBrackets = 0

  if (json[0] !== '{') {
    throw 'malformed'
  }

  while (index < json.length - 1) {
    while (json[index] !== '{') {
      index++
    }

    if (json[index] === '{') {
      do {
        str += json[index]

        if (json[index] === '{') {
          openBrackets++
        }

        if (json[index] === '}') {
          openBrackets--
        }

        index++
      } while (openBrackets > 0 && index < json.length - 1)

      if (str[0] === '{' && str[str.length - 1] === '}') {
        parts.push(str)

        str = ''
      } else {
        throw 'missing last bracket'
      }
    }
  }

  return parts
}

function handleConnection(socket) {
  console.log('Client connected')
  let parts = ''

  socket.on('data', (data) => {
    let json = data.toString('utf-8')
    parts += json

    try {
      if (parts[parts.length - 1] === '\n') {
        const primes = parseData(parts)

        for (let i = 0; i < primes.length; i++) {
          const response = handleData(primes[i])

          socket.write(response)
        }

        parts = ''
      }
    } catch (err) {
      // malformed response
      socket.write('{}')
      socket.destroy()
    }
  })

  socket.on('end', () => {
    console.log('Closing connection with client')
  })

  socket.on('error', (err) => {
    console.error(`Error: ${err}`)
  })
}

const mockSocket = {
  events: {},
  responses: [],
  on: function (event, callback) {
    this.events[event] = callback
  },
  write: function (data) {
    console.log('writing to server', data)

    this.responses.push(data)
  },
  destroy: function () {
    console.log('connection destroyed')
  },
  emit: function (event, data) {
    if (typeof this.events[event] !== 'function') {
      throw 'event not found'
    }

    this.events[event](data)
  }
}

handleConnection(mockSocket)

mockSocket.emit('data', `{"method":"isPrime","number":2915625.1234}
`)

console.log(mockSocket.responses)
