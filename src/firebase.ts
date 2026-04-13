import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, Timestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { PERSONAS, SCENARIOS } from './constants';

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// 구글 로그인/로그아웃 함수
export const signIn = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    // 한국어 주석: 로그인 실패 시 상세 에러를 콘솔에 출력하여 원인 파악을 돕습니다.
    console.error("Firebase Login Error:", error.code, error.message);
    
    if (error.code === 'auth/popup-closed-by-user') {
      console.warn("사용자가 로그인 팝업을 닫았습니다.");
    } else if (error.code === 'auth/unauthorized-domain') {
      alert("현재 도메인이 Firebase 승인된 도메인에 등록되지 않았습니다. Firebase 콘솔 설정을 확인해주세요.");
    } else if (error.code === 'auth/cancelled-popup-request') {
      console.warn("이전 팝업 요청이 취소되었습니다.");
    } else {
      alert(`로그인 중 오류가 발생했습니다: ${error.message}`);
    }
    throw error;
  }
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
 */
export async function seedInitialData() {
  try {
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
    console.error("Error seeding initial data:", error);
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
