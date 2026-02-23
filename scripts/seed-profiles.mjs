import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAjHfLeoDtzuipoL0EpElWd6De4YRjwxQw",
  authDomain: "my-app-d57ad.firebaseapp.com",
  projectId: "my-app-d57ad",
  storageBucket: "my-app-d57ad.firebasestorage.app",
  messagingSenderId: "494292895627",
  appId: "1:494292895627:web:1bfb14aaa80cb4efa0d18e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const accounts = [
  { email: "teacher@school.com", password: "teacher123", profile: { name: "김선생", role: "teacher", strengths: [], gardenLevel: 0 } },
  { email: "student1@school.com", password: "student123", profile: { name: "이하늘", role: "student", studentNumber: 1, strengths: ["creativity", "curiosity", "kindness"], gardenLevel: 0 } },
  { email: "student2@school.com", password: "student123", profile: { name: "박지우", role: "student", studentNumber: 2, strengths: ["perseverance", "teamwork", "hope"], gardenLevel: 0 } },
  { email: "student3@school.com", password: "student123", profile: { name: "최서윤", role: "student", studentNumber: 3, strengths: ["love", "gratitude", "humor"], gardenLevel: 0 } },
  { email: "student4@school.com", password: "student123", profile: { name: "정민준", role: "student", studentNumber: 4, strengths: ["bravery", "leadership", "honesty"], gardenLevel: 0 } },
  { email: "student5@school.com", password: "student123", profile: { name: "강예은", role: "student", studentNumber: 5, strengths: ["social-intelligence", "fairness", "self-regulation"], gardenLevel: 0 } },
];

async function main() {
  console.log("📝 Firestore 프로필 데이터 저장 시작...\n");
  // 교사 UID 먼저 확보
  let teacherUid = null;
  try {
    const teacherCred = await signInWithEmailAndPassword(auth, "teacher@school.com", "teacher123");
    teacherUid = teacherCred.user.uid;
  } catch (e) {
    console.error("❌ 교사 로그인 실패:", e.message);
  }
  for (const acc of accounts) {
    try {
      const cred = await signInWithEmailAndPassword(auth, acc.email, acc.password);
      const uid = cred.user.uid;
      const profile = { ...acc.profile, uid };
      // 학생 프로필에 teacherId 추가
      if (acc.profile.role === "student" && teacherUid) {
        profile.teacherId = teacherUid;
      }
      await setDoc(doc(db, "users", uid), profile);
      console.log(`✅ ${acc.profile.name} (${acc.email}) 프로필 저장 완료`);
    } catch (e) {
      console.error(`❌ ${acc.email}: ${e.message}`);
    }
  }
  console.log("\n✨ 완료!");
  process.exit(0);
}

main();
