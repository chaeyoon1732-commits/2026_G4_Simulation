import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, Timestamp, doc, setDoc, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { PERSONAS, SCENARIOS } from './constants';

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// 구글 로그인 함수 (팝업 및 리다이렉트 대응)
export const signIn = async () => {
  try {
    // 한국어 주석: 먼저 팝업 방식으로 로그인을 시도합니다.
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Firebase Login Error:", error.code, error.message);
    
    // 한국어 주석: 팝업이 차단되었거나 브라우저 설정(COOP 등)으로 인해 실패한 경우 리다이렉트 방식으로 전환합니다.
    if (
      error.code === 'auth/popup-blocked' || 
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request' ||
      error.code === 'auth/internal-error' // COOP 이슈 시 종종 internal-error 발생
    ) {
      console.log("팝업 방식 실패, 리다이렉트 방식으로 전환합니다...");
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectError) {
        console.error("Redirect Login Error:", redirectError);
        alert("로그인 페이지로 이동하는 중 오류가 발생했습니다.");
      }
    } else if (error.code === 'auth/unauthorized-domain') {
      const currentDomain = window.location.hostname;
      alert(`현재 도메인(${currentDomain})이 Firebase 승인된 도메인에 등록되지 않았습니다. \n\nFirebase 콘솔(프로젝트 ID: gen-lang-client-0783562913)에서 이 도메인을 추가해 주세요.`);
    } else {
      alert(`로그인 중 오류가 발생했습니다: ${error.message}`);
    }
    throw error;
  }
};

// 한국어 주석: 리다이렉트 후 돌아왔을 때 결과를 처리하는 함수
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
  } catch (error) {
    console.error("Error handling redirect result:", error);
  }
  return null;
};

export const signOut = () => auth.signOut();

/**
 * 시뮬레이션 결과를 Firestore에 저장하는 함수
 */
export async function saveSimulationResult(result: any) {
  try {
    const docRef = await addDoc(collection(db, 'simulations'), {
      ...result,
      timestamp: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving simulation result:", error);
    throw error;
  }
}

/**
 * 사용자의 시뮬레이션 히스토리를 가져오는 함수
 */
export async function getSimulationHistory(userId: string) {
  try {
    const q = query(
      collection(db, 'simulations'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting simulation history:", error);
    return [];
  }
}

/**
 * 2026_G4_Simulation 컬렉션에 데이터를 시드(seed)하는 함수
 * 앱 실행 시 초기 데이터를 Firestore에 자동으로 업로드합니다.
 * (관리자만 실행 가능하도록 규칙이 설정되어 있으므로, 일반 사용자는 실패할 수 있습니다.)
 */
export async function seedInitialData() {
  try {
    // 이미 데이터가 있는지 확인하여 불필요한 쓰기 방지
    const personasSnapshot = await getDocs(collection(db, '2026_G4_Simulation', 'personas', 'items'));
    if (!personasSnapshot.empty) {
      console.log("Data already exists in Firestore. Skipping seed.");
      return;
    }

    console.log("Seeding initial data...");
    // 1. 페르소나 데이터 시드
    for (const persona of PERSONAS) {
      await setDoc(doc(db, '2026_G4_Simulation', 'personas', 'items', persona.id), persona);
    }
    
    // 2. 시나리오 데이터 시드
    for (const scenario of SCENARIOS) {
      await setDoc(doc(db, '2026_G4_Simulation', 'scenarios', 'items', scenario.id), scenario);
    }
    
    console.log("Initial data seeded to '2026_G4_Simulation' collection successfully.");
  } catch (error) {
    // 일반 사용자의 경우 권한 부족으로 실패하는 것이 정상이므로 경고만 출력
    console.warn("Seed skipped or failed (likely due to permissions):", error);
  }
}

/**
 * Firestore에서 페르소나 목록을 읽어오는 함수
 */
export async function fetchPersonasFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, '2026_G4_Simulation', 'personas', 'items'));
    const personas = querySnapshot.docs.map(doc => doc.data() as any);
    return personas.length > 0 ? personas : PERSONAS; // 데이터가 없으면 로컬 데이터 반환
  } catch (error) {
    console.error("Error fetching personas:", error);
    return PERSONAS;
  }
}

/**
 * Firestore에서 시나리오 목록을 읽어오는 함수
 */
export async function fetchScenariosFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, '2026_G4_Simulation', 'scenarios', 'items'));
    const scenarios = querySnapshot.docs.map(doc => doc.data() as any);
    return scenarios.length > 0 ? scenarios : SCENARIOS; // 데이터가 없으면 로컬 데이터 반환
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    return SCENARIOS;
  }
}

/**
 * 모든 사용자의 시뮬레이션 결과를 가져오는 함수 (관리자용)
 */
export async function getAllSimulationResults() {
  try {
    const q = query(
      collection(db, 'simulations'),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting all simulation results:", error);
    return [];
  }
}

/**
 * 페르소나 정보를 업데이트하거나 생성하는 함수 (관리자용)
 */
export async function updatePersona(persona: any) {
  try {
    await setDoc(doc(db, '2026_G4_Simulation', 'personas', 'items', persona.id), persona);
    return true;
  } catch (error) {
    console.error("Error updating persona:", error);
    return false;
  }
}

/**
 * 시나리오 정보를 업데이트하거나 생성하는 함수 (관리자용)
 */
export async function updateScenario(scenario: any) {
  try {
    await setDoc(doc(db, '2026_G4_Simulation', 'scenarios', 'items', scenario.id), scenario);
    return true;
  } catch (error) {
    console.error("Error updating scenario:", error);
    return false;
  }
}

/**
 * 페르소나 정보를 삭제하는 함수 (관리자용)
 */
export async function deletePersona(id: string) {
  try {
    await deleteDoc(doc(db, '2026_G4_Simulation', 'personas', 'items', id));
    return true;
  } catch (error) {
    console.error("Error deleting persona:", error);
    return false;
  }
}

/**
 * 시나리오 정보를 삭제하는 함수 (관리자용)
 */
export async function deleteScenario(id: string) {
  try {
    await deleteDoc(doc(db, '2026_G4_Simulation', 'scenarios', 'items', id));
    return true;
  } catch (error) {
    console.error("Error deleting scenario:", error);
    return false;
  }
}

/**
 * 관리자 여부를 확인하는 함수
 */
export function checkIsAdmin(email: string | null) {
  const adminEmails = ['chaeyoon1732@gmail.com', 'admin@hyundai.com']; // 관리자 이메일 목록
  return email ? adminEmails.includes(email) : false;
}

/**
 * 사용자의 프로필 정보를 저장하거나 업데이트하는 함수
 */
export async function updateUserProfile(userId: string, data: any) {
  try {
    await setDoc(doc(db, 'users', userId), data, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
}

/**
 * 사용자의 프로필 정보를 가져오는 함수
 */
export async function getUserProfile(userId: string) {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}
