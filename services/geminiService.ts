import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ActionType, LabState, Quiz } from '../types';

const model = 'gemini-2.5-flash';
const ttsModel = 'gemini-2.5-flash-preview-tts';

const getAiClient = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("API Key is missing.");
    }
    return new GoogleGenAI({ apiKey });
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        explanation: {
            type: Type.STRING,
            description: "Lời giải thích ngắn gọn, thân thiện cho học sinh tiểu học (1-2 câu).",
        },
        quiz: {
            type: Type.OBJECT,
            // Fix: Removed `nullable: true` as it is not a supported property in the response schema.
            // The optionality of the property is handled by not including it in the `required` array.
            description: "Một câu hỏi trắc nghiệm nhanh, nếu có.",
            properties: {
                question: {
                    type: Type.STRING,
                    description: "Câu hỏi để kiểm tra hiểu biết của học sinh.",
                },
                correctAnswerHint: {
                    type: Type.STRING,
                    description: "Gợi ý về câu trả lời đúng để kiểm tra câu trả lời của học sinh.",
                },
            },
        },
    },
    required: ['explanation'],
};

const systemInstruction = `Con là 'Trợ lý AI' trong một phòng thí nghiệm ảo cho học sinh lớp 4-5. 
Nhiệm vụ của con là giải thích các hiện tượng vật lý (bay hơi, ngưng tụ, tan chảy, hòa tan) một cách cực kỳ đơn giản, vui vẻ và tự nhiên như đang nói chuyện với một đứa trẻ. 
Luôn giữ câu trả lời rất ngắn gọn (1-2 câu), tập trung vào ý chính.
Sử dụng ngôn ngữ gần gũi, thân thiện (xưng 'cô/thầy' và gọi học sinh là 'con'). 
Mục tiêu là giúp các con hiểu bài một cách dễ dàng và thú vị.
Tuyệt đối không sử dụng markdown.`;


async function generateAudio(textToSpeak: string, apiKey: string): Promise<string | null> {
    if (!textToSpeak) return null;
    try {
        const ai = getAiClient(apiKey);
        const response = await ai.models.generateContent({
            model: ttsModel,
            contents: [{ parts: [{ text: textToSpeak }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Audio generation failed:", error);
        throw error;
    }
}

export async function getInitialGreeting(apiKey: string): Promise<{ text: string; audio: string | null }> {
    const ai = getAiClient(apiKey);
    const response = await ai.models.generateContent({
        model,
        contents: "Hãy viết một lời chào mừng ngắn gọn (1 câu) để bắt đầu buổi thí nghiệm ảo.",
        config: {
            systemInstruction
        }
    });
    const text = response.text.trim();
    const audio = await generateAudio(text, apiKey);
    return { text, audio };
}

function buildPrompt(action: ActionType, labState: LabState, actionHistory: ActionType[], userAnswer?: string, currentQuiz?: Quiz): string {
    const previousActions = actionHistory.join(', ');
    
    switch (action) {
        case ActionType.HEAT_WATER:
            return `Học sinh vừa chọn hành động "Đun nóng nước". Hãy giải thích hiện tượng "bay hơi" là gì khi nước được đun nóng. Sau đó, đặt một câu hỏi đơn giản để kiểm tra xem con có hiểu không.`;
        case ActionType.ADD_ICE:
            if (!labState.showVapor) {
                return `Học sinh muốn "Đặt đá lên nắp cốc" nhưng chưa có hơi nước. Hãy nhẹ nhàng nhắc con cần đun nước để tạo ra hơi nước trước.`;
            }
            return `Học sinh vừa "Đặt đá lên nắp cốc" khi có hơi nước nóng bốc lên. Hãy giải thích hiện tượng "ngưng tụ" là gì khi hơi nước gặp lạnh. Sau đó, đặt một câu hỏi đơn giản.`;
        case ActionType.DROP_ICE_IN_WATER:
            return `Học sinh vừa 'Thả viên đá vào nước nóng'. Hãy giải thích hiện tượng 'tan chảy' là gì khi đá (thể rắn) gặp nước nóng và tại sao nước nguội đi. Sau đó, đặt một câu hỏi đơn giản.`;
        case ActionType.DISSOLVE_SALT:
            return `Học sinh vừa 'Hòa muối vào nước'. Hãy giải thích hiện tượng 'hòa tan' là gì. Giới thiệu ngắn gọn về 'chất tan' (muối) và 'dung môi' (nước). Sau đó, đặt một câu hỏi đơn giản.`;
        case ActionType.ANSWER_QUIZ:
            return `Cô/Thầy đã hỏi con câu: "${currentQuiz?.question}". Con trả lời là: "${userAnswer}". Gợi ý câu trả lời đúng là về: "${currentQuiz?.correctAnswerHint}".
            Hãy nhận xét câu trả lời của con. Nếu đúng, hãy khen ngợi. Nếu sai, hãy động viên và giải thích lại một cách đơn giản. Chỉ đưa ra nhận xét, không hỏi thêm câu hỏi nào khác.`;
        case ActionType.ASK_QUESTION:
             return `Học sinh vừa hỏi một câu: "${userAnswer}". Dựa vào bối cảnh thí nghiệm (các hành động đã thực hiện: ${previousActions}), hãy trả lời câu hỏi này một cách đơn giản, phù hợp với học sinh tiểu học. Chỉ trả lời câu hỏi, không hỏi thêm gì cả.`;
        default:
            return "Hãy đưa ra một lời gợi ý chung cho thí nghiệm.";
    }
}

export async function getAiResponse(apiKey: string, action: ActionType, labState: LabState, actionHistory: ActionType[], userAnswer?: string, currentQuiz?: Quiz) {
    const prompt = buildPrompt(action, labState, actionHistory, userAnswer, currentQuiz);

    const ai = getAiClient(apiKey);
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    try {
        const text = response.text.trim();
        const json = JSON.parse(text);
        
        const explanation = json.explanation || "Cô/Thầy chưa nghĩ ra lời giải thích. Con thử lại nhé!";
        // For general questions, ensure no new quiz is generated.
        const quiz = action === ActionType.ASK_QUESTION ? null : (json.quiz || null);
        
        // Combine explanation and question for a single audio generation
        const textToSpeak = quiz ? `${explanation} ${quiz.question}` : explanation;
        const audio = await generateAudio(textToSpeak, apiKey);
        
        return {
            explanation,
            quiz,
            audio,
        };
    } catch (e) {
        console.error("Failed to parse Gemini JSON response:", e);
        console.error("Raw response text:", response.text);
        const explanation = response.text || "Có lỗi xảy ra, con thử lại sau nhé.";
        const audio = await generateAudio(explanation, apiKey);
        return {
            explanation,
            quiz: null,
            audio,
        };
    }
}