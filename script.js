// ==================== AUTHENTICATION & ROUTER LOGIC ====================
let isAuthenticated = false;

const allLinks = document.querySelectorAll('.nav-links li, .dropdown-menu li[data-target]');
const views = document.querySelectorAll('.view');

function navigateTo(targetId) {
    // Authentication Guard
    if (!isAuthenticated && targetId !== 'login-view') {
        targetId = 'login-view';
    }

    // Update Sidebar Navigation state if it's a main link
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    const linkEl = document.querySelector(`.nav-links li[data-target="${targetId}"]`);
    if (linkEl) linkEl.classList.add('active');

    // Hide all views and show target
    views.forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById(targetId);
    if (targetView) targetView.classList.add('active');

    // Toggle Navbar visibility based on auth
    const nav = document.getElementById('main-nav');
    if (nav) nav.style.display = isAuthenticated ? 'flex' : 'none';

    // Close any open dropdowns
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) dropdown.classList.remove('show');
}

allLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        if (targetId) navigateTo(targetId);
    });
});

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;

    // Simulate API call and success
    isAuthenticated = true;
    showToast(`¡Bienvenido de nuevo, ${email.split('@')[0]}!`, 'success');
    navigateTo('home-view');
}

function handleLogout() {
    isAuthenticated = false;
    showToast('Has cerrado sesión correctamente.', 'info');
    navigateTo('login-view');
}

// Ensure proper initial state
navigateTo('login-view');


// ==================== GLOBAL UI UTILS (TOASTS) ====================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.style.background = 'var(--surface-color)';
    toast.style.border = '1px solid var(--surface-border)';
    toast.style.padding = '1rem 1.5rem';
    toast.style.borderRadius = '12px';
    toast.style.color = 'white';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    toast.style.animation = 'slideInRight 0.3s ease forwards';
    toast.style.transition = 'opacity 0.3s ease';

    let icon = '<i class="fa-solid fa-circle-info" style="color: #3b82f6;"></i>';
    if (type === 'success') icon = '<i class="fa-solid fa-circle-check" style="color: #10b981;"></i>';
    if (type === 'error') icon = '<i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS keyframe for toast animation if it doesn't exist
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.innerHTML = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// ==================== INTERACTIVE UI HANDLERS ====================
function saveSettings() {
    const btn = document.querySelector('.settings-actions-bottom .btn-primary');
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        showToast('Tus preferencias se han guardado correctamente.', 'success');
    }, 800);
}

function addFriend() {
    showToast('Solicitud de amistad enviada', 'success');
}

function editProfile() {
    showToast('Abriendo el editor de perfil...', 'info');
}

function actionFriend(actionName) {
    showToast(`Acción: ${actionName} en curso...`, 'info');
}

// Bind Logout action to the dropdown menu item
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('.dropdown-menu li:last-child a');
    if (logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            handleLogout();
        };
    }
});

// ==================== PLAYER LOGIC (Ad Simulation) ====================

let mainShakaPlayer = null;
let partyShakaPlayer = null;

document.addEventListener('DOMContentLoaded', () => {
    shaka.polyfill.installAll();
});

let countdownInterval;

function openPlayer(videoSrc) {
    // Switch to player view programmatically
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('player-view').classList.add('active');

    // Reset UI
    document.getElementById('ad-layer').classList.add('active');
    document.getElementById('movie-layer').classList.remove('active');

    // Set Main Video
    if (videoSrc) {
        const mainVideo = document.getElementById('main-video-player');
        if (mainVideo) {
            if (!mainShakaPlayer) {
                mainShakaPlayer = new shaka.Player(mainVideo);
            }
            mainShakaPlayer.load(videoSrc).catch(e => console.error('Error loading video', e));
        }
    }

    let countdown = 5;
    const countdownElement = document.getElementById('ad-countdown');
    countdownElement.innerText = countdown;

    // Start countdown
    countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.innerText = countdown;

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            startMoviePlayback();
        }
    }, 1000);
}

let hasAnsweredPopup = false;

function startMoviePlayback() {
    // Hide Ad, Show Movie
    document.getElementById('ad-layer').classList.remove('active');
    document.getElementById('movie-layer').classList.add('active');

    const mainVideo = document.getElementById('main-video-player');
    if (mainVideo) {
        mainVideo.play();
    }

    if (!hasAnsweredPopup) {
        // Simulate Interaction Popup after 3 seconds of playing
        setTimeout(() => {
            const popup = document.getElementById('interaction-popup');
            if (!popup || hasAnsweredPopup) return;
            const timerSpan = document.getElementById('interaction-timer');
            popup.classList.add('show');

            // Timer for popup
            let pt = 10;
            const popTimer = setInterval(() => {
                pt--;
                if (timerSpan) timerSpan.innerText = pt;
                if (pt <= 0 || !popup.classList.contains('show')) {
                    clearInterval(popTimer);
                    popup.classList.remove('show');
                }
            }, 1000);
        }, 3000);
    }
}

