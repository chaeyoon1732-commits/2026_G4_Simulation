import { Persona, Scenario, PERSONAS, SCENARIOS } from '../constants';
import { Timestamp } from 'firebase/firestore';

export interface DemoData {
  personas: Persona[];
  scenarios: Scenario[];
  simulations: any[];
  users: any[];
}

const MOCK_NAMES = ['김철수', '이영희', '박지민', '최도윤', '정서윤', '강하준', '조예은', '윤시우', '임지우', '한주원'];

export const generateInitialDemoData = (): DemoData => {
  // 1. Personas and Scenarios (use constants)
  const personas = [...PERSONAS];
  const scenarios = [...SCENARIOS];

  // 2. Mock Users
  const users = MOCK_NAMES.map((name, i) => ({
    uid: `demo-user-${i}`,
    name,
    email: `user${i}@example.com`,
    role: i === 0 ? 'admin' : 'user',
    updatedAt: new Date()
  }));

  // 3. Mock Simulations (50 records)
  const simulations = Array.from({ length: 50 }).map((_, i) => {
    const user = users[Math.floor(Math.random() * users.length)];
    const persona = personas[Math.floor(Math.random() * personas.length)];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    // Random dates within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    // Random scores
    const scores = {
      empathy: Math.floor(Math.random() * 40) + 60,
      logic: Math.floor(Math.random() * 40) + 60,
      professionalism: Math.floor(Math.random() * 40) + 60,
      overall: 0
    };
    scores.overall = Math.floor((scores.empathy + scores.logic + scores.professionalism) / 3);

    return {
      id: `demo-sim-${i}`,
      userId: user.uid,
      userName: user.name,
      personaId: persona.id,
      personaName: persona.name,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      scores,
      feedback: '데모 모드 자동 생성 피드백입니다. 면담 과정에서 공감 능력이 돋보였습니다.',
      timestamp: Timestamp.fromDate(date),
      history: [
        { role: 'user', content: '안녕하세요, 면담을 시작해볼까요?' },
        { role: 'model', content: '네, 알겠습니다. 어떤 이야기를 나누고 싶으신가요?' }
      ]
    };
  });

  return {
    personas,
    scenarios,
    simulations,
    users
  };
};
