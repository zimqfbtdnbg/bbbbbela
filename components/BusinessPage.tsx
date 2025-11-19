
import { generateSpecializedContent } from '../services/geminiService.ts';

export function BusinessPage({ onNavigate }) {
    const container = document.createElement('div');
    container.className = 'p-6 bg-bg h-full overflow-y-auto';
    
    let activeTab = 'contract'; // contract, marketing, finance
    let prompt = '';
    let result = '';
    let isLoading = false;

    const render = () => {
        container.innerHTML = '';
        
        // Header
        const header = document.createElement('header');
        header.className = 'flex justify-between items-center mb-6';
        header.innerHTML = `
            <div>
                <h2 class="text-2xl font-black text-text leading-none">Бизнес Центр</h2>
                <span class="text-xs text-text-light font-medium">AI-аналитика и стратегия</span>
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
            { id: 'contract', label: 'Договоры', icon: 'fa-file-signature' },
            { id: 'marketing', label: 'Маркетинг', icon: 'fa-bullhorn' },
            { id: 'finance', label: 'Финансы', icon: 'fa-chart-line' }
        ];
        
        tabs.forEach(t => {
            const btn = document.createElement('button');
            const isActive = activeTab === t.id;
            btn.className = `flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${isActive ? 'bg-text text-white shadow-md' : 'text-text-light hover:text-text'}`;
            btn.innerHTML = `<i class="fas ${t.icon}"></i> <span class="hidden md:inline">${t.label}</span>`;
            btn.onclick = () => { activeTab = t.id; result = ''; render(); };
            tabsContainer.appendChild(btn);
        });
        container.appendChild(tabsContainer);

        // Input Area
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-[2rem] shadow-neo';
        
        const label = document.createElement('label');
        label.className = "text-[10px] font-bold text-text-light uppercase tracking-wider mb-3 block ml-1";
        
        let placeholder = "";
        if (activeTab === 'contract') {
            label.textContent = "Параметры документа";
            placeholder = "Пример: Составь договор оказания услуг веб-разработки между ООО 'Старт' и ИП Иванов на сумму 100 000р...";
        } else if (activeTab === 'marketing') {
            label.textContent = "Продукт и Цели";
            placeholder = "Пример: Стратегия продвижения новой кофейни в центре Москвы для студентов...";
        } else {
            label.textContent = "Финансовая задача";
            placeholder = "Пример: Составь план накоплений на квартиру за 5 лет с доходом 150к...";
        }

        card.appendChild(label);

        const textarea = document.createElement('textarea');
        textarea.className = "w-full bg-bg border-transparent focus:border-primary rounded-2xl px-5 py-4 text-text shadow-inner outline-none transition-all resize-none text-sm font-medium mb-4";
        textarea.rows = 4;
        textarea.placeholder = placeholder;
        textarea.value = prompt;
        textarea.oninput = (e) => prompt = (e.target as HTMLTextAreaElement).value;
        card.appendChild(textarea);

        const btn = document.createElement('button');
        btn.disabled = isLoading || !prompt.trim();
        btn.className = "w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2";
        btn.innerHTML = isLoading ? '<i class="fas fa-spinner fa-spin"></i> Анализ...' : '<i class="fas fa-magic"></i> Сгенерировать';
        btn.onclick = handleGenerate;
        card.appendChild(btn);

        container.appendChild(card);

        // Result Area
        if (result) {
            const resultCard = document.createElement('div');
            resultCard.className = "mt-6 bg-white p-6 rounded-[2rem] shadow-neo animate-fadeIn";
            resultCard.innerHTML = `<div class="prose prose-sm max-w-none text-text">${result.replace(/\n/g, '<br>')}</div>`;
            container.appendChild(resultCard);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        isLoading = true;
        render();
        
        try {
            // Mapping tabs to service types
            const serviceType = activeTab === 'marketing' ? 'business-marketing' : 'business-contract'; // simplified for finance -> contract logic generally works or add new case
            
            const response = await generateSpecializedContent(prompt, serviceType);
            result = response; // Simple markdown rendering
        } catch (e) {
            result = "Ошибка генерации. Попробуйте позже.";
        } finally {
            isLoading = false;
            render();
        }
    };

    render();
    return container;
}
