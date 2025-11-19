
import { analyzeDocument } from '../services/geminiService.ts';

export function DocumentAnalysisPage({ onNavigate }) {
    let documentText = null;
    let fileName = '';
    let messages = [];
    let input = '';
    let isLoading = false;
    
    const container = document.createElement('div');
    container.className = 'p-6 h-full flex flex-col bg-bg';

    const render = () => {
        container.innerHTML = '';

        const header = document.createElement('header');
        header.className = 'flex justify-between items-center mb-6 flex-shrink-0';
        header.innerHTML = '<h2 class="text-2xl font-black text-text">Анализ Документов</h2>';
        const closeButton = document.createElement('button');
        closeButton.className = 'bg-white w-10 h-10 rounded-xl shadow-sm flex items-center justify-center text-text hover:text-primary transition-colors';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.onclick = () => onNavigate('main-menu');
        header.appendChild(closeButton);
        container.appendChild(header);

        const card = document.createElement('div');
        card.className = "flex-grow flex flex-col bg-white rounded-[2rem] shadow-neo overflow-hidden relative";

        if (!documentText) {
            const uploader = document.createElement('div');
            uploader.className = 'flex-grow flex flex-col items-center justify-center text-center p-8';
            uploader.innerHTML = `
                <div class="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <i class="fas fa-file-lines text-4xl text-orange-400"></i>
                </div>
                <h3 class="text-xl font-bold text-text mb-3">Загрузка документа</h3>
                <p class="text-text-light mb-8 max-w-xs text-sm font-medium">Загрузите .txt файл, и ИИ проанализирует его структуру и содержание.</p>
            `;
            const uploadLabel = document.createElement('label');
            uploadLabel.className = 'bg-text text-white font-bold py-4 px-8 rounded-2xl hover:bg-black shadow-lg transition-all cursor-pointer flex items-center gap-3 transform hover:-translate-y-1';
            uploadLabel.innerHTML = '<i class="fas fa-upload"></i> <span>Выбрать файл</span>';
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.txt';
            fileInput.className = 'hidden';
            fileInput.onchange = handleFileUpload;
            uploadLabel.appendChild(fileInput);
            uploader.appendChild(uploadLabel);
            card.appendChild(uploader);
        } else {
            const chatContainer = document.createElement('div');
            chatContainer.className = 'flex-grow flex flex-col overflow-hidden h-full';
            
            const fileInfo = document.createElement('div');
            fileInfo.className = 'flex-shrink-0 p-5 bg-gray-50/80 backdrop-blur border-b border-gray-100 flex justify-between items-center';
            fileInfo.innerHTML = `
                <div class="flex items-center gap-3">
                   <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-orange-500 border border-gray-100">
                        <i class="fas fa-file-alt"></i>
                   </div>
                   <div>
                       <span class="font-bold text-text text-sm block">${fileName}</span>
                       <span class="text-[10px] text-text-light font-bold uppercase tracking-wider">Анализ активен</span>
                   </div>
                </div>
            `;
            const resetButton = document.createElement('button');
            resetButton.className = 'text-xs bg-white px-3 py-2 rounded-lg text-danger hover:bg-danger hover:text-white transition-colors font-bold shadow-sm border border-gray-100';
            resetButton.innerHTML = '<i class="fas fa-trash-alt mr-1"></i> Сброс';
            resetButton.onclick = handleReset;
            fileInfo.appendChild(resetButton);
            chatContainer.appendChild(fileInfo);

            const messageList = document.createElement('div');
            messageList.className = 'flex-grow overflow-y-auto p-5 space-y-5';
            messages.forEach(msg => {
                messageList.innerHTML += `
                    <div class="flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn">
                        <div class="max-w-[90%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-text text-white rounded-tr-sm' : 'bg-white text-text border border-gray-100 rounded-tl-sm shadow-neo'}">
                            <div class="prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}">${msg.content.replace(/\n/g, '<br />')}</div>
                        </div>
                    </div>
                `;
            });
            if (isLoading) {
                 messageList.innerHTML += `
                     <div class="flex justify-start animate-fadeIn">
                        <div class="p-4 rounded-2xl rounded-tl-sm bg-white border border-gray-100 shadow-neo">
                            <div class="flex items-center gap-1.5">
                                <div class="w-1.5 h-1.5 bg-text rounded-full animate-bounce"></div>
                                <div class="w-1.5 h-1.5 bg-text rounded-full animate-bounce delay-150"></div>
                                <div class="w-1.5 h-1.5 bg-text rounded-full animate-bounce delay-300"></div>
                            </div>
                        </div>
                    </div>
                `;
            }
            const chatEndRef = document.createElement('div');
            messageList.appendChild(chatEndRef);
            setTimeout(() => chatEndRef.scrollIntoView({ behavior: 'smooth' }), 0);
            chatContainer.appendChild(messageList);

            const inputArea = document.createElement('div');
            inputArea.className = 'p-4 bg-white border-t border-gray-100 flex-shrink-0';
            const inputGroup = document.createElement('div');
            inputGroup.className = 'flex items-center gap-2';
            const textInput = document.createElement('textarea');
            textInput.value = input;
            textInput.oninput = (e) => input = (e.target as HTMLTextAreaElement).value;
            textInput.placeholder = 'Задайте вопрос по документу...';
            textInput.rows = 1;
            textInput.className = 'flex-grow bg-bg border-transparent rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none placeholder-text-light/70';
            textInput.onkeypress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
            
            const sendButton = document.createElement('button');
            sendButton.disabled = isLoading;
            sendButton.className = 'bg-text text-white rounded-2xl w-12 h-12 flex-shrink-0 flex items-center justify-center text-lg hover:bg-black transition-colors disabled:opacity-50 shadow-md';
            sendButton.innerHTML = '<i class="fas fa-arrow-up text-sm"></i>';
            sendButton.onclick = handleSendMessage;
            
            inputGroup.append(textInput, sendButton);
            inputArea.appendChild(inputGroup);
            chatContainer.appendChild(inputArea);
            card.appendChild(chatContainer);
        }
        
        container.appendChild(card);
    };
    
    const handleFileUpload = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file && file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (event) => {
                documentText = event.target?.result;
                fileName = file.name;
                messages = [{
                    role: 'model',
                    content: `Документ **${file.name}** загружен. Я готов отвечать на вопросы.`
                }];
                render();
            };
            reader.readAsText(file);
        } else {
            alert("Только файлы .txt");
        }
    };
    
    const handleSendMessage = async () => {
        if (!input.trim() || !documentText) return;
        messages = [...messages, { role: 'user', content: input }];
        const currentInput = input; input = ''; isLoading = true; render();
        try {
            const responseText = await analyzeDocument(documentText, currentInput);
            messages = [...messages, { role: 'model', content: responseText }];
        } catch (error) {
            messages = [...messages, { role: 'model', content: `Ошибка: ${error.message}` }];
        } finally {
            isLoading = false; render();
        }
    };

    const handleReset = () => { documentText = null; fileName = ''; messages = []; render(); };

    render();
    return container;
}
