import { GoogleGenAI, Type } from "@google/genai";
import { Persona, Scenario } from "./constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SimulationState {
  trust: number;
  acceptance: number;
  stability: number;
  engagement: number;
  goalsAchieved: string[];
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
        3. 학습자가 '공감적 경청'이나 '전략적 질문'을 할 때마다 심리 분석 지표(신뢰, 수용, 안정, 몰입)를 0~100 사이로 업데이트하세요.
        4. 면담 목표(${scenario.goals.join(', ')})가 달성되었다고 판단되면 해당 목표를 goalsAchieved 배열에 추가하세요.
        5. 직접적인 정답이나 코칭을 하지 말고, 오직 페르소나의 반응으로만 피드백을 주십시오.
        6. 모든 응답은 반드시 아래의 JSON 형식을 포함해야 합니다.
        
        [응답 형식]
        {
          "content": "페르소나의 대화 내용",
          "metadata": {
            "trust": 현재 신뢰도(0-100),
            "acceptance": 현재 수용성(0-100),
            "stability": 현재 안정감(0-100),
            "engagement": 현재 몰입도(0-100),
            "goalsAchieved": ["달성된 목표1", "달성된 목표2"]
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
      metadata: { trust: 50, acceptance: 50, stability: 50, engagement: 50, goalsAchieved: [] }
    };
  }
}

export async function generateReportAnalysis(history: ChatMessage[], persona: Persona, scenario: Scenario) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: `
        당신은 현대자동차의 전문 HR 컨설턴트입니다. 
        진행된 면담 시뮬레이션의 대화 내용을 분석하여 상세 리포트를 작성하세요.
        
        [분석 대상]
        - 페르소나: ${persona.name} (${persona.role})
        - 상황: ${scenario.title}
        - 대화 내용: ${JSON.stringify(history)}
        
        [출력 형식]
        반드시 아래의 JSON 구조로 응답하세요:
        {
          "summary": "전체적인 면담 총평 (3-4문장)",
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
    contents: [{ role: "user", parts: [{ text: "위의 지침에 따라 면담 내용을 분석해 주세요." }] }]
  });
  
  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse report analysis:", response.text);
    return null;
  }
}
