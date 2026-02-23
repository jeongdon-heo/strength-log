import { NextRequest, NextResponse } from "next/server";
import { REPORT_EXAMPLES } from "@/lib/report-examples";

interface ObservationInput {
  content: string;
  writerRole: string;
  strengthId: string;
  category: string;
}

interface RequestBody {
  apiKey: string;
  studentName: string;
  observations: ObservationInput[];
  strengths: string[];
  mode?: "standard" | "example-based";
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { apiKey, studentName, observations, strengths, mode = "standard" } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API 키가 필요합니다." },
        { status: 400 }
      );
    }

    if (!observations || observations.length === 0) {
      return NextResponse.json(
        { error: "관찰 기록이 필요합니다." },
        { status: 400 }
      );
    }

    // Build observation data text
    const observationText = observations
      .map(
        (obs, i) =>
          `${i + 1}. [${obs.writerRole === "teacher" ? "교사 기록" : "또래 기록"}] 강점: ${obs.strengthId}, 영역: ${obs.category}\n   내용: ${obs.content}`
      )
      .join("\n");

    const strengthsList = strengths.length > 0 ? strengths.join(", ") : "미등록";

    let systemPrompt: string;

    if (mode === "example-based") {
      const examplesText = REPORT_EXAMPLES.map(
        (ex, i) => `[예시 ${i + 1}: ${ex.label}]\n${ex.text}`
      ).join("\n\n");

      systemPrompt = `당신은 초등학교 4학년 담임교사입니다. 아래 '작성 요령'과 '참고 예시'를 숙지한 후, 동일한 형식으로 '행동특성 및 종합의견'을 작성하세요.

[작성 요령]
행동특성 및 종합의견은 담임교사가 1년간 학생을 수시 관찰·평가한 누가기록을 바탕으로, 학생을 총체적으로 이해할 수 있도록 문장으로 작성하는 '추천서' 성격의 기록입니다.

1. 핵심 기재 요령
• 구체적 사례 중심 서술: "성실하다", "착하다", "책임감 있다" 같은 상투적·추상적 형용사 나열을 지양하고, 학생이 실제 활동에서 보여준 태도·동기·갈등 관리·협력 등의 구체적 사례와 객관적 누가기록에 근거하여 작성할 것.
• 단점 기재 시 변화 가능성 필수: 장점 위주로 작성하되, 단점·부족한 점을 기록할 경우 반드시 극복 과정이나 '변화 및 발전 가능성'을 함께 기재할 것.
• 분량: 공백 포함 최대 500자(1,500바이트) 이내. 400~500자 범위를 준수할 것.

2. 기재 내용 구성
• 교과 세부능력, 창의적 체험활동, 독서활동 등 다른 항목에 미처 담지 못한 학업 역량·인성·가치관을 담임교사 관점에서 종합 기술.
• 단순 중복 기재 금지: 다른 영역 활동을 그대로 옮겨 적지 말 것. 연계 시 참가 동기나 활동 후 변화 등 담임교사만의 재평가가 드러나야 함.

3. 금지 사항
• 사교육 유발 요인 절대 금지: 공인어학시험 성적, 교외 대회 수상, 모의고사 성적, 교외 인증시험, 논문·도서 출간 등 기재 불가.
• 영재교육 수료 내용 기재 불가.

[참고 예시 — 문체·표현·구성 레퍼런스]
${examplesText}
1. 위 예시들의 문체와 표현 패턴을 정확히 따를 것 (예: "~하는 모습이 인상적임", "~하는 등 ~이 돋보임", "~할 것으로 기대됨" 등).
2. 교사 기록과 승인된 친구 기록만 사용하고 학생 본인 기록은 제외할 것.
3. 모든 문장의 끝을 반드시 'ㅁ' 받침으로 끝낼 것 (예: ~함, ~임, ~됨, ~보임, ~있음, ~받음, ~높음, ~뛰어남 등). 절대로 '~다', '~요', '~습니다'로 끝내지 말 것.
4. 친구들의 평가를 "동료 학생들로부터 ~라는 긍정적인 평가를 받음" 등의 형태로 포함할 것.
5. 구체적 사례 중심으로 서술하고, 추상적 형용사 나열("착하다", "성실하다")은 지양할 것.
6. 단점을 언급할 경우 반드시 변화·발전 가능성을 함께 기술할 것.
7. 사교육 유발 요인(교외 수상, 어학시험 등)은 절대 포함하지 말 것.
8. 글자 수 공백 포함 400~500자 준수.
9. 예시 문장을 그대로 복사하지 말고, 해당 학생의 실제 관찰 기록 데이터를 바탕으로 새로 작성할 것.`;
    } else {
      systemPrompt = `당신은 초등학교 4학년 담임교사입니다. 아래 데이터를 바탕으로 '행동특성 및 종합의견'을 작성하세요.
교사 기록과 승인된 친구 기록만 사용하고 학생 본인 기록은 제외할 것.
"~함, ~임" 형태의 개조식 문장 사용.
친구들의 평가를 "동료 학생들로부터 ~라는 긍정적인 평가를 받음" 등의 형태로 포함할 것.
글자 수 공백 포함 400~500자 준수.`;
    }

    const userPrompt = `학생 이름: ${studentName}
VIA 대표 강점: ${strengthsList}

관찰 기록:
${observationText}

위 데이터를 바탕으로 행동특성 및 종합의견을 작성해주세요.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Gemini API 호출에 실패했습니다. API 키를 확인해주세요." },
        { status: geminiResponse.status }
      );
    }

    const geminiData = await geminiResponse.json();

    const text =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!text) {
      return NextResponse.json(
        { error: "생성된 텍스트가 없습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Gemini route error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
