# การอิมพลีเมนต์ SMS Gateway และระบบป้องกัน SMS Bombing

แผนการนี้จะครอบคลุมการแก้ไขโค้ดเพื่อเชื่อมต่อกับ SMS Gateway ของจริง พร้อมทั้งเพิ่มระบบรักษาความปลอดภัย (Rate Limiting + CAPTCHA) เพื่อป้องกันการโจมตีหรือปั่นยอดส่ง SMS

## User Review Required

> [!WARNING]
> การติดตั้ง CAPTCHA เป็นสิ่งจำเป็นมากก่อนขึ้น Production เพื่อป้องกันปัญหาค่าใช้จ่าย SMS บานปลาย
> ผมขอเสนอให้ใช้ **Cloudflare Turnstile** (ฟรีและไม่ต้องให้ User คอยกดเลือกรูปภาพ) โดยต้องติดตั้ง Library เพิ่มคือ `@marsidev/react-turnstile`

## Open Questions

> [!IMPORTANT]
> 1. **SMS Provider**: คุณวางแผนจะใช้บริการของเจ้าไหนครับ? (เช่น ThaiBulkSMS, SMSMKT, Twilio) ผมจะเขียนโครงสร้างโค้ดสำหรับเจ้านั้นให้เป็นค่าเริ่มต้น
> 2. **CAPTCHA**: คุณตกลงที่จะใช้ Cloudflare Turnstile ตามที่แนะนำหรือไม่? ถ้าตกลง ผมจะทำการติดตั้งแพ็กเกจให้เลยครับ

## Proposed Changes

### Dependencies
#### [NEW] `package.json`
- เพิ่มแพ็กเกจ `@marsidev/react-turnstile` สำหรับดึง Widget ป้องกันบอท

---

### Backend / Action
#### [MODIFY] [app/actions/auth.ts](file:///d:/NextJSProjects/next16-mhc9-popular-vote/app/actions/auth.ts)
- เพิ่มฟังก์ชันสำหรับยืนยัน `captchaToken` (ผ่าน API ของ Cloudflare)
- เพิ่ม **Rate Limiting**: เช็คในตาราง `OtpVerification` ว่าเบอร์นี้ขอ OTP เกิน 3 ครั้งใน 15 นาทีที่ผ่านมาหรือไม่ หากเกินให้ Reject
- หากผ่านทั้งหมด ถึงจะเรียกใช้ `sendOTP`

---

### Service Layer
#### [MODIFY] [lib/sms.ts](file:///d:/NextJSProjects/next16-mhc9-popular-vote/lib/sms.ts)
- แทนที่ Mock (console.log) ด้วยคำสั่ง `fetch` 
- ส่ง HTTP POST Request ไปยัง API ของผู้ให้บริการ SMS โดยดึง API Key/Secret จาก `process.env`

---

### Frontend
#### [MODIFY] [app/vote/register/page.tsx](file:///d:/NextJSProjects/next16-mhc9-popular-vote/app/vote/register/page.tsx)
- เพิ่ม `<Turnstile />` Widget ของ Cloudflare ด้านล่างช่องกรอกเบอร์โทร
- เพิ่ม `useState` เพื่อเก็บ Token ที่ผ่านการตรวจสอบบอท
- ปิดปุ่ม "รับรหัส OTP" ไว้ชั่วคราวจนกว่าจะผ่านการทดสอบ CAPTCHA
- ส่ง Token แนบไปกับ Form Action

#### [NEW] `.env.example`
- เพิ่มรายชื่อ Environment Variables ที่คุณต้องไปตั้งค่า (เช่น `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `SMS_API_KEY`)

## Verification Plan
1. ทดลอง Request OTP โดยไม่ติ๊ก CAPTCHA (จะต้องถูกระบบปฏิเสธ)
2. ทดลองขอ OTP ติดต่อกัน 4 ครั้ง (ครั้งที่ 4 ระบบต้องแจ้งเตือนติด Rate Limit 15 นาที)
3. ดูโค้ดฝั่ง Server ว่ามีการยิง HTTP Request รูปแบบที่ถูกต้องเตรียมพร้อมใช้งานแล้ว
