import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";

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

// 학생 정보 (seed-profiles에서 생성한 계정)
const students = [
  { email: "student1@school.com", password: "student123", name: "이하늘", strengths: ["creativity", "curiosity", "kindness"] },
  { email: "student2@school.com", password: "student123", name: "박지우", strengths: ["perseverance", "teamwork", "hope"] },
  { email: "student3@school.com", password: "student123", name: "최서윤", strengths: ["love", "gratitude", "humor"] },
  { email: "student4@school.com", password: "student123", name: "정민준", strengths: ["bravery", "leadership", "honesty"] },
  { email: "student5@school.com", password: "student123", name: "강예은", strengths: ["social-intelligence", "fairness", "self-regulation"] },
];

const categories = ["수업", "관계", "생활", "기타"];

// 학생별 셀프 기록 3개 + 친구 선물 2개 = 5개씩
const selfLogs = {
  "이하늘": [
    { strengthId: "creativity", category: "수업", content: "미술 시간에 재활용 재료로 로봇을 만들었는데 선생님이 아이디어가 좋다고 칭찬해주셨어요." },
    { strengthId: "curiosity", category: "수업", content: "과학 시간에 식물이 왜 햇빛 쪽으로 자라는지 궁금해서 도서관에서 책을 찾아 읽었어요." },
    { strengthId: "kindness", category: "관계", content: "점심시간에 새로 전학 온 친구가 혼자 앉아있길래 같이 밥 먹자고 했어요." },
  ],
  "박지우": [
    { strengthId: "perseverance", category: "수업", content: "수학 문제가 너무 어려웠는데 포기하지 않고 3번이나 다시 풀어서 결국 맞았어요." },
    { strengthId: "teamwork", category: "수업", content: "모둠 과제에서 친구들이 힘들어할 때 제가 먼저 도와주고 역할을 나눠서 함께 완성했어요." },
    { strengthId: "hope", category: "생활", content: "체육대회에서 우리 반이 질 것 같았는데 끝까지 응원하고 파이팅 했어요." },
  ],
  "최서윤": [
    { strengthId: "love", category: "관계", content: "엄마 생신에 편지를 직접 써서 드렸더니 엄마가 울면서 기뻐하셨어요." },
    { strengthId: "gratitude", category: "생활", content: "급식 아주머니께 매일 감사합니다 인사를 드렸더니 아주머니가 활짝 웃으셨어요." },
    { strengthId: "humor", category: "관계", content: "친구가 시험을 못 봐서 울고 있길래 재미있는 이야기로 웃게 해줬어요." },
  ],
  "정민준": [
    { strengthId: "bravery", category: "수업", content: "발표 시간에 손을 제일 먼저 들고 내 의견을 자신있게 말했어요." },
    { strengthId: "leadership", category: "수업", content: "모둠장으로서 친구들의 의견을 하나하나 들어보고 가장 좋은 방법을 정했어요." },
    { strengthId: "honesty", category: "생활", content: "복도에서 돈을 주웠는데 바로 선생님께 가져다 드렸어요." },
  ],
  "강예은": [
    { strengthId: "social-intelligence", category: "관계", content: "친구 두 명이 다투고 있길래 양쪽 이야기를 다 들어보고 화해시켜줬어요." },
    { strengthId: "fairness", category: "수업", content: "모둠 활동에서 발표 기회를 아직 못 가진 친구에게 양보했어요." },
    { strengthId: "self-regulation", category: "생활", content: "게임하고 싶었지만 숙제를 먼저 끝내고 나서 게임을 했어요." },
  ],
};

