export type UserRole = "teacher" | "student";
export type WriterRole = "teacher" | "peer" | "self";
export type ObservationCategory = "수업" | "관계" | "생활" | "기타";
export type ObservationStatus = "pending" | "approved" | "rejected";

export interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  role: UserRole;
  teacherId?: string; // 소속 교사 UID (학생 전용)
  studentNumber?: number;
  strengths: string[]; // VIA 진단 결과 강점 ID 배열
  gardenLevel: number;
}

export interface Observation {
  id: string;
  targetId: string; // 대상 학생 UID
  writerId: string; // 작성자 UID
  teacherId?: string; // 소속 교사 UID
  writerRole: WriterRole;
  writerName?: string;
  targetName?: string;
  category: ObservationCategory;
  strengthId: string;
  content: string;
  status: ObservationStatus;
  createdAt: Date;
}

export interface StrengthItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  examples: string[];
}

export interface StrengthCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  strengths: StrengthItem[];
}
