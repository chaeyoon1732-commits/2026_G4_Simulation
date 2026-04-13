export type Category = '목표/평가' | '인사통보' | '직원케어' | '성과관리';

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
  // 영업 부문
  {
    id: 'sales-1',
    name: '김철수',
    role: '카마스터 (15년차)',
    department: '영업',
    description: '과거 실적은 좋았으나 최근 시장 변화에 적응하지 못하고 실적이 정체된 베테랑.',
    traits: ['자부심 강함', '보수적', '변화에 대한 두려움'],
    mbti: 'ISTJ',
    difficulty: '중',
    recentIssue: '온라인 판매 비중 확대에 대한 강한 거부감 표출',
  },
  {
    id: 'sales-2',
    name: '이민지',
    role: '카마스터 (2년차)',
    department: '영업',
    description: '개인 생활을 중시하며, 조직의 목표보다는 본인의 워라밸이 우선인 MZ 세대 사원.',
    traits: ['솔직함', '효율 중심', '조직 몰입도 낮음'],
    mbti: 'ENTP',
    difficulty: '상',
    recentIssue: '주말 당직 근무에 대한 불만 토로 및 퇴사 암시',
  },
  {
    id: 'sales-3',
    name: '박성진',
    role: '카마스터 (8년차)',
    department: '영업',
    description: '지식은 풍부하나 실제 고객 응대 시 활동량이 부족하여 실적이 오르지 않는 정보형 사원.',
    traits: ['분석적', '소극적', '이론 중심'],
    mbti: 'INTP',
    difficulty: '하',
    recentIssue: '가망 고객 리스트 관리 부실로 인한 기회 손실 발생',
  },
  {
    id: 'sales-4',
    name: '정하윤',
    role: '카마스터 (5년차)',
    department: '영업',
    description: '고객과의 관계는 좋으나 감정 기복이 심해 실적의 변동폭이 큰 감정 기복형 사원.',
    traits: ['사교적', '감성적', '회복탄력성 낮음'],
    mbti: 'ENFP',
    difficulty: '중',
    recentIssue: '최근 대형 계약 파기 후 일주일간 무단 지각 반복',
  },
  // 서비스 부문 (서비스엔지니어)
  {
    id: 'service-1',
    name: '박진호',
    role: '서비스엔지니어 (하이테크)',
    department: '서비스',
    description: '기술력에 대한 자부심이 매우 높으나, 고객 응대나 행정 업무를 경시하는 경향이 있음.',
    traits: ['전문성', '고집스러움', '소통 부족'],
    mbti: 'INTJ',
    difficulty: '상',
    recentIssue: '고객에게 기술 용어만 사용하여 불친절하다는 VOC 발생',
  },
  {
    id: 'service-2',
    name: '최윤아',
    role: '서비스엔지니어 (복직자)',
    department: '서비스',
    description: '육아휴직 후 1년 만에 복직하여 최신 기술 트렌드와 현장 속도에 적응하는 데 어려움을 겪음.',
    traits: ['불안함', '의욕적이지만 위축됨', '지원이 필요함'],
    mbti: 'ISFJ',
    difficulty: '하',
    recentIssue: '전기차 정비 매뉴얼 숙지 미흡으로 작업 시간 지연',
  },
  {
    id: 'service-3',
    name: '강대협',
    role: '서비스엔지니어 (20년차)',
    department: '서비스',
    description: '오랜 현장 경험으로 번아웃이 온 상태이며, 새로운 정비 시스템 도입에 소극적인 베테랑.',
    traits: ['냉소적', '경험 중시', '에너지 저하'],
    mbti: 'ISTP',
    difficulty: '상',
    recentIssue: '팀 내 신규 장비 교육 참여 거부 및 후배들과의 마찰',
  },
  {
    id: 'service-4',
    name: '한주원',
    role: '서비스엔지니어 (3년차)',
    department: '서비스',
    description: '원칙을 철저히 고수하나 융통성이 부족하여 바쁜 현장 상황에서 병목 현상을 일으키는 사원.',
    traits: ['원칙주의', '꼼꼼함', '융통성 부족'],
    mbti: 'ESTJ',
    difficulty: '중',
    recentIssue: '표준 작업 시간(ST) 초과에 대한 팀장의 지적에 규정 준수 강조하며 대립',
  },
];

