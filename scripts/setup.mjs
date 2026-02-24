// Firebase Admin SDK 없이 Firebase Client SDK로 테스트 계정 + 데이터 생성
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAccount(email, password, profile) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    await setDoc(doc(db, "users", uid), { ...profile, uid });
    console.log(`✅ ${profile.role} 계정 생성: ${email} (${profile.name})`);
    return uid;
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      console.log(`⏭️  이미 존재: ${email}`);
    } else {
      console.error(`❌ 오류 (${email}):`, e.message);
    }
    return null;
  }
}

async function main() {
  console.log("🚀 강점 로그 2.0 초기 데이터 설정 시작...\n");

  // 1. 교사 계정
  const teacherUid = await createAccount("teacher@school.com", "teacher123", {
    name: "김선생",
    role: "teacher",
    strengths: [],
    gardenLevel: 0,
  });

  // 2. 학생 계정 5명
  const students = [
    { name: "이하늘", number: 1, strengths: ["creativity", "curiosity", "kindness"] },
    { name: "박지우", number: 2, strengths: ["perseverance", "teamwork", "hope"] },
    { name: "최서윤", number: 3, strengths: ["love", "gratitude", "humor"] },
    { name: "정민준", number: 4, strengths: ["bravery", "leadership", "honesty"] },
    { name: "강예은", number: 5, strengths: ["social-intelligence", "fairness", "self-regulation"] },
  ];

  for (const s of students) {
    await createAccount(`student${s.number}@school.com`, "student123", {
      name: s.name,
      role: "student",
      studentNumber: s.number,
      strengths: s.strengths,
      gardenLevel: 0,
      teacherId: teacherUid || undefined,
    });
  }

  console.log("\n✨ 설정 완료!\n");
  console.log("📋 로그인 정보:");
  console.log("  교사: teacher@school.com / teacher123");
  console.log("  학생: student1@school.com ~ student5@school.com / student123");
  console.log("\n🚀 npm run dev 로 개발 서버를 시작하세요!");

  process.exit(0);
}

main();
