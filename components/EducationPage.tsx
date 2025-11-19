
import { generateSpecializedContent } from '../services/geminiService.ts';

export function EducationPage({ onNavigate }) {
    const container = document.createElement('div');
    container.className = 'p-6 bg-bg h-full overflow-y-auto';
    
    let activeTab = 'plan'; 
    let prompt = '';
    let result = '';
    let isLoading = false;

    const render = () => {
        container.innerHTML = '';
        
        const header = document.createElement('header');
        header.className = 'flex justify-between items-center mb-6';
        header.innerHTML = `
            <div>
                <h2 class="text-2xl font-black text-text leading-none">Education Hub</h2>
                <span class="text-xs text-text-light font-medium">Персональное обучение</span>
            </div>
        `;
        const closeButton = document.createElement('button');
        closeButton.className = 'bg-white w-10 h-10 rounded-xl shadow-sm flex items-center justify-center text-text hover:text-primary transition-colors';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.onclick = () => onNavigate('main-menu');
        header.appendChild(closeButton);
        container.appendChild(header);

        // Tabs
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'bg-white p-1 rounded-2xl flex mb-6 shadow-sm';
        const tabs = [
            { id: 'plan', label: 'План Учебы', icon: 'fa-list-check' },
            { id: 'tutor', label: 'AI Репетитор', icon: 'fa-chalkboard-teacher' },
        ];
        
        tabs.forEach(t => {
            const btn = document.createElement('button');
            const isActive = activeTab === t.id;
            btn.className = `flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${isActive ? 'bg-info text-white shadow-md' : 'text-text-light hover:text-text'}`;
            btn.innerHTML = `<i class="fas ${t.icon}"></i> <span>${t.label}</span>`;
            btn.onclick = () => { activeTab = t.id; result = ''; render(); };
            tabsContainer.appendChild(btn);
        });
        container.appendChild(tabsContainer);

        // Input
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-[2rem] shadow-neo';
        
        const label = document.createElement('div');
        label.className = "text-[10px] font-bold text-text-light uppercase tracking-wider mb-3 block ml-1";
        label.textContent = activeTab === 'plan' ? "Цель обучения" : "Тема урока";
        
        const textarea = document.createElement('textarea');
        textarea.className = "w-full bg-bg border-transparent focus:border-info rounded-2xl px-5 py-4 text-text shadow-inner outline-none transition-all resize-none text-sm font-medium mb-4";
        textarea.rows = 4;
        textarea.placeholder = activeTab === 'plan' ? "Например: Хочу выучить Python для Data Science за 3 месяца с нуля..." : "Например: Объясни квантовую запутанность простыми словами...";
        textarea.value = prompt;
        textarea.oninput = (e) => prompt = (e.target as HTMLTextAreaElement).value;
        card.appendChild(label);
        card.appendChild(textarea);

        const btn = document.createElement('button');
        btn.disabled = isLoading || !prompt.trim();
        btn.className = "w-full bg-info text-white font-bold py-4 rounded-xl shadow-lg shadow-info/20 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2";
        btn.innerHTML = isLoading ? '<i class="fas fa-spinner fa-spin"></i> Думаю...' : '<i class="fas fa-lightbulb"></i> Начать';
        btn.onclick = handleGenerate;
        card.appendChild(btn);
        container.appendChild(card);

        // Result
        if (result) {
            const resultCard = document.createElement('div');
            resultCard.className = "mt-6 bg-white p-6 rounded-[2rem] shadow-neo animate-fadeIn border-l-4 border-info";
            resultCard.innerHTML = `<div class="prose prose-sm max-w-none text-text">${result.replace(/\n/g, '<br>')}</div>`;
            container.appendChild(resultCard);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        isLoading = true;
        render();
        
        try {
            const serviceType = activeTab === 'plan' ? 'edu-plan' : 'edu-tutor';
            const response = await generateSpecializedContent(prompt, serviceType);
            result = response;
        } catch (e) {
            result = "Ошибка. Попробуйте позже.";
        } finally {
            isLoading = false;
            render();
        }
    };

    render();
    return container;
}
