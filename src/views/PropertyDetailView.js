import { store } from '../store.js';
import { advisors } from '../data/advisors.js';

export function renderPropertyDetailView(container) {
  const prop = store.getSelectedProperty();
  const isFav = store.isFavorite(prop.id);
  const advisor = advisors.find(a => a.id === prop.advisorId) || advisors[0];

  let downPaymentPercent = 20;
  let interestRate = 6.5;
  let loanTermYears = 30;

  function calcMonthly(price, downPct, rate, years) {
    const principal = price * (1 - downPct / 100);
    const r = rate / 100 / 12;
    const n = years * 12;
    if (r === 0) return Math.round(principal / n);
    return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }

  const initialMonthly = calcMonthly(prop.price, downPaymentPercent, interestRate, loanTermYears);

  const html = `
    <div class="min-h-screen pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <!-- Breadcrumb + Actions -->
      <div class="flex flex-wrap justify-between items-center gap-4 mb-8 pb-4 border-b border-white/10 text-xs">
        <button class="btn-glass px-4 py-2 flex items-center gap-1.5 text-gray-300 hover:text-white cursor-pointer" id="back-to-browse-btn">
          <span class="material-symbols-outlined text-sm">arrow_back</span> Back
        </button>

        <div class="flex items-center gap-3">
          <button class="btn-glass px-4 py-2 flex items-center gap-1.5 text-gray-300 hover:text-secondary cursor-pointer" id="detail-share-btn">
            <span class="material-symbols-outlined text-sm">share</span> Share
          </button>
          <button class="btn-glass px-4 py-2 flex items-center gap-1.5 ${isFav ? 'text-secondary border-secondary' : 'text-gray-300'} hover:text-secondary cursor-pointer" id="detail-fav-btn">
            <span class="material-symbols-outlined text-sm ${isFav ? 'fill-1 text-secondary' : ''}">favorite</span>
            ${isFav ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <!-- Title + Price -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <span class="bg-secondary/90 text-black font-bold text-xs uppercase tracking-widest px-3.5 py-1 rounded-full">${prop.badge}</span>
            <span class="bg-white/10 text-gray-300 text-xs uppercase tracking-widest px-3 py-1 rounded-full border border-white/10">${prop.type}</span>
          </div>
          <h1 class="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">${prop.title}</h1>
          <p class="text-sm md:text-base text-gray-300 flex items-center gap-1.5 font-light">
            <span class="material-symbols-outlined text-secondary">location_on</span>
            ${prop.location}
          </p>
        </div>

        <div class="text-left lg:text-right">
          <p class="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Asking Price</p>
          <p class="font-display text-4xl sm:text-5xl font-extrabold text-secondary glow-text">${prop.priceFormatted}</p>
          <p class="text-xs text-gray-400 mt-1">~$${initialMonthly.toLocaleString()}/mo · ~$${Math.round(prop.price * 0.009 / 12).toLocaleString()}/mo property tax</p>
        </div>
      </div>

      <!-- Gallery -->
      <div class="mb-12 space-y-4">
        <div class="relative aspect-[21/10] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
          <img src="${prop.gallery[0]}" alt="${prop.title}" id="gallery-main-img" class="w-full h-full object-cover transition-opacity duration-300" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

          <div class="absolute bottom-6 right-6 flex items-center gap-3">
            <button class="btn-primary px-6 py-3 text-xs font-bold tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(68,226,205,0.4)]" id="detail-launch-twin-btn">
              <span class="material-symbols-outlined text-base">view_in_ar</span>
              View in 3D
            </button>
            <button class="btn-glass px-5 py-3 text-xs font-bold tracking-widest flex items-center gap-2" id="detail-book-tour-btn">
              <span class="material-symbols-outlined text-base">calendar_month</span>
              Book Tour
            </button>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-4">
          ${prop.gallery.map((img, idx) => `
            <button class="gallery-thumb-btn relative aspect-[16/10] rounded-2xl overflow-hidden glass-card border ${idx === 0 ? 'border-secondary ring-2 ring-secondary/50' : 'border-white/10 opacity-70'} hover:opacity-100 transition-all cursor-pointer" data-img="${img}">
              <img src="${img}" alt="Photo ${idx + 1}" class="w-full h-full object-cover" loading="lazy">
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Specs Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-6 glass-panel-heavy rounded-3xl border border-white/10 mb-12 text-center">
        <div class="p-3 border-r border-white/5 last:border-0">
          <span class="material-symbols-outlined text-secondary text-2xl mb-1">bed</span>
          <p class="font-display text-xl font-bold text-white">${prop.beds}</p>
          <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Bedrooms</p>
        </div>
        <div class="p-3 border-r border-white/5 last:border-0">
          <span class="material-symbols-outlined text-secondary text-2xl mb-1">bathtub</span>
          <p class="font-display text-xl font-bold text-white">${prop.baths}</p>
          <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Bathrooms</p>
        </div>
        <div class="p-3 border-r border-white/5 last:border-0">
          <span class="material-symbols-outlined text-secondary text-2xl mb-1">square_foot</span>
          <p class="font-display text-xl font-bold text-white">${prop.sqft.toLocaleString()}</p>
          <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Sq Ft</p>
        </div>
        <div class="p-3 border-r border-white/5 last:border-0">
          <span class="material-symbols-outlined text-secondary text-2xl mb-1">landscape</span>
          <p class="font-display text-xl font-bold text-white">${prop.lotSize}</p>
          <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Lot Size</p>
        </div>
        <div class="p-3 border-r border-white/5 last:border-0">
          <span class="material-symbols-outlined text-secondary text-2xl mb-1">construction</span>
          <p class="font-display text-xl font-bold text-white">${prop.yearBuilt}</p>
          <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Year Built</p>
        </div>
        <div class="p-3">
          <span class="material-symbols-outlined text-secondary text-2xl mb-1">eco</span>
          <p class="font-display text-xl font-bold text-secondary">Platinum</p>
          <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Eco Rating</p>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <!-- Left column -->
        <div class="lg:col-span-8 space-y-12">
          <!-- Description -->
          <div class="glass-panel p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 class="font-display text-2xl font-bold text-white">About This Property</h3>
            <p class="text-gray-300 font-light leading-relaxed text-sm sm:text-base">${prop.description}</p>
            <p class="text-xs text-secondary font-medium italic">"${prop.tagline}"</p>
          </div>

          <!-- Highlights -->
          <div class="glass-panel p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 class="font-display text-2xl font-bold text-white">Key Features</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              ${prop.highlights.map(h => `
                <div class="flex items-start gap-3 p-3 rounded-2xl bg-surface-high/60 border border-white/5">
                  <span class="material-symbols-outlined text-secondary text-lg mt-0.5">verified</span>
                  <span class="text-xs text-gray-200 font-medium">${h}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Amenities -->
          <div class="glass-panel p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 class="font-display text-2xl font-bold text-white">Amenities</h3>
            <div class="flex flex-wrap gap-2.5 pt-2">
              ${prop.amenities.map(a => `
                <div class="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface-high/80 border border-white/5 text-xs text-white">
                  <span class="material-symbols-outlined text-secondary text-base">check</span>
                  ${a}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Mortgage Calculator -->
          <div class="glass-panel p-8 rounded-3xl border border-white/10 space-y-6" id="mortgage-calculator-box">
            <div class="flex justify-between items-center pb-3 border-b border-white/10">
              <div>
                <span class="text-secondary text-[10px] font-bold uppercase tracking-widest">Financing</span>
                <h3 class="font-display text-xl font-bold text-white">Mortgage Calculator</h3>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-gray-400 uppercase">Monthly Est.</span>
                <p class="font-display text-2xl font-bold text-secondary" id="calc-monthly-output">$${initialMonthly.toLocaleString()}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div class="flex justify-between text-xs mb-1.5">
                  <span class="text-gray-300">Down Payment</span>
                  <span class="text-secondary font-bold" id="calc-down-label">20% ($${((prop.price * 0.2) / 1000000).toFixed(2)}M)</span>
                </div>
                <input type="range" min="10" max="50" step="5" value="20" id="calc-down-slider" class="w-full">
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1.5">
                  <span class="text-gray-300">Interest Rate</span>
                  <span class="text-secondary font-bold" id="calc-rate-label">6.5%</span>
                </div>
                <input type="range" min="3.5" max="10.0" step="0.1" value="6.5" id="calc-rate-slider" class="w-full">
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1.5">
                  <span class="text-gray-300">Loan Term</span>
                  <span class="text-secondary font-bold" id="calc-term-label">30 Years</span>
                </div>
                <select id="calc-term-select" class="w-full bg-surface-high border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-secondary outline-none">
                  <option value="30">30 Years Fixed</option>
                  <option value="15">15 Years Fixed</option>
                  <option value="10">10 Years ARM</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-4 space-y-8 sticky top-28">
          <!-- Advisor Card -->
          <div class="glass-panel-heavy p-6 rounded-3xl border border-white/10 space-y-5 text-center shadow-2xl">
            <div class="relative w-24 h-24 mx-auto">
              <img src="${advisor.image}" alt="${advisor.name}" class="w-full h-full object-cover rounded-full border-2 border-secondary/60 p-1" loading="lazy">
              <div class="absolute bottom-0 right-0 p-1 rounded-full bg-secondary text-black shadow-lg">
                <span class="material-symbols-outlined text-xs">verified</span>
              </div>
            </div>

            <div>
              <span class="text-[10px] text-secondary font-bold uppercase tracking-wider block">Listing Advisor</span>
              <h4 class="font-display text-xl font-bold text-white">${advisor.name}</h4>
              <p class="text-xs text-gray-300">${advisor.title}</p>
              <p class="text-[11px] text-gray-400 mt-1">${advisor.phone}</p>
            </div>

            <div class="pt-2 flex flex-col gap-2.5">
              <button class="w-full btn-primary py-3 text-xs font-bold tracking-widest" id="sidebar-book-tour-btn">
                Book a Tour
              </button>
              <button class="w-full btn-glass py-3 text-xs font-bold tracking-widest" id="sidebar-contact-advisor-btn">
                Contact Advisor
              </button>
            </div>
          </div>

          <!-- IoT Telemetry -->
          <div class="glass-panel p-6 rounded-3xl border border-secondary/20 space-y-4">
            <div class="flex items-center gap-2 text-secondary">
              <span class="material-symbols-outlined text-base">sensors</span>
              <h4 class="text-xs font-bold uppercase tracking-widest">Live IoT Data</h4>
            </div>

            <div class="space-y-2.5 text-xs">
              <div class="flex justify-between p-2.5 rounded-xl bg-surface-high/60 border border-white/5">
                <span class="text-gray-400">Energy Efficiency</span>
                <span class="text-white font-semibold">${prop.telemetry.energyEfficiency}</span>
              </div>
              <div class="flex justify-between p-2.5 rounded-xl bg-surface-high/60 border border-white/5">
                <span class="text-gray-400">Solar Output</span>
                <span class="text-secondary font-semibold">${prop.telemetry.solarOutput}</span>
              </div>
              <div class="flex justify-between p-2.5 rounded-xl bg-surface-high/60 border border-white/5">
                <span class="text-gray-400">HVAC Status</span>
                <span class="text-white font-semibold">${prop.telemetry.hvacStatus}</span>
              </div>
              <div class="flex justify-between p-2.5 rounded-xl bg-surface-high/60 border border-white/5">
                <span class="text-gray-400">Security</span>
                <span class="text-tertiary font-semibold">${prop.telemetry.securityZones}</span>
              </div>
            </div>

            <button class="w-full btn-glass py-2.5 text-xs font-bold tracking-wider text-secondary border-secondary/30 hover:border-secondary flex items-center justify-center gap-1.5 cursor-pointer" id="sidebar-telemetry-twin-btn">
              <span class="material-symbols-outlined text-sm">open_in_full</span>
              Open 3D Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Events
  const backBtn = container.querySelector('#back-to-browse-btn');
  if (backBtn) backBtn.addEventListener('click', () => store.setRoute('browse'));

  const favBtn = container.querySelector('#detail-fav-btn');
  if (favBtn) favBtn.addEventListener('click', () => store.toggleFavorite(prop.id));

  const shareBtn = container.querySelector('#detail-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        store.addToast('Link copied to clipboard', 'info');
      }
    });
  }

  // Gallery
  const mainImg = container.querySelector('#gallery-main-img');
  container.querySelectorAll('.gallery-thumb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-img');
      if (mainImg) {
        mainImg.style.opacity = '0';
        setTimeout(() => { mainImg.src = src; mainImg.style.opacity = '1'; }, 150);
      }
      container.querySelectorAll('.gallery-thumb-btn').forEach(b => {
        b.classList.remove('border-secondary', 'ring-2', 'ring-secondary/50');
        b.classList.add('border-white/10', 'opacity-70');
      });
      btn.classList.add('border-secondary', 'ring-2', 'ring-secondary/50');
      btn.classList.remove('border-white/10', 'opacity-70');
    });
  });

  // Mortgage calculator
  const downSlider = container.querySelector('#calc-down-slider');
  const rateSlider = container.querySelector('#calc-rate-slider');
  const termSelect = container.querySelector('#calc-term-select');

  function updateCalc() {
    const d = parseFloat(downSlider.value);
    const r = parseFloat(rateSlider.value);
    const t = parseInt(termSelect.value, 10);
    container.querySelector('#calc-down-label').textContent = `${d}% ($${((prop.price * d / 100) / 1000000).toFixed(2)}M)`;
    container.querySelector('#calc-rate-label').textContent = `${r}%`;
    container.querySelector('#calc-term-label').textContent = `${t} Years`;
    container.querySelector('#calc-monthly-output').textContent = `$${calcMonthly(prop.price, d, r, t).toLocaleString()}`;
  }

  if (downSlider) downSlider.addEventListener('input', updateCalc);
  if (rateSlider) rateSlider.addEventListener('input', updateCalc);
  if (termSelect) termSelect.addEventListener('change', updateCalc);

  // Tour + twin buttons
  const bookTourBtn = container.querySelector('#detail-book-tour-btn');
  const sidebarTourBtn = container.querySelector('#sidebar-book-tour-btn');
  if (bookTourBtn) bookTourBtn.addEventListener('click', () => store.openModal('book-tour', { property: prop }));
  if (sidebarTourBtn) sidebarTourBtn.addEventListener('click', () => store.openModal('book-tour', { property: prop }));

  const launchTwinBtn = container.querySelector('#detail-launch-twin-btn');
  const sidebarTwinBtn = container.querySelector('#sidebar-telemetry-twin-btn');
  if (launchTwinBtn) launchTwinBtn.addEventListener('click', () => store.setRoute('digital-twin', prop.id));
  if (sidebarTwinBtn) sidebarTwinBtn.addEventListener('click', () => store.setRoute('digital-twin', prop.id));

  const contactAdvBtn = container.querySelector('#sidebar-contact-advisor-btn');
  if (contactAdvBtn) contactAdvBtn.addEventListener('click', () => store.openModal('contact-advisor', { advisor }));
}
