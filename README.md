# ระบบ Popular Vote (MHC9)

ระบบโหวตผลงานนวัตกรรม ศูนย์สุขภาพจิตที่ 9 เน้นการออกแบบ Mobile-First Design ที่ทันสมัย (High-Tech, AI Theme, Glassmorphism) 

## 🚀 เทคโนโลยีที่ใช้ (Tech Stack)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database ORM**: [Prisma v7](https://www.prisma.io/) 
- **Database Driver**: `@prisma/adapter-libsql` (ใช้ SQLite สำหรับ Development)
- **Authentication**: JWT Session (ใช้ไลบรารี `jose`)
- **Validation**: Zod
- **Font**: Google Prompt

## 📱 ฟีเจอร์หลัก (Key Features)
1. **Landing Page**: แสดงรายการกิจกรรมโหวตที่กำลังเปิดอยู่
2. **ระบบยืนยันตัวตน (OTP)**: ผู้ใช้ลงทะเบียนด้วยเบอร์โทรศัพท์ และยืนยันด้วยรหัส OTP 6 หลัก (จำลองระบบ)
3. **ระบบโหวต (Voting System)**: เลือกโหวตผลงานนวัตกรรมได้ 1 ผลงานต่อ 1 กิจกรรม
4. **สรุปผลคะแนน (Leaderboard)**: ดูผลโหวตแบบ Top 10 อัปเดตคะแนนล่าสุด

## 🛠 การติดตั้งและรันโปรเจกต์ (Getting Started)

1. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```

2. ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables):
   สร้างไฟล์ `.env` ที่ root ของโปรเจกต์
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

3. สร้างฐานข้อมูลและเพิ่มข้อมูลเริ่มต้น (Database & Seed):
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. รัน Development Server:
   ```bash
   npm run dev
   ```
   เปิดบราวเซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

## 📁 โครงสร้างโปรเจกต์ที่สำคัญ (Project Structure)
- `/app` - หน้าจอและเส้นทางทั้งหมด (App Router)
- `/app/actions` - Server Actions สำหรับจัดการ Business Logic (Auth, Vote)
- `/lib` - ฟังก์ชันช่วยเหลือต่างๆ เช่น `prisma.ts`, `session.ts`, `sms.ts`
- `/prisma` - Schema ของฐานข้อมูลและสคริปต์ Seed ข้อมูล

## 🎨 สไตล์และการออกแบบ (UI/UX)
- เน้น **Mobile-First Design** จัดการพื้นที่และการแสดงผลให้เหมาะกับสมาร์ทโฟนที่สุด
- ธีม **Futuristic / Cyberpunk** ใช้โทนสีเข้ม (Dark Mode) ตัดกับแสงสว่าง Neon Cyan และ Neon Purple
- เอฟเฟกต์ **Glassmorphism** สำหรับ Card ร่วมกับขอบเรืองแสงที่คมชัด และพื้นหลัง Cyber-Grid 3 มิติ
- เพิ่มความมีชีวิตชีวาด้วยแอนิเมชันแบบ **Scanline**, เส้นเล็งเป้า (Crosshairs) และ HUD Interface
