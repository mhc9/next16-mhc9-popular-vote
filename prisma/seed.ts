import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter })

import bcrypt from 'bcryptjs'

async function main() {
  // Create Default Admin User
  const adminPasswordHash = await bcrypt.hash('password123', 10)
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      name: 'System Admin',
      role: 'ADMIN',
    }
  })

  // สร้าง Event เริ่มต้น
  const event = await prisma.voteEvent.upsert({
    where: { qrToken: 'mhc9-demo-event-2026' },
    update: {},
    create: {
      name: 'MHC9 Innovation Awards 2026',
      qrToken: 'mhc9-demo-event-2026',
      startAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // เมื่อวาน
      endAt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // อีก 7 วัน
      isOpen: true,
    },
  })

  // สร้างผู้เข้าแข่งขันจำลอง
  const contestantsData = [
    {
      id: 'MHC01',
      fullName: 'นพ. สมชาย ใจดี',
      position: 'นายแพทย์ชำนาญการ',
      department: 'ศูนย์สุขภาพจิตที่ 9',
      projectTitle: 'ระบบ AI คัดกรองภาวะซึมเศร้า',
      projectDesc: 'แอปพลิเคชันที่ใช้ AI ในการวิเคราะห์พฤติกรรมและการพิมพ์เพื่อคัดกรองความเสี่ยงภาวะซึมเศร้าเบื้องต้น',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Somchai',
    },
    {
      id: 'MHC02',
      fullName: 'พญ. สมหญิง รักสงบ',
      position: 'จิตแพทย์เด็กและวัยรุ่น',
      department: 'โรงพยาบาลจิตเวช',
      projectTitle: 'Mindfulness for Kids',
      projectDesc: 'สื่อการเรียนรู้แบบ Interactive เพื่อฝึกสมาธิและการจัดการอารมณ์สำหรับเด็ก',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Somying',
    },
    {
      id: 'MHC03',
      fullName: 'ดร. สมศักดิ์ เก่งกาจ',
      position: 'นักจิตวิทยาคลินิก',
      department: 'ศูนย์สุขภาพจิตที่ 9',
      projectTitle: 'Tele-Counseling Platform',
      projectDesc: 'แพลตฟอร์มให้คำปรึกษาทางจิตวิทยาออนไลน์ที่มีระบบนัดหมายและวิดีโอคอลที่ปลอดภัย',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Somsak',
    },
    {
      id: 'MHC04',
      fullName: 'นางสาว สมศรี ใจบุญ',
      position: 'พยาบาลวิชาชีพ',
      department: 'แผนกผู้ป่วยนอก',
      projectTitle: 'Smart Queue & Triage',
      projectDesc: 'ระบบจัดการคิวและคัดกรองผู้ป่วยด้วยตู้ Kiosk อัตโนมัติ',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Somsri',
    }
  ]

  for (const c of contestantsData) {
    await prisma.contestant.upsert({
      where: { id: c.id },
      update: {},
      create: c,
    })
  }

  console.log('Seed data created successfully!')
  console.log(`Event Token for testing: ${event.qrToken}`)
  console.log(`Admin User: admin / password123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
