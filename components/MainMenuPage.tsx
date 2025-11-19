
function MenuSection({ title, children }) {
    const section = document.createElement('div');
    section.className = "mb-6 animate-fadeIn";
    section.innerHTML = `<h3 class="text-xs font-black text-text-light uppercase tracking-wider mb-3 pl-1">${title}</h3>`;
    const grid = document.createElement('div');
    grid.className = "grid grid-cols-2 gap-4";
    children.forEach(child => grid.appendChild(child));
    section.appendChild(grid);
    return section;
}

function MainMenuCard({ icon, title, subtitle, onClick, className = '', colorClass = 'text-primary', badge = null }) {
    const button = document.createElement('button');
    button.onclick = onClick;
    button.className = `bg-white p-4 rounded-3xl flex flex-col items-start justify-between text-left shadow-neo hover:shadow-neo-hover transform hover:-translate-y-1 transition-all duration-300 group min-h-[140px] relative overflow-hidden ${className}`;
    
    let badgeHTML = '';
    if (badge) {
        badgeHTML = `<div class="absolute top-3 right-3 bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-md">${badge}</div>`;
    }

    button.innerHTML = `
        ${badgeHTML}
        <div class="absolute -right-4 -bottom-4 text-8xl opacity-[0.03] group-hover:opacity-[0.06] transition-opacity text-text pointer-events-none">
            <i class="fas ${icon}"></i>
        </div>
        <div class="w-10 h-10 bg-bg rounded-xl flex items-center justify-center mb-2 group-hover:bg-${colorClass}/10 transition-colors z-10">
            <i class="fas ${icon} text-lg ${colorClass}"></i>
        </div>
        <div class="z-10 w-full">
            <h3 class="font-bold text-text text-sm leading-tight mb-1">${title}</h3>
            <p class="text-[10px] text-text-light font-medium leading-tight">${subtitle}</p>
        </div>
    `;
    return button;
}

export function MainMenuPage({ user, onNavigate }) {
    const container = document.createElement('div');
    container.className = 'p-6 bg-bg h-full overflow-y-auto pb-24 scroll-smooth';

    // Header
    const header = document.createElement('header');
    header.className = 'flex justify-between items-center mb-8 sticky top-0 bg-bg z-20 py-2';
    
    const welcome = document.createElement('div');
    welcome.innerHTML = `
        <div class="flex items-center gap-2 mb-1">
             <span class="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-md">v5.0</span>
             ${user.isVerified ? '<i class="fas fa-check-circle text-primary text-xs"></i>' : ''}
        </div>
        <h1 class="text-2xl font-black text-text">
            Привет, ${user.name.split(' ')[0]}
        </h1>
    `;

    const coinBadge = document.createElement('div');
    coinBadge.className = "bg-white px-3 py-1.5 rounded-full shadow-neo flex items-center gap-2 border border-transparent hover:border-primary/20 cursor-pointer transition-all";
    coinBadge.onclick = () => onNavigate('profile');
    coinBadge.innerHTML = `
        <i class="fas fa-coins text-gold"></i>
        <span class="font-bold text-sm text-text">${user.coins || 0}</span>
    `;

    header.append(welcome, coinBadge);
    container.appendChild(header);

    // 1. Productivity Hub (Business)
    const businessCards = [
        MainMenuCard({
            icon: "fa-briefcase",
            title: "Бизнес Центр",
            subtitle: "Договоры, Маркетинг, Финансы",
            onClick: () => onNavigate('business-center'),
            colorClass: "text-text",
            className: "col-span-2 bg-gradient-to-br from-white to-gray-50"
        })
    ];
    container.appendChild(MenuSection({ title: "Продуктивность", children: businessCards }));

    // 2. Learning Hub (Education)
    const eduCards = [
        MainMenuCard({
            icon: "fa-graduation-cap",
            title: "Учеба & Тьютор",
            subtitle: "Планы и помощь",
            onClick: () => onNavigate('education-hub'),
            colorClass: "text-info"
        }),
        MainMenuCard({
            icon: "fa-code",
            title: "Dev Studio",
            subtitle: "Код и отладка",
            onClick: () => onNavigate('dev-studio'),
            colorClass: "text-purple"
        })
    ];
    container.appendChild(MenuSection({ title: "Обучение и Разработка", children: eduCards }));

    // 3. Creative Hub
    const creativeCards = [
        MainMenuCard({
            icon: "fa-robot",
            title: "Bela Chat",
            subtitle: "Умный помощник",
            onClick: () => onNavigate('chat'),
            colorClass: "text-primary",
            badge: "LIVE"
        }),
        MainMenuCard({
            icon: "fa-video",
            title: "Видео Генерация",
            subtitle: "Veo Engine",
            onClick: () => onNavigate('video-generation'),
            colorClass: "text-pink-500"
        }),
        MainMenuCard({
            icon: "fa-file-alt",
            title: "Анализ док-ов",
            subtitle: "Работа с данными",
            onClick: () => onNavigate('document-analysis'),
            colorClass: "text-orange-500"
        }),
        MainMenuCard({
            icon: "fa-photo-video",
            title: "Медиа Галерея",
            subtitle: "Ваши файлы",
            onClick: () => onNavigate('video-gallery'),
            colorClass: "text-green-500"
        })
    ];
    container.appendChild(MenuSection({ title: "Творчество", children: creativeCards }));

    // Footer link
    const footer = document.createElement('div');
    footer.className = "text-center mt-8 mb-4";
    const profileBtn = document.createElement('button');
    profileBtn.className = "text-text-light text-xs font-medium hover:text-primary transition-colors";
    profileBtn.innerHTML = '<i class="fas fa-cog mr-1"></i> Настройки профиля';
    profileBtn.onclick = () => onNavigate('profile');
    footer.appendChild(profileBtn);
    container.appendChild(footer);

    return container;
}
