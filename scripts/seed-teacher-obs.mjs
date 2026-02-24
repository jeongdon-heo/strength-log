import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
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

async function main() {
  console.log("📝 교사 관찰 기록 학생별 5개씩 생성...\n");

  // 교사 로그인
  const teacherCred = await signInWithEmailAndPassword(auth, "teacher@school.com", "teacher123");
  const teacherUid = teacherCred.user.uid;
  console.log("✅ 교사(김선생) 로그인 완료\n");

  // 학생 UID 조회
  const q = query(collection(db, "users"), where("role", "==", "student"));
  const snap = await getDocs(q);
  const students = snap.docs.map(d => d.data());
  students.sort((a, b) => (a.studentNumber ?? 0) - (b.studentNumber ?? 0));

  const observations = {
    "이하늘": [
      { strengthId: "creativity", category: "수업", content: "미술 시간에 폐품을 활용한 조형 작품에서 독창적인 발상이 돋보였으며 친구들에게도 영감을 줌." },
      { strengthId: "curiosity", category: "수업", content: "과학 실험에서 교과서에 없는 추가 질문을 스스로 만들어 탐구하는 모습이 인상적이었음." },
      { strengthId: "kindness", category: "관계", content: "전학 온 학생에게 일주일간 교실 안내를 자발적으로 해주어 빠른 적응을 도움." },
      { strengthId: "curiosity", category: "기타", content: "도서관에서 자발적으로 곤충 도감을 빌려 읽고 관찰 일지를 작성해 옴." },
      { strengthId: "creativity", category: "수업", content: "국어 시간 시 창작 활동에서 감각적인 비유 표현을 사용하여 반 대표 작품으로 선정됨." },
    ],
    "박지우": [
      { strengthId: "perseverance", category: "수업", content: "수학 심화 문제를 3일에 걸쳐 풀이 과정을 정리하며 끝까지 해결하는 끈기를 보여줌." },
      { strengthId: "teamwork", category: "수업", content: "모둠 프로젝트에서 구성원 간 갈등 상황을 조율하고 역할을 재분배하여 성공적으로 완수함." },
      { strengthId: "hope", category: "생활", content: "체육대회 연습에서 계주 실수 후에도 의기소침하지 않고 팀원들을 격려하며 분위기를 끌어올림." },
      { strengthId: "perseverance", category: "생활", content: "줄넘기 이중뛰기에 도전하여 한 달간 매일 아침 연습한 끝에 성공하는 모습을 보여줌." },
      { strengthId: "teamwork", category: "관계", content: "반 축제 준비 시 소외되는 친구 없이 모든 구성원에게 역할을 배분하는 리더십을 발휘함." },
    ],
    "최서윤": [
      { strengthId: "love", category: "관계", content: "입원한 친구에게 반 친구들의 응원 메시지를 모아 직접 만든 카드로 전달함." },
      { strengthId: "gratitude", category: "생활", content: "급식실 배식 도우미에게 매일 감사 인사를 건네고 주변 친구들에게도 감사 표현을 독려함." },
      { strengthId: "humor", category: "관계", content: "반 분위기가 침체되었을 때 적절한 유머로 친구들을 웃게 하여 교실 분위기를 환기시킴." },
      { strengthId: "love", category: "생활", content: "어버이날 부모님께 손편지를 정성껏 작성하여 가정에서 좋은 반응을 받았다는 학부모 피드백 있음." },
      { strengthId: "gratitude", category: "수업", content: "담임교사에게 자발적으로 감사 편지를 작성하여 전달하는 등 감사하는 마음을 실천으로 옮김." },
    ],
    "정민준": [
      { strengthId: "bravery", category: "수업", content: "전교 발표대회에 자원하여 준비 과정에서 긴장을 극복하고 당당하게 발표를 완수함." },
      { strengthId: "leadership", category: "수업", content: "모둠장으로서 구성원 의견을 경청한 후 합리적인 방향을 제시하며 프로젝트를 이끌어감." },
      { strengthId: "honesty", category: "생활", content: "교실에서 발견한 분실물을 즉시 교무실에 가져다주는 정직한 행동을 실천함." },
      { strengthId: "bravery", category: "관계", content: "친구가 또래 괴롭힘을 당하는 상황에서 용기 있게 개입하여 상황을 교사에게 알림." },
      { strengthId: "leadership", category: "기타", content: "현장학습에서 길을 찾는 상황에서 침착하게 지도를 읽고 반 친구들을 안전하게 인솔함." },
    ],
    "강예은": [
      { strengthId: "social-intelligence", category: "관계", content: "친구 간 다툼 상황에서 양측의 감정을 공감하며 들어주고 합리적인 해결책을 제시함." },
      { strengthId: "fairness", category: "수업", content: "모둠 활동에서 발표 기회를 고르게 배분하여 모든 구성원이 참여할 수 있도록 배려함." },
      { strengthId: "self-regulation", category: "생활", content: "주변 소란에도 흔들리지 않고 자기 할 일에 집중하는 뛰어난 자기통제력을 보여줌." },
      { strengthId: "social-intelligence", category: "생활", content: "표정이 어두운 친구에게 먼저 다가가 이야기를 들어주고 담임에게 상담을 연결해줌." },
      { strengthId: "fairness", category: "관계", content: "간식 배분 시 공정하게 나누어 주어 반 친구들로부터 신뢰를 받고 있음." },
    ],
  };

  for (const student of students) {
    const obs = observations[student.name];
    if (!obs) continue;
    console.log(`👤 ${student.studentNumber}번 ${student.name}`);

    for (const o of obs) {
      await addDoc(collection(db, "observations"), {
        targetId: student.uid,
        writerId: teacherUid,
        writerRole: "teacher",
        writerName: "김선생",
        targetName: student.name,
        category: o.category,
        strengthId: o.strengthId,
        content: o.content,
        status: "approved",
        teacherId: teacherUid,
        createdAt: Timestamp.now(),
      });
      console.log(`  ✅ ${o.strengthId}: ${o.content.slice(0, 30)}...`);
    }
  }

  console.log("\n✨ 교사 기록 25개 생성 완료! (학생 5명 × 5개, 모두 approved)");
  process.exit(0);
}

main();
