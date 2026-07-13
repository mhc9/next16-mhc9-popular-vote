# แนวทางการเชื่อมต่อ SMS Gateway สำหรับระบบโหวต (OTP Registration)

การเปลี่ยนจากการ Mock OTP ใน Console ไปสู่การใช้ **SMS Gateway** ของจริง (เช่น ThaiBulkSMS, Twilio, หรือ SMSMKT) จะต้องมีการ Refactor ระบบทั้งในส่วนของ Frontend, Backend Action และ Service Layer โดยมีข้อควรระวังสำคัญที่สุดคือ **ความปลอดภัย (ป้องกัน SMS Bombing)** 

นี่คือคำแนะนำและขั้นตอนการ Refactor ที่ควรทำครับ:

---

## 1. การปรับปรุงส่วน Service (`lib/sms.ts`)

ปัจจุบันไฟล์นี้ทำแค่ `console.log` คุณจะต้องเปลี่ยนไปใช้ `fetch` เพื่อยิง HTTP Request ไปยัง API ของผู้ให้บริการ SMS 

```typescript
// ตัวอย่างการ Refactor lib/sms.ts (สมมติใช้ ThaiBulkSMS)
export async function sendOTP(phoneNumber: string, otpCode: string): Promise<boolean> {
  const apiKey = process.env.SMS_API_KEY
  const apiSecret = process.env.SMS_API_SECRET
  
  const message = `รหัส OTP สำหรับโหวต MHC9 คือ: ${otpCode} (มีอายุ 5 นาที)`

  try {
    const response = await fetch('https://api-v2.thaibulksms.com/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        apiKey,
        apiSecret,
        msisdn: phoneNumber,
        message: message,
        sender: 'MHC9VOTE', // ชื่อผู้ส่งที่ลงทะเบียนไว้
      })
    })

    if (!response.ok) throw new Error('SMS Gateway Error')
    return true
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return false
  }
}
```

---

## 2. การเพิ่มความปลอดภัย ป้องกัน SMS Bombing (สำคัญมาก!)

หากคุณเปิดให้ส่ง SMS ฟรี บอทสามารถกระหน่ำยิงเบอร์มั่วเพื่อผลาญเครดิต SMS ของคุณจนหมดได้ (SMS Bombing) คุณ**ต้อง**เพิ่มสิ่งเหล่านี้ก่อนเปิดใช้งานจริง:

### A. เพิ่ม Rate Limiting (จำกัดจำนวนครั้ง)
ในไฟล์ `app/actions/auth.ts` ก่อนที่จะเรียก `sendOTP` ต้องเช็คว่าเบอร์นี้ขอ OTP ไปกี่ครั้งแล้ว
```typescript
// ตัวอย่างเช็ค Rate Limit ใน app/actions/auth.ts
const recentRequests = await prisma.otpVerification.count({
  where: {
    voter: { phoneNumber },
    createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } // ย้อนหลัง 15 นาที
  }
})

if (recentRequests >= 3) {
  return { error: 'คุณขอรหัส OTP บ่อยเกินไป กรุณารอ 15 นาที' }
}
```

### B. เพิ่ม CAPTCHA ที่ Frontend
ในไฟล์ `app/vote/register/page.tsx` ควรติดตั้ง **Cloudflare Turnstile** หรือ **Google reCAPTCHA v3** เพื่อป้องกันบอท

---

## 3. การ Refactor Frontend (`app/vote/register/page.tsx`)

ไม่ต้องปรับเปลี่ยนโครงสร้างเยอะ แต่จะต้องเพิ่ม State สำหรับรับ Token ของ CAPTCHA และส่งไปพร้อมกับ Form

```tsx
// สิ่งที่ต้องเพิ่มใน app/vote/register/page.tsx
import { Turnstile } from '@marsidev/react-turnstile' // ตัวอย่าง

function RegisterForm() {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  
  // ใน <form>
  return (
    <form action={formAction}>
      {/* เพิ่ม hidden input สำหรับส่งค่า token */}
      <input type="hidden" name="captchaToken" value={captchaToken || ''} />
      
      <input type="tel" name="phoneNumber" required />
      
      {/* วาง Widget ตรวจสอบ Bot */}
      <Turnstile siteKey="YOUR_SITE_KEY" onSuccess={setCaptchaToken} />
      
      <SubmitButton disabled={!captchaToken} />
    </form>
  )
}
```

---

## 4. รูปแบบสถาปัตยกรรม SMS OTP (ทางเลือก)

การทำ OTP มี 2 รูปแบบหลักๆ ให้คุณเลือก:

*   **แบบที่ 1: Generate & Verify เอง (ตามโค้ดปัจจุบันของคุณ)**
    *   **วิธีทำ:** สุ่มตัวเลข 6 หลัก บันทึก Hash ลง Database แล้วส่งตัวเลขนั้นไปทาง SMS (ดังเช่นที่อยู่ใน `auth.ts` ปัจจุบัน)
    *   **ข้อดี:** ประหยัดค่าใช้จ่าย จ่ายแค่ค่าส่งข้อความ SMS พื้นฐาน, ควบคุมระบบเองได้ทั้งหมด
*   **แบบที่ 2: ใช้ OTP API ของผู้ให้บริการโดยตรง (เช่น Twilio Verify, Firebase Auth, ThaiBulkSMS OTP)**
    *   **วิธีทำ:** ให้ Backend สั่ง Provider ให้ส่ง OTP และตอนตรวจสอบก็ยิงไปถาม Provider ว่ารหัสถูกไหม (ไม่ต้องสร้าง Hash และตาราง `otpVerification` เอง)
    *   **ข้อดี:** ปลอดภัยสูงมาก ไม่ต้องกังวลเรื่องการจัดการ Database ของ OTP แต่มีราคาต่อครั้งสูงกว่า

**คำแนะนำ:** โค้ดปัจจุบันของคุณออกแบบมาเป็น **แบบที่ 1** ซึ่งทำได้ดีแล้วครับ (มี Hash และวันหมดอายุ) สิ่งที่ต้องทำเพิ่มคือแค่เข้าไปแก้ `lib/sms.ts` ให้ยิง API จริง และเพิ่มการป้องกันบอท (CAPTCHA + Rate Limit) ก็พร้อมใช้งานบน Production ครับ
