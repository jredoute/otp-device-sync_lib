var WebSocketClient = require('websocket').client;

const getTimeBasedCode = async (user: string, service: string, options?: { verbose?: boolean, registeredKey?: string }) => {

  try {
    const qs = new URLSearchParams({
      issuer: service,
      label: user,
    })
  
    if (options?.registeredKey) {
      qs.set('registeredKey', options?.registeredKey)
    }
  
    if (options?.verbose) {
      console.log('OTP Device Sync | Querying virtual time based code generation application');
    }

    const req = await fetch(`${process.env.TIMEBASED_SERVER_BASE_URL}/totps?${qs}`)
  
    const code = await req.text()
  
    if (options?.verbose) {
      console.log(`OTP Device Sync | Code received : ${code}`)
    }
    
    return code
  } catch (ex) {
    if (options?.verbose) {
      console.log('OTP Device Sync | Error', ex)
    }
    throw ex
  }
  
}

interface MailComponents {
  codes: string[],
  links: string[],
  html: string
}

const rejectUnauthorized = process.env.NODE_ENV === 'production'

const getMailComponents = async (email: string, from: string, options?: { verbose?: boolean, timeout?: number, registeredKey?: string }): Promise<MailComponents> => {
  return new Promise((resolve, reject) => {
    var client = new WebSocketClient({
      tlsOptions: {
        rejectUnauthorized
      }
    });

    client.on('connect', function(connection) {
      try {
        if (options?.verbose) {
          console.log(`OTP Device Sync | Watching incoming mails from ${from} to ${email}`);
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
            console.log(`OTP Device Sync | Error Init : ${e.toString()}` )
          } else {
            console.log(`OTP Device Sync | Error Init :`, e)
          }
        }
        reject(e)
      }
    })

    client.on('connectFailed', function (error) {
      if (options?.verbose) {
        console.log(`OTP Device Sync | Connection Failed :`, error)
      }
      reject(error)
    })
    
    try {
      const qs = new URLSearchParams({
        email,
        from
      })

      if (options?.registeredKey) {
        qs.set('registeredKey', options?.registeredKey)
      }
      client.connect(`${process.env.MAIL_SERVER_BASE_URL}?${qs}`, 'echo-protocol')
    } catch (e) {
      if (options?.verbose) {
        console.log(`OTP Device Sync | Error Connecting :`, e)
      }
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
