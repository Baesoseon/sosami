
export enum AppState {
  START,
  LOADING,
  TESTING,
  ANALYZING,
  RESULT,
  ERROR,
}

export type MBTIDimension = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

export interface QuestionOption {
  text: string;
  type: MBTIDimension;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

export interface Answer {
  questionId: number;
  type: MBTIDimension;
}

export interface LearningStyleResult {
  type: string;
  title: string;
  description: string;
  studyTips: string[];
}
