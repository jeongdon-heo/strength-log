"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { ArrowLeft, AlertTriangle } from "lucide-react";

const QUESTIONS = [
  { num: 1, en: "When I see beautiful scenery, I stop and enjoy it for a while.", ko: "아름다운 풍경을 보면 잠시 멈춰 서서 그것을 즐긴다.", explain: "등굣길에 예쁜 꽃이 피었거나 저녁 노을이 멋질 때, \"와~ 예쁘다\" 하고 가만히 쳐다본 적이 있니? 그런 마음이 든다면 왼쪽을 골라보자." },
  { num: 2, en: "When someone is being treated unfairly, I stick up for them.", ko: "누군가 불공평한 대우를 받고 있을 때, 나는 그들을 지지하거나 편들어 준다.", explain: "친구가 선생님이나 다른 친구에게 불공평하게 대우받을 때, \"그건 아닌 것 같아요!\" 하고 용기 있게 말해주는 편이니?" },
  { num: 3, en: "I enjoy creating things that are new and different.", ko: "새롭고 독특한 것을 만드는 것을 즐긴다.", explain: "그림을 그리거나 만들기를 할 때, 남들과 똑같이 하는 것보다 나만의 특별한 아이디어를 내서 만드는 걸 좋아하니?" },
  { num: 4, en: "I do not have many questions.", ko: "나는 궁금한 것이나 질문이 별로 없다.", explain: "수업 시간에 궁금한 게 별로 없거나 \"왜 그렇지?\" 하고 질문을 잘 하지 않는 편이라면 왼쪽을, 질문이 많다면 오른쪽을 골라야 해.", reverse: true },
  { num: 5, en: "I work really well with a group.", ko: "나는 모둠(그룹) 활동을 할 때 협력을 매우 잘한다.", explain: "친구들과 모둠 숙제를 하거나 놀이를 할 때, 다른 친구들과 힘을 합쳐서 잘하는 편이니?" },
  { num: 6, en: "I only help people I know, even if it's not fair to others.", ko: "다른 사람에게 불공평하더라도, 나는 내가 아는 사람만 돕는다.", explain: "내가 아는 친구만 도와주고, 잘 모르는 친구에게는 공평하게 대하지 않는다면 왼쪽을, 모두에게 공평하게 대한다면 오른쪽을 골라보자.", reverse: true },
  { num: 7, en: "I can still be friends with people who were mean to me, if they apologize.", ko: "나에게 못되게 굴었던 사람이라도, 사과한다면 여전히 친구로 지낼 수 있다.", explain: "나를 속상하게 한 친구가 \"미안해\" 하고 사과하면, 마음을 풀고 다시 같이 놀아줄 수 있니?" },
  { num: 8, en: "I can find many things to be thankful for in my life.", ko: "내 삶에서 감사해야 할 일들을 많이 찾을 수 있다.", explain: "맛있는 밥을 먹을 때, 친구와 재미있게 놀 때, \"참 고맙다\" 하고 느끼는 일들이 많으니?" },
  { num: 9, en: "I will tell a lie if it will keep me from getting in trouble.", ko: "곤란한 상황에서 벗어날 수 있다면 거짓말을 할 것이다.", explain: "내가 혼날까 봐 무서울 때, 거짓말을 해서라도 그 상황을 피하고 싶다면 왼쪽을, 혼나더라도 솔직하게 말하는 편이라면 오른쪽을 골라야 해.", reverse: true },
  { num: 10, en: "I believe that things will always work out no matter how difficult they seem now.", ko: "지금은 아무리 어려워 보여도 결국에는 다 잘 될 것이라고 믿는다.", explain: "어려운 일이 생겨도 \"분명 잘 될 거야!\" 하고 희망을 잃지 않는 긍정적인 마음을 가졌니?" },
  { num: 11, en: "I think that I am always right.", ko: "나는 내가 항상 옳다고 생각한다.", explain: "내가 생각하는 것이 늘 맞고, 다른 친구들 말이 틀렸다고 생각하는 편이니?", reverse: true },
  { num: 12, en: "Making people laugh is something I am good at.", ko: "나는 사람들을 웃게 만드는 것을 잘한다.", explain: "너는 우리 반의 분위기 메이커니? 친구들이나 가족들을 웃게 해주는 걸 잘하고 즐기니?" },
  { num: 13, en: "I consider the positives and negatives of every option when I am making a decision.", ko: "결정을 내릴 때 모든 선택지의 장점과 단점을 고려한다.", explain: "어떤 것을 고를 때, '이걸 하면 좋은 점은 뭐고, 나쁜 점은 뭘까?' 하고 미리 신중하게 생각하는 편이니?" },
  { num: 14, en: "I am always kind to other people.", ko: "나는 항상 다른 사람들에게 친절하다.", explain: "친구들이나 선생님, 가족들에게 언제나 상냥하고 다정하게 대하는 편이니?" },
  { num: 15, en: "I am good at organizing group activities and making them happen.", ko: "나는 모둠 활동을 조직하고 계획대로 진행되게 하는 일을 잘한다.", explain: "모둠 숙제나 친구들과 놀 계획을 세울 때, 누가 무엇을 할지 정하고 계획대로 잘 이끌어가는 편이니?" },
  { num: 16, en: "If there is a chance to learn something new, I jump right in.", ko: "새로운 것을 배울 기회가 생기면 바로 뛰어든다.", explain: "처음 보는 것이나 처음 배우는 것이 생기면, 호기심을 가지고 \"내가 한번 해볼래!\" 하고 적극적으로 도전하는 편이니?" },
  { num: 17, en: "I feel loved.", ko: "나는 사랑받고 있다고 느낀다.", explain: "가족이나 친구, 선생님이 나를 아끼고 사랑한다고 자주 느끼니?" },
  { num: 18, en: "I complete my homework even when it is challenging.", ko: "숙제가 어려워도 끝까지 마친다.", explain: "어려운 숙제가 생겨도 포기하지 않고 끈기 있게 끝까지 풀어서 마무리하는 편이니?" },
  { num: 19, en: "Others tell me that I give good advice.", ko: "다른 사람들은 내가 좋은 조언을 해준다고 말한다.", explain: "친구가 고민이 있어서 너에게 물어봤을 때, 네가 해준 말이 친구에게 큰 도움이 된 적이 있니? 친구들이 너를 '고민 해결사'처럼 믿고 의지한다면 이 문항이 바로 네 얘기야." },
  { num: 20, en: "I am very careful at whatever I do.", ko: "나는 무엇을 하든 매우 조심스럽고 신중하다.", explain: "어떤 일을 할 때 실수를 하지 않으려고 미리 여러 번 확인하고, 조심스럽게 처리하는 편이니?" },
  { num: 21, en: "If I want something, I can't wait.", ko: "나는 무언가 갖고 싶은 게 생기면 참지 못한다.", explain: "사고 싶은 장난감이나 먹고 싶은 게 생기면 당장 가져야 직성이 풀리니? 꾹 참고 기다리는 게 힘들다면 왼쪽을, 잘 참을 수 있다면 오른쪽을 골라보자.", reverse: true },
  { num: 22, en: "I talk and behave appropriately in most social situations.", ko: "나는 대부분의 사회적 상황에서 적절하게 말하고 행동한다.", explain: "친구들이나 어른들 앞에서 예의 바르게 말하고 행동할 줄 아는 편이니? 어떤 상황에서 어떻게 행동해야 할지 잘 아는 친구라면 왼쪽." },
  { num: 23, en: "I feel a powerful love for people, even people I don't know or just see on the street.", ko: "나는 사람들에 대해 강한 사랑을 느낀다. 모르는 사람이나 길에서 마주치는 사람들에게도 그런 마음이 든다.", explain: "잘 모르는 사람에게도 따뜻한 마음을 가지고, 세상의 모든 사람들이 행복했으면 좋겠다고 생각하니?" },
  { num: 24, en: "I listen carefully to other group members when our team is making a decision.", ko: "우리 팀이 결정을 내릴 때 다른 모둠원들의 말을 주의 깊게 듣는다.", explain: "모둠 활동을 할 때 내 생각만 주장하지 않고, 다른 친구들의 이야기도 귀 기울여 듣는 편이니?" },
  { num: 25, en: "I get tired and bored with life easily.", ko: "나는 삶이 쉽게 피곤하고 지루하게 느껴진다.", explain: "매일매일이 피곤하고 지루해서 재미없는 날이 많다면 왼쪽을, 즐겁고 활기찬 날이 많다면 오른쪽을 골라야 해.", reverse: true },
  { num: 26, en: "I often notice beautiful things around me.", ko: "나는 주변에 있는 아름다운 것들을 자주 발견한다.", explain: "길을 가다가 예쁜 꽃이나 멋진 구름을 발견하고 '예쁘다!' 하고 느끼는 경우가 많니?" },
  { num: 27, en: "I speak up when I see someone being mean to others.", ko: "누군가 다른 사람에게 못되게 구는 것을 보면 당당하게 말한다.", explain: "친구가 다른 친구에게 못되게 행동할 때, 용기 있게 \"그러지 마!\" 하고 말해주는 편이니?" },
  { num: 28, en: "I see myself as a very creative person.", ko: "나는 나 자신이 매우 창의적인 사람이라고 생각한다.", explain: "특별하고 새로운 아이디어를 잘 떠올리고, 다른 사람들과는 다르게 생각하는 재주가 있다고 생각하니?" },
  { num: 29, en: "I am curious about how things work.", ko: "나는 사물들이 어떻게 작동하는지(원리)에 대해 궁금해한다.", explain: "\"저건 왜 저렇게 움직이지?\", \"이건 어떻게 만들었을까?\" 하고 궁금해하며 원리를 찾아보려 하는 편이니?" },
  { num: 30, en: "I am mean to people I do not like.", ko: "나는 내가 좋아하지 않는 사람들에게 못되게 군다.", explain: "내가 별로 좋아하지 않는 친구에게는 일부러 심술궂게 굴거나 못되게 대하는 편이라면 왼쪽을, 모두에게 친절하게 대하려고 노력한다면 오른쪽을 골라야 해.", reverse: true },
  { num: 31, en: "If someone hurts me, but they say they're sorry, I forgive them.", ko: "누군가 나에게 상처를 주었더라도 미안하다고 말하면 나는 그들을 용서한다.", explain: "친구가 나를 속상하게 했어도 진심으로 사과하면, 마음속의 화를 풀고 용서해 줄 수 있니?" },
  { num: 32, en: "I am a thankful person.", ko: "나는 감사할 줄 아는 사람이다.", explain: "작은 도움이나 선물에도 \"고맙습니다!\" 하고 감사하는 마음을 잘 표현하는 편이니?" },
  { num: 33, en: "I am honest even when lying could keep me from getting in trouble.", ko: "거짓말을 하면 곤란한 상황을 피할 수 있을 때조차도 나는 정직하게 말한다.", explain: "실수로 물건을 깨뜨렸을 때, 혼날까 봐 무서워도 \"사실 제가 그랬어요\"라고 솔직하게 말하는 편이니? 정직한 용기를 낸 적이 있다면 왼쪽이야." },
  { num: 34, en: "I will achieve my goals.", ko: "나는 나의 목표를 이루어낼 것이다.", explain: "\"나는 훌륭한 사람이 될 거야!\" \"나는 꼭 그림을 잘 그릴 거야!\" 처럼 세운 목표를 반드시 이룰 거라고 굳게 믿는 편이니?" },
  { num: 35, en: "If I am good at something, I make sure to show everyone.", ko: "내가 무언가를 잘한다면, 그것을 모든 사람에게 꼭 보여준다.", explain: "내가 잘하는 게 있다면, 친구들이나 선생님에게 \"저 이거 잘해요!\" 하고 자랑하고 뽐내는 걸 좋아하니?", reverse: true },
  { num: 36, en: "People say that I am funny.", ko: "사람들은 내가 재미있는 사람이라고 말한다.", explain: "친구들이나 가족들이 너를 보고 \"넌 참 재미있어!\" 하고 자주 이야기하니?" },
  { num: 37, en: "I carefully think about the opinions of others before I make a decision.", ko: "나는 결정을 내리기 전에 다른 사람들의 의견을 신중하게 생각한다.", explain: "중요한 것을 결정할 때, 내 생각만 고집하지 않고 다른 친구들의 의견도 잘 들어보고 깊이 생각하는 편이니?" },
  { num: 38, en: "I do whatever I can when I see people who are in need.", ko: "도움이 필요한 사람을 보면 내가 할 수 있는 모든 것을 한다.", explain: "친구가 힘들어하거나 도움이 필요해 보일 때, 누가 시키지 않아도 먼저 나서서 도와주려고 노력하니?" },
  { num: 39, en: "Others want me in charge when a group project needs to be done.", ko: "모둠 과제를 해야 할 때, 다른 사람들은 내가 맡아서 이끌어주기를 원한다.", explain: "친구들이 모둠의 대표나 대장을 뽑을 때, \"네가 대장 해줘!\" 하고 너를 믿고 맡기는 경우가 많니?" },
  { num: 40, en: "I get excited when I see there is something new to learn.", ko: "배울 만한 새로운 것이 있다는 것을 알게 되면 신이 난다.", explain: "새로운 것을 배우는 것을 즐기고, 기대감에 가득 차서 \"와! 재밌겠다!\" 하고 설레는 편이니?" },
  { num: 41, en: "I love my family members no matter what they do.", ko: "우리 가족이 무엇을 하든 나는 그들을 사랑한다.", explain: "가족들과 가끔 다투기도 하지만, 그래도 언제나 가족들을 진심으로 아끼고 사랑하는 마음을 가지고 있니?" },
  { num: 42, en: "If a task is hard, I give up easily.", ko: "할 일이 어려우면 나는 쉽게 포기한다.", explain: "어려운 숙제나 힘든 일이 생기면 \"안 되겠어!\" 하고 쉽게 포기하는 편이라면 왼쪽을, 끝까지 노력하는 편이라면 오른쪽을 골라야 해.", reverse: true },
  { num: 43, en: "My friends ask for my opinion before they make an important decision.", ko: "내 친구들은 중요한 결정을 내리기 전에 나의 의견을 묻는다.", explain: "친구들이 중요한 결정을 해야 할 때, 너의 의견이 궁금해서 \"너는 어떻게 생각해?\" 하고 물어보는 경우가 많니?" },
  { num: 44, en: "I think carefully before I act.", ko: "나는 행동하기 전에 신중하게 생각한다.", explain: "어떤 행동을 하기 전에 '이렇게 하면 괜찮을까?' 하고 미리 한 번 더 깊이 생각하고 조심하는 편이니?" },
  { num: 45, en: "I am able to control my anger really well.", ko: "나는 나의 화를 아주 잘 조절할 수 있다.", explain: "화나는 일이 생겨도 \"하나, 둘, 셋!\" 하고 스스로 마음을 다스려서 화를 잘 참는 편이니?" },
  { num: 46, en: "I get along with all different types of people.", ko: "나는 다양한 종류의 모든 사람과 잘 지낸다.", explain: "나랑 성격이 다르거나, 나이가 다른 사람들과도 편하게 잘 어울리고 친구가 될 수 있니?" },
  { num: 47, en: "I think there is something powerful I can't see but I know is there that helps me when times are hard.", ko: "나는 눈에 보이지는 않지만, 힘들 때 나를 도와주는 어떤 강력한 힘이 존재한다고 생각한다.", explain: "힘들고 어려울 때, 나를 도와주는 '운'이나 '행운', '희망' 같은 보이지 않는 힘이 있다고 믿는 편이니?" },
  { num: 48, en: "If my group does not use my idea, I will not help.", ko: "모둠에서 나의 아이디어를 쓰지 않는다면, 나는 돕지 않을 것이다.", explain: "모둠 활동을 할 때 내 아이디어를 쓰지 않으면 화가 나서 아무것도 돕지 않는다면 왼쪽을, 그래도 열심히 돕는다면 오른쪽을 골라야 해.", reverse: true },
  { num: 49, en: "I always feel tired.", ko: "나는 항상 피곤함을 느낀다.", explain: "매일매일 몸도 마음도 너무 피곤하고 힘든 편이라면 왼쪽을, 활기차고 에너지가 넘치는 편이라면 오른쪽을 골라야 해.", reverse: true },
  { num: 50, en: "I feel better when I see beautiful pictures or listen to great music.", ko: "아름다운 그림을 보거나 멋진 음악을 들을 때 기분이 좋아진다.", explain: "아름다운 예술 작품이나 멋진 노래를 들으면 마음이 편안해지고 행복해지는 것을 느끼니?" },
  { num: 51, en: "When someone is getting bullied, I do not stick up for them.", ko: "누군가 괴롭힘을 당하고 있을 때, 나는 그들의 편을 들어주지 않는다.", explain: "친구가 괴롭힘을 당하는 것을 보면 무서워서 나서지 못하고, 친구 편을 들어주지 않는 편이라면 왼쪽을, 용기 있게 도와준다면 오른쪽을 골라야 해.", reverse: true },
  { num: 52, en: "I am very cooperative when I work in groups.", ko: "나는 모둠 활동을 할 때 매우 협조적이다.", explain: "친구들과 함께하는 모둠 활동에서 내 의견만 고집하지 않고, 친구들과 힘을 모아 협력하는 것을 잘하니?" },
  { num: 53, en: "I often figure out different ways of doing things.", ko: "나는 어떤 일을 할 때 종종 색다른(다른) 방법을 찾아낸다.", explain: "문제를 풀거나 만들기를 할 때, 남들과 똑같은 방법 대신 나만의 특별하고 새로운 방법을 생각해서 해보는 것을 즐기니?" },
  { num: 54, en: "I frequently ask questions.", ko: "나는 자주 질문을 한다.", explain: "수업 시간에 궁금한 것이 많아서 \"선생님, 이건 왜 그래요?\" 하고 자주 질문하는 편이니?" },
  { num: 55, en: "I am only fair to people who are nice to me.", ko: "나는 나에게 잘해주는 사람에게만 공정하게 대한다.", explain: "나에게 친절하게 대해주는 친구에게만 잘해주고, 다른 친구들에게는 공정하게 대하지 않는다면 왼쪽을, 모든 친구에게 공평하게 대한다면 오른쪽을 골라야 해.", reverse: true },
  { num: 56, en: "I am a forgiving person.", ko: "나는 다른 사람을 잘 용서하는 사람이다.", explain: "친구가 나에게 잘못했더라도, 그 친구의 사과를 받아주고 마음속으로 용서해 줄 수 있니?" },
  { num: 57, en: "I often don't feel thankful.", ko: "나는 감사함을 느끼지 못할 때가 많다.", explain: "친구나 가족의 도움에 \"고맙다\"는 마음을 잘 느끼지 못하거나 표현하지 않는다면 왼쪽을, 감사함을 잘 느끼는 편이라면 오른쪽을 골라야 해.", reverse: true },
  { num: 58, en: "I often make excuses.", ko: "나는 자주 변명을 한다.", explain: "내가 잘못을 했을 때 \"그건 ~때문이었어요\" 하고 핑계나 변명을 자주 하는 편이라면 왼쪽을, 잘못을 인정하는 편이라면 오른쪽을 골라야 해.", reverse: true },
  { num: 59, en: "Even when things look bad, I stay hopeful.", ko: "상황이 나빠 보일 때도 나는 희망을 잃지 않는다.", explain: "어려운 일이 생겨서 앞이 캄캄해 보여도 \"괜찮아, 잘 될 거야!\" 하고 긍정적인 마음을 잃지 않는 편이니?" },
  { num: 60, en: "If I have done something good, I tell everyone about it.", ko: "내가 좋은 일을 했다면, 모든 사람에게 그것에 대해 말한다.", explain: "내가 좋은 일을 하거나 칭찬받을 만한 일을 하면, 친구들이나 가족들에게 \"나 이런 일 했어!\" 하고 자랑하고 싶어 하니?", reverse: true },
  { num: 61, en: "I can easily bring smiles to people's faces.", ko: "나는 사람들의 얼굴에 쉽게 미소를 띄게 할 수 있다.", explain: "나의 말이나 행동 때문에 주변 사람들이 쉽게 웃고 행복해하는 것을 보니?" },
  { num: 62, en: "I wait until I have all the facts before I make a decision.", ko: "나는 결정을 내리기 전에 모든 사실을 알 때까지 기다린다.", explain: "어떤 것을 결정할 때, 성급하게 하지 않고 필요한 정보를 충분히 찾아보고 신중하게 생각한 다음에 결정하는 편이니?" },
  { num: 63, en: "I don't help others if they don't ask.", ko: "나는 다른 사람들이 요청하지 않으면 돕지 않는다.", explain: "친구가 도움이 필요해 보여도 \"도와줘\" 하고 부탁하기 전에는 먼저 나서서 돕지 않는 편이라면 왼쪽을, 먼저 돕는 편이라면 오른쪽을 골라야 해.", reverse: true },
  { num: 64, en: "People look up to me as a leader and they give me their trust.", ko: "사람들은 나를 리더로서 존경하고 신뢰한다.", explain: "친구들이 너를 '모둠의 대장'처럼 믿고 따르며, 너의 말에 귀 기울이는 경우가 많니?" },
  { num: 65, en: "I love learning about how to do different things.", ko: "나는 다양한 일들을 어떻게 하는지 배우는 것을 정말 좋아한다.", explain: "새로운 것을 배우는 것에 즐거움을 느끼고, '이건 어떻게 하는 걸까?' 하고 궁금해하며 배우는 것을 좋아하니?" },
  { num: 66, en: "Even when my family members and I fight, I still love them.", ko: "가족과 싸우더라도 나는 여전히 그들을 사랑한다.", explain: "가족들과 가끔 다투거나 속상한 일이 있어도, 여전히 가족들을 사랑하는 마음은 변치 않는 편이니?" },
  { num: 67, en: "I keep trying even after I fail.", ko: "나는 실패하더라도 계속해서 노력한다.", explain: "수학 문제가 안 풀리거나 운동 기술이 잘 안 될 때, \"에이, 안 해!\" 하고 포기하니, 아니면 \"다시 해보자!\" 하고 도전하니? 끝까지 해보는 친구라면 왼쪽!" },
  { num: 68, en: "People tell me that I am a wise person.", ko: "사람들은 나에게 내가 지혜로운 사람이라고 말한다.", explain: "친구들이 어려운 문제나 고민이 있을 때, 너에게 물어보면 현명한 답이나 좋은 방법을 알려준다고 말하니?" },
  { num: 69, en: "I think about the consequences of my behavior before I take action.", ko: "나는 행동하기 전에 내 행동이 가져올 결과를 생각한다.", explain: "어떤 행동을 하기 전에 '이렇게 하면 어떤 결과가 생길까?' 하고 미리 생각하고 조심하는 편이니?" },
  { num: 70, en: "I have a lot of patience.", ko: "나는 인내심이 매우 강하다.", explain: "기다리는 것을 잘하고, 어려운 일이 생겨도 쉽게 짜증 내지 않고 꾹 참는 편이니?" },
  { num: 71, en: "I often make other people upset without meaning to.", ko: "나는 의도치 않게 자주 다른 사람들을 화나게 하거나 속상하게 만든다.", explain: "일부러 그런 건 아니지만, 나도 모르게 친구들을 화나게 하거나 속상하게 하는 경우가 종종 있다면 왼쪽을, 그런 경우가 거의 없다면 오른쪽을 골라야 해.", reverse: true },
  { num: 72, en: "I think there are hidden forces in nature that shape my life.", ko: "나는 자연에 내 삶을 만들어가는 숨겨진 힘이 있다고 생각한다.", explain: "눈에 보이지는 않지만, '운명'이나 '행운', '자연의 힘' 같은 것이 내 삶에 좋은 영향을 준다고 믿는 편이니?" },
  { num: 73, en: "I respect the opinions of my teammates, even when I disagree.", ko: "나는 동의하지 않더라도 팀원들의 의견을 존중한다.", explain: "모둠 활동을 할 때 내 생각과 다르더라도, 친구들의 의견을 무시하지 않고 '그럴 수도 있구나' 하고 존중해 주는 편이니?" },
  { num: 74, en: "I usually do not have a lot of energy.", ko: "나는 보통 에너지가 별로 없다.", explain: "평소에 활기차고 신나게 놀기보다는, 피곤하고 기운이 없는 편이라면 왼쪽을, 에너지가 넘치는 편이라면 오른쪽을 골라야 해.", reverse: true },
  { num: 75, en: "I love beautiful things.", ko: "나는 아름다운 것들을 사랑한다.", explain: "예쁜 그림, 멋진 음악, 아름다운 자연 등 보기 좋고 듣기 좋은 것을 좋아하고 소중하게 여기니?" },
  { num: 76, en: "I stand up for what is right, even when I am scared.", ko: "나는 무서울 때라도 옳은 일을 위해 당당히 나선다.", explain: "무섭거나 혼날까 봐 걱정되어도, '이건 잘못된 거야!' 하고 용기 있게 옳은 일을 말하는 편이니?" },
  { num: 77, en: "I always like to do things in different ways.", ko: "나는 항상 색다른 방법으로 일하는 것을 좋아한다.", explain: "어떤 일을 할 때, 다른 친구들이나 선생님이 알려준 방법이 아닌, 나만의 독특하고 새로운 방법으로 해보는 것을 즐기니?" },
  { num: 78, en: "I am always full of questions.", ko: "나는 항상 궁금한 것이 많다.", explain: "\"저건 왜 저렇지?\", \"이건 뭐지?\" 하고 항상 궁금한 것이 많아서 질문을 자주 하는 편이니?" },
  { num: 79, en: "If I like someone in a group, I let them get away with things.", ko: "모둠에서 내가 좋아하는 사람이라면, 그가 잘못해도 그냥 넘어가 준다.", explain: "내가 좋아하는 친구가 잘못을 해도 \"괜찮아\" 하고 모른 척 넘어가 준다면 왼쪽을, 좋아하는 친구라도 잘못한 것은 잘못했다고 말한다면 오른쪽을 골라야 해.", reverse: true },
  { num: 80, en: "When someone apologizes, I give them a second chance.", ko: "누군가 사과하면, 나는 그들에게 다시 한번 기회를 준다.", explain: "친구가 잘못을 하고 \"미안해\" 하고 사과하면, 다시 한번 그 친구를 믿고 기회를 주는 편이니?" },
  { num: 81, en: "I often feel lucky for things in my life.", ko: "나는 내 삶에서 일어나는 일들에 대해 자주 운이 좋다고 느낀다.", explain: "\"와! 오늘 운이 좋았어!\", \"내가 이런 행운이!\" 처럼 내 삶에 좋은 일들이 자주 일어난다고 생각하니?" },
  { num: 82, en: "I always tell the truth, even if it means I won't get what I want.", ko: "나는 내가 원하는 것을 얻지 못하게 되더라도 항상 진실만을 말한다.", explain: "내가 솔직하게 말하면 원하는 것을 얻지 못할 수도 있어도, 거짓말하지 않고 항상 진실만 말하는 편이니?" },
  { num: 83, en: "I know I can get through bad times.", ko: "나는 힘든 시기도 이겨낼 수 있다는 것을 알고 있다.", explain: "어려운 일이 생겨도 \"나는 해낼 수 있어!\" 하고 나 자신을 믿고 용기를 얻는 편이니?" },
  { num: 84, en: "I like to show off the talents I have.", ko: "나는 내가 가진 재능을 뽐내는 것을 좋아한다.", explain: "내가 잘하는 것이 있다면, 숨기기보다는 다른 친구들이나 어른들 앞에서 보여주고 뽐내는 것을 즐기니?", reverse: true },
  { num: 85, en: "I enjoy telling people funny stories and jokes.", ko: "나는 사람들에게 재미있는 이야기나 농담을 하는 것을 즐긴다.", explain: "친구들을 웃게 만드는 것을 좋아하고, 재미있는 이야기나 농담을 들려주는 것을 즐기니?" },
  { num: 86, en: "I think about all my choices before I make a decision.", ko: "나는 결정을 내리기 전에 내가 할 수 있는 모든 선택에 대해 생각한다.", explain: "어떤 것을 결정하기 전에 '이 방법도 있고, 저 방법도 있겠지?' 하고 모든 가능성을 신중하게 생각해 보는 편이니?" },
  { num: 87, en: "I do kind things for people on my own without being told.", ko: "나는 누가 시키지 않아도 스스로 사람들에게 친절한 행동을 한다.", explain: "친구나 가족을 돕는 일, 착한 일을 할 때 누가 시키기 전에 스스로 먼저 하는 편이니?" },
  { num: 88, en: "I am good at leading a group to get the job done.", ko: "나는 일을 완수하기 위해 모둠을 이끄는 것을 잘한다.", explain: "모둠 활동을 할 때 친구들을 이끌고 함께 힘을 합쳐서 목표를 잘 달성할 수 있도록 돕는 편이니?" },
  { num: 89, en: "When I want to learn something, I try to find out everything about it.", ko: "나는 무언가를 배우고 싶을 때, 그것에 대해 모든 것을 알아내려고 노력한다.", explain: "궁금한 것이 생기면, 단순히 조금 아는 것을 넘어 끝까지 파고들어 모든 것을 알아내려고 노력하는 탐구심이 강하니?" },
  { num: 90, en: "I am thankful for those who love me.", ko: "나는 나를 사랑해 주는 사람들에게 감사함을 느낀다.", explain: "나를 아끼고 사랑해 주는 가족이나 친구들에게 고마운 마음을 자주 느끼니?" },
  { num: 91, en: "I always wait till the last minute to do homework or chores.", ko: "나는 항상 숙제나 집안일을 마지막 순간까지 미룬다.", explain: "숙제나 집에서 할 일을 미리미리 하기보다는, 마감 시간이 다 돼서야 허둥지둥하는 편이라면 왼쪽을, 일찍 처리하는 편이라면 오른쪽을 골라야 해.", reverse: true },
  { num: 92, en: "I am able to solve problems in a way that is pleasing to everyone.", ko: "나는 모든 사람을 만족시킬 수 있는 방식으로 문제를 해결할 수 있다.", explain: "친구들끼리 다투거나 어려운 문제가 생겼을 때, 모두가 만족할 수 있는 좋은 해결 방법을 찾아내는 것을 잘하니?" },
  { num: 93, en: "I often find myself doing things that I know I shouldn't be doing.", ko: "나는 해서는 안 된다는 것을 알면서도 그 일을 하고 있는 나 자신을 자주 발견한다.", explain: "'이건 하면 안 되는데...' 하고 알면서도 그 행동을 하고 있는 나를 자주 발견한다면 왼쪽을, 그런 행동을 잘 참는 편이라면 오른쪽을 골라야 해.", reverse: true },
  { num: 94, en: "I sometimes lose my temper.", ko: "나는 가끔 화를 참지 못하고 폭발한다.", explain: "화가 나면 참지 못하고 소리를 지르거나 짜증을 내는 일이 가끔 있다면 왼쪽을, 화를 잘 다스리는 편이라면 오른쪽을 골라야 해.", reverse: true },
  { num: 95, en: "I know what makes people comfortable and what to say in different situations.", ko: "나는 사람들이 어떤 상황에서 편안하게 느끼는지, 그리고 각 상황에서 어떤 말을 해야 하는지 알고 있다.", explain: "상황에 맞는 적절한 말을 잘하고, 친구들이 편안하게 느낄 수 있도록 분위기를 잘 맞추는 편이니?" },
  { num: 96, en: "I believe that God or a higher power watches over me.", ko: "나는 신이나 더 높은 힘이 나를 지켜보고 있다고 믿는다.", explain: "하느님, 부처님, 또는 눈에 보이지 않는 큰 힘이 나를 보살피고 지켜주고 있다고 믿는 편이니?" },
  { num: 97, en: "It makes me happy when I can do my fair share in a group.", ko: "모둠에서 내 몫을 공정하게 할 수 있을 때 기분이 좋다.", explain: "모둠 활동에서 내가 맡은 일을 잘 해냈을 때 뿌듯하고 기분이 좋은 편이니?" },
  { num: 98, en: "I have lots of energy.", ko: "나는 에너지가 넘친다.", explain: "매일매일 활기차고 신나게 활동하는 편이니? 에너지가 가득해서 이것저것 하고 싶은 게 많은 친구라면 왼쪽!" }
];

