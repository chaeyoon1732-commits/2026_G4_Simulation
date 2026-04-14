export type Category = '영업' | '서비스' | '목표/평가' | '인사통보' | '직원케어' | '성과관리';

export interface Persona {
  id: string;
  name: string;
  role: string;
  department: '영업' | '서비스';
  description: string;
  traits: string[];
  mbti: string;
  difficulty: '상' | '중' | '하';
  recentIssue: string;
  imageUrl?: string;
}

export interface Scenario {
  id: string;
  category: Category;
  title: string;
  description: string;
  guide: string;
  goals: string[];
}

export const PERSONAS: Persona[] = [
  // 영업 부문 페르소나 (영업대리, 영업과장, 영업차장, 영업부장)
  {
    id: 'sales-1',
    name: '박인호',
    role: '영업대리 (30세)',
    department: '영업',
    description: '고객 응대 매너는 훌륭하나, 최근 타 브랜드의 공격적인 프로모션과 실적 압박으로 인해 조기 이탈 징후를 보이는 MZ 사원.',
    traits: ['고객 지향', '실적 압박', '이탈 고민'],
    mbti: 'ENFP',
    difficulty: '중',
    recentIssue: '최근 2개월 연속 판매 목표 미달 및 이직 사이트 접속 정황 포착',
  },
  {
    id: 'sales-2',
    name: '김서인',
    role: '영업과장 (42세)',
    department: '영업',
    description: '개인 판매 실적은 지점 내 최상위권이나, 지점 회의나 가망 고객 정보 공유 등 협업에는 매우 소극적인 개인주의형 과장.',
    traits: ['성과 중심', '개인주의', '정보 독점'],
    mbti: 'INTJ',
    difficulty: '중',
    recentIssue: '지점 내 협업 분위기 저해 및 후배 카마스터들과의 소통 단절',
  },
  {
    id: 'sales-3',
    name: '이정훈',
    role: '영업차장 (49세)',
    department: '영업',
    description: '성실함으로 승부해왔으나, 최근 디지털 가망 고객 대응 및 CRM 시스템 활용에 어려움을 느끼며 슬럼프에 빠진 차장.',
    traits: ['성실함', '자신감 하락', '디지털 취약'],
    mbti: 'ISFJ',
    difficulty: '하',
    recentIssue: '디지털 가망 고객 전환율 급락 및 기존 고객 이탈 증가',
  },
  {
    id: 'sales-4',
    name: '최주하',
    role: '영업부장 (53세)',
    department: '영업',
    description: '관계 영업의 달인이지만, 본사 지침인 태블릿 상담 및 디지털 프로세스 도입을 "현장 모르는 소리"라며 거부하는 베테랑 부장.',
    traits: ['관계 중심', '변화 거부', '강한 자부심'],
    mbti: 'ESTJ',
    difficulty: '상',
    recentIssue: '지점 내 디지털 전환 지표 최하위 및 본사 가이드라인 미준수',
  },
  // 서비스 부문 페르소나 (서비스엔지니어, 서비스수석엔지니어)
  {
    id: 'service-1',
    name: '최진우',
    role: '서비스엔지니어 (31세)',
    department: '서비스',
    description: '단순 소모품 교환 및 경정비는 능숙하나, 고난도 회로 진단이나 통신 정비 공부는 소홀히 하며 현재 수준에 안주하는 엔지니어.',
    traits: ['안주함', '학습 의욕 저하', '단순 작업 선호'],
    mbti: 'ESFP',
    difficulty: '하',
    recentIssue: '최근 기술 등급 시험(HMCP) 낙방 및 고난도 정비 기피',
  },
  {
    id: 'service-2',
    name: '정민석',
    role: '서비스엔지니어 (35세)',
    department: '서비스',
    description: '팀 내 유일한 EV 인증 전문가로 모든 고난도 전기차 수리가 몰려 번아웃 직전이며, 업무 불균형에 불만이 큰 엔지니어.',
    traits: ['전문성', '책임감', '번아웃'],
    mbti: 'INFJ',
    difficulty: '중',
    recentIssue: '과도한 EV 정비 물량 집중으로 인한 이탈 위기 및 팀 내 갈등',
  },
  {
    id: 'service-3',
    name: '장태윤',
    role: '서비스수석엔지니어 (45세)',
    department: '서비스',
    description: '정비 매뉴얼과 원칙은 완벽히 준수하나, 유연성이 부족하여 바쁜 현장 상황에서 고객과 잦은 마찰을 빚는 수석엔지니어.',
    traits: ['원칙주의', '유연성 부족', 'CS 취약'],
    mbti: 'ISTJ',
    difficulty: '중',
    recentIssue: '최근 고객 만족도(CS) 점수 하락 및 고객 항의 빈번 발생',
  },
  {
    id: 'service-4',
    name: '박승범',
    role: '서비스수석엔지니어 (49세)',
    department: '서비스',
    description: '내연기관 수리의 독보적 장인이지만, 전동화(EV/SDV) 기술 습득은 "은퇴할 때까지 필요 없다"며 회피하는 거부형 수석엔지니어.',
    traits: ['기술 자부심', '변화 거부', '장인 정신'],
    mbti: 'ISTP',
    difficulty: '상',
    recentIssue: '고난도 EV 수리 거부로 인한 팀 내 작업 정체 및 기술 전수 부재',
  },
];

