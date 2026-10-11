import { store } from '../store.js';

export function renderNavbar(container) {
  const state = store.state;
  const favCount = state.favorites.length;
  const user = state.user;

  const html = `
    <nav class="fixed top-0 left-0 right-0 w-full z-50 glass-panel shadow-2xl h-20 transition-all duration-300 border-b border-white/10" id="main-nav">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex justify-between items-center h-full">
        <!-- Logo -->
        <div class="flex items-center gap-6 md:gap-8">
          <a href="#home" class="flex items-center gap-2 group cursor-pointer" data-route="home">
            <span class="font-display text-2xl md:text-3xl font-bold tracking-tight text-white glow-text group-hover:text-secondary transition-colors">Home<span class="text-secondary">Hub</span></span>
            <span class="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border border-secondary/40 text-secondary bg-secondary/10">Ultra-Prime</span>
          </a>

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center gap-6 text-sm font-medium">
            <button class="nav-link ${state.currentRoute === 'home' ? 'text-secondary border-b-2 border-secondary font-semibold' : 'text-gray-300 hover:text-secondary'} py-2 transition-all cursor-pointer" data-route="home">
              Home
            </button>
            <button class="nav-link ${state.currentRoute === 'browse' ? 'text-secondary border-b-2 border-secondary font-semibold' : 'text-gray-300 hover:text-secondary'} py-2 transition-all cursor-pointer" data-route="browse">
              Browse Estates
            </button>
            <button class="nav-link ${state.currentRoute === 'digital-twin' ? 'text-secondary border-b-2 border-secondary font-semibold' : 'text-gray-300 hover:text-secondary'} py-2 transition-all flex items-center gap-1.5 cursor-pointer" data-route="digital-twin">
              <span class="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              3D Digital Twin
            </button>
            <button class="nav-link ${state.currentRoute === 'advisors' ? 'text-secondary border-b-2 border-secondary font-semibold' : 'text-gray-300 hover:text-secondary'} py-2 transition-all cursor-pointer" data-route="advisors">
              Elite Advisors
            </button>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="flex items-center gap-2 sm:gap-3 md:gap-4">
          <!-- Live Analytics Tracker Trigger -->
          <button class="p-2 sm:p-2.5 rounded-full glass-card text-emerald-400 hover:text-emerald-300 hover:border-emerald-400/50 relative transition-all cursor-pointer group flex items-center justify-center" id="nav-tracker-btn" title="Live Visitor & Login Tracker">
            <span class="material-symbols-outlined text-[18px] sm:text-[20px]">monitoring</span>
            <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>

          <!-- Search Button -->
          <button class="p-2 sm:p-2.5 rounded-full glass-card text-gray-300 hover:text-secondary hover:border-secondary transition-all cursor-pointer" id="nav-search-btn" title="Search properties">
            <span class="material-symbols-outlined text-[18px] sm:text-[20px]">search</span>
          </button>

          <!-- Favorites Drawer Trigger -->
          <button class="p-2 sm:p-2.5 rounded-full glass-card text-gray-300 hover:text-secondary hover:border-secondary relative transition-all cursor-pointer" id="nav-favorites-btn" title="Saved Estates">
            <span class="material-symbols-outlined text-[18px] sm:text-[20px] ${favCount > 0 ? 'text-secondary fill-1' : ''}">favorite</span>
            ${favCount > 0 ? `<span class="absolute -top-1 -right-1 bg-secondary text-black font-bold text-[10px] w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-lg">${favCount}</span>` : ''}
          </button>

          <!-- List Property CTA -->
          <button class="hidden md:flex btn-primary px-4 lg:px-5 py-2 lg:py-2.5 text-xs font-bold tracking-wider rounded-full shadow-[0_0_20px_rgba(68,226,205,0.3)] hover:shadow-[0_0_30px_rgba(68,226,205,0.6)] cursor-pointer" data-route="list-property">
            <span class="material-symbols-outlined text-[18px]">add_home</span>
            LIST PROPERTY
          </button>

          <!-- Authentication Profile / Sign In -->
          ${user ? `
            <div class="relative" id="user-menu-container">
              <button class="flex items-center gap-2 p-1 sm:p-1.5 pr-2 sm:pr-3 rounded-full glass-card hover:border-secondary transition-all cursor-pointer group" id="user-menu-btn" title="User Profile">
                <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary/20 border border-secondary/40 text-secondary font-bold text-xs flex items-center justify-center overflow-hidden">
                  ${user.avatarUrl ? `<img src="${user.avatarUrl}" alt="${user.fullName || 'User'}" class="w-full h-full object-cover">` : ((user.fullName?.[0] || user.email?.[0] || 'U').toUpperCase())}
                </div>
                <div class="hidden md:flex flex-col text-left">
                  <span class="text-xs font-semibold text-white group-hover:text-secondary transition-colors leading-tight max-w-[100px] truncate">${user.fullName || user.email.split('@')[0]}</span>
                  <span class="text-[9px] uppercase tracking-wider text-secondary font-bold">${user.role || 'Client'}</span>
                </div>
                <span class="material-symbols-outlined text-[16px] text-gray-400 group-hover:text-secondary transition-colors">expand_more</span>
              </button>

              <!-- Profile Dropdown Menu -->
              <div class="hidden absolute right-0 mt-2 w-60 glass-panel-heavy rounded-2xl p-2 border border-white/10 shadow-2xl z-50 text-xs backdrop-blur-xl animate-[fadeIn_0.15s_ease-out]" id="user-dropdown">
                <div class="px-3 py-2.5 border-b border-white/10 mb-1">
                  <p class="font-bold text-white truncate">${user.fullName || 'HomeHub Member'}</p>
                  <p class="text-[10px] text-gray-400 truncate">${user.email}</p>
                  <div class="mt-1 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span class="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Active Session</span>
                  </div>
                </div>
                <button class="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-emerald-300 hover:text-emerald-200 flex items-center gap-2.5 cursor-pointer transition-colors" id="nav-dropdown-tracker">
                  <span class="material-symbols-outlined text-[16px] text-emerald-400">insights</span>
                  Live Visitor & Login Tracker
                </button>
                <button class="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-gray-200 hover:text-secondary flex items-center gap-2.5 cursor-pointer transition-colors" id="nav-dropdown-favs">
                  <span class="material-symbols-outlined text-[16px] text-secondary">favorite</span>
                  Saved Estates (${favCount})
                </button>
                <button class="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-gray-200 hover:text-secondary flex items-center gap-2.5 cursor-pointer transition-colors" id="nav-dropdown-tours">
                  <span class="material-symbols-outlined text-[16px] text-secondary">calendar_month</span>
                  My Booked Tours (${state.bookedTours.length})
                </button>
                <button class="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-gray-200 hover:text-secondary flex items-center gap-2.5 cursor-pointer transition-colors" data-route="list-property">
                  <span class="material-symbols-outlined text-[16px] text-secondary">add_business</span>
                  Submit Listing
                </button>
                <div class="my-1 border-t border-white/10"></div>
                <button class="w-full text-left px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-300 hover:text-red-200 flex items-center gap-2.5 cursor-pointer transition-colors" id="nav-logout-btn">
                  <span class="material-symbols-outlined text-[16px]">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          ` : `
            <button class="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card hover:border-secondary text-gray-200 hover:text-secondary text-xs font-semibold tracking-wide transition-all cursor-pointer" id="nav-signin-btn" title="Sign In or Register">
              <span class="material-symbols-outlined text-[16px] sm:text-[18px] text-secondary">lock</span>
              <span>Sign In</span>
            </button>
          `}

          <!-- Mobile Hamburger -->
          <button class="lg:hidden p-2 sm:p-2.5 rounded-full glass-card text-gray-300 hover:text-secondary cursor-pointer" id="mobile-menu-toggle">
            <span class="material-symbols-outlined text-[20px] sm:text-[24px]">menu</span>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Menu -->
      <div class="hidden lg:hidden glass-panel-heavy border-t border-white/10 px-6 py-6 transition-all" id="mobile-menu">
        <div class="flex flex-col gap-4 text-base font-medium">
          <button class="text-left py-2 ${state.currentRoute === 'home' ? 'text-secondary font-bold' : 'text-gray-300'}" data-route="home">Home</button>
          <button class="text-left py-2 ${state.currentRoute === 'browse' ? 'text-secondary font-bold' : 'text-gray-300'}" data-route="browse">Browse Estates</button>
          <button class="text-left py-2 ${state.currentRoute === 'digital-twin' ? 'text-secondary font-bold' : 'text-gray-300'} flex items-center gap-2" data-route="digital-twin">
            <span class="w-2 h-2 rounded-full bg-secondary"></span> 3D Digital Twin Experience
          </button>
          <button class="text-left py-2 ${state.currentRoute === 'advisors' ? 'text-secondary font-bold' : 'text-gray-300'}" data-route="advisors">Elite Advisors</button>
          <button class="text-left py-2 ${state.currentRoute === 'list-property' ? 'text-secondary font-bold' : 'text-gray-300'}" data-route="list-property">List Your Property</button>
          
          <button class="text-left py-2 text-emerald-400 font-bold flex items-center gap-2" id="mobile-tracker-btn">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Visitor Tracker
          </button>

          ${user ? `
            <div class="pt-4 border-t border-white/10 flex flex-col gap-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-secondary/20 border border-secondary/40 text-secondary font-bold flex items-center justify-center overflow-hidden">
                  ${user.avatarUrl ? `<img src="${user.avatarUrl}" class="w-full h-full object-cover">` : ((user.fullName?.[0] || 'U').toUpperCase())}
                </div>
                <div>
                  <p class="text-sm font-bold text-white">${user.fullName || user.email}</p>
                  <p class="text-xs text-secondary">${user.role || 'Buyer'}</p>
                </div>
              </div>
              <button class="text-left py-1 text-sm text-gray-300 hover:text-secondary flex items-center gap-2" id="mobile-my-tours-btn">
                <span class="material-symbols-outlined text-sm">calendar_month</span> My Booked Tours (${state.bookedTours.length})
              </button>
              <button class="text-left py-1 text-sm text-red-400 hover:text-red-300 flex items-center gap-2" id="mobile-logout-btn">
                <span class="material-symbols-outlined text-sm">logout</span> Sign Out
              </button>
            </div>
          ` : `
            <div class="pt-4 border-t border-white/10">
              <button class="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2" id="mobile-signin-btn">
                <span class="material-symbols-outlined text-sm">lock</span> Sign In / Register
              </button>
            </div>
          `}
        </div>
      </div>
    </nav>
  `;

  container.innerHTML = html;

  // Event Listeners for routes
  container.querySelectorAll('[data-route]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const route = btn.getAttribute('data-route');
      store.setRoute(route);
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) mobileMenu.classList.add('hidden');
    });
  });

  const searchBtn = container.querySelector('#nav-search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      store.setRoute('browse');
      setTimeout(() => {
        const searchInput = document.getElementById('browse-search-input');
        if (searchInput) searchInput.focus();
      }, 100);
    });
  }

  const favBtn = container.querySelector('#nav-favorites-btn');
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      store.openModal('favorites');
    });
  }

  // Live Activity & Visitor Tracker Trigger
  const trackerBtn = container.querySelector('#nav-tracker-btn');
  if (trackerBtn) {
    trackerBtn.addEventListener('click', () => {
      store.openModal('tracker');
    });
  }

  const dropdownTracker = container.querySelector('#nav-dropdown-tracker');
  if (dropdownTracker) {
    dropdownTracker.addEventListener('click', () => {
      userDropdown?.classList.add('hidden');
      store.openModal('tracker');
    });
  }

  const mobileTrackerBtn = container.querySelector('#mobile-tracker-btn');
  if (mobileTrackerBtn) {
    mobileTrackerBtn.addEventListener('click', () => {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) mobileMenu.classList.add('hidden');
      store.openModal('tracker');
    });
  }

  // Auth Button (Sign In)
  const signinBtn = container.querySelector('#nav-signin-btn');
  if (signinBtn) {
    signinBtn.addEventListener('click', () => {
      store.openModal('auth', { tab: 'signin' });
    });
  }

  const mobileSigninBtn = container.querySelector('#mobile-signin-btn');
  if (mobileSigninBtn) {
    mobileSigninBtn.addEventListener('click', () => {
      store.openModal('auth', { tab: 'signin' });
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) mobileMenu.classList.add('hidden');
    });
  }

  // User Profile Dropdown Toggle
  const userMenuBtn = container.querySelector('#user-menu-btn');
  const userDropdown = container.querySelector('#user-dropdown');
  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      if (!userDropdown.classList.contains('hidden')) {
        userDropdown.classList.add('hidden');
      }
    });

    userDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  const dropdownFavs = container.querySelector('#nav-dropdown-favs');
  if (dropdownFavs) {
    dropdownFavs.addEventListener('click', () => {
      userDropdown?.classList.add('hidden');
      store.openModal('favorites');
    });
  }

  const dropdownTours = container.querySelector('#nav-dropdown-tours');
  if (dropdownTours) {
    dropdownTours.addEventListener('click', () => {
      userDropdown?.classList.add('hidden');
      store.openModal('my-tours');
    });
  }

  const mobileMyTours = container.querySelector('#mobile-my-tours-btn');
  if (mobileMyTours) {
    mobileMyTours.addEventListener('click', () => {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) mobileMenu.classList.add('hidden');
      store.openModal('my-tours');
    });
  }

  const logoutBtn = container.querySelector('#nav-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      userDropdown?.classList.add('hidden');
      store.logout();
    });
  }

  const mobileLogoutBtn = container.querySelector('#mobile-logout-btn');
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', () => {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) mobileMenu.classList.add('hidden');
      store.logout();
    });
  }

  const mobileToggle = container.querySelector('#mobile-menu-toggle');
  const mobileMenu = container.querySelector('#mobile-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}
