
import { generateSpeech } from '../services/geminiService.ts';
import { GoogleGenAI, Modality } from '@google/genai';

function decode(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(data, ctx) {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
}

function encode(bytes) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export function ChatPage({ messages, isLoading, onSendMessage, setMessages }) {
    let selectedModel = 'gemini-3-pro-preview';
    let image = null;
    let imageName = '';

    const container = document.createElement('div');
    container.className = 'flex flex-col h-full bg-bg relative';

    // Header
    const header = document.createElement('header');
    header.className = 'bg-white/80 backdrop-blur-md p-4 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100';
    
    const headerTitle = document.createElement('div');
    headerTitle.className = "flex items-center gap-3";
    headerTitle.innerHTML = `
        <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <i class="fas fa-robot"></i>
        </div>
        <div>
            <h2 class="text-sm font-bold text-text leading-tight">Bela Chat</h2>
            <span class="text-[10px] text-green-500 font-medium flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>Online</span>
        </div>
    `;

    const modelSelectWrapper = document.createElement('div');
    modelSelectWrapper.className = "relative";
    const modelSelect = document.createElement('select');
    modelSelect.className = "bg-bg text-text text-xs font-bold rounded-xl py-2 px-3 pr-8 border-none focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer shadow-sm";
    
    const models = [
        { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro' }
    ];
    models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name;
        if(m.id === selectedModel) opt.selected = true;
        modelSelect.appendChild(opt);
    });
    modelSelect.onchange = (e) => { selectedModel = (e.target as HTMLSelectElement).value; };
    
    const chevron = document.createElement('i');
    chevron.className = "fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-[10px] text-text-light pointer-events-none";
    
    modelSelectWrapper.append(modelSelect, chevron);
    header.append(headerTitle, modelSelectWrapper);

    const messageArea = document.createElement('div');
    messageArea.className = 'flex flex-col flex-grow overflow-hidden';

    const chatHistory = document.createElement('div');
    chatHistory.className = 'flex-grow overflow-y-auto p-4 space-y-6';

    const chatEndRef = document.createElement('div');

    const inputArea = document.createElement('div');
    inputArea.className = 'bg-white p-4 pb-6 border-t border-gray-100';

    const updateMessages = () => {
        chatHistory.innerHTML = '';
        messages.forEach(msg => {
            const msgContainer = document.createElement('div');
            msgContainer.className = `flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`;
            
            const msgBubble = document.createElement('div');
            if (msg.role === 'user') {
                msgBubble.className = "bg-primary text-white rounded-2xl rounded-tr-none px-5 py-3 max-w-[85%] shadow-lg shadow-primary/20 text-sm leading-relaxed";
            } else {
                msgBubble.className = "bg-white text-text rounded-2xl rounded-tl-none px-5 py-4 max-w-[90%] shadow-neo text-sm leading-relaxed border border-gray-50";
            }
            
            if (msg.image) {
                msgBubble.innerHTML += `<img src="${msg.image}" alt="upload" class="rounded-lg mb-3 max-h-48 object-cover border-2 border-white/20" />`;
            }
            
            const contentDiv = document.createElement('div');
            contentDiv.className = msg.role === 'user' ? "prose prose-invert prose-sm max-w-none" : "prose prose-sm max-w-none text-text";
            contentDiv.innerHTML = msg.content.replace(/\n/g, '<br />');
            msgBubble.appendChild(contentDiv);

            if (msg.groundingChunks && msg.groundingChunks.length > 0) {
                 const sourcesDiv = document.createElement('div');
                 sourcesDiv.className = `mt-3 pt-2 border-t ${msg.role === 'user' ? 'border-white/20' : 'border-gray-100'}`;
                 let sourcesHTML = `<h4 class="text-[10px] font-bold mb-1 opacity-70 uppercase tracking-wider">Источники:</h4><ul class="space-y-1">`;
                 msg.groundingChunks.forEach(chunk => {
                     if (chunk.web) sourcesHTML += `<li class="text-xs truncate"><a href="${chunk.web.uri}" target="_blank" rel="noopener noreferrer" class="${msg.role === 'user' ? 'text-white underline' : 'text-primary font-medium hover:underline'}"><i class="fas fa-link mr-1 text-[10px]"></i>${chunk.web.title}</a></li>`;
                     if (chunk.maps) sourcesHTML += `<li class="text-xs truncate"><a href="${chunk.maps.uri}" target="_blank" rel="noopener noreferrer" class="${msg.role === 'user' ? 'text-white underline' : 'text-primary font-medium hover:underline'}"><i class="fas fa-map-marker-alt mr-1 text-[10px]"></i>${chunk.maps.title}</a></li>`;
                 });
                 sourcesHTML += '</ul>';
                 sourcesDiv.innerHTML = sourcesHTML;
                 msgBubble.appendChild(sourcesDiv);
            }
            
            if (msg.role === 'model' && msg.content) {
                const ttsButton = document.createElement('button');
                ttsButton.className = "mt-3 text-text-light hover:text-primary transition-colors flex items-center gap-1 text-[10px] font-bold bg-bg px-2 py-1 rounded-md";
                ttsButton.innerHTML = '<i class="fas fa-volume-up"></i> <span>ОЗВУЧИТЬ</span>';
                ttsButton.onclick = async () => {
                     try {
                        const base64Audio = await generateSpeech(msg.content);
                        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                        const decodedData = decode(base64Audio);
                        const audioBuffer = await decodeAudioData(decodedData, audioContext);
                        const source = audioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(audioContext.destination);
                        source.start(0);
                    } catch (error) {
                        console.error("Error playing TTS:", error);
                    }
                };
                msgBubble.appendChild(ttsButton);
            }

            msgContainer.appendChild(msgBubble);
            chatHistory.appendChild(msgContainer);
        });

        if (isLoading) {
            chatHistory.innerHTML += `
                 <div class="flex justify-start w-full animate-fadeIn">
                    <div class="px-4 py-3 rounded-2xl rounded-tl-none bg-white shadow-neo border border-gray-50">
                        <div class="flex items-center gap-1">
                            <div class="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                            <div class="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-150"></div>
                            <div class="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-300"></div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        chatHistory.appendChild(chatEndRef);
        chatEndRef.scrollIntoView({ behavior: 'smooth' });
    };
    
    // Live Session
    let sessionPromise = null;
    let mediaStream = null;
    let scriptProcessor = null;
    let inputAudioContext = null;
    let outputAudioContext = null;
    let userTranscriptRef = '';
    let modelTranscriptRef = '';
    
    const stopLiveSession = () => {
         if (sessionPromise) { sessionPromise.then(session => session.close()); sessionPromise = null; }
        if (mediaStream) { mediaStream.getTracks().forEach(track => track.stop()); mediaStream = null; }
        if(scriptProcessor) { scriptProcessor.disconnect(); scriptProcessor = null; }
        if (inputAudioContext && inputAudioContext.state !== 'closed') { inputAudioContext.close(); inputAudioContext = null; }
        if (outputAudioContext && outputAudioContext.state !== 'closed') { outputAudioContext.close(); outputAudioContext = null; }
        inputArea.style.display = 'block';
        const liveArea = container.querySelector('.live-session-area');
        if(liveArea) liveArea.remove();
    };

    const startLiveSession = async () => {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            let nextStartTime = 0;
            
            const liveArea = document.createElement('div');
            liveArea.className = 'live-session-area flex flex-col items-center justify-center p-8 bg-white rounded-[2rem] shadow-float m-4 absolute bottom-0 left-0 right-0 z-30 animate-fadeIn';
            
            liveArea.innerHTML = `
                <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <i class="fas fa-microphone-lines text-2xl text-primary"></i>
                </div>
                <h3 class="text-lg font-black text-text mb-2">Live Conversation</h3>
                <p class="text-sm text-text-light mb-6">Говорите, я слушаю...</p>
            `;

            const liveDisplay = document.createElement('div');
            liveDisplay.className = "w-full text-center space-y-4 mb-6 min-h-[60px]";
            const userTranscriptEl = document.createElement('p');
            userTranscriptEl.className = "text-xs text-text-light/80 italic";
            const modelTranscriptEl = document.createElement('p');
            modelTranscriptEl.className = "text-sm font-medium text-primary";
            liveDisplay.append(userTranscriptEl, modelTranscriptEl);
            liveArea.appendChild(liveDisplay);

            const stopButton = document.createElement('button');
            stopButton.className = "bg-danger text-white font-bold py-3 px-10 rounded-2xl shadow-lg hover:shadow-xl hover:bg-red-600 transition-all flex items-center gap-2";
            stopButton.innerHTML = `<i class="fas fa-phone-slash"></i> Завершить`;
            stopButton.onclick = stopLiveSession;
            liveArea.appendChild(stopButton);
            
            messageArea.appendChild(liveArea);
            inputArea.style.display = 'none';

            sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
                },
                callbacks: {
                    onopen: () => {
                        const source = inputAudioContext.createMediaStreamSource(mediaStream);
                        scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const int16 = new Int16Array(inputData.length);
                            for (let i = 0; i < inputData.length; i++) { int16[i] = inputData[i] * 32768; }
                            const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
                            sessionPromise?.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message) => {
                        if (message.serverContent?.inputTranscription) {
                            userTranscriptRef += message.serverContent.inputTranscription.text;
                            userTranscriptEl.innerHTML = userTranscriptRef;
                        }
                        if (message.serverContent?.outputTranscription) {
                            modelTranscriptRef += message.serverContent.outputTranscription.text;
                            modelTranscriptEl.innerHTML = modelTranscriptRef;
                        }
                         if(message.serverContent?.turnComplete) {
                            const newMessages = [];
                            if (userTranscriptRef) newMessages.push({ role: 'user', content: userTranscriptRef });
                            if (modelTranscriptRef) newMessages.push({ role: 'model', content: modelTranscriptRef });
                            if (newMessages.length > 0) setMessages([...messages, ...newMessages]);
                            userTranscriptRef = ''; modelTranscriptRef = '';
                            userTranscriptEl.innerHTML = ''; modelTranscriptEl.innerHTML = '';
                        }
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if(base64Audio) {
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext);
                             const source = outputAudioContext.createBufferSource();
                             source.buffer = audioBuffer;
                             source.connect(outputAudioContext.destination);
                             const startTime = Math.max(outputAudioContext.currentTime, nextStartTime);
                             source.start(startTime);
                             nextStartTime = startTime + audioBuffer.duration;
                        }
                    },
                    onerror: (e) => { console.error(e); stopLiveSession(); },
                    onclose: () => stopLiveSession(),
                }
            });

        } catch (error) {
            console.error(error);
            alert("Ошибка доступа к микрофону.");
        }
    };

    // Input Controls
    const imagePreview = document.createElement('div');
    const textInput = document.createElement('textarea');
    textInput.placeholder = 'Напишите сообщение...';
    textInput.rows = 1;
    textInput.className = "flex-grow bg-bg text-text border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-sm font-medium placeholder-text-light/70";
    
    const adjustHeight = () => {
        textInput.style.height = 'auto';
        textInput.style.height = Math.min(textInput.scrollHeight, 150) + 'px';
    };

    const send = () => {
        if (textInput.value.trim() || image) {
            onSendMessage(textInput.value, image, null, selectedModel);
            textInput.value = '';
            textInput.style.height = 'auto'; 
            image = null;
            imageName = '';
            updateInputArea();
        }
    };
    
    textInput.addEventListener('input', adjustHeight);
    textInput.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.className = 'hidden';
    fileInput.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { image = reader.result; imageName = file.name; updateInputArea(); };
            reader.readAsDataURL(file);
        }
    };
    
    const updateInputArea = () => {
        imagePreview.innerHTML = '';
        if (image) {
            imagePreview.className = "flex items-center justify-between p-3 mb-3 bg-bg rounded-xl border border-border-color";
            imagePreview.innerHTML = `
                <div class="flex items-center gap-3">
                    <img src="${image}" alt="preview" class="w-10 h-10 rounded-lg object-cover shadow-sm"/>
                    <span class="text-xs text-text font-bold truncate max-w-[150px]">${imageName}</span>
                </div>
            `;
            const removeBtn = document.createElement('button');
            removeBtn.className = "text-text-light hover:text-danger transition-colors px-2";
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.onclick = () => { image = null; imageName = ''; fileInput.value = ''; updateInputArea(); };
            imagePreview.appendChild(removeBtn);
        } else {
             imagePreview.className = "";
        }
    };
    
    const inputControls = document.createElement('div');
    inputControls.className = 'flex items-end gap-2';
    
    const attachBtn = document.createElement('label');
    attachBtn.className = "cursor-pointer p-2 mb-1 h-10 w-10 flex items-center justify-center rounded-full text-text-light hover:text-primary hover:bg-primary/5 transition-all";
    attachBtn.innerHTML = '<i class="fas fa-paperclip text-lg"></i>';
    attachBtn.appendChild(fileInput);
    
    const micBtn = document.createElement('button');
    micBtn.className = "p-2 mb-1 h-10 w-10 flex items-center justify-center rounded-full text-text-light hover:text-primary hover:bg-primary/5 transition-all";
    micBtn.innerHTML = '<i class="fas fa-microphone text-lg"></i>';
    micBtn.onclick = startLiveSession;

    const sendButton = document.createElement('button');
    sendButton.className = "bg-primary text-white rounded-2xl w-12 h-12 flex-shrink-0 flex items-center justify-center text-lg hover:bg-primary-dark hover:scale-105 shadow-lg shadow-primary/30 transition-all duration-200";
    sendButton.innerHTML = '<i class="fas fa-paper-plane text-sm"></i>';
    sendButton.onclick = send;

    inputControls.append(attachBtn, micBtn, textInput, sendButton);
    inputArea.append(imagePreview, inputControls);

    messageArea.append(chatHistory, inputArea);
    container.append(header, messageArea);

    updateMessages();
    return container;
}
