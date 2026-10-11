import { store } from '../store.js';
import { properties } from '../data/properties.js';
import { advisors } from '../data/advisors.js';
import { renderPropertyCard, wirePropertyCardEvents } from '../utils/propertyCard.js';

export function renderHomeView(container) {
  const featuredProperties = properties.filter(p => p.featured);

  const html = `
    <div class="relative min-h-screen pt-20">
      <!-- Hero -->
      <section class="relative min-h-[92vh] flex items-center justify-center overflow-hidden py-16 px-6 md:px-12">
        <div class="absolute inset-0 z-0">
          <img src="/images/AB6AXuCpenHFTF3i53_5ELnfMBf8uJqOqmktl3lnxVtThqKZFFVfFd449QvSBdXpzeCyOtM8rU2KbE3ZnKpIZq1JOz2ASmbELX-M-b479aed4d661.png" alt="Luxury estate" class="w-full h-full object-cover opacity-35 scale-105 transition-transform duration-1000">
          <div class="absolute inset-0 hero-gradient"></div>
        </div>

        <div class="relative z-10 max-w-6xl mx-auto text-center">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-secondary/40 text-secondary text-xs uppercase font-bold tracking-widest mb-6 animate-float">
            <span class="w-2 h-2 rounded-full bg-secondary"></span>
            3D-Verified Luxury Real Estate
          </div>

          <h1 class="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight drop-shadow-2xl">
            Find Your <br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-secondary glow-text">Perfect Home</span>
          </h1>

          <p class="font-body text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Exceptional luxury estates with verified 3D digital twins, live IoT telemetry, and dedicated private buyer representation.
          </p>

          <!-- Search Bar -->
          <div class="glass-panel-heavy p-3 sm:p-4 rounded-3xl max-w-4xl mx-auto shadow-2xl border border-white/15 neon-glow relative">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <div class="flex items-center gap-3 px-4 py-3 bg-surface-high/60 rounded-2xl border border-white/5 focus-within:border-secondary/50">
                <span class="material-symbols-outlined text-secondary">location_on</span>
                <div class="text-left w-full">
                  <label class="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Location</label>
                  <input type="text" id="hero-location-input" placeholder="Bel Air, Manhattan, Miami..." class="w-full bg-transparent text-xs sm:text-sm text-white focus:outline-none placeholder-gray-500">
                </div>
              </div>

              <div class="flex items-center gap-3 px-4 py-3 bg-surface-high/60 rounded-2xl border border-white/5 focus-within:border-secondary/50">
                <span class="material-symbols-outlined text-secondary">domain</span>
                <div class="text-left w-full">
                  <label class="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Property Type</label>
                  <select id="hero-type-select" class="w-full bg-transparent text-xs sm:text-sm text-white focus:outline-none cursor-pointer">
                    <option value="All" class="bg-surface-high text-white">All Types</option>
                    <option value="Villa" class="bg-surface-high text-white">Villa</option>
                    <option value="Penthouse" class="bg-surface-high text-white">Penthouse</option>
                    <option value="Waterfront" class="bg-surface-high text-white">Waterfront</option>
                    <option value="Modern Estate" class="bg-surface-high text-white">Modern Estate</option>
                  </select>
                </div>
              </div>

              <button id="hero-search-btn" class="w-full h-full py-4 btn-primary rounded-2xl text-xs md:text-sm font-bold tracking-widest flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(68,226,205,0.4)]">
                <span class="material-symbols-outlined text-[20px]">search</span>
                Search Estates
              </button>
            </div>
          </div>

          <!-- Quick tags -->
          <div class="flex flex-wrap justify-center items-center gap-2.5 mt-6 text-xs text-gray-400">
            <span class="text-gray-500">Popular:</span>
            <button class="px-3 py-1 rounded-full glass-card hover:text-secondary hover:border-secondary text-[11px] quick-tag" data-tag="Bel Air">Bel Air</button>
            <button class="px-3 py-1 rounded-full glass-card hover:text-secondary hover:border-secondary text-[11px] quick-tag" data-tag="Manhattan">Manhattan</button>
            <button class="px-3 py-1 rounded-full glass-card hover:text-secondary hover:border-secondary text-[11px] quick-tag" data-tag="Miami">Miami</button>
            <button class="px-3 py-1 rounded-full glass-card hover:text-secondary hover:border-secondary text-[11px] quick-tag" data-tag="Dubai">Dubai</button>
            <button class="px-3 py-1 rounded-full glass-card hover:text-secondary hover:border-secondary text-[11px] quick-tag" data-tag="French Riviera">French Riviera</button>
          </div>
        </div>
      </section>

      <!-- Stats Bar -->
      <section class="py-12 border-y border-white/10 bg-surface-low/60 relative">
        <div class="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div class="glass-card p-6 rounded-2xl">
            <h3 class="font-display text-4xl sm:text-5xl font-extrabold text-secondary mb-1 glow-text">10k+</h3>
            <p class="text-xs uppercase tracking-widest font-semibold text-gray-400">Properties Closed</p>
          </div>
          <div class="glass-card p-6 rounded-2xl">
            <h3 class="font-display text-4xl sm:text-5xl font-extrabold text-secondary mb-1 glow-text">$4.2B</h3>
            <p class="text-xs uppercase tracking-widest font-semibold text-gray-400">Total Volume</p>
          </div>
          <div class="glass-card p-6 rounded-2xl">
            <h3 class="font-display text-4xl sm:text-5xl font-extrabold text-secondary mb-1 glow-text">240</h3>
            <p class="text-xs uppercase tracking-widest font-semibold text-gray-400">Expert Advisors</p>
          </div>
          <div class="glass-card p-6 rounded-2xl">
            <h3 class="font-display text-4xl sm:text-5xl font-extrabold text-secondary mb-1 glow-text">100%</h3>
            <p class="text-xs uppercase tracking-widest font-semibold text-gray-400">3D Twin Verified</p>
          </div>
        </div>
      </section>

      <!-- Featured Properties -->
      <section class="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <div class="inline-flex items-center gap-1.5 text-secondary text-xs uppercase font-bold tracking-widest mb-2">
              <span class="material-symbols-outlined text-sm">stars</span> Featured
            </div>
            <h2 class="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white">Handpicked Properties</h2>
          </div>
          <button class="btn-glass px-6 py-3 text-xs uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer" id="home-view-all-btn">
            Browse All <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${featuredProperties.map(p => renderPropertyCard(p)).join('')}
        </div>
      </section>

      <!-- 3D Twin Teaser -->
      <section class="py-24 px-6 md:px-12 relative overflow-hidden bg-gradient-to-b from-surface-low to-surface">
        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div class="lg:col-span-6 space-y-6">
            <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs uppercase font-bold tracking-widest">
              <span class="material-symbols-outlined text-sm">view_in_ar</span> 3D Viewer
            </div>

            <h2 class="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              Explore Every Room Before You Visit
            </h2>

            <p class="text-gray-300 font-light leading-relaxed text-sm md:text-base">
              Tour any property in full 3D from anywhere in the world. HomeHub's digital twin technology gives you real-time climate data, solar analytics, and interactive floor plans — all before stepping through the door.
            </p>

            <div class="grid grid-cols-2 gap-4 pt-2">
              <div class="glass-card p-4 rounded-2xl">
                <span class="material-symbols-outlined text-secondary text-2xl mb-1">thermostat</span>
                <h4 class="text-sm font-bold text-white">Live Climate</h4>
                <p class="text-xs text-gray-400">Real-time HVAC and microclimate data per room.</p>
              </div>
              <div class="glass-card p-4 rounded-2xl">
                <span class="material-symbols-outlined text-secondary text-2xl mb-1">solar_power</span>
                <h4 class="text-sm font-bold text-white">Solar Output</h4>
                <p class="text-xs text-gray-400">Live energy harvest and efficiency metrics.</p>
              </div>
            </div>

            <div class="pt-4 flex flex-wrap gap-4">
              <button class="btn-primary px-8 py-3.5 text-xs font-bold tracking-widest" id="home-launch-twin-btn">
                Open 3D Viewer
              </button>
              <button class="btn-glass px-6 py-3.5 text-xs font-bold tracking-widest" id="home-book-consult-btn">
                Request a 3D Scan
              </button>
            </div>
          </div>

          <div class="lg:col-span-6 relative">
            <div class="relative aspect-[4/3] rounded-3xl overflow-hidden glass-panel border border-secondary/30 shadow-[0_0_50px_rgba(68,226,205,0.2)] group">
              <img src="/images/AB6AXuBtpeMIA2tuI3-zSVN79y07FdHi4ZPwUSmjrxQGEm231QvqvNqJzB_P7UzJZBeLJ0BaQJhTKVVe1kdVAf6EfdyszFNzhxXT-122579553bf4.png" alt="3D twin wireframe preview" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

              <div class="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-panel-heavy border border-white/10 flex justify-between items-center">
                <div>
                  <span class="text-[10px] text-secondary uppercase font-bold tracking-widest">Active Model</span>
                  <h4 class="text-sm font-bold text-white">Bel Air Monolith — 3D Wireframe</h4>
                  <p class="text-xs text-gray-400">WebGL engine active</p>
                </div>
                <button class="p-3 rounded-xl bg-secondary text-black hover:bg-secondary-bright transition-all" id="twin-play-btn">
                  <span class="material-symbols-outlined">play_arrow</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Advisors Preview -->
      <section class="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <span class="text-secondary text-xs uppercase font-bold tracking-widest block mb-2">Meet the Team</span>
          <h2 class="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">Your Dedicated Advisors</h2>
          <p class="text-gray-400 font-light text-sm">Experienced negotiators who handle complex high-value deals with complete discretion.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${advisors.map(adv => `
            <div class="glass-card rounded-3xl p-6 flex flex-col justify-between group border-white/10 hover:border-secondary/40">
              <div class="text-center mb-6">
                <div class="relative w-28 h-28 mx-auto mb-4">
                  <img src="${adv.image}" alt="${adv.name}" class="w-full h-full object-cover rounded-full border-2 border-secondary/60 p-1 group-hover:scale-105 transition-transform">
                  <div class="absolute bottom-0 right-0 p-1.5 rounded-full bg-secondary text-black shadow-lg">
                    <span class="material-symbols-outlined text-xs">verified</span>
                  </div>
                </div>
                <h3 class="font-display text-xl font-bold text-white">${adv.name}</h3>
                <p class="text-xs text-secondary font-semibold">${adv.title}</p>
                <p class="text-[11px] text-gray-400 mt-1">${adv.territory}</p>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between py-2 border-y border-white/10 text-xs">
                  <span class="text-gray-400">Closed Volume</span>
                  <span class="font-bold text-white">${adv.totalSales}</span>
                </div>
                <p class="text-xs text-gray-300 font-light line-clamp-2">${adv.bio}</p>
                <button class="w-full btn-glass py-2.5 text-xs font-bold tracking-wider advisor-card-btn cursor-pointer" data-id="${adv.id}">
                  Book Consultation
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Bottom CTA -->
      <section class="py-24 px-6 md:px-12 relative overflow-hidden text-center bg-gradient-to-t from-surface-low to-transparent border-t border-white/10">
        <div class="max-w-3xl mx-auto space-y-6 relative z-10">
          <span class="text-secondary text-xs uppercase font-bold tracking-widest block">Get Started</span>
          <h2 class="font-display text-3xl sm:text-5xl font-bold text-white">Ready to Buy or Sell?</h2>
          <p class="text-gray-300 font-light text-sm md:text-base max-w-xl mx-auto">
            Work with our advisors to find your next property or list yours — backed by AI valuations and global reach.
          </p>
          <div class="pt-4 flex flex-wrap justify-center gap-4">
            <button class="btn-primary px-8 py-4 text-xs font-bold tracking-widest" id="cta-list-property-btn">
              List Your Property
            </button>
            <button class="btn-glass px-8 py-4 text-xs font-bold tracking-widest" id="cta-browse-estates-btn">
              Browse Properties
            </button>
          </div>
        </div>
      </section>
    </div>
  `;

  container.innerHTML = html;

  // Search
  const searchBtn = container.querySelector('#hero-search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const keyword = container.querySelector('#hero-location-input')?.value || '';
      const type = container.querySelector('#hero-type-select')?.value || 'All';
      store.setFilters({ keyword, type });
      store.setRoute('browse');
    });
  }

  container.querySelectorAll('.quick-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      store.setFilters({ keyword: tag.getAttribute('data-tag'), type: 'All' });
      store.setRoute('browse');
    });
  });

  const viewAllBtn = container.querySelector('#home-view-all-btn');
  if (viewAllBtn) viewAllBtn.addEventListener('click', () => store.setRoute('browse'));

  // Property card events (shared utility)
  wirePropertyCardEvents(container);

  // Digital twin buttons
  const launchTwinBtn = container.querySelector('#home-launch-twin-btn');
  const playTwinBtn = container.querySelector('#twin-play-btn');
  if (launchTwinBtn) launchTwinBtn.addEventListener('click', () => store.setRoute('digital-twin'));
  if (playTwinBtn) playTwinBtn.addEventListener('click', () => store.setRoute('digital-twin'));

  const bookConsultBtn = container.querySelector('#home-book-consult-btn');
  if (bookConsultBtn) bookConsultBtn.addEventListener('click', () => store.openModal('book-tour', { property: properties[0] }));

  // Advisor buttons
  container.querySelectorAll('.advisor-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const adv = advisors.find(a => a.id === btn.getAttribute('data-id'));
      store.openModal('contact-advisor', { advisor: adv });
    });
  });

  const ctaListBtn = container.querySelector('#cta-list-property-btn');
  if (ctaListBtn) ctaListBtn.addEventListener('click', () => store.setRoute('list-property'));

  const ctaBrowseBtn = container.querySelector('#cta-browse-estates-btn');
  if (ctaBrowseBtn) ctaBrowseBtn.addEventListener('click', () => store.setRoute('browse'));
}
