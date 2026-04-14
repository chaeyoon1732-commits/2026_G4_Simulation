import { GoogleGenAI, Type } from "@google/genai";
import { Persona, Scenario } from "./constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SimulationState {
  rapport: number;      // 라포 형성
  situation: number;    // 현상 파악
  solution: number;     // 해결책 도출
  engagement: number;   // 몰입도
  goalsAchieved: string[];
  onePointLesson?: string; // 실시간 코칭 피드백
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  metadata?: SimulationState;
}

export function createChatSession(persona: Persona, scenario: Scenario) {
  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `
        당신은 현대자동차의 직원 '${persona.name}'(${persona.role})입니다.
        상황: ${scenario.title} - ${scenario.description}
        페르소나 특징: ${persona.traits.join(', ')}
        
        [지침]
        1. 선택된 페르소나와 상황에 완벽히 빙의하여 대화를 이끄세요.
        2. 학습자(면담자)의 화법에 따라 반응하십시오.
        3. 학습자의 발화가 다음 코칭 단계 중 어디에 해당하는지 판단하고 지표(0-100)를 업데이트하세요:
           - 라포 형성 (Rapport): 대화 초기 공감 및 신뢰 구축
           - 현상 파악 (Situation): 문제의 원인이나 현재 상황에 대한 질문/경청
           - 해결책 도출 (Solution): 구체적인 대안 제시 및 실행 약속
        4. 면담 목표(${scenario.goals.join(', ')})가 달성되었다고 판단되면 해당 목표를 goalsAchieved 배열에 추가하세요.
        5. **중요**: 학습자의 마지막 발화에 대해 코칭 전문가로서의 '원포인트 레슨'을 1문장으로 작성하여 onePointLesson 필드에 넣으세요.
        6. 모든 응답은 반드시 아래의 JSON 형식을 포함해야 합니다.
        
        [응답 형식]
        {
          "content": "페르소나의 대화 내용",
          "metadata": {
            "rapport": 현재 라포 형성도(0-100),
            "situation": 현재 현상 파악도(0-100),
            "solution": 현재 해결책 도출도(0-100),
            "engagement": 현재 몰입도(0-100),
            "goalsAchieved": ["달성된 목표1", "달성된 목표2"],
            "onePointLesson": "코칭 전문가의 실시간 피드백 (예: '상대방의 감정에 먼저 공감해준 점이 매우 훌륭합니다.')"
          }
        }
      `,
      responseMimeType: "application/json",
    },
  });
}

export async function sendMessage(chat: any, message: string) {
  const result = await chat.sendMessage({ message });
  const text = result.text;
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    return {
      content: text,
      metadata: { rapport: 50, situation: 50, solution: 50, engagement: 50, goalsAchieved: [] }
    };
  }
}

export async function generateReportAnalysis(history: ChatMessage[], persona: Persona, scenario: Scenario) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `
        당신은 현대자동차의 전문 HR 컨설턴트이자 코칭 전문가입니다. 
        진행된 면담 시뮬레이션의 대화 내용을 분석하여 상세 리포트를 작성하세요.
        
        [분석 대상]
        - 페르소나: ${persona.name} (${persona.role})
        - 상황: ${scenario.title}
        - 대화 내용: ${JSON.stringify(history)}
        
        [출력 형식]
        반드시 아래의 JSON 구조로 응답하세요:
        {
          "summary": "전체적인 면담 총평 (3-4문장)",
          "coachingStyle": "학습자의 코칭 스타일 진단 (예: '경청 중심의 수평적 코칭', '지시 중심의 수직적 코칭' 등)",
          "quantitative": {
            "speechRatio": 학습자의 발화 비중 (0-100),
            "safetyTrend": [대화 흐름에 따른 심리적 안전감 변화 수치 5개],
            "keywords": ["학습자가 주로 사용한 핵심 키워드 3-4개"]
          },
          "psychologicalResponse": "팀원의 심리적 반응 분석",
          "leadershipDiagnosis": "학습자의 리더십 스타일 진단",
          "teamMemberNeeds": "학습자가 파악했어야 할 팀원의 숨겨진 니즈",
          "strengths": "소통상의 강점",
          "improvements": "개선이 필요한 포인트",
          "recommendedDialogue": "이 상황에서 추천하는 구체적인 대화 예시",
          "executionGuide": "현장 실습에 적용 가능한 실행 가이드",
          "riskManagement": "발생 가능한 리스크 및 관리 방안",
          "actionGuide": "리더십 행동 가이드"
        }
      `,
      responseMimeType: "application/json",
    },
    contents: "위의 지침에 따라 면담 내용을 분석해 주세요."
  });
  
  const text = response.text;
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse report analysis:", text);
    return null;
  }
}
