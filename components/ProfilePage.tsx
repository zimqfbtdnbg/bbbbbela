
export function ProfilePage({ user, onLogout, onUpdateUser, onNavigate, onRequestVerification, onTransaction, onBuySubscription }) {
    const container = document.createElement('div');
    container.className = 'p-6 bg-bg h-full overflow-y-auto';
    
    const renderContent = () => {
        container.innerHTML = ''; 

        // Header
        const header = document.createElement('header');
        header.className = 'flex justify-between items-center mb-6';
        header.innerHTML = '<h2 class="text-2xl font-black text-text">Профиль</h2>';
        const closeButton = document.createElement('button');
        closeButton.className = 'bg-white w-10 h-10 rounded-xl shadow-sm flex items-center justify-center text-text hover:text-primary transition-colors';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.onclick = () => onNavigate('main-menu');
        header.appendChild(closeButton);
        container.appendChild(header);

        // Profile Card
        const profileCard = document.createElement('div');
        profileCard.className = 'bg-white p-6 rounded-[2rem] shadow-neo mb-6 relative overflow-hidden';
        
        // Decorative background blob
        const blob = document.createElement('div');
        blob.className = 'absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl';
        profileCard.appendChild(blob);

        const profileInner = document.createElement('div');
        profileInner.className = "relative z-10 flex flex-col items-center";

        // Avatar
        const avatarContainer = document.createElement('div');
        avatarContainer.className = 'relative mb-4 group cursor-pointer';
        const avatarLabel = document.createElement('label');
        avatarLabel.className = "block";
        const img = document.createElement('img');
        img.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=5E72E4&color=fff&size=128`;
        img.className = 'w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg group-hover:shadow-xl transition-all';
        
        const editBadge = document.createElement('div');
        editBadge.className = 'absolute bottom-0 right-0 bg-text text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-white';
        editBadge.innerHTML = '<i class="fas fa-camera text-xs"></i>';
        
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.className = 'hidden';
        fileInput.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (ev.target) {
                         onUpdateUser({ ...user, avatar: ev.target.result });
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        
        avatarLabel.append(img, editBadge, fileInput);
        avatarContainer.appendChild(avatarLabel);

        // Name & Status
        const nameEl = document.createElement('h3');
        nameEl.className = 'text-xl font-bold text-text flex items-center gap-2';
        nameEl.innerHTML = `${user.name} ${user.isVerified ? '<i class="fas fa-check-circle text-primary"></i>' : ''}`;
        
        const idEl = document.createElement('p');
        idEl.className = 'text-text-light text-xs font-mono mb-4 bg-gray-100 px-2 py-1 rounded-md';
        idEl.textContent = user.id.split('_')[1];

        profileInner.append(avatarContainer, nameEl, idEl);
        profileCard.appendChild(profileInner);
        container.appendChild(profileCard);

        // Wallet & Subscription Section
        const statsGrid = document.createElement('div');
        statsGrid.className = "grid grid-cols-2 gap-4 mb-6";

        // Coins Card
        const coinsCard = document.createElement('div');
        coinsCard.className = "bg-white p-5 rounded-3xl shadow-neo flex flex-col items-center justify-center relative overflow-hidden group";
        coinsCard.innerHTML = `
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold to-yellow-300"></div>
            <i class="fas fa-coins text-3xl text-gold mb-2 group-hover:scale-110 transition-transform"></i>
            <span class="text-2xl font-black text-text">${user.coins || 0}</span>
            <span class="text-xs text-text-light font-medium uppercase tracking-wider">Монеты</span>
        `;
        statsGrid.appendChild(coinsCard);

        // Premium Status Card
        const isPremium = user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date();
        const premiumCard = document.createElement('div');
        premiumCard.className = "bg-white p-5 rounded-3xl shadow-neo flex flex-col items-center justify-center relative overflow-hidden";
        const daysLeft = isPremium ? Math.ceil((new Date(user.premiumExpiresAt).getTime() - Date.now()) / (1000 * 3600 * 24)) : 0;
        
        premiumCard.innerHTML = `
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-light"></div>
            <i class="fas fa-crown text-3xl ${isPremium ? 'text-primary' : 'text-gray-300'} mb-2"></i>
            <span class="text-lg font-bold text-text">${isPremium ? (daysLeft > 3650 ? '10 Лет' : daysLeft + ' дн.') : 'Free'}</span>
            <span class="text-xs text-text-light font-medium uppercase tracking-wider">Статус</span>
        `;
        statsGrid.appendChild(premiumCard);
        container.appendChild(statsGrid);

        // Actions Menu
        const menu = document.createElement('div');
        menu.className = "space-y-4";

        // Earn Coins Action
        const earnBtn = document.createElement('button');
        earnBtn.className = "w-full bg-white p-4 rounded-2xl shadow-neo flex items-center justify-between group hover:shadow-neo-hover transition-all";
        earnBtn.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-success text-xl">
                    <i class="fas fa-play"></i>
                </div>
                <div class="text-left">
                    <h4 class="font-bold text-text">Заработать монеты</h4>
                    <p class="text-xs text-text-light">Смотреть рекламу (+10 монет)</p>
                </div>
            </div>
            <i class="fas fa-chevron-right text-gray-300 group-hover:text-primary"></i>
        `;
        earnBtn.onclick = () => {
            const btnIcon = earnBtn.querySelector('.fa-play');
            if (btnIcon) {
                btnIcon.className = "fas fa-spinner fa-spin";
                setTimeout(() => {
                    onTransaction(10, 'add');
                    btnIcon.className = "fas fa-check";
                    setTimeout(() => renderContent(), 1000);
                }, 1500);
            }
        };
        menu.appendChild(earnBtn);

        // Buy Premium Action
        const buyBtn = document.createElement('button');
        buyBtn.className = "w-full bg-white p-4 rounded-2xl shadow-neo flex items-center justify-between group hover:shadow-neo-hover transition-all";
        buyBtn.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xl">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="text-left">
                    <h4 class="font-bold text-text">Продлить Premium</h4>
                    <p class="text-xs text-text-light">100 монет / месяц</p>
                </div>
            </div>
            <div class="bg-bg px-3 py-1 rounded-lg text-xs font-bold text-text group-hover:bg-primary group-hover:text-white transition-colors">100 <i class="fas fa-coins text-[10px]"></i></div>
        `;
        buyBtn.onclick = onBuySubscription;
        menu.appendChild(buyBtn);

        // Verify Action
        if (!user.isVerified) {
            const verifyBtn = document.createElement('button');
            verifyBtn.className = "w-full bg-white p-4 rounded-2xl shadow-neo flex items-center justify-between group hover:shadow-neo-hover transition-all";
            verifyBtn.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 text-xl">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="text-left">
                        <h4 class="font-bold text-text">Верификация</h4>
                        <p class="text-xs text-text-light">Получить синюю галочку</p>
                    </div>
                </div>
                <i class="fas fa-chevron-right text-gray-300 group-hover:text-primary"></i>
            `;
            verifyBtn.onclick = () => onRequestVerification("User requested verification");
            menu.appendChild(verifyBtn);
        }

        // Logout Action
        const logoutBtn = document.createElement('button');
        logoutBtn.className = "w-full mt-6 p-4 text-danger font-bold text-sm hover:bg-danger/5 rounded-2xl transition-colors flex items-center justify-center gap-2";
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Выйти из аккаунта';
        logoutBtn.onclick = onLogout;
        menu.appendChild(logoutBtn);

        container.appendChild(menu);
    };

    renderContent();
    return container;
}
