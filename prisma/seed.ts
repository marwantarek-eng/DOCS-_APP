// prisma/seed.ts
// Run: npx prisma db seed

import { PrismaClient, Role, Specialty, BadgeType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Doctors ──────────────────────────────────
  const marwan = await prisma.user.upsert({
    where: { email: "marwan@docs.eg" },
    update: {},
    create: {
      name: "د. مروان طارق علي",
      email: "marwan@docs.eg",
      phone: "+201001234567",
      role: Role.DOCTOR,
      syndicateId: "EG-29814",
      isVerified: true,
      specialty: Specialty.ORTHOPAEDICS,
      location: "Cairo",
      bio: "استشاري جراحة العظام وإصابات الملاعب | Consultant Orthopaedic & Sports Surgery",
      trustScore: 91,
      yearsExp: 15,
      whatsappUrl: "https://wa.me/201001234567",
    },
  });

  const sara = await prisma.user.upsert({
    where: { email: "sara@docs.eg" },
    update: {},
    create: {
      name: "د. سارة عبدالعزيز",
      email: "sara@docs.eg",
      phone: "+201112345678",
      role: Role.DOCTOR,
      syndicateId: "EG-41532",
      isVerified: true,
      specialty: Specialty.DERMATOLOGY,
      location: "Cairo",
      bio: "استشارية جلدية وتجميل الجلد | Consultant Dermatology & Aesthetic",
      trustScore: 88,
      yearsExp: 12,
    },
  });

  const ahmed = await prisma.user.upsert({
    where: { email: "ahmed@docs.eg" },
    update: {},
    create: {
      name: "د. أحمد حسن",
      email: "ahmed@docs.eg",
      phone: "+201223456789",
      role: Role.DOCTOR,
      syndicateId: "EG-18976",
      isVerified: true,
      specialty: Specialty.CARDIOLOGY,
      location: "Alexandria",
      bio: "استشاري أمراض قلب وأوعية دموية | Consultant Cardiology & Vascular",
      trustScore: 95,
      yearsExp: 18,
    },
  });

  // ── Folders for Marwan ────────────────────────
  const kneeFolder = await prisma.folder.create({
    data: { doctorId: marwan.id, nameAr: "الركبة",         nameEn: "Knee Surgery",      icon: "🦵" },
  });
  const spineFolder = await prisma.folder.create({
    data: { doctorId: marwan.id, nameAr: "العمود الفقري",  nameEn: "Spine",             icon: "🦴" },
  });
  const shoulderFolder = await prisma.folder.create({
    data: { doctorId: marwan.id, nameAr: "الكتف والمفاصل",nameEn: "Shoulder & Joints", icon: "💪" },
  });
  const sportsFolder = await prisma.folder.create({
    data: { doctorId: marwan.id, nameAr: "إصابات الملاعب", nameEn: "Sports Injuries",  icon: "⚽" },
  });

  // ── Cases ─────────────────────────────────────
  const case1 = await prisma.case.create({
    data: {
      doctorId: marwan.id,
      folderId: kneeFolder.id,
      titleAr: "تثبيت كسر مضاعف في الظنبوب",
      titleEn: "Complex tibial plateau fracture fixation",
      challengeAr: "شاب ٢٨ سنة، إصابة ملاعب أدت لكسر مضاعف مع تحرك العظام من مكانها.",
      challengeEn: "28-year-old with complex tibial fracture and full bone displacement after sports injury.",
      actionAr: "تدخل جراحي سريع باستخدام شريحة تيتانيوم ومسامير قابلة للامتصاص.",
      actionEn: "Emergency surgery with titanium plate and absorbable screws.",
      outcomeAr: "استعادة الحركة الكاملة بعد شهرين. عاد المريض للملاعب.",
      outcomeEn: "Full ROM restored in 2 months. Patient returned to sport.",
      beforeLabelAr: "قبل — كسر مفتوح",
      beforeLabelEn: "Before — fracture",
      afterLabelAr: "بعد — التعافي",
      afterLabelEn: "After — healed",
      beforeBgColor: "#FEE2E2",
      afterBgColor: "#DCFCE7",
      views: 214,
      complianceAccepted: true,
    },
  });

  const case2 = await prisma.case.create({
    data: {
      doctorId: marwan.id,
      folderId: kneeFolder.id,
      titleAr: "علاج قطع في الغضروف الهلالي للركبة",
      titleEn: "Meniscal tear arthroscopic repair",
      challengeAr: "لاعب رياضي يعاني من ألم شديد وعدم قدرة على ثني الركبة.",
      challengeEn: "Professional athlete with severe knee pain from acute meniscal tear.",
      actionAr: "منظار للركبة لتهذيب الغضروف مع برنامج تأهيل مكثف.",
      actionEn: "Knee arthroscopy for meniscal debridement and intensive rehab.",
      outcomeAr: "العودة للملاعب بعد ٣ شهور بمستوى أداء طبيعي.",
      outcomeEn: "Returned to sport after 3 months at pre-injury level.",
      beforeBgColor: "#FEF3C7",
      afterBgColor: "#DCFCE7",
      views: 187,
      complianceAccepted: true,
    },
  });

  const case3 = await prisma.case.create({
    data: {
      doctorId: marwan.id,
      folderId: shoulderFolder.id,
      titleAr: "خلع كتف خلفي فائت — تشخيص متأخر",
      titleEn: "Missed posterior shoulder dislocation",
      challengeAr: "شاب ٢٢ سنة يعاني من ألم في الكتف منذ ٣ أشهر. خطأ تشخيصي في مستشفيين.",
      challengeEn: "22-year-old with 3-month shoulder pain, misdiagnosed at two hospitals.",
      actionAr: "أشعة مقطعية ثلاثية الأبعاد. إعادة التموضع وإصلاح الحفرة الغينوئيدية.",
      actionEn: "3D CT, closed reduction under GA, glenoid repair.",
      outcomeAr: "عاد نطاق الحركة الكامل بعد ١٢ أسبوعاً.",
      outcomeEn: "Full ROM at 12 weeks. Patient back to football at 5 months.",
      beforeBgColor: "#FEE2E2",
      afterBgColor: "#DCFCE7",
      views: 301,
      complianceAccepted: true,
    },
  });

  const case4 = await prisma.case.create({
    data: {
      doctorId: marwan.id,
      folderId: sportsFolder.id,
      titleAr: "إصابة الرباط الصليبي في لاعب كرة قدم",
      titleEn: "ACL reconstruction in footballer",
      challengeAr: "لاعب ٢٥ سنة، تمزق كامل في الرباط الصليبي الأمامي أثناء المباراة.",
      challengeEn: "25-year-old footballer, complete ACL rupture during competitive match.",
      actionAr: "إعادة بناء الرباط باستخدام وتر النصف وترائي مع التثبيت الداخلي.",
      actionEn: "ACL reconstruction using hamstring graft with internal brace.",
      outcomeAr: "عودة للتدريب بعد ٩ أشهر. لا يوجد عدم استقرار في الركبة.",
      outcomeEn: "Returned to training at 9 months. No residual instability.",
      beforeBgColor: "#FEF3C7",
      afterBgColor: "#DCFCE7",
      views: 142,
      complianceAccepted: true,
    },
  });

  // ── Endorsements ──────────────────────────────
  await prisma.endorsement.createMany({
    data: [
      { senderId: sara.id,  receiverId: marwan.id, caseId: case1.id, badgeType: BadgeType.SURGICAL_EXCELLENCE },
      { senderId: ahmed.id, receiverId: marwan.id, caseId: case1.id, badgeType: BadgeType.BRILLIANT_DIAGNOSIS },
      { senderId: sara.id,  receiverId: marwan.id, caseId: case3.id, badgeType: BadgeType.CLINICAL_ACUMEN },
      { senderId: ahmed.id, receiverId: marwan.id, caseId: case4.id, badgeType: BadgeType.QUICK_INTERVENTION },
      { senderId: marwan.id, receiverId: ahmed.id, caseId: null,     badgeType: BadgeType.RESEARCH_LEADER },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });