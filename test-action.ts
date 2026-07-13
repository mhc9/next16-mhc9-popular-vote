import { requestOtpAction } from './app/actions/auth'

async function run() {
  const formData = new FormData()
  formData.append('contactMethod', 'email')
  formData.append('contactValue', 'test@example.com')
  formData.append('captchaToken', '1x00000000000000000000AA')
  
  console.log('Running action...')
  const result = await requestOtpAction(null, formData)
  console.log('Result:', result)
}

run().catch(console.error)
