import 'server-only'

export async function sendOTP(phoneNumber: string, otpCode: string): Promise<boolean> {
  const provider = process.env.SMS_PROVIDER || 'MOCK'
  const message = `รหัส OTP สำหรับโหวต MHC9 คือ: ${otpCode} (มีอายุ 5 นาที)`
  console.log(message)

  if (process.env.NODE_ENV !== 'production' && provider === 'MOCK') {
    console.log('\n=========================================')
    console.log(`📱 MOCK SMS TO: ${phoneNumber}`)
    console.log(`🔑 OTP CODE: ${otpCode}`)
    console.log('=========================================\n')
    return true
  }

  try {
    switch (provider.toUpperCase()) {
      case 'THAIBULKSMS':
        return await sendThaiBulkSMS(phoneNumber, message)
      case 'TWILIO':
        return await sendTwilioSMS(phoneNumber, message)
      case 'FIREBASE':
        return await sendFirebaseSMS(phoneNumber, message)
      case 'MOCK':
      default:
        console.log(`[PROD MOCK] Sending SMS to ${phoneNumber}: Your OTP is ${otpCode}`)
        return true
    }
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return false
  }
}

async function sendThaiBulkSMS(msisdn: string, message: string) {
  const apiKey = process.env.SMS_API_KEY
  const apiSecret = process.env.SMS_API_SECRET
  if (!apiKey || !apiSecret) throw new Error('Missing ThaiBulkSMS credentials')

  const token = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

  const response = await fetch('https://api-v2.thaibulksms.com/sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${token}`
    },
    body: new URLSearchParams({
      msisdn,
      message,
      sender: process.env.SMS_SENDER || 'SMS',
    })
  })

  if (!response.ok) {
    console.error('ThaiBulkSMS Error:', await response.text())
    return false
  }
  return true
}

async function sendTwilioSMS(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER
  if (!accountSid || !authToken || !from) throw new Error('Missing Twilio credentials')

  let formattedNumber = to
  if (to.startsWith('0')) formattedNumber = '+66' + to.slice(1)

  const token = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${token}`
    },
    body: new URLSearchParams({ To: formattedNumber, From: from, Body: body })
  })

  if (!response.ok) {
    console.error('Twilio Error:', await response.text())
    return false
  }
  return true
}

async function sendFirebaseSMS(to: string, body: string) {
  // Note: Firebase Authentication natively uses client-side flows for SMS OTP.
  // To send programmatic SMS from server with Firebase, you usually integrate an extension (like Twilio).
  // Here we provide a stub for custom Identity Toolkit API implementations if needed.
  console.warn('Firebase SMS integration via server requires specific Identity Toolkit API or Extensions.')
  return false
}