export const SCENARIOS: Scenario[] = [
  // 목표/평가
  {
    id: 'scen-1-1',
    category: '목표/평가',
    title: '연초 목표 설정 면담',
    description: '새로운 한 해의 판매 목표와 역량 개발 계획을 수립하는 면담입니다.',
    guide: '도전적인 목표를 설정하되, 구성원이 스스로 실행 방안을 찾도록 질문하세요.',
    goals: ['도전적 목표 합의', '구체적 실행 방안 도출', '필요 자원 확인'],
  },
  {
    id: 'scen-1-2',
    category: '목표/평가',
    title: '중간 성과 점검 면담',
    description: '상반기 실적을 리뷰하고 하반기 목표 달성을 위한 전략을 수정하는 면담입니다.',
    guide: '수치에 대한 질책보다는 장애 요인을 함께 분석하고 해결책을 모색하세요.',
    goals: ['성과 장애 요인 분석', '전략 수정 및 보완', '동기 부여'],
  },
  {
    id: 'scen-1-3',
    category: '목표/평가',
    title: '연말 종합 평가 면담',
    description: '한 해의 성과를 최종 확정하고 피드백을 전달하는 면담입니다.',
    guide: '결과에 대한 납득성을 높이고, 내년도 성장을 위한 제언을 덧붙이세요.',
    goals: ['평가 결과 납득', '강점 및 보완점 피드백', '차년도 성장 방향 제시'],
  },
  // 인사통보
  {
    id: 'scen-2-1',
    category: '인사통보',
    title: '승진 통보 면담',
    description: '승진 대상자에게 축하 메시지와 함께 새로운 역할에 대한 기대를 전달하는 면담입니다.',
    guide: '축하와 함께 리더로서의 책임감을 강조하고 비전을 공유하세요.',
    goals: ['승진 축하 및 격려', '새로운 역할 기대치 전달', '리더십 비전 공유'],
  },
  {
    id: 'scen-2-2',
    category: '인사통보',
    title: '승진 누락 통보 면담',
    description: '승진에서 제외된 구성원에게 이유를 설명하고 심리적 충격을 케어하는 면담입니다.',
    guide: '결과를 명확히 전달하되, 구성원의 감정을 충분히 수용하고 재도전의 기회를 강조하세요.',
    goals: ['누락 사유 명확화', '감정 수용 및 케어', '향후 보완 계획 수립'],
  },
  {
    id: 'scen-2-3',
    category: '인사통보',
    title: '거점 합리화 공지 면담',
    description: '지점 통합 등으로 인한 거점 이동 대상자에게 조직의 결정을 전달하는 면담입니다.',
    guide: '변화의 필요성을 논리적으로 설명하고, 이동에 따른 불안감을 해소해 주세요.',
    goals: ['변화 필요성 공유', '불안감 경청', '이동 지원책 안내'],
  },
  {
    id: 'scen-2-4',
    category: '인사통보',
    title: '저성과자 퇴출 통보 면담',
    description: '지속적인 성과 부진으로 인해 조직을 떠나야 함을 알리는 매우 어려운 면담입니다.',
    guide: '단호하지만 예우를 갖추어 전달하고, 향후 진로에 대한 현실적인 조언을 제공하세요.',
    goals: ['결정 사항 단호한 전달', '절차 및 예우 안내', '감정적 충돌 최소화'],
  },
  {
    id: 'scen-2-5',
    category: '인사통보',
    title: '인사이동 안내 면담',
    description: '타 부서나 타 지역으로의 발령 사항을 전달하는 면담입니다.',
    guide: '새로운 환경에서의 성장을 강조하고, 인수인계 등 마무리 과정을 독려하세요.',
    goals: ['발령 배경 설명', '새로운 역할 가치 부여', '원활한 인수인계 독려'],
  },
  // 직원케어
  {
    id: 'scen-3-1',
    category: '직원케어',
    title: '번아웃 증후군 케어 면담',
    description: '과도한 업무로 인해 열정이 식고 무기력해진 구성원을 위한 면담입니다.',
    guide: '업무 이야기보다는 구성원의 상태에 집중하고, 휴식이나 업무 조정을 논의하세요.',
    goals: ['심리적 상태 파악', '업무 과부하 원인 제거', '회복 지원 약속'],
  },
  {
    id: 'scen-3-2',
    category: '직원케어',
    title: '육아휴직 후 복직 지원 면담',
    description: '복직 후 적응에 어려움을 겪는 구성원을 환영하고 지원하는 면담입니다.',
    guide: '복귀를 진심으로 환영하고, 단기 성과보다는 연착륙을 위한 배려를 보여주세요.',
    goals: ['복직 환영 및 격려', '적응 애로사항 청취', '유연한 업무 환경 조성'],
  },
  {
    id: 'scen-3-3',
    category: '직원케어',
    title: '동료 간 갈등 중재 면담',
    description: '팀 내 동료와 마찰이 있는 구성원의 입장을 듣고 중재하는 면담입니다.',
    guide: '어느 한 편을 들기보다 객관적인 사실과 감정을 분리하여 경청하세요.',
    goals: ['갈등 원인 파악', '감정 정화', '협력적 관계 회복 방안'],
  },
  // 성과관리
  {
    id: 'scen-4-1',
    category: '성과관리',
    title: '우수인재 성장 지원 면담',
    description: '성과가 우수한 인재에게 더 큰 도전 과제를 부여하고 성장을 독려하는 면담입니다.',
    guide: '현재 성과를 높이 평가하고, 차세대 리더로서의 커리어 패스를 제시하세요.',
    goals: ['성과 인정 및 보상', '고난도 과제 부여', '장기적 커리어 코칭'],
  },
  {
    id: 'scen-4-2',
    category: '성과관리',
    title: '저성과자 개선 코칭 면담',
    description: '성과가 미진한 구성원의 역량 향상을 위해 구체적인 행동 변화를 촉구하는 면담입니다.',
    guide: '문제 행동을 구체적으로 지적하되, 개선 가능성에 대한 믿음을 보여주세요.',
    goals: ['문제 행동 인식', '역량 향상 계획 수립', '모니터링 주기 합의'],
  },
];