// Points claiming logic
function claimPoints(amount) {
    hasAnsweredPopup = true;
    const popup = document.getElementById('interaction-popup');
    popup.innerHTML = `
        <div class="interaction-content" style="text-align: center; color: #10b981;">
            <h4><i class="fa-solid fa-check-circle"></i> ¡+${amount} Pts!</h4>
            <p>Respuesta registrada</p>
        </div>
    `;

    // Animate points update in header
    const pointsHeader = document.querySelector('.user-points div:nth-child(2)');
    if (pointsHeader) {
        pointsHeader.innerHTML = `<i class="fa-solid fa-bolt"></i> 2,500 pts`;
        pointsHeader.style.color = '#10b981';
        pointsHeader.style.transform = 'scale(1.1)';
        setTimeout(() => {
            pointsHeader.style.color = 'var(--primary)';
            pointsHeader.style.transform = 'scale(1)';
        }, 1000);
    }

    setTimeout(() => {
        popup.classList.remove('show');
        // Hide completely to avoid empty box
        setTimeout(() => { popup.style.display = 'none'; }, 300);
    }, 1500);
}

function closePlayer() {
    clearInterval(countdownInterval);

    const mainVideo = document.getElementById('main-video-player');
    if (mainVideo) {
        mainVideo.pause();
        mainVideo.currentTime = 0;
    }

    if (mainShakaPlayer) {
        mainShakaPlayer.unload();
    }

    const partyVideo = document.getElementById('party-video-player');
    if (partyVideo) {
        partyVideo.pause();
        partyVideo.currentTime = 0;
    }

    if (partyShakaPlayer) {
        partyShakaPlayer.unload();
    }

    // Go back to home
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    document.querySelector('.nav-links li[data-target="home-view"]').classList.add('active');
    document.getElementById('home-view').classList.add('active');
}

// ==================== WATCH PARTY LOGIC ====================
function createRoom() {
    const actionsBlock = document.querySelector('.party-actions');
    const lobbyBlock = document.getElementById('room-lobby');

    // Hide creation actions, show the lobby UI
    actionsBlock.style.display = 'none';
    lobbyBlock.classList.remove('hidden');

    // Add a mock message to chat
    const chatMsgs = document.querySelector('.chat-messages');
    setTimeout(() => {
        chatMsgs.innerHTML += `
            <div class="message">
                <strong>El servidor:</strong> Sala creada. Esperando a que se unan tus amigos...
            </div>
        `;
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }, 500);
}

function startPartyPlayback() {
    const partyVideo = document.getElementById('party-video-player');
    const previewOverlay = document.getElementById('party-preview-overlay');
    const videoSelect = document.getElementById('party-video-select');

    if (partyVideo && previewOverlay) {
        if (videoSelect && videoSelect.value) {
            if (!partyShakaPlayer) {
                partyShakaPlayer = new shaka.Player(partyVideo);
            }
            partyShakaPlayer.load(videoSelect.value).catch(e => console.error('Error loading party video', e));
        }

        previewOverlay.style.display = 'none';
        partyVideo.style.display = 'block';
        partyVideo.play();
        showToast('Reproducción sincronizada iniciada', 'success');

        const chatMsgs = document.querySelector('.chat-messages');
        chatMsgs.innerHTML += `
            <div class="message" style="color:#10b981;">
                <strong>El servidor:</strong> La película ha comenzado en sincronía para todos.
            </div>
        `;
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }
}

// Switching party tabs
function switchPartyTab(tabId) {
    // Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    // If 'global' tab, set the second button active. If 'private', first button active.
    if (tabId === 'global') {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    }

    // Connects
    const privateTab = document.getElementById('private-rooms-tab');
    const globalTab = document.getElementById('global-rooms-tab');

    if (tabId === 'private') {
        privateTab.style.display = 'block';
        globalTab.style.display = 'none';
        setTimeout(() => privateTab.classList.add('active'), 10);
        globalTab.classList.remove('active');
    } else {
        privateTab.style.display = 'none';
        globalTab.style.display = 'block';
        setTimeout(() => globalTab.classList.add('active'), 10);
        privateTab.classList.remove('active');
    }
}

// ==================== TROLLEO & REACTIONS LOGIC ====================
let selectedTargetUser = null;
let currentCredits = 150;

