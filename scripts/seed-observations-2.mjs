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

const students = [
  { email: "student1@school.com", password: "student123", name: "이하늘" },
  { email: "student2@school.com", password: "student123", name: "박지우" },
  { email: "student3@school.com", password: "student123", name: "최서윤" },
  { email: "student4@school.com", password: "student123", name: "정민준" },
  { email: "student5@school.com", password: "student123", name: "강예은" },
];

const selfLogs = {
  "이하늘": [
    { strengthId: "creativity", category: "수업", content: "국어 시간에 시를 쓸 때 비유 표현을 많이 써서 선생님께서 감탄하셨어요." },
    { strengthId: "curiosity", category: "기타", content: "비가 온 뒤 무지개가 생기는 이유가 궁금해서 백과사전을 찾아봤어요." },
    { strengthId: "kindness", category: "생활", content: "교실 청소를 혼자 하는 친구가 있어서 같이 도와줬어요." },
  ],
  "박지우": [
    { strengthId: "perseverance", category: "생활", content: "줄넘기 이중뛰기를 한 달 동안 매일 연습해서 드디어 성공했어요." },
    { strengthId: "teamwork", category: "관계", content: "반 축제 준비에서 소외된 친구가 없도록 역할을 골고루 나눠줬어요." },
    { strengthId: "hope", category: "수업", content: "영어 단어 시험에서 틀렸지만 다음엔 꼭 만점 받겠다고 다짐했어요." },
  ],
  "최서윤": [
    { strengthId: "love", category: "관계", content: "아픈 친구에게 직접 만든 카드를 써서 전해줬더니 친구가 감동받았어요." },
    { strengthId: "gratitude", category: "수업", content: "선생님이 어려운 문제를 알려주셔서 감사 편지를 써서 드렸어요." },
    { strengthId: "humor", category: "생활", content: "청소 시간이 지루해서 노래를 부르며 하자고 해서 다들 즐겁게 청소했어요." },
  ],
  "정민준": [
    { strengthId: "bravery", category: "관계", content: "친구가 놀림당하는 걸 보고 용기 내서 그만하라고 말했어요." },
    { strengthId: "leadership", category: "기타", content: "소풍에서 길을 잃었을 때 침착하게 지도를 보고 친구들을 이끌었어요." },
    { strengthId: "honesty", category: "수업", content: "시험에서 옆 친구 답이 보였지만 내 답을 그대로 써서 제출했어요." },
  ],
  "강예은": [
    { strengthId: "social-intelligence", category: "생활", content: "친구가 표정이 안 좋아서 무슨 일이냐고 먼저 물어봤더니 고민을 이야기해줬어요." },
    { strengthId: "fairness", category: "관계", content: "간식을 나눌 때 모든 친구에게 똑같은 양을 나눠줬어요." },
    { strengthId: "self-regulation", category: "수업", content: "수업 시간에 친구가 장난을 걸었지만 참고 수업에 집중했어요." },
  ],
};

const peerGifts = {
  "이하늘": [
    { targetName: "정민준", targetIdx: 3, strengthId: "honesty", category: "생활", content: "민준이는 항상 솔직하게 말해서 믿음이 가요. 정직한 친구!" },
    { targetName: "강예은", targetIdx: 4, strengthId: "self-regulation", category: "수업", content: "예은이가 시끄러운 상황에서도 차분하게 공부하는 모습이 대단해요!" },
  ],
  "박지우": [
    { targetName: "최서윤", targetIdx: 2, strengthId: "love", category: "관계", content: "서윤이가 아픈 친구에게 카드 써준 거 보고 감동받았어요. 따뜻한 친구!" },
    { targetName: "강예은", targetIdx: 4, strengthId: "fairness", category: "관계", content: "예은이가 간식 나눌 때 공평하게 해줘서 아무도 불만이 없었어요!" },
  ],
  "최서윤": [
    { targetName: "박지우", targetIdx: 1, strengthId: "perseverance", category: "생활", content: "지우가 줄넘기 이중뛰기 한 달 동안 연습한 거 진짜 끈기 있어요!" },
    { targetName: "정민준", targetIdx: 3, strengthId: "bravery", category: "관계", content: "민준이가 놀림당하는 친구를 위해 용기 내서 나선 모습이 멋있었어요!" },
  ],
  "정민준": [
    { targetName: "이하늘", targetIdx: 0, strengthId: "curiosity", category: "수업", content: "하늘이가 궁금한 게 있으면 직접 찾아보는 모습이 멋있어요!" },
    { targetName: "최서윤", targetIdx: 2, strengthId: "gratitude", category: "수업", content: "서윤이가 선생님께 감사 편지 쓴 거 보고 나도 감사함을 배웠어요!" },
  ],
  "강예은": [
    { targetName: "이하늘", targetIdx: 0, strengthId: "creativity", category: "수업", content: "하늘이 시가 너무 예뻐서 우리 반 시집을 만들자고 했어요!" },
    { targetName: "박지우", targetIdx: 1, strengthId: "teamwork", category: "기타", content: "지우가 축제 준비할 때 모두를 챙겨줘서 함께하면 든든해요!" },
  ],
};

async function main() {
  console.log("📝 학생별 관찰 기록 5개씩 추가 생성...\n");
  // 교사 UID 확보
  const teacherCred = await signInWithEmailAndPassword(auth, "teacher@school.com", "teacher123");
  const teacherUid = teacherCred.user.uid;
  const uids = [];
  for (const s of students) {
    const cred = await signInWithEmailAndPassword(auth, s.email, s.password);
    uids.push(cred.user.uid);
  }

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const writerUid = uids[i];
    console.log(`\n👤 ${s.name}`);

    for (const log of selfLogs[s.name]) {
      await addDoc(collection(db, "observations"), {
        targetId: writerUid, writerId: writerUid, writerRole: "self",
        writerName: s.name, targetName: s.name,
        category: log.category, strengthId: log.strengthId,
        content: log.content, status: "pending", teacherId: teacherUid, createdAt: Timestamp.now(),
      });
      console.log(`  ✅ 셀프: ${log.content.slice(0, 30)}...`);
    }

    for (const gift of peerGifts[s.name]) {
      await addDoc(collection(db, "observations"), {
        targetId: uids[gift.targetIdx], writerId: writerUid, writerRole: "peer",
        writerName: s.name, targetName: gift.targetName,
        category: gift.category, strengthId: gift.strengthId,
        content: gift.content, status: "pending", teacherId: teacherUid, createdAt: Timestamp.now(),
      });
      console.log(`  🎁 선물 → ${gift.targetName}: ${gift.content.slice(0, 25)}...`);
    }
  }

  console.log("\n✨ 추가 25개 완료! (총 50개)");
  process.exit(0);
}

main();
