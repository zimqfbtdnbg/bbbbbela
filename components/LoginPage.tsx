
export function LoginPage({ onLogin }) {
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center h-full p-8 bg-bg';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'w-full max-w-sm flex flex-col items-center animate-fadeIn';

    // Logo
    const logoContainer = document.createElement('div');
    logoContainer.className = 'relative mb-10';
    const icon = document.createElement('div');
    icon.className = 'w-24 h-24 bg-gradient-to-tr from-primary to-primary-light rounded-3xl flex items-center justify-center shadow-neo-hover text-white text-4xl transform rotate-3';
    icon.innerHTML = '<i class="fas fa-brain"></i>';
    logoContainer.appendChild(icon);

    const title = document.createElement('h1');
    title.className = 'text-4xl font-black mb-2 text-text tracking-tight text-center';
    title.textContent = 'Bela AI 5.0';

    const badge = document.createElement('span');
    badge.className = "bg-gradient-to-r from-gold to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-widest shadow-lg";
    badge.textContent = "Ultimate Edition";

    const subtitle = document.createElement('p');
    subtitle.className = 'mb-8 text-text-light text-center text-sm font-medium leading-relaxed';
    subtitle.textContent = 'Добро пожаловать в будущее. Получите 10 лет Premium подписки и доступ к Super App функциям.';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Как вас зовут?';
    input.className = 'w-full bg-white border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 mb-4 text-text placeholder-text-light/50 shadow-neo focus:shadow-neo-hover outline-none transition-all font-medium text-center';

    const button = document.createElement('button');
    button.className = 'w-full bg-text text-white font-bold py-4 px-6 rounded-2xl hover:bg-black hover:shadow-lg transform active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-neo';
    button.innerHTML = '<span>Активировать систему</span> <i class="fas fa-arrow-right"></i>';
    button.disabled = true;

    const handleCreateProfile = () => {
        if (input.value.trim()) {
            // 10 Years from now
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 10);

            const newUser = {
                id: `user_${Date.now()}`,
                name: input.value.trim(),
                createdAt: new Date().toISOString(),
                isVerified: false,
                coins: 100, // Increased Welcome Bonus for 5.0
                premiumExpiresAt: expiryDate.toISOString(),
                avatar: null
            };
            onLogin(newUser);
        }
    };

    input.addEventListener('input', () => {
        button.disabled = !input.value.trim();
        if(input.value.trim()) {
            button.classList.add('bg-primary');
            button.classList.remove('bg-text');
        } else {
            button.classList.add('bg-text');
            button.classList.remove('bg-primary');
        }
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleCreateProfile();
        }
    });

    button.addEventListener('click', handleCreateProfile);

    contentWrapper.append(logoContainer, title, badge, subtitle, input, button);
    container.appendChild(contentWrapper);

    return container;
}
