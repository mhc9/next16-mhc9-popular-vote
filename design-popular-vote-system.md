# เอกสารออกแบบระบบ Popular Vote (โหวตให้คะแนนผู้เข้าร่วมแข่งขันนำเสนอผลงาน)

## 1. ภาพรวม & Tech Stack

| ส่วน | เทคโนโลยีที่แนะนำ |
|---|---|
| Frontend / Framework | Next.js v16 (App Router, Server Actions, Server Components) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth ผู้โหวต | OTP ผ่านเบอร์โทรศัพท์ (SMS Provider เช่น Thai Bulk SMS / Twilio / Deesmsx) + JWT/Session cookie (httpOnly) |
| QR Code | ไลบรารี `qrcode` (สร้างฝั่ง server) และ `qrcode.react` (แสดงผลฝั่ง client ถ้าต้องการ) |
| Rate limiting / กันสแปม | Upstash Redis หรือ middleware + reCAPTCHA/hCaptcha ตอนขอ OTP |
| File storage (รูปผู้เข้าแข่งขัน) | Vercel Blob / S3 / Cloudinary |
| Deployment | Vercel (เหมาะกับ Next.js) |

**หมายเหตุสำคัญเรื่องข้อกำหนด:** โจทย์ระบุว่าหน้าผลโหวตให้ "แสดงลำดับที่มีคะแนนน้อยที่สุด 10 ลำดับแรก" ซึ่งปกติงาน Popular Vote จะต้องการดู **อันดับคะแนนสูงสุด (มากไปน้อย) 10 อันดับแรก** เป็นหลัก จึงออกแบบให้ระบบ sort ได้ทั้งสองทิศทาง (มากสุด/น้อยสุด) และตั้งค่า default เป็น "มากสุด 10 อันดับแรก" — สามารถสลับได้ตามการใช้งานจริง

---

## 2. Database Schema (ERD)

```
Contestant (ผู้เข้าแข่งขัน)
├─ id            String  @id  // เช่น "MHC01"
├─ fullName      String
├─ position      String       // ตำแหน่ง
├─ department    String       // หน่วยงาน
├─ projectTitle  String       // ชื่อผลงาน
├─ projectDesc   Text         // คำอธิบายผลงาน
├─ photoUrl      String
├─ voteCount     Int      @default(0)   // denormalized counter เพื่อความเร็ว
├─ isActive      Boolean  @default(true)
├─ createdAt     DateTime @default(now())
└─ updatedAt     DateTime @updatedAt

VoteEvent (รอบ/งานแข่งขัน — เผื่อจัดหลายงาน)
├─ id            String   @id @default(cuid())
├─ name          String        // เช่น "MHC Awards 2026"
├─ qrToken       String   @unique  // token ที่ฝังใน QR code
├─ startAt       DateTime
├─ endAt         DateTime
├─ isOpen        Boolean  @default(true)
└─ createdAt     DateTime @default(now())

Voter (ผู้ร่วมโหวต)
├─ id            String   @id @default(cuid())
├─ phoneNumber   String   @unique
├─ isVerified    Boolean  @default(false)
├─ deviceFingerprint String?      // เสริมกันโหวตซ้ำผ่านอุปกรณ์
├─ createdAt     DateTime @default(now())
└─ lastLoginAt   DateTime?

OtpVerification (บันทึกการยืนยัน OTP)
├─ id            String   @id @default(cuid())
├─ voterId       String   FK -> Voter.id
├─ otpCodeHash   String        // เก็บเป็น hash ห้ามเก็บ plain text
├─ expiresAt     DateTime
├─ attempts      Int      @default(0)
├─ consumedAt    DateTime?
└─ createdAt     DateTime @default(now())

Vote (การโหวต)
├─ id            String   @id @default(cuid())
├─ voteEventId   String   FK -> VoteEvent.id
├─ voterId       String   FK -> Voter.id
├─ contestantId  String   FK -> Contestant.id
├─ ipAddress     String?
├─ userAgent     String?
├─ createdAt     DateTime @default(now())
└─ @@unique([voteEventId, voterId])   // 1 คน โหวตได้ 1 ครั้ง/1 งาน
```

**กติกาเชิงข้อมูลที่สำคัญ**
- `@@unique([voteEventId, voterId])` ที่ตาราง `Vote` คือกลไกหลักที่ป้องกันการโหวตซ้ำในระดับฐานข้อมูล (ไม่ใช่แค่ฝั่ง UI)
- `Contestant.voteCount` เป็นตัวเลขที่ increment ทุกครั้งที่มีการ insert `Vote` สำเร็จ (ใน transaction เดียวกัน) เพื่อให้ query อันดับเร็วโดยไม่ต้อง `COUNT()` ทุกครั้ง
- `OtpVerification` แยกออกจาก `Voter` เพื่อรองรับการขอ OTP ใหม่ได้หลายครั้ง และเก็บประวัติ/จำกัดจำนวนครั้งได้

