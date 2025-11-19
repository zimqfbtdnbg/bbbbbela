
export function VideoGalleryPage({ onNavigate }) {
    const container = document.createElement('div');
    container.className = 'p-6 bg-bg min-h-full';
    let videos = [];
    let selectedVideo = null;

    const render = () => {
        container.innerHTML = '';

        const header = document.createElement('header');
        header.className = 'flex justify-between items-center mb-6';
        header.innerHTML = '<h2 class="text-2xl font-black text-text">Галерея</h2>';
        const closeButton = document.createElement('button');
        closeButton.className = 'bg-white w-10 h-10 rounded-xl shadow-sm flex items-center justify-center text-text hover:text-primary transition-colors';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.onclick = () => onNavigate('main-menu');
        header.appendChild(closeButton);
        container.appendChild(header);

        if (videos.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] shadow-neo mx-auto max-w-xs p-8 text-center mt-10';
            emptyState.innerHTML = `
                <div class="w-20 h-20 bg-bg rounded-full flex items-center justify-center mb-6 text-text-light">
                    <i class="fas fa-film text-3xl opacity-50"></i>
                </div>
                <p class="text-text font-bold mb-2">Пусто</p>
                <p class="text-text-light text-xs mb-6">Здесь появятся ваши видеошедевры</p>
            `;
            const createBtn = document.createElement('button');
            createBtn.className = "bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all text-sm";
            createBtn.textContent = 'Создать первое';
            createBtn.onclick = () => onNavigate('video-generation');
            emptyState.appendChild(createBtn);
            container.appendChild(emptyState);
        } else {
            const grid = document.createElement('div');
            grid.className = 'grid grid-cols-2 gap-4';
            videos.forEach(video => {
                const videoCard = document.createElement('div');
                videoCard.className = "group relative rounded-2xl overflow-hidden bg-white shadow-neo hover:shadow-neo-hover transition-all duration-300 cursor-pointer aspect-[9/16] transform hover:-translate-y-1";
                videoCard.onclick = () => { selectedVideo = video; render(); };
                videoCard.innerHTML = `
                    <video src="${video.url}" class="w-full h-full object-cover"></video>
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                       <div class="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-primary shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                           <i class="fas fa-play ml-1 text-sm"></i>
                       </div>
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <p class="text-[10px] text-white truncate font-medium">${video.prompt}</p>
                    </div>
                `;
                grid.appendChild(videoCard);
            });
            container.appendChild(grid);
        }

        if (selectedVideo) {
            const modal = document.createElement('div');
            modal.className = "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn";
            modal.onclick = () => { selectedVideo = null; render(); };
            
            const modalContent = document.createElement('div');
            modalContent.className = 'bg-white p-4 rounded-[2rem] max-w-md w-full shadow-2xl relative';
            modalContent.onclick = (e) => e.stopPropagation();
            modalContent.innerHTML = `
                <div class="relative rounded-xl overflow-hidden bg-black mb-4 shadow-inner">
                    <video src="${selectedVideo.url}" controls autoPlay class="w-full max-h-[70vh] object-contain"></video>
                </div>
                <div class="px-2 pb-2">
                    <p class="text-sm font-bold text-text mb-1 leading-tight">${selectedVideo.prompt}</p>
                    <p class="text-[10px] text-text-light bg-bg inline-block px-2 py-1 rounded-md font-mono mt-2">${new Date(selectedVideo.createdAt).toLocaleDateString()}</p>
                </div>
            `;
            
            const closeModalBtn = document.createElement('button');
            closeModalBtn.className = "absolute -top-12 right-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors backdrop-blur";
            closeModalBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeModalBtn.onclick = () => { selectedVideo = null; render(); };
            
            modal.appendChild(closeModalBtn);
            modal.appendChild(modalContent);
            container.appendChild(modal);
        }
    };

    videos = JSON.parse(localStorage.getItem('belaAiVideoGallery_4_1') || '[]');
    render();

    return container;
}
