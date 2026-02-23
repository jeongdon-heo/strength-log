import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { UserProfile, Observation, ObservationStatus } from "./types";

// ─── Users ────────────────────────────────────────────
export async function getUser(uid: string): Promise<UserProfile | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function setUser(user: UserProfile): Promise<void> {
  const db = getFirebaseDb();
  await setDoc(doc(db, "users", user.uid), user);
}

export async function getAllStudents(teacherId?: string): Promise<UserProfile[]> {
  const db = getFirebaseDb();
  const constraints = [where("role", "==", "student")];
  if (teacherId) constraints.push(where("teacherId", "==", teacherId));
  const q = query(collection(db, "users"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as UserProfile)
    .sort((a, b) => (a.studentNumber ?? 0) - (b.studentNumber ?? 0));
}

// ─── Observations ─────────────────────────────────────
/** 관찰 기록 수 기준으로 정원 레벨 계산 (3개당 1레벨, 최대 10) */
function calcGardenLevel(observationCount: number): number {
  return Math.min(Math.floor(observationCount / 3), 10);
}

/** 학생이 받은 관찰 기록 수를 세고 gardenLevel 업데이트 */
async function refreshGardenLevel(targetId: string): Promise<void> {
  const db = getFirebaseDb();
  const q = query(collection(db, "observations"), where("targetId", "==", targetId));
  const snap = await getDocs(q);
  const level = calcGardenLevel(snap.size);
  await updateDoc(doc(db, "users", targetId), { gardenLevel: level });
}
export async function addObservation(obs: Omit<Observation, "id" | "createdAt">): Promise<string> {
  const db = getFirebaseDb();
  const docRef = await addDoc(collection(db, "observations"), {
    ...obs,
    createdAt: Timestamp.now(),
  });
  // 자동 레벨업: 대상 학생의 정원 레벨 갱신
  await refreshGardenLevel(obs.targetId);
  return docRef.id;
}

export async function getObservationsForStudent(targetId: string): Promise<Observation[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, "observations"),
    where("targetId", "==", targetId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: (d.data().createdAt as Timestamp).toDate(),
    }) as Observation)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getObservationsByWriter(writerId: string): Promise<Observation[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, "observations"),
    where("writerId", "==", writerId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: (d.data().createdAt as Timestamp).toDate(),
    }) as Observation)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getPendingObservations(teacherId?: string): Promise<Observation[]> {
  const db = getFirebaseDb();
  const constraints = [where("status", "==", "pending")];
  if (teacherId) constraints.push(where("teacherId", "==", teacherId));
  const q = query(
    collection(db, "observations"),
    ...constraints
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: (d.data().createdAt as Timestamp).toDate(),
    }) as Observation)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function updateObservationStatus(
  id: string,
  status: ObservationStatus
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "observations", id), { status });
}

export async function deleteObservation(id: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, "observations", id));
}

export async function getApprovedObservationsForStudent(targetId: string): Promise<Observation[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, "observations"),
    where("targetId", "==", targetId),
    where("status", "==", "approved")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: (d.data().createdAt as Timestamp).toDate(),
    }) as Observation)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getAllObservations(teacherId?: string): Promise<Observation[]> {
  const db = getFirebaseDb();
  if (teacherId) {
    const q = query(collection(db, "observations"), where("teacherId", "==", teacherId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: (d.data().createdAt as Timestamp).toDate(),
      }) as Observation)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  const snap = await getDocs(collection(db, "observations"));
  return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: (d.data().createdAt as Timestamp).toDate(),
    }) as Observation)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function updateUserGardenLevel(uid: string, level: number): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "users", uid), { gardenLevel: level });
}

export async function deleteStudent(uid: string): Promise<void> {
  const db = getFirebaseDb();
  // Delete all observations where student is target
  const targetQ = query(collection(db, "observations"), where("targetId", "==", uid));
  const targetSnap = await getDocs(targetQ);
  // Delete all observations where student is writer
  const writerQ = query(collection(db, "observations"), where("writerId", "==", uid));
  const writerSnap = await getDocs(writerQ);
  const deletePromises = [
    ...targetSnap.docs.map((d) => deleteDoc(d.ref)),
    ...writerSnap.docs.map((d) => deleteDoc(d.ref)),
  ];
  await Promise.all(deletePromises);
  // Delete user profile
  await deleteDoc(doc(db, "users", uid));
}