export default function DiagnosisDetailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link href="/teacher/diagnosis">
          <Button variant="ghost" size="sm" className="mb-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            강점 진단하기로 돌아가기
          </Button>
        </Link>

        {/* Header Card */}
        <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-emerald-900">
              VIA 청소년 성격 강점 검사 완전 정복 매뉴얼
            </CardTitle>
            <p className="text-sm text-emerald-700 mt-2">
              모든 사람의 마음속에는 보석처럼 빛나는 강점(보석)이 숨어 있어요. 이 검사를 통해 너의 숨겨진 강점을 찾아보세요!
            </p>
          </CardHeader>
        </Card>

        {/* Response Guide Card */}
        <Card className="mb-6 border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg">답변 방법 가이드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="flex-shrink-0 font-bold text-blue-700 text-sm">완전 그래!</span>
                <span className="text-sm text-gray-700">VERY MUCH LIKE ME - &ldquo;와! 이건 완전 내 얘기야! 정말 그래!&rdquo;</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg">
                <span className="flex-shrink-0 font-bold text-cyan-700 text-sm">대체로 그래</span>
                <span className="text-sm text-gray-700">MOSTLY LIKE ME - &ldquo;응, 대체로 나랑 비슷해.&rdquo;</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="flex-shrink-0 font-bold text-gray-700 text-sm">어느 정도</span>
                <span className="text-sm text-gray-700">SOMEWHAT LIKE ME - &ldquo;음, 어느 정도는 그런 것 같아.&rdquo;</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <span className="flex-shrink-0 font-bold text-orange-700 text-sm">조금 그래</span>
                <span className="text-sm text-gray-700">A LITTLE LIKE ME - &ldquo;조금, 아주 조금만 비슷해.&rdquo;</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <span className="flex-shrink-0 font-bold text-red-700 text-sm">전혀 아니야</span>
                <span className="text-sm text-gray-700">NOT LIKE ME AT ALL - &ldquo;전혀 아니야! 나랑 완전 달라.&rdquo;</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-3 mb-8">
          {QUESTIONS.map((question) => (
            <Card key={question.num} className="border-gray-100">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 h-7 w-7 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">
                    {question.num}
                  </span>
                  <div className="flex-1 min-w-0">
                    {question.reverse && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 mb-1">
                        <AlertTriangle className="h-3 w-3" />
                        거꾸로 질문!
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mb-0.5">{question.en}</p>
                    <p className="text-sm font-medium text-gray-800 mb-1">{question.ko}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{question.explain}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Back Button */}
        <Link href="/teacher/diagnosis">
          <Button variant="ghost" size="sm" className="mb-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            강점 진단하기로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}
