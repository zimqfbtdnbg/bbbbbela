
import { LoginPage } from './components/LoginPage.tsx';
import { MainMenuPage } from './components/MainMenuPage.tsx';
import { ChatPage } from './components/ChatPage.tsx';
import { VideoGenerationPage } from './components/VideoGenerationPage.tsx';
import { VideoGalleryPage } from './components/VideoGalleryPage.tsx';
import { DocumentAnalysisPage } from './components/DocumentAnalysisPage.tsx';
import { ProfilePage } from './components/ProfilePage.tsx';
import { BusinessPage } from './components/BusinessPage.tsx';
import { EducationPage } from './components/EducationPage.tsx';
import { CodingPage } from './components/CodingPage.tsx';
import { generateChatMessage } from './services/geminiService.ts';

// --- App State ---
let state = {
    user: null,
    page: 'login',
    messages: [],
    isLoading: false,
};

// --- App Container ---
let root = null;
const appContainer = document.createElement('div');
const mainContent = document.createElement('main');
let bottomNav = null;

// --- State Management ---
function setState(newState) {
    state = { ...state, ...newState };
    render();
}

// --- Event Handlers ---
const handleLogin = (newUser) => {
    localStorage.setItem('belaAiUser_5_0', JSON.stringify(newUser));
    setState({
        user: newUser,
        page: 'main-menu',
        messages: [{
            role: 'model',
            content: `Привет, ${newUser.name}! Добро пожаловать в Bela AI 5.0 Ultimate. Ваша подписка активирована на 10 лет!`,
        }],
    });
    window.location.hash = '#main-menu';
};

const handleLogout = () => {
    localStorage.removeItem('belaAiUser_5_0');
    setState({ user: null, page: 'login', messages: [] });
    window.location.hash = '#login';
};

const handleUpdateUser = (updatedUser) => {
    localStorage.setItem('belaAiUser_5_0', JSON.stringify(updatedUser));
    setState({ user: updatedUser });
};

const handleTransaction = (amount, type) => {
    if (!state.user) return;
    
    const updatedUser = { ...state.user };
    
    if (type === 'add') {
        updatedUser.coins = (updatedUser.coins || 0) + amount;
    } else if (type === 'subtract') {
        if ((updatedUser.coins || 0) < amount) {
            alert("Недостаточно монет!");
            return;
        }
        updatedUser.coins -= amount;
    }
    
    handleUpdateUser(updatedUser);
};

const handleBuySubscription = () => {
    if (!state.user) return;
    
    const COST = 100;
    if ((state.user.coins || 0) >= COST) {
        handleTransaction(COST, 'subtract');
        
        const updatedUser = { ...state.user };
        const currentExpiry = new Date(updatedUser.premiumExpiresAt || Date.now());
        // Add 30 days
        currentExpiry.setDate(currentExpiry.getDate() + 30);
        
        updatedUser.premiumExpiresAt = currentExpiry.toISOString();
        handleUpdateUser(updatedUser);
        
        alert("Подписка успешно продлена на 30 дней!");
    } else {
        alert(`Недостаточно монет. Нужно ${COST}, у вас ${state.user.coins || 0}.`);
    }
};

const handleNavigate = (newPage) => {
    window.location.hash = `#${newPage}`;
};

const handleSendMessage = async (prompt, image, mode, modelId) => {
    const userMessage = { role: 'user', content: prompt, image: image };
    const newMessages = [...state.messages, userMessage];
    setState({ messages: newMessages, isLoading: true });

    try {
        const result = await generateChatMessage(prompt, image, mode, state.messages, modelId);
        const modelMessage = {
            role: 'model',
            content: result.text,
            groundingChunks: result.groundingChunks
        };
        setState({
            messages: [...newMessages, modelMessage],
            isLoading: false
        });
    } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage = {
            role: 'model',
            content: `Произошла ошибка. (${error.message})`,
        };
        setState({
            messages: [...newMessages, errorMessage],
            isLoading: false
        });
    }
};

const handleRequestVerification = (verificationText) => {
    alert("Заявка отправлена! Ожидайте решения.");
    setTimeout(() => {
        if (state.user) {
            const updatedUser = { ...state.user, isVerified: true };
            localStorage.setItem('belaAiUser_5_0', JSON.stringify(updatedUser));
            setState({ user: updatedUser });
        }
    }, 3000);
};

