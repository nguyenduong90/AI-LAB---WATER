export enum ActionType {
  HEAT_WATER = 'HEAT_WATER',
  ADD_ICE = 'ADD_ICE',
  ANSWER_QUIZ = 'ANSWER_QUIZ',
  ASK_QUESTION = 'ASK_QUESTION',
  DROP_ICE_IN_WATER = 'DROP_ICE_IN_WATER',
  DISSOLVE_SALT = 'DISSOLVE_SALT',
}

export enum MessageSender {
  AI = 'AI',
  USER = 'USER',
}

export interface LabState {
  isHeating: boolean;
  showVapor: boolean;
  isIceOnLid: boolean;
  showCondensation: boolean;
  isIceInWater: boolean;
  isSaltInWater: boolean;
  saltLevel: number; // 0-10, representing 0% to 100%
}

export interface AiMessage {
  id: string;
  sender: MessageSender;
  text: string;
  audio?: string | null;
}

export interface Quiz {
  question: string;
  correctAnswerHint: string;
}

export interface AiResponse {
    explanation: string;
    quiz: Quiz | null;
}
