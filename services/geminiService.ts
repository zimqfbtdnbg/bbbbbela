
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function fileToGenerativePart(base64, mimeType) {
    return {
        inlineData: {
            data: base64,
            mimeType
        },
    };
}

export async function generateChatMessage(
    prompt,
    image,
    mode, 
    history,
    modelId
) {
    let modelName = modelId || 'gemini-3-pro-preview';
    let tools = [];
    let config = {};
    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));

    const userParts = [];
    if(prompt) userParts.push({ text: prompt });
    if (image) {
        const mimeType = image.split(';')[0].split(':')[1];
        const base64Data = image.split(',')[1];
        userParts.push(fileToGenerativePart(base64Data, mimeType));
    }
     contents.push({ role: 'user', parts: userParts });

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents,
            tools,
            config
        });
        
        const text = response.text;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        return { text, groundingChunks };
    } catch (error) {
        console.error(`Error with model ${modelName}:`, error);
        throw new Error(`Failed to get response from Gemini API.`);
    }
}

// New Service for 5.0 Specialized Hubs
export async function generateSpecializedContent(prompt, type) {
    let systemInstruction = "";
    let model = "gemini-3-pro-preview"; // Default to smartest model for heavy tasks

    switch (type) {
        case 'business-contract':
            systemInstruction = "You are an expert legal consultant and business strategist. Generate professional, formatted contracts or business documents based on the user's request. Use strict markdown formatting with bold headers.";
            break;
        case 'business-marketing':
            systemInstruction = "You are a CMO (Chief Marketing Officer). Create detailed marketing strategies, analyzing target audiences, channels, and creative concepts. Be bold and data-driven.";
            break;
        case 'edu-plan':
            systemInstruction = "You are an advanced educational curriculum designer. Create detailed, step-by-step study plans with timelines, resources, and milestones.";
            break;
        case 'edu-tutor':
            systemInstruction = "You are a Socratic tutor. Explain complex concepts simply, ask checking questions, and provide examples.";
            break;
        case 'dev-debug':
            systemInstruction = "You are a Senior Staff Engineer. Analyze the provided code for bugs, security vulnerabilities, and performance issues. Provide the fixed code and explain the changes.";
            break;
        case 'dev-docs':
            systemInstruction = "You are a Technical Writer. Generate comprehensive documentation (JSDoc/Python Docstring style) and a README.md structure for the provided code.";
            break;
        default:
            systemInstruction = "You are a helpful AI assistant.";
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Specialized generation failed:", error);
        throw new Error("Service temporarily unavailable.");
    }
}

export async function generateVideo(
    prompt,
    aspectRatio,
    resolution,
    onProgress
) {
    const localAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        onProgress("Запуск процесса генерации...");
        let operation = await localAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: resolution,
                aspectRatio: aspectRatio
            }
        });

        onProgress("Видео обрабатывается... Это может занять несколько минут.");
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await localAi.operations.getVideosOperation({ operation: operation });
        }

        onProgress("Получение ссылки на видео...");
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Не удалось получить ссылку на сгенерированное видео.");
        }

        onProgress("Загрузка видео...");
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Ошибка при загрузке видео: ${response.statusText}`);
        }
        
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        
        onProgress("Готово!");
        return videoUrl;

    } catch (error) {
        console.error("Video generation failed:", error);
        if (error instanceof Error && error.message.includes('Requested entity was not found.')) {
             throw new Error("Ошибка API ключа. Пожалуйста, выберите другой ключ и попробуйте снова.");
        }
        throw new Error("Не удалось сгенерировать видео.");
    }
}

export async function analyzeDocument(documentText, prompt) {
    try {
        const fullPrompt = `Проанализируй следующий документ и ответь на вопрос.\n\nДОКУМЕНТ:\n---\n${documentText}\n---\n\nВОПРОС: ${prompt}`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: fullPrompt
        });
        
        return response.text;
    } catch (error) {
        console.error("Document analysis failed:", error);
        throw new Error("Не удалось проанализировать документ.");
    }
}

export async function generateSpeech(text) {
     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say with a friendly tone: ${text}` }] }],
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
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("TTS generation failed:", error);
        throw new Error("Failed to generate speech.");
    }
}