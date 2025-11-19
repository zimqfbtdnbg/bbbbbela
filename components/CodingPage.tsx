
import { generateSpecializedContent } from '../services/geminiService.ts';

export function CodingPage({ onNavigate }) {
    const container = document.createElement('div');
    container.className = 'p-6 bg-bg h-full overflow-y-auto';
    
    let activeMode = 'debug'; 
    let code = '';
    let result = '';
    let isLoading = false;

    const render = () => {
        container.innerHTML = '';
        
        const header = document.createElement('header');
        header.className = 'flex justify-between items-center mb-6';
        header.innerHTML = `
            <div>
                <h2 class="text-2xl font-black text-text leading-none">Dev Studio</h2>
                <span class="text-xs text-text-light font-medium">Инструменты разработчика</span>
            </div>
        `;
        const closeButton = document.createElement('button');
        closeButton.className = 'bg-white w-10 h-10 rounded-xl shadow-sm flex items-center justify-center text-text hover:text-primary transition-colors';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.onclick = () => onNavigate('main-menu');
        header.appendChild(closeButton);
        container.appendChild(header);

        // Modes
        const modes = document.createElement('div');
        modes.className = 'flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar';
        
        const btns = [
            { id: 'debug', label: 'Debug & Fix', icon: 'fa-bug' },
            { id: 'docs', label: 'Документация', icon: 'fa-book' },
        ];
        
        btns.forEach(b => {
            const btn = document.createElement('button');
            const isActive = activeMode === b.id;
            btn.className = `flex-shrink-0 px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isActive ? 'bg-purple text-white shadow-lg shadow-purple/20' : 'bg-white text-text shadow-sm'}`;
            btn.innerHTML = `<i class="fas ${b.icon}"></i> ${b.label}`;
            btn.onclick = () => { activeMode = b.id; result = ''; render(); };
            modes.appendChild(btn);
        });
        container.appendChild(modes);

        // Code Editor Simulation
        const editorContainer = document.createElement('div');
        editorContainer.className = "bg-[#1e1e1e] rounded-[1.5rem] p-4 shadow-2xl mb-6";
        
        const editorHeader = document.createElement('div');
        editorHeader.className = "flex gap-2 mb-4";
        editorHeader.innerHTML = `<div class="w-3 h-3 rounded-full bg-red-500"></div><div class="w-3 h-3 rounded-full bg-yellow-500"></div><div class="w-3 h-3 rounded-full bg-green-500"></div>`;
        editorContainer.appendChild(editorHeader);

        const textarea = document.createElement('textarea');
        textarea.className = "w-full bg-transparent text-gray-300 font-mono text-xs outline-none resize-none min-h-[200px]";
        textarea.placeholder = "// Вставьте ваш код сюда...";
        textarea.spellcheck = false;
        textarea.value = code;
        textarea.oninput = (e) => code = (e.target as HTMLTextAreaElement).value;
        editorContainer.appendChild(textarea);
        container.appendChild(editorContainer);

        // Action
        const actionBtn = document.createElement('button');
        actionBtn.disabled = isLoading || !code.trim();
        actionBtn.className = "w-full bg-purple text-white font-bold py-4 rounded-xl shadow-lg shadow-purple/20 hover:bg-purple/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mb-8";
        actionBtn.innerHTML = isLoading ? '<i class="fas fa-circle-notch fa-spin"></i> Обработка...' : `<i class="fas fa-play"></i> Запустить ${activeMode === 'debug' ? 'Отладку' : 'Генерацию'}`;
        actionBtn.onclick = handleProcess;
        container.appendChild(actionBtn);

        // Output
        if (result) {
            const output = document.createElement('div');
            output.className = "bg-white p-6 rounded-[2rem] shadow-neo animate-fadeIn";
            output.innerHTML = `
                <h3 class="font-bold text-text mb-3">Результат:</h3>
                <div class="prose prose-sm max-w-none bg-bg p-4 rounded-xl font-mono text-xs overflow-x-auto">${result.replace(/\n/g, '<br>')}</div>
            `;
            container.appendChild(output);
        }
    };

    const handleProcess = async () => {
        if (!code.trim()) return;
        isLoading = true;
        render();
        
        try {
            const serviceType = activeMode === 'debug' ? 'dev-debug' : 'dev-docs';
            const response = await generateSpecializedContent(code, serviceType);
            result = response;
        } catch (e) {
            result = "Ошибка обработки кода.";
        } finally {
            isLoading = false;
            render();
        }
    };

    render();
    return container;
}
