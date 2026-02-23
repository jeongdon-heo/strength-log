📜 프로젝트: 강점 로그 2.0 (우리들의 강점 정원)
초등학교 4학년 학생들의 강점 진단 결과를 바탕으로 교사와 학생이 상호 관찰 기록을 남기고, AI가 이를 종합하여 생활기록부 초안을 생성하는 웹앱입니다.

🛠 1. 기술 스택 (Tech Stack)
Framework: Next.js 14 (App Router)

Styling: Tailwind CSS + Shadcn UI

Database & Auth: Firebase (Firestore, Authentication)

AI Engine: Google Gemini 1.5 Pro API

Icons: Lucide React + Emoji

🗄 2. 데이터베이스 설계 (Firestore Schema)
users 컬렉션
JSON
{
  "uid": "string",
  "name": "string",
  "role": "teacher | student",
  "studentNumber": "number",
  "strengths": ["강점1", "강점2", "강점3"], // VIA 진단 결과
  "gardenLevel": "number" // 누적 기록에 따른 정원 레벨
}
observations 컬렉션
JSON
{
  "id": "string",
  "targetId": "string (대상 학생 UID)",
  "writerId": "string (작성자 UID)",
  "writerRole": "teacher | peer | self",
  "category": "수업 | 관계 | 생활 | 기타",
  "strengthId": "string (예: creativity)",
  "content": "string (구체적 사례)",
  "status": "pending | approved", // 학생 기록은 교사 승인 필요
  "createdAt": "timestamp"
}
🎨 3. 메뉴 및 UI 구성
[선생님 모드]
Dashboard: 학급 전체 카드 뷰 (기록 누적 현황 시각화)

Teacher Log: 학생 선택 후 즉시 관찰 기록 입력 (STT 지원 권장)

Approval Box: 학생들이 쓴 '친구 선물(Peer-Log)' 검토 및 승인/반려

AI Report: 교사 기록 + 승인된 친구 기록을 합쳐 생기부 초안 생성

Settings: 학생 명단 업로드 및 Gemini API 키 설정

[학생 모드]
My Garden: 내가 받은 강점 보석 꽃들과 나의 대표 강점 확인

Self Log: 오늘 내가 발휘한 강점 스스로 기록하기

Peer Gift: 친구에게 강점 아이콘과 함께 칭찬 메시지 보내기

Strength Dictionary: 24개 강점의 뜻과 예시 문구 확인 (팝업 사전)

🪄 4. 핵심 기능 상세: 강점 사전 & 피커 (Strength Picker)
강점 카테고리 (6개 보석)
지혜: 창의성, 호기심, 판단력, 학구열, 통찰

용기: 용기, 끈기, 정집, 활력

사랑: 사랑, 친절, 사회 지능

정의: 팀워크, 공정함, 리더십

절제: 용서, 겸손, 신중함, 자기조절

초월: 심미안, 감사, 희망, 유머, 영성

🤖 5. AI 생기부 생성 로직 (Prompt Engineering)
System Prompt:

당신은 초등학교 4학년 담임교사입니다. 아래 데이터를 바탕으로 '행동특성 및 종합의견'을 작성하세요.

교사 기록과 승인된 친구 기록만 사용하고 학생 본인 기록은 제외할 것.

"~함, ~임" 형태의 개조식 문장 사용.

친구들의 평가를 "동료 학생들로부터 ~라는 긍정적인 평가를 받음" 등의 형태로 포함할 것.

글자 수 공백 포함 400~500자 준수.

🚀 6. 단계별 개발 로드맵
Phase 1 (기본): Next.js 프로젝트 세팅 및 Firebase 연동 (Auth/Firestore)

Phase 2 (입력): 교사용/학생용 기록 입력 폼 및 강점 피커 UI 구현

Phase 3 (관리): 선생님용 대시보드 및 학생 기록 승인 시스템 구축

Phase 4 (AI): Gemini API 연동 및 생기부 자동 생성 기능 구현

Phase 5 (고도화): 정원 성장 애니메이션 및 게임화 요소 추가

