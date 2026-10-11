import { store } from '../store.js';
import { advisors } from '../data/advisors.js';

export function renderAdvisorsView(container) {
  const html = `
    <div class="min-h-screen pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span class="text-secondary text-xs uppercase font-bold tracking-widest block">Our Team</span>
        <h1 class="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white">Meet the Advisors</h1>
        <p class="text-gray-300 font-light text-sm sm:text-base leading-relaxed">
          Our senior partners handle the world's most significant private residential transactions, combining deep market expertise with complete discretion.
        </p>
      </div>

      <!-- Advisor Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        ${advisors.map(adv => `
          <div class="glass-panel-heavy rounded-3xl p-8 flex flex-col justify-between border border-white/10 hover:border-secondary/40 transition-all duration-300 group shadow-xl">
            <div>
              <div class="relative w-32 h-32 mx-auto mb-6">
                <img src="${adv.image}" alt="${adv.name}" class="w-full h-full object-cover rounded-full border-2 border-secondary/60 p-1 group-hover:scale-105 transition-transform duration-500" loading="lazy">
                <div class="absolute bottom-1 right-1 p-2 rounded-full bg-secondary text-black shadow-xl">
                  <span class="material-symbols-outlined text-sm font-bold">verified</span>
                </div>
              </div>

              <div class="text-center mb-6">
                <h3 class="font-display text-2xl font-bold text-white mb-1">${adv.name}</h3>
                <p class="text-xs text-secondary font-semibold">${adv.title}</p>
                <p class="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                  <span class="material-symbols-outlined text-xs text-secondary">location_on</span>
                  ${adv.territory}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-3 py-3 border-y border-white/10 text-center text-xs mb-6">
                <div>
                  <span class="text-gray-400 text-[10px] uppercase block">Experience</span>
                  <span class="font-bold text-white">${adv.experience}</span>
                </div>
                <div>
                  <span class="text-gray-400 text-[10px] uppercase block">Volume Closed</span>
                  <span class="font-bold text-secondary">${adv.totalSales}</span>
                </div>
              </div>

              <p class="text-xs text-gray-300 font-light leading-relaxed mb-6">${adv.bio}</p>

              <div class="flex flex-wrap gap-1.5 mb-6">
                ${adv.specialties.map(s => `
                  <span class="text-[10px] px-2.5 py-1 rounded-full bg-surface-high border border-white/5 text-gray-300 font-medium">${s}</span>
                `).join('')}
              </div>
            </div>

            <div class="space-y-2.5 pt-4 border-t border-white/10">
              <button class="w-full btn-primary py-3 text-xs font-bold tracking-wider advisor-schedule-btn cursor-pointer" data-id="${adv.id}">
                Book a Consultation
              </button>
              <div class="flex justify-between text-[11px] text-gray-400 pt-1">
                <span>${adv.phone}</span>
                <span class="text-secondary hover:underline cursor-pointer">${adv.email}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Advisory Pillars -->
      <div class="glass-panel rounded-3xl p-8 md:p-12 border border-white/10">
        <h3 class="font-display text-2xl md:text-3xl font-bold text-white text-center mb-10">How We Work</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="space-y-3 p-4 rounded-2xl bg-surface-high/50 border border-white/5">
            <div class="p-3 w-12 h-12 rounded-xl bg-secondary/15 text-secondary border border-secondary/30 flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">visibility_off</span>
            </div>
            <h4 class="font-display text-lg font-bold text-white">Off-Market Access</h4>
            <p class="text-xs text-gray-300 font-light leading-relaxed">
              Over 40% of our transactions happen off-market under NDA, protecting both buyers and sellers from public exposure.
            </p>
          </div>

          <div class="space-y-3 p-4 rounded-2xl bg-surface-high/50 border border-white/5">
            <div class="p-3 w-12 h-12 rounded-xl bg-secondary/15 text-secondary border border-secondary/30 flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">analytics</span>
            </div>
            <h4 class="font-display text-lg font-bold text-white">Data-Backed Valuations</h4>
            <p class="text-xs text-gray-300 font-light leading-relaxed">
              We combine macroeconomic trends, local comparable sales, and IoT telemetry to give you the most accurate price guidance possible.
            </p>
          </div>

          <div class="space-y-3 p-4 rounded-2xl bg-surface-high/50 border border-white/5">
            <div class="p-3 w-12 h-12 rounded-xl bg-secondary/15 text-secondary border border-secondary/30 flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">view_in_ar</span>
            </div>
            <h4 class="font-display text-lg font-bold text-white">3D Virtual Tours</h4>
            <p class="text-xs text-gray-300 font-light leading-relaxed">
              Every property we represent is laser-scanned into a high-fidelity 3D model so clients can conduct thorough due diligence from anywhere.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  container.querySelectorAll('.advisor-schedule-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const adv = advisors.find(a => a.id === btn.getAttribute('data-id'));
      store.openModal('contact-advisor', { advisor: adv });
    });
  });
}