function selectUserForReaction(slotId) {
    // Deselect all
    document.querySelectorAll('#private-users-grid .user-slot').forEach(el => el.classList.remove('selected-target'));

    selectedTargetUser = slotId;
    document.getElementById(slotId).classList.add('selected-target');

    // Enable buttons if enough credits
    checkReactionButtons();
}

function checkReactionButtons() {
    const isUserSelected = selectedTargetUser !== null;
    document.getElementById('btn-react-1').disabled = !(isUserSelected && currentCredits >= 10);
    document.getElementById('btn-react-2').disabled = !(isUserSelected && currentCredits >= 25);
    document.getElementById('btn-react-3').disabled = !(isUserSelected && currentCredits >= 50);
    document.getElementById('btn-react-4').disabled = !(isUserSelected && currentCredits >= 100);
}

function throwReaction(type, cost) {
    if (!selectedTargetUser || currentCredits < cost) return;

    // Deduct credits
    currentCredits -= cost;
    document.getElementById('reaction-credits-display').innerText = currentCredits;
    document.getElementById('credit-balance').innerText = currentCredits;
    checkReactionButtons();

    // Visual Effect
    const previewContainer = document.getElementById('mini-player-preview');

    if (type === 'flashbang') {
        const flash = document.createElement('div');
        flash.className = 'flashbang-effect';
        previewContainer.appendChild(flash);
        setTimeout(() => flash.remove(), 3000);

        const chatMsgs = document.querySelector('.chat-messages');
        chatMsgs.innerHTML += `<div class="message" style="color:#ec4899;"><em>¡Tú has lanzado una CEGADORA a la pantalla! (-100 Cr.)</em></div>`;
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
        return;
    }

    // Projectile Animation
    const emojis = { 'tomato': '🍅', 'water': '💦', 'pie': '🥧' };
    const projectile = document.createElement('div');
    projectile.className = 'throw-animation';
    projectile.innerText = emojis[type];

    // Start from bottom center of the preview
    projectile.style.bottom = '-20px';
    projectile.style.left = '45%';

    // Calculate generic target translation inside the 250px tall container
    projectile.style.setProperty('--tx', '0px');
    projectile.style.setProperty('--ty', '-150px');

    previewContainer.appendChild(projectile);

    setTimeout(() => {
        projectile.remove();

        // Intensity scaling based on cost
        // Tomato (10) -> small, Water (25) -> medium, Pie (50) -> huge
        let intensityFactor = 1;
        let stayDuration = 2000;

        if (type === 'water') { intensityFactor = 1.3; stayDuration = 3000; }
        if (type === 'pie') { intensityFactor = 2; stayDuration = 5000; } // Pie lasts 5 seconds and is huge

        // Show Splash Effect
        const splashClass = type === 'tomato' ? 'splash-tomato' : type === 'water' ? 'splash-water' : 'splash-pie';
        const splash = document.createElement('div');
        splash.className = `screen-splash ${splashClass}`;

        // Apply dynamic scale modifier
        splash.style.transform = `translate(-50%, -50%) scale(${intensityFactor})`;
        splash.style.animation = `splashEffectDynamic ${stayDuration / 1000}s ease-out forwards`;

        previewContainer.appendChild(splash);

        // Remove splash after animation
        setTimeout(() => splash.remove(), stayDuration);

        // Add chat msg
        const targetName = document.querySelector(`#${selectedTargetUser} span`).innerText;
        const msg = type === 'tomato' ? 'tomatazo' : type === 'water' ? 'cubo de agua' : 'tartazo GIGANTE';

        const chatMsgs = document.querySelector('.chat-messages');
        chatMsgs.innerHTML += `<div class="message" style="color:#ec4899;"><em>Has lanzado un ${msg} a ${targetName} (-${cost} Cr.)</em></div>`;
        chatMsgs.scrollTop = chatMsgs.scrollHeight;

    }, 1000);
}

// ==================== STORE LOGIC ====================
function buyCredits(amount) {
    currentCredits += amount;

    // Update displays
    const displays = document.querySelectorAll('#reaction-credits-display, #credit-balance');
    displays.forEach(d => { if (d) d.innerText = currentCredits });

    // Visual feedback
    alert(`¡Has comprado ${amount} Créditos exitosamente!`);
    checkReactionButtons();
}

function buyRental() {
    alert("Has adquirido un Alquiler VIP. Ahora puedes crear una Sala Pública Global para transmitir este Estreno cerrado.");
}

// ==================== PROFILE DROPDOWN LOGIC ====================
function toggleProfileMenu() {
    document.getElementById('profile-dropdown').classList.toggle('show');
}

// Close dropdown when clicking outside
window.addEventListener('click', function (e) {
    const avatarContainer = document.querySelector('.avatar-container');
    if (avatarContainer && !avatarContainer.contains(e.target)) {
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
});