// 친구 선물 (peer gift) 데이터 — 각 학생이 2개씩 다른 친구에게
const peerGifts = {
  "이하늘": [
    { targetName: "박지우", targetIdx: 1, strengthId: "perseverance", category: "수업", content: "지우가 어려운 수학 문제를 끝까지 포기하지 않고 푸는 모습이 정말 멋있었어!" },
    { targetName: "최서윤", targetIdx: 2, strengthId: "humor", category: "관계", content: "서윤이가 재미있는 이야기를 해줘서 우리 반이 항상 웃음이 넘쳐요!" },
  ],
  "박지우": [
    { targetName: "이하늘", targetIdx: 0, strengthId: "creativity", category: "수업", content: "하늘이는 항상 기발한 아이디어를 내서 모둠 활동이 재미있어요!" },
    { targetName: "정민준", targetIdx: 3, strengthId: "bravery", category: "수업", content: "민준이가 발표를 자신있게 하는 모습을 보면 나도 용기가 생겨요!" },
  ],
  "최서윤": [
    { targetName: "강예은", targetIdx: 4, strengthId: "fairness", category: "관계", content: "예은이는 항상 공정하게 행동해서 친구들이 다 믿고 따라요!" },
    { targetName: "이하늘", targetIdx: 0, strengthId: "kindness", category: "관계", content: "하늘이가 전학생 옆에 먼저 다가가는 모습이 정말 따뜻했어요!" },
  ],
  "정민준": [
    { targetName: "박지우", targetIdx: 1, strengthId: "teamwork", category: "수업", content: "지우는 모둠 활동할 때 항상 친구들을 챙겨줘서 고마워!" },
    { targetName: "강예은", targetIdx: 4, strengthId: "social-intelligence", category: "관계", content: "예은이가 싸우는 친구들을 화해시켜주는 모습이 대단해요!" },
  ],
  "강예은": [
    { targetName: "최서윤", targetIdx: 2, strengthId: "gratitude", category: "생활", content: "서윤이가 급식 아주머니께 매일 인사하는 모습이 정말 보기 좋아요!" },
    { targetName: "정민준", targetIdx: 3, strengthId: "leadership", category: "수업", content: "민준이가 모둠장으로서 모두의 의견을 잘 정리해줘서 든든해요!" },
  ],
};

async function main() {
  console.log("📝 학생별 관찰 기록 5개씩 생성 시작...\n");
  // 교사 UID 확보 (학생들의 teacherId로 사용)
  const teacherCred = await signInWithEmailAndPassword(auth, "teacher@school.com", "teacher123");
  const teacherUid = teacherCred.user.uid;

  const uids = [];
  // 먼저 모든 학생 로그인해서 UID 확보
  for (const s of students) {
    const cred = await signInWithEmailAndPassword(auth, s.email, s.password);
    uids.push(cred.user.uid);
  }

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const writerUid = uids[i];
    console.log(`\n👤 ${s.name} (${s.email}) 로그인...`);

    // 셀프 기록 3개
    const mySelfs = selfLogs[s.name];
    for (const log of mySelfs) {
      await addDoc(collection(db, "observations"), {
        targetId: writerUid,
        writerId: writerUid,
        writerRole: "self",
        writerName: s.name,
        targetName: s.name,
        category: log.category,
        strengthId: log.strengthId,
        content: log.content,
        status: "pending",
        teacherId: teacherUid,
        createdAt: Timestamp.now(),
      });
      console.log(`  ✅ 셀프기록: ${log.strengthId} — ${log.content.slice(0, 25)}...`);
    }

    // 친구 선물 2개
    const myGifts = peerGifts[s.name];
    for (const gift of myGifts) {
      const targetUid = uids[gift.targetIdx];
      await addDoc(collection(db, "observations"), {
        targetId: targetUid,
        writerId: writerUid,
        writerRole: "peer",
        writerName: s.name,
        targetName: gift.targetName,
        category: gift.category,
        strengthId: gift.strengthId,
        content: gift.content,
        status: "pending",
        teacherId: teacherUid,
        createdAt: Timestamp.now(),
      });
      console.log(`  🎁 친구선물 → ${gift.targetName}: ${gift.content.slice(0, 25)}...`);
    }
  }

  console.log("\n✨ 총 25개 기록 생성 완료! (학생 5명 × 5개)");
  console.log("   - 셀프 기록 15개 (pending)");
  console.log("   - 친구 선물 10개 (pending)");
  console.log("   → 교사 로그인 후 승인함에서 확인하세요!");
  process.exit(0);
}

main();
