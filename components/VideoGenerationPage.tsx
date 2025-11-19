
import { generateVideo } from '../services/geminiService.ts';

export function VideoGenerationPage({ onNavigate }) {
    const container = document.createElement('div');
    container.className = 'p-6 bg-bg h-full overflow-y-auto';

    let prompt = '';
    let aspectRatio = '16:9';
    let resolution = '720p';
    let isLoading = false;
    let loadingMessage = '';
    let generatedVideoUrl = null;
    let error = null;
    let isKeySelected = false;

    const render = () => {
        container.innerHTML = '';

        const header = document.createElement('header');
        header.className = 'flex justify-between items-center mb-6';
        header.innerHTML = '<h2 class="text-2xl font-black text-text">Видео Студия</h2>';
        const closeButton = document.createElement('button');
        closeButton.className = 'bg-white w-10 h-10 rounded-xl shadow-sm flex items-center justify-center text-text hover:text-primary transition-colors';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.onclick = () => onNavigate('main-menu');
        header.appendChild(closeButton);
        container.appendChild(header);

        const contentCard = document.createElement('div');
        contentCard.className = "bg-white p-6 rounded-[2rem] shadow-neo";

        if (!isKeySelected) {
            const keyPrompt = document.createElement('div');
            keyPrompt.className = 'bg-warning/10 border border-warning/20 text-warning p-6 rounded-2xl mb-6 text-center';
            keyPrompt.innerHTML = `
                <i class="fas fa-key text-3xl mb-3 block"></i>
                <p class="mb-4 text-sm font-bold">Требуется доступ к Veo API</p>
            `;
            const selectKeyBtn = document.createElement('button');
            selectKeyBtn.className = 'bg-warning text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-warning/20 hover:shadow-xl text-sm transition-all';
            selectKeyBtn.textContent = 'Подключить ключ';
            selectKeyBtn.onclick = async () => {
                await window.aistudio.openSelectKey();
                isKeySelected = true;
                render();
            };
            keyPrompt.appendChild(selectKeyBtn);
            contentCard.appendChild(keyPrompt);
        }

        const form = document.createElement('div');
        form.className = 'space-y-6';

        // Prompt
        form.innerHTML += `<div>
            <label class="text-[10px] font-bold text-text-light uppercase tracking-wider mb-2 block ml-1">Сценарий видео</label>
            <textarea id="prompt-textarea" rows="4" placeholder="Опишите вашу идею..." class="w-full bg-bg border-transparent focus:border-primary rounded-2xl px-5 py-4 text-text shadow-inner outline-none transition-all resize-none text-sm font-medium">${prompt}</textarea>
        </div>`;
        
        // Aspect Ratio
        const aspectDiv = document.createElement('div');
        aspectDiv.innerHTML = `<label class="text-[10px] font-bold text-text-light uppercase tracking-wider mb-3 block ml-1">Формат кадра</label>`;
        const aspectButtons = document.createElement('div');
        aspectButtons.className = 'flex gap-3';
        const ratios = [{val: '16:9', label: '16:9', icon: 'fa-tv'}, {val: '9:16', label: '9:16', icon: 'fa-mobile-alt'}];
        ratios.forEach(r => {
            const btn = document.createElement('button');
            const isActive = aspectRatio === r.val;
            btn.className = `flex-1 py-4 rounded-2xl text-sm font-bold transition-all duration-200 border flex flex-col items-center gap-2 ${isActive ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 transform scale-[1.02]' : 'bg-bg text-text-light border-transparent hover:bg-gray-100'}`;
            btn.innerHTML = `<i class="fas ${r.icon} text-xl"></i>${r.label}`;
            btn.onclick = () => { aspectRatio = r.val; render(); };
            aspectButtons.appendChild(btn);
        });
        aspectDiv.appendChild(aspectButtons);
        form.appendChild(aspectDiv);

        // Resolution
        const resDiv = document.createElement('div');
        resDiv.innerHTML = `<label class="text-[10px] font-bold text-text-light uppercase tracking-wider mb-3 block ml-1">Качество</label>`;
        const resButtons = document.createElement('div');
        resButtons.className = 'flex gap-3';
        const resolutions = ['720p', '1080p'];
        resolutions.forEach(r => {
            const btn = document.createElement('button');
            const isActive = resolution === r;
            btn.className = `flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 border ${isActive ? 'bg-text text-white border-text shadow-md' : 'bg-white text-text border-border-color hover:border-text'}`;
            btn.textContent = r;
            btn.onclick = () => { resolution = r; render(); };
            resButtons.appendChild(btn);
        });
        resDiv.appendChild(resButtons);
        form.appendChild(resDiv);

        // Generate Button
        const generateBtn = document.createElement('button');
        generateBtn.disabled = isLoading || !isKeySelected;
        generateBtn.className = "w-full mt-6 bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-5 px-6 rounded-2xl hover:shadow-neo-hover transform active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-neo";
        generateBtn.innerHTML = isLoading ? 'Создаем шедевр...' : '<i class="fas fa-clapperboard mr-2"></i> Сгенерировать';
        generateBtn.onclick = handleGenerate;
        form.appendChild(generateBtn);
        
        if (error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = "text-center text-danger text-xs font-bold p-4 bg-danger/5 rounded-2xl mt-4 border border-danger/10";
            errorDiv.textContent = error;
            form.appendChild(errorDiv);
        }

        if (isLoading) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = "text-center p-8 mt-6 bg-bg rounded-3xl";
            loadingDiv.innerHTML = `
                <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-text font-bold text-sm animate-pulse">${loadingMessage}</p>`;
            form.appendChild(loadingDiv);
        }
        
        if (generatedVideoUrl) {
            const resultDiv = document.createElement('div');
            resultDiv.className = "mt-8 animate-fadeIn";
            const videoEl = document.createElement('video');
            videoEl.src = generatedVideoUrl;
            videoEl.controls = true;
            videoEl.className = "rounded-2xl shadow-float w-full mb-4 bg-black";
            resultDiv.appendChild(videoEl);
            const galleryBtn = document.createElement('button');
            galleryBtn.className = "w-full bg-white border-2 border-bg text-text font-bold py-4 px-4 rounded-2xl hover:border-primary hover:text-primary transition-colors";
            galleryBtn.textContent = 'Смотреть в галерее';
            galleryBtn.onclick = () => onNavigate('video-gallery');
            resultDiv.appendChild(galleryBtn);
            form.appendChild(resultDiv);
        }

        contentCard.appendChild(form);
        container.appendChild(contentCard);
        
        const promptTextarea = container.querySelector('#prompt-textarea');
        if (promptTextarea) {
            promptTextarea.addEventListener('input', (e) => prompt = (e.target as HTMLTextAreaElement).value);
        }
    };
    
    const saveToGallery = (url) => {
        const newVideo = {
            id: `vid_${Date.now()}`,
            prompt,
            url,
            createdAt: new Date().toISOString(),
        };
        const gallery = JSON.parse(localStorage.getItem('belaAiVideoGallery_4_1') || '[]');
        gallery.unshift(newVideo);
        localStorage.setItem('belaAiVideoGallery_4_1', JSON.stringify(gallery));
    };
    
    const handleGenerate = async () => {
        if (!prompt.trim()) { error = "Напишите сценарий для видео."; render(); return; }
        if (!isKeySelected) { error = "Нужен API ключ."; render(); return; }
        isLoading = true; error = null; generatedVideoUrl = null; render();
        try {
            const videoUrl = await generateVideo(prompt, aspectRatio, resolution, (msg) => { loadingMessage = msg; render(); });
            generatedVideoUrl = videoUrl;
            saveToGallery(videoUrl);
        } catch (err) {
            console.error(err);
            error = err.message || "Сбой генерации.";
            if (err.message.includes('Ошибка API ключа')) isKeySelected = false;
        } finally {
            isLoading = false; loadingMessage = ''; render();
        }
    };

    (async () => {
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) isKeySelected = true;
        render();
    })();

    return container;
}