---

## 3. โครงสร้างโปรเจกต์ (Next.js 16 App Router)

```
app/
├─ (public)/
│   ├─ page.tsx                    // หน้าแรก/ข้อมูลงาน
│   ├─ contestants/page.tsx        // แสดงรายชื่อผู้เข้าแข่งขันทั้งหมด (public, ไม่ต้อง login)
│   └─ contestants/[id]/page.tsx   // รายละเอียดผลงานรายบุคคล
│
├─ vote/
│   ├─ [qrToken]/page.tsx          // Entry point หลังสแกน QR -> เช็ค session
│   ├─ register/page.tsx           // กรอกเบอร์โทร
│   ├─ verify-otp/page.tsx         // กรอกรหัส OTP
│   └─ cast/page.tsx               // หน้าเลือกโหวต (ต้อง login แล้ว)
│
├─ results/
│   └─ page.tsx                    // แดชบอร์ดผลโหวต Top 10 (public หรือจำกัดสิทธิ์ตามต้องการ)
│
├─ admin/
│   ├─ login/page.tsx
│   ├─ contestants/page.tsx        // CRUD ผู้เข้าแข่งขัน
│   ├─ events/page.tsx             // สร้าง/จัดการ VoteEvent + generate QR
│   └─ dashboard/page.tsx          // สถิติ real-time, export ผล
│
├─ api/
│   ├─ otp/request/route.ts        // POST ขอ OTP
│   ├─ otp/verify/route.ts         // POST ยืนยัน OTP
│   ├─ votes/route.ts              // POST บันทึกโหวต
│   └─ results/route.ts            // GET อันดับผลโหวต (ใช้ ISR/polling)
│
└─ lib/
    ├─ prisma.ts
    ├─ sms.ts                      // เชื่อมต่อ SMS provider
    ├─ session.ts                  // จัดการ cookie/JWT ของผู้โหวต
    └─ rate-limit.ts
```

> Next.js 16 ใช้ Server Actions ได้โดยตรงในฟอร์ม (เช่น `action={requestOtpAction}`) แทนการยิง fetch เข้า `route.ts` ก็ได้ — เลือกได้ตามที่ทีมถนัด แต่ `route.ts` จะสะดวกกว่าเมื่อมี client-side polling (เช่น หน้าแดชบอร์ดผลโหวต)

---

## 4. Flow การทำงานโดยละเอียด

### 4.1 การลงทะเบียน/ยืนยันตัวตน (ทำครั้งเดียว ผูกกับเบอร์โทร)
1. ผู้ใช้สแกน QR ที่หน้างาน → ลิงก์พาไปที่ `/vote/[qrToken]`
2. ระบบตรวจสอบ `qrToken` ว่าตรงกับ `VoteEvent` ที่ `isOpen = true` และอยู่ในช่วง `startAt`–`endAt`
3. ถ้ายังไม่มี session → redirect ไป `/vote/register` ให้กรอกเบอร์โทร
4. ระบบส่ง OTP 6 หลัก (อายุ 5 นาที) ผ่าน SMS พร้อม rate limit (เช่น ขอได้ไม่เกิน 3 ครั้ง/10 นาที ต่อเบอร์ และต่อ IP)
5. ผู้ใช้กรอก OTP ที่ `/vote/verify-otp` → ระบบตรวจสอบ hash + `expiresAt` + จำนวน `attempts` (ล็อกหลังผิดเกิน 5 ครั้ง)
6. เมื่อยืนยันสำเร็จ → สร้าง session cookie (httpOnly, secure) ผูกกับ `voterId` → redirect ไป `/vote/cast`

### 4.2 การโหวต
1. หน้า `/vote/cast` แสดงรายชื่อผู้เข้าแข่งขันทั้งหมด (การ์ด: รูป, หมายเลข MHC0x, ชื่อผลงาน, หน่วยงาน) พร้อมช่องค้นหา/กรอง
2. ผู้ใช้เลือกผู้เข้าแข่งขัน 1 คน → กด "ยืนยันการโหวต" (มี modal confirm เพราะโหวตได้ครั้งเดียว)
3. Server Action/Route ตรวจสอบสิทธิ์: session ถูกต้อง + `voteEventId + voterId` ยังไม่เคยมีในตาราง `Vote`
4. บันทึกลง `Vote` และ increment `Contestant.voteCount` ใน database transaction เดียวกัน (ป้องกัน race condition ด้วย `SELECT ... FOR UPDATE` หรือใช้ `prisma.$transaction` กับ atomic `increment`)
5. แสดงหน้า "ขอบคุณสำหรับการโหวต" พร้อมล็อกปุ่ม ไม่ให้กดซ้ำ