// --- Router ---
function handleRouteChange() {
    const hash = window.location.hash.slice(1);
    const page = hash || (state.user ? 'main-menu' : 'login');
    setState({ page });
}

// --- Components ---
function BottomNavComponent() {
    const container = document.createElement('div');
    container.className = "fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-border-color h-16 flex justify-around items-center md:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]";

    const navItems = [
        { page: 'main-menu', icon: 'fa-th-large', label: 'Хаб' },
        { page: 'chat', icon: 'fa-comment-alt', label: 'Чат' },
        { page: 'video-generation', icon: 'fa-magic', label: 'Видео' },
        { page: 'profile', icon: 'fa-user-circle', label: 'Профиль' },
    ];

    navItems.forEach(item => {
        const isActive = state.page === item.page;
        const button = document.createElement('button');
        button.className = `flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${isActive ? 'text-primary translate-y-[-2px]' : 'text-text-light hover:text-primary'}`;
        button.onclick = () => handleNavigate(item.page);
        
        button.innerHTML = `
            <i class="fas ${item.icon} text-xl mb-1 ${isActive ? 'drop-shadow-sm' : ''}"></i>
            <span class="text-[10px] font-medium tracking-wide">${item.label}</span>
        `;
        container.appendChild(button);
    });

    return container;
}

// --- Render Function ---
function render() {
    mainContent.innerHTML = '';
    let pageComponent;

    if (!state.user) {
        pageComponent = LoginPage({ onLogin: handleLogin });
    } else {
        switch (state.page) {
            case 'main-menu':
                pageComponent = MainMenuPage({ user: state.user, onNavigate: handleNavigate });
                break;
            case 'chat':
                pageComponent = ChatPage({
                    messages: state.messages,
                    onSendMessage: handleSendMessage,
                    isLoading: state.isLoading,
                    setMessages: (newMessages) => setState({ messages: newMessages })
                });
                break;
            case 'video-generation':
                pageComponent = VideoGenerationPage({ onNavigate: handleNavigate });
                break;
            case 'video-gallery':
                pageComponent = VideoGalleryPage({ onNavigate: handleNavigate });
                break;
            case 'document-analysis':
                pageComponent = DocumentAnalysisPage({ onNavigate: handleNavigate });
                break;
            case 'business-center':
                pageComponent = BusinessPage({ onNavigate: handleNavigate });
                break;
            case 'education-hub':
                pageComponent = EducationPage({ onNavigate: handleNavigate });
                break;
            case 'dev-studio':
                pageComponent = CodingPage({ onNavigate: handleNavigate });
                break;
            case 'profile':
                pageComponent = ProfilePage({ 
                    user: state.user, 
                    onLogout: handleLogout, 
                    onUpdateUser: handleUpdateUser, 
                    onNavigate: handleNavigate,
                    onRequestVerification: handleRequestVerification,
                    onTransaction: handleTransaction,
                    onBuySubscription: handleBuySubscription
                });
                break;
            default:
                 window.location.hash = '#main-menu';
                 pageComponent = MainMenuPage({ user: state.user, onNavigate: handleNavigate });
        }
    }
    
    mainContent.appendChild(pageComponent);
    
    if (bottomNav) {
        appContainer.removeChild(bottomNav);
        bottomNav = null;
    }
    if (state.user) {
        bottomNav = BottomNavComponent();
        appContainer.appendChild(bottomNav);
    }
}

// --- App Initialization ---
export default function App(rootElement) {
    root = rootElement;
    root.className = "max-w-screen-md mx-auto min-h-screen flex flex-col md:py-6";
    appContainer.className = "bg-bg md:bg-white md:rounded-[2.5rem] md:shadow-float flex-grow flex flex-col overflow-hidden animate-fadeIn relative z-10 h-[100vh] md:h-[90vh]";
    mainContent.className = "flex-grow overflow-y-auto pb-20 md:pb-0 scroll-smooth no-scrollbar";
    appContainer.appendChild(mainContent);
    root.appendChild(appContainer);

    window.addEventListener('hashchange', handleRouteChange);
    const storedUser = localStorage.getItem('belaAiUser_5_0');
    if (storedUser) {
        state.user = JSON.parse(storedUser);
        state.messages = [{
            role: 'model',
            content: 'Рад вас видеть! Ваш Premium аккаунт активен. Чем займемся?',
        }];
    }
    handleRouteChange();
}
