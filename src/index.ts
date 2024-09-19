import * as websocket from 'websocket'

const getOTPFromMail = async (email: string, from: string, options?: { verbose?: boolean, timeout?: number }): Promise<string> => {
  return new Promise((resolve, reject) => {
    const client = new websocket.client()

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
            if (options?.verbose) {
              console.log(`OTP Device Sync | Code received : ${message.utf8Data}`)
            }
            resolve(message.utf8Data)
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
      client.connect(`ws://${process.env.MAIL_SERVER_HOST}:${process.env.MAIL_SERVER_PORT}?email=${email}&from=${from}`, 'echo-protocol')
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
  getOTPFromMail
}