### 4.3 การแสดงผล
- หน้า `/results` ดึงข้อมูลจาก `Contestant` เรียงตาม `voteCount` (default: มากไปน้อย, จำกัด 10 รายการแรก)
- รองรับการ refresh อัตโนมัติ (polling ทุก 10–15 วินาที หรือใช้ Server-Sent Events/WebSocket ถ้าต้องการ real-time เต็มรูปแบบ)
- แอดมินสามารถ export เป็น CSV/Excel ได้จากหน้า `/admin/dashboard`

---

## 5. มาตรการความปลอดภัยและป้องกันการโหวตไม่เป็นธรรม

| ความเสี่ยง | มาตรการ |
|---|---|
| โหวตซ้ำด้วยเบอร์เดียวกัน | `@@unique([voteEventId, voterId])` ระดับ DB + ตรวจสอบซ้ำใน server action |
| ปลอมเบอร์โทร/ใช้บอทขอ OTP จำนวนมาก | Rate limit ต่อเบอร์และต่อ IP, ใช้ CAPTCHA ก่อนขอ OTP, จำกัดจำนวน OTP request/วัน |
| แชร์ลิงก์โหวตข้ามอุปกรณ์เพื่อโหวตแทนคนอื่น | ผูกสิทธิ์โหวตกับเบอร์โทรที่ verify แล้วเท่านั้น (ไม่ใช่กับอุปกรณ์) ทำให้ต้องมี SIM จริงเพื่อรับ OTP |
| แก้ไข voteCount ตรงๆ ผ่าน client | คำนวณ/บันทึกคะแนนที่ server เท่านั้น ไม่รับค่าที่ client ส่งมา |
| QR token ถูกเดา/ใช้ผิดงาน | ใช้ token แบบสุ่มยาว (เช่น UUID/cuid) และตรวจสอบช่วงเวลาเปิด-ปิดโหวต |
| SQL Injection / XSS | ใช้ Prisma (parameterized query) และ sanitize input ทุกจุด, ใช้ Zod validate ฟอร์ม |
| ข้อมูลเบอร์โทรรั่วไหล | เข้ารหัส/จำกัดสิทธิ์เข้าถึงตาราง Voter เฉพาะแอดมิน, ปฏิบัติตาม PDPA |

---

## 6. UI/UX หลัก (Tailwind CSS)

- **หน้ารายชื่อผู้เข้าแข่งขัน**: Grid การ์ด responsive (mobile-first เพราะผู้ใช้ส่วนใหญ่เข้าจากมือถือหลังสแกน QR)
- **หน้าโหวต**: เน้นปุ่มใหญ่ กดง่ายบนมือถือ, มี progress indicator (ลงทะเบียน → ยืนยัน OTP → โหวต → เสร็จสิ้น)
- **หน้าผลโหวต**: ตาราง/การ์ด Top 10 พร้อม bar แสดงสัดส่วนคะแนนเทียบกับอันดับ 1 (ใช้กราฟแบบง่าย ไม่ต้อง fetch คะแนนจริงไปแสดงกับผู้โหวตทั่วไปถ้าอยากเก็บเป็นความลับระหว่างงาน)

---

## 7. สรุปสิ่งที่ควรตัดสินใจเพิ่มเติมก่อนเริ่มพัฒนา

1. โหวตได้ **1 สิทธิ์ต่อคนต่อทั้งงาน** หรือ 1 สิทธิ์ต่อ 1 ผู้เข้าแข่งขัน (เลือกได้หลายคน)?
2. ต้องการให้หน้า `/results` เห็นได้แบบ public ระหว่างงานเลย หรือเปิดเผยหลังปิดโหวตเท่านั้น?
3. ใช้ SMS provider เจ้าไหน (มีผลต่อ cost และ API ที่ใช้ผูกใน `lib/sms.ts`)?
4. ต้องการระบบแอดมินสำหรับสร้าง/แก้ไขข้อมูลผู้เข้าแข่งขันแบบ CRUD เต็มรูปแบบ หรือ import จาก Excel ครั้งเดียว?
