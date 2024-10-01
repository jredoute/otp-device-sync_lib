var WebSocketClient = require('websocket').client;

const getTimeBasedCode = async (user: string, service: string) => {
  const req = await fetch(`${process.env.TIMEBASED_SERVER_BASE_URL}/totps?${
    new URLSearchParams({
      issuer: service,
      label: user,
    })
  }`)

  const code = await req.text()

  return code
}

interface MailComponents {
  codes: string[],
  links: string[],
  html: string
}

const rejectUnauthorized = process.env.NODE_ENV === 'production'

const getMailComponents = async (email: string, from: string, options?: { verbose?: boolean, timeout?: number }): Promise<MailComponents> => {
  return new Promise((resolve, reject) => {
    var client = new WebSocketClient({
      tlsOptions: {
        rejectUnauthorized
      }
    });

    client.on('connect', function(connection) {
      try {
        if (options?.verbose) {
          console.log('OTP Device Sync | Connected');
        }
        connection.on('error', function(error) {
          if (options?.verbose) {
            console.log(`OTP Device Sync | Socket Error : ${error.toString()}`)
          }
          reject(error.toString())
        })
        connection.on('close', function() {
          if (options?.verbose) {
            console.log('OTP Device Sync | Closed')
          }
          reject('socket closed')
        })
        connection.on('message', function(message) {
          if (message.type === 'utf8') {
            const data: MailComponents = JSON.parse(message.utf8Data) as MailComponents
            if (options?.verbose) {
              console.log(`OTP Device Sync | Codes received : ${data.codes.join(', ')}`)
            }
            resolve(data)
          }
        })
      } catch (e) {
        if (options?.verbose) {
          if (e instanceof Error) {
            console.log(`OTP Device Sync | Error : ${e.toString()}` )
          } else {
            console.log(`OTP Device Sync | Error :`, e)
          }
        }
        reject(e)
      }
    })

    client.on('connectFailed', function (error) {
      console.log('ici', error)
      reject(error)
    })
    
    try {
      client.connect(`${process.env.MAIL_SERVER_BASE_URL}?email=${encodeURIComponent(email)}&from=${encodeURIComponent(from)}`, 'echo-protocol')
    } catch (e) {
      reject(e)
    }

    if (options?.timeout !== 0) {
      setTimeout(() => {
        reject('timeout')
      }, options?.timeout)
    }
  })
}

export {
  getMailComponents,
  getTimeBasedCode
}
