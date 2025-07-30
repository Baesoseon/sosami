import { GoogleGenAI, Type } from "@google/genai";
import type { Question, Answer, LearningStyleResult, MBTIDimension } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const questionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER },
      text: { type: Type.STRING },
      options: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            type: { type: Type.STRING },
          },
          required: ["text", "type"],
        },
      },
    },
    required: ["id", "text", "options"],
  },
};

const resultSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, description: "4글자의 MBTI 유형 (예: 'INTJ')." },
        title: { type: Type.STRING, description: "학습 스타일에 대한 창의적이고 8비트 게임 테마의 제목." },
        description: { type: Type.STRING, description: "학습 스타일, 강점, 그리고 잠재적 어려움에 대한 상세한 설명."},
        studyTips: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "'파워업'으로 제시되는 실행 가능한 공부 팁 목록."
        },
    },
    required: ["type", "title", "description", "studyTips"],
};

export const generateTestQuestions = async (): Promise<Question[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `학습 스타일 퀴즈를 위한 12개의 객관식 질문을 생성해 주세요. 각 질문은 학생이 겪을 수 있는 간단한 시나리오를 제시해야 합니다.
            각 질문에는 두 개의 선택지가 있어야 하며, 각 선택지는 MBTI 이분법(E/I, S/N, T/F, J/P) 중 하나에 해당해야 합니다.
            네 가지 이분법 각각에 대해 정확히 세 개의 질문을 제공해 주세요.
            전체적인 톤은 8비트 RPG나 어드벤처 게임처럼 재미있고 향수를 불러일으키는 스타일이어야 합니다. 질문 ID는 1부터 12까지 순차적으로 부여해 주세요.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: questionSchema,
                systemInstruction: "당신은 레트로 8비트 테마의 교육용 콘텐츠를 전문으로 하는 창의적인 게임 디자이너입니다. 당신의 임무는 학생들이 자신의 MBTI 기반 학습 스타일을 발견할 수 있도록 재미있는 성격 퀴즈 질문을 만드는 것입니다."
            }
        });

        const jsonText = response.text.trim();
        const questions = JSON.parse(jsonText);
        return questions;

    } catch (error) {
        console.error("Error generating test questions:", error);
        throw new Error("퀘스트를 불러오는 데 실패했습니다. 연결을 확인하고 다시 시도해 주세요.");
    }
};

export const analyzeAnswersAndGetResult = async (answers: Answer[]): Promise<LearningStyleResult> => {
    const counts: Record<MBTIDimension, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    answers.forEach(answer => {
      counts[answer.type]++;
    });

    const mbtiType = [
      counts.E >= counts.I ? 'E' : 'I',
      counts.S >= counts.N ? 'S' : 'N',
      counts.T >= counts.F ? 'T' : 'F',
      counts.J >= counts.P ? 'J' : 'P'
    ].join('');
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `사용자의 MBTI 학습 유형은 ${mbtiType}입니다. 이 특정 유형에 대한 종합적인 학습 프로필을 한국어로 생성해 주세요.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: resultSchema,
                systemInstruction: "당신은 MBTI 결과를 해석하여 학생들에게 실행 가능한 조언을 제공하는 전문 교육 심리학자입니다. 명확하고 격려적이며, 약간은 장난기 있는 8비트 게임 마스터 스타일로 소통합니다."
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result;

    } catch (error) {
        console.error("Error analyzing results:", error);
        throw new Error("답변을 분석하는 데 실패했습니다. 최종 보스가 신호를 방해하고 있는지도 모릅니다!");
    }
};