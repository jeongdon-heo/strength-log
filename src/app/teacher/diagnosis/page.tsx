"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Globe,
  UserPlus,
  ClipboardList,
  BarChart3,
  Clock,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Star,
} from "lucide-react";

const STEPS = [
  {
    number: 1,
    title: "VIA 사이트 접속",
    icon: Globe,
    color: "text-blue-600 bg-blue-50",
    description: "아래 버튼 또는 주소창에 www.viacharacter.org 를 입력하여 사이트에 접속합니다.",
    tips: ["영어 사이트이므로, 크롬 브라우저의 자동 번역 기능을 활용하면 편리합니다."],
  },
  {
    number: 2,
    title: "회원가입 (무료)",
    icon: UserPlus,
    color: "text-emerald-600 bg-emerald-50",
    description: "사이트 상단의 'Take The Free Survey' 버튼을 클릭하여 회원가입 페이지로 이동합니다.",
    tips: [
      "이름, 이메일, 비밀번호를 입력합니다.",
      "학생 이메일이 없는 경우, 교사가 대리로 가입할 수 있습니다.",
      "나이를 묻는 항목에서 만 10세 이상이면 성인용 검사(VIA Survey)가 적용됩니다.",
    ],
  },
  {
    number: 3,
    title: "설문 시작",
    icon: ClipboardList,
    color: "text-violet-600 bg-violet-50",
    description: "로그인 후 'Take Survey'를 클릭하면 약 96개의 질문으로 구성된 설문이 시작됩니다.",
    tips: [
      "소요 시간: 약 10~15분",
      "각 문항에 대해 '매우 그렇다 ~ 매우 아니다' 중 자신에게 맞는 답을 고릅니다.",
      "정답이 없으므로, 솔직하게 응답하도록 안내해 주세요.",
      "중간에 멈추더라도 저장되며, 다시 로그인하면 이어서 할 수 있습니다.",
    ],
  },
  {
    number: 4,
    title: "결과 확인",
    icon: BarChart3,
    color: "text-amber-600 bg-amber-50",
    description: "설문 완료 후, 24개 성격 강점이 순위별로 정렬된 결과를 무료로 확인할 수 있습니다.",
    tips: [
      "상위 5개 강점(Signature Strengths)이 가장 중요합니다.",
      "결과 화면을 캡처하거나 PDF로 저장해두면 좋습니다.",
      "결과를 바탕으로 '강점 로그 2.0'에서 학생의 대표 강점을 설정해 주세요.",
    ],
  },
];

const VIA_STRENGTHS_24 = [
  { category: "지혜와 지식", emoji: "📚", strengths: ["창의성", "호기심", "판단력", "학구열", "통찰력"] },
  { category: "용기", emoji: "🦁", strengths: ["용감함", "끈기", "정직", "활력"] },
  { category: "인간애", emoji: "💕", strengths: ["사랑", "친절", "사회지능"] },
  { category: "정의", emoji: "⚖️", strengths: ["팀워크", "공정성", "리더십"] },
  { category: "절제", emoji: "🧘", strengths: ["용서", "겸손", "신중함", "자기조절"] },
  { category: "초월", emoji: "✨", strengths: ["감상력", "감사", "희망", "유머", "영성"] },
];

export default function DiagnosisPage() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <Card className="border-emerald-100/60 bg-gradient-to-br from-emerald-50/50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Star className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">VIA 성격 강점 진단</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                VIA(Values in Action) 성격 강점 검사는 전 세계 3,500만 명 이상이 참여한
                과학적으로 검증된 무료 강점 진단 도구입니다. 24개의 성격 강점 중
                학생 개인의 대표 강점을 발견할 수 있습니다.
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> 소요 시간: 약 10~15분
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 무료
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick link */}
      <Button
        asChild
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 text-sm font-medium"
      >
        <a href="https://www.viacharacter.org/account/register" target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4 mr-2" />
          VIA 강점 진단 사이트 바로가기
        </a>
      </Button>

      <Separator />

      {/* Step-by-step guide */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4 text-gray-500" />
          진단 방법 안내
        </h3>
        <div className="space-y-3">
          {STEPS.map((step) => (
            <Card key={step.number} className="border-gray-100">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-lg ${step.color} flex items-center justify-center flex-shrink-0`}>
                    <step.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      <span className="text-gray-400 mr-1.5">STEP {step.number}</span>
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    {step.tips.length > 0 && (
                      <ul className="space-y-1">
                        {step.tips.map((tip, i) => (
                          <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* 24 Character Strengths overview */}
      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            VIA 24개 성격 강점 한눈에 보기
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VIA_STRENGTHS_24.map((cat) => (
              <div key={cat.category} className="rounded-lg bg-gray-50 p-3">
                <h5 className="text-xs font-semibold text-gray-700 mb-1.5">
                  {cat.emoji} {cat.category}
                </h5>
                <div className="flex flex-wrap gap-1">
                  {cat.strengths.map((s) => (
                    <span
                      key={s}
                      className="inline-block text-[11px] bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-600"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teacher notes */}
      <Card className="border-amber-100/60 bg-amber-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
            <AlertCircle className="h-4 w-4" />
            선생님 참고사항
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-amber-900/80">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
              <span>VIA 사이트는 영어로 되어있습니다. <strong>크롬 브라우저의 자동 번역</strong> 기능을 사용하면 한국어로 진행할 수 있습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
              <span>초등학생의 경우 일부 문항이 어려울 수 있으므로, <strong>교사가 옆에서 설명</strong>해 주시면 좋습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
              <span>진단 결과는 <strong>&lsquo;강점 로그 2.0&rsquo; 설정 &gt; 학생 추가</strong> 시 대표 강점을 지정하는 데 활용할 수 있습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
              <span>강점에는 좋고 나쁨이 없습니다. 학생들이 자신의 강점을 <strong>긍정적으로 받아들이도록</strong> 안내해 주세요.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
              <span>결과가 달라질 수 있으므로, <strong>학기 초와 학기 말</strong>에 한 번씩 진단하면 성장 변화를 관찰할 수 있습니다.</span>
            </li>
          </ul>
        </CardContent>
      </Card>


      {/* Detail guide button */}
      <Link href="/teacher/diagnosis/detail">
        <Button
          variant="outline"
          className="w-full h-11 text-sm font-medium text-violet-700 border-violet-200 hover:bg-violet-50"
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          설문 문항 상세 안내 (1번~98번 전체 해설)
        </Button>
      </Link>
      {/* Bottom CTA */}
      <Button
        asChild
        variant="outline"
        className="w-full h-10 text-sm text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <a href="https://www.viacharacter.org/" target="_blank" rel="noopener noreferrer">
          <Globe className="h-4 w-4 mr-2" />
          VIA 공식 사이트 홈페이지 방문
        </a>
      </Button>
    </div>
  );
}