export const SCENARIOS: Scenario[] = [
  // 목표/평가 카테고리
  {
    id: 'scen-sales-4',
    category: '목표/평가',
    title: '베테랑 부장의 디지털 전환 설득',
    description: '디지털 시스템 활용을 거부하는 영업부장을 설득하여 노하우를 시스템에 녹여내도록 유도하는 면담입니다.',
    guide: '베테랑의 자부심을 존중하면서도, 디지털 도구가 그의 노하우를 어떻게 확장시킬 수 있는지 연결하세요.',
    goals: ['디지털 도구 필요성 공감', 'CRM 활용 약속', '노하우 공유 체계 구축'],
  },
  {
    id: 'scen-service-4',
    category: '목표/평가',
    title: 'EV 전환을 위한 심리적 장벽 제거',
    description: '전동화 기술 습득을 회피하는 서비스수석엔지니어의 거부감을 해소하고 EV 진단으로 기술을 연결하는 면담입니다.',
    guide: '내연기관의 숙련된 기술이 EV 진단에서 어떻게 핵심적인 역할을 하는지 강조하여 기술적 연속성을 설명하세요.',
    goals: ['EV 교육 참여 확약', '기술적 자부심 고취', '전동화 전환 필요성 수용'],
  },
  // 인사통보 카테고리
  {
    id: 'scen-hr-1',
    category: '인사통보',
    title: '직무 순환 및 보직 변경 안내',
    description: '현장 상황에 따른 직무 순환의 필요성을 설명하고, 새로운 보직에서의 성장 가능성을 제시하는 면담입니다.',
    guide: '조직의 필요성과 개인의 역량 매칭을 강조하며, 변화에 대한 불안감을 해소해 주세요.',
    goals: ['변경 취지 이해', '새 직무 적응 지원 약속', '긍정적 수용 유도'],
  },
  // 직원케어 카테고리
  {
    id: 'scen-sales-1',
    category: '직원케어',
    title: 'MZ 신입의 비전 수립 및 동기부여',
    description: '실적 압박으로 퇴사를 고민하는 영업대리에게 카마스터로서의 비전을 제시하고 조기 이탈을 방지하는 코칭입니다.',
    guide: '단기 실적보다는 장기적인 커리어 성장에 초점을 맞추고, 심리적 안전감을 제공하세요.',
    goals: ['심리적 불안 해소', '장기 비전 공유', '업무 환경 개선 약속'],
  },
  {
    id: 'scen-sales-3',
    category: '직원케어',
    title: '슬럼프 차장의 관점 전환 면담',
    description: '디지털 환경 변화에 위축된 영업차장이 실패 원인을 외부 탓이 아닌 내부 강점에서 찾도록 돕는 면담입니다.',
    guide: '과거의 성공 경험을 상기시키고, 현재 상황에서 통제 가능한 변수에 집중하도록 유도하세요.',
    goals: ['자신감 회복', '내부 강점 재발견', '구체적 행동 계획 수립'],
  },
  {
    id: 'scen-service-2',
    category: '직원케어',
    title: '번아웃 방지 및 기술 전수 협의',
    description: '업무 과부하에 걸린 서비스엔지니어의 업무를 재분배하고 팀 내 기술 전수 체계를 협의하는 면담입니다.',
    guide: '구성원의 헌신을 높이 평가하고, 지속 가능한 업무 환경을 위한 구체적인 대안을 제시하세요.',
    goals: ['업무 재분배 합의', '멘토링 시스템 구축', '번아웃 케어 및 휴식 보장'],
  },
  // 성과관리 카테고리
  {
    id: 'scen-sales-2',
    category: '성과관리',
    title: '개인주의형 과장의 역할 재정의',
    description: '성과는 좋으나 협업에 소극적인 영업과장에게 지점 시너지를 위한 리더로서의 역할을 재정의해주는 코칭입니다.',
    guide: '개인 성과를 넘어 팀 전체의 성과가 본인의 가치에 어떤 영향을 주는지 논리적으로 접근하세요.',
    goals: ['협업의 중요성 인식', '정보 공유 프로세스 합의', '팀 내 멘토링 역할 부여'],
  },
  {
    id: 'scen-service-1',
    category: '성과관리',
    title: '성장 정체 탈피를 위한 동기부여',
    description: '기술 등급 시험에 낙방하고 안주하는 서비스엔지니어에게 하이테크 전문가로 성장해야 하는 이유를 깨닫게 하는 면담입니다.',
    guide: '현재의 기술 수준에 머물렀을 때의 리스크와 전문가로 성장했을 때의 보상을 명확히 대비시키세요.',
    goals: ['학습 의욕 고취', '기술 등급 재도전 계획', '전문가 성장 로드맵 수립'],
  },
  {
    id: 'scen-service-3',
    category: '성과관리',
    title: '서비스 마인드 및 유연성 코칭',
    description: '원칙주의적인 서비스수석엔지니어에게 기술적 원칙과 고객 감정 케어 사이의 균형을 잡도록 돕는 코칭입니다.',
    guide: '매뉴얼 준수의 가치를 인정하되, 고객 경험(CX)이 브랜드 가치에 미치는 영향을 사례 중심으로 설명하세요.',
    goals: ['고객 감정 공감 필요성 인식', '유연한 응대 가이드 수립', 'CS 점수 개선 목표 설정'],
  },
];

