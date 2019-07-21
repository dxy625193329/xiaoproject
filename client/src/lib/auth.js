import { Crypto } from 'cryptojs'

class RdWXBizDataCrypt {

  constructor(appId, sessionKey) {
    this.appId = appId
    this.sessionKey = sessionKey
  }

  decryptData(encryptedData, iv) {
    return new Promise((resolve, reject) => {
      encryptedData = Crypto.util.base64ToBytes(encryptedData)
      const key = Crypto.util.base64ToBytes(this.sessionKey)
      iv = Crypto.util.base64ToBytes(iv)

      const mode = new Crypto.mode.CBC(Crypto.pad.pkcs7);

      let decryptResult

      try {
        const bytes = Crypto.AES.decrypt(encryptedData, key, {
          asBpytes: true,
          iv: iv,
          mode: mode
        })

        decryptResult = JSON.parse(bytes)
        resolve(decryptResult)
      } catch (err) {
        reject(err)
      }

      if (decryptResult.watermark.appid !== this.appId) {
        reject(err)
      }

    })
  }
}

export default RdWXBizDataCrypt