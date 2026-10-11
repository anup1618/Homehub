import { store } from '../store.js';
import { properties } from '../data/properties.js';
import { createDigitalTwinViewer } from '../components/DigitalTwinViewer.js';

// Module-level reference so we can destroy the old viewer before creating a new one.
// This prevents the memory leak caused by orphaned animation loops on every route change.
let activeViewer = null;

export function renderDigitalTwinView(container) {
  // Clean up any existing Three.js instance before re-rendering
  if (activeViewer) {
    activeViewer.destroy();
    activeViewer = null;
  }

  const prop = store.getSelectedProperty();

  const html = `
    <div class="min-h-screen pt-24 pb-16 px-6 md:px-12 max-w-7xl mx-auto flex flex-col">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
            <span class="text-secondary text-xs uppercase font-bold tracking-widest">3D Digital Twin Viewer</span>
          </div>
          <h1 class="font-display text-2xl sm:text-4xl font-bold text-white">${prop.title}</h1>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto">
          <select id="twin-property-switcher" class="bg-surface-high border border-white/15 rounded-2xl px-4 py-2.5 text-xs text-white focus:border-secondary outline-none cursor-pointer flex-1 md:flex-initial">
            ${properties.map(p => `
              <option value="${p.id}" ${p.id === prop.id ? 'selected' : ''}>${p.title} — ${p.city}</option>
            `).join('')}
          </select>

          <button class="btn-primary px-5 py-2.5 text-xs font-bold whitespace-nowrap" id="twin-book-tour-btn">
            Book a Tour
          </button>
        </div>
      </div>

      <!-- 3D Canvas + Telemetry -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-stretch">
        <!-- 3D Viewport -->
        <div class="lg:col-span-8 glass-panel-heavy rounded-3xl p-4 border border-secondary/30 relative flex flex-col min-h-[500px] shadow-[0_0_50px_rgba(3,198,178,0.15)]">
          <!-- Floating Controls -->
          <div class="absolute top-6 left-6 right-6 z-10 flex flex-wrap justify-between items-center gap-3 pointer-events-none">
            <div class="flex items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
              <button class="floor-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-secondary text-black" data-floor="all">All Floors</button>
              <button class="floor-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-gray-300 hover:text-white" data-floor="ground">Level 1</button>
              <button class="floor-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-gray-300 hover:text-white" data-floor="penthouse">Level 2</button>
              <button class="floor-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-gray-300 hover:text-white" data-floor="rooftop">Rooftop</button>
            </div>

            <div class="flex items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
              <button class="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-secondary flex items-center gap-1 cursor-pointer" id="toggle-wireframe-btn">
                <span class="material-symbols-outlined text-sm">grid_3x3</span> Wireframe
              </button>
            </div>
          </div>

          <!-- WebGL Canvas -->
          <div id="twin-canvas-container" class="w-full flex-1 rounded-2xl overflow-hidden relative" style="min-height: 480px;"></div>

          <!-- Controls hint -->
          <div class="mt-3 flex justify-between items-center text-[11px] text-gray-400 px-2">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-xs text-secondary">touch_app</span>
              Drag to orbit · Scroll to zoom
            </span>
            <span class="text-secondary font-mono">60 FPS · WebGL 2.0</span>
          </div>
        </div>

        <!-- Telemetry Sidebar -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Live Sensors -->
          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div class="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 class="font-display text-base font-bold text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary">sensors</span> Live Sensors
              </h3>
              <span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            </div>

            <div class="space-y-3 text-xs">
              <div class="p-3 rounded-2xl bg-surface-high/70 border border-white/5 space-y-1">
                <div class="flex justify-between text-gray-400">
                  <span>Grand Salon Temperature</span>
                  <span class="text-white font-bold font-mono">71.4°F</span>
                </div>
                <div class="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-secondary h-full rounded-full" style="width: 72%;"></div>
                </div>
                <p class="text-[10px] text-gray-500">HVAC Zone 1 · Humidity 42%</p>
              </div>

              <div class="p-3 rounded-2xl bg-surface-high/70 border border-white/5 space-y-1">
                <div class="flex justify-between text-gray-400">
                  <span>Solar Yield</span>
                  <span class="text-secondary font-bold font-mono">${prop.telemetry.solarOutput}</span>
                </div>
                <div class="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-tertiary h-full rounded-full" style="width: 88%;"></div>
                </div>
                <p class="text-[10px] text-gray-500">Battery 94% · Grid export active</p>
              </div>

              <div class="p-3 rounded-2xl bg-surface-high/70 border border-white/5 space-y-1">
                <div class="flex justify-between text-gray-400">
                  <span>Pool Filtration</span>
                  <span class="text-white font-bold font-mono">82°F · 140 GPM</span>
                </div>
                <div class="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-secondary h-full rounded-full" style="width: 95%;"></div>
                </div>
                <p class="text-[10px] text-gray-500">Ozone sanitized · Salinity 3200 ppm</p>
              </div>

              <div class="p-3 rounded-2xl bg-surface-high/70 border border-white/5 space-y-1">
                <div class="flex justify-between text-gray-400">
                  <span>Security Perimeter</span>
                  <span class="text-tertiary font-bold font-mono">All Clear</span>
                </div>
                <div class="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-tertiary h-full rounded-full" style="width: 100%;"></div>
                </div>
                <p class="text-[10px] text-gray-500">12 AI optical gates · LiDAR boundary active</p>
              </div>
            </div>
          </div>

          <!-- Property Quick Info -->
          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
            <div class="flex items-center gap-3">
              <img src="${prop.mainImage}" alt="${prop.title}" class="w-16 h-16 object-cover rounded-xl" loading="lazy">
              <div>
                <h4 class="text-sm font-bold text-white">${prop.title}</h4>
                <p class="text-xs text-gray-400">${prop.location}</p>
                <p class="text-sm font-bold text-secondary mt-0.5">${prop.priceFormatted}</p>
              </div>
            </div>
            <button class="w-full btn-glass py-2.5 text-xs font-bold text-gray-200 hover:text-secondary cursor-pointer" id="twin-view-details-btn">
              Full Property Details
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Boot the Three.js viewer and store the reference for cleanup
  const twinContainer = container.querySelector('#twin-canvas-container');
  if (twinContainer) {
    activeViewer = createDigitalTwinViewer(twinContainer);
  }

  // Property switcher
  const propertySwitcher = container.querySelector('#twin-property-switcher');
  if (propertySwitcher) {
    propertySwitcher.addEventListener('change', e => {
      store.setRoute('digital-twin', e.target.value);
    });
  }

  // Wireframe toggle
  let wireframeOn = false;
  const wireframeBtn = container.querySelector('#toggle-wireframe-btn');
  if (wireframeBtn && activeViewer) {
    wireframeBtn.addEventListener('click', () => {
      wireframeOn = !wireframeOn;
      activeViewer.toggleWireframe(wireframeOn);
      wireframeBtn.classList.toggle('text-secondary', wireframeOn);
      store.addToast(`Wireframe ${wireframeOn ? 'on' : 'off'}`, 'info');
    });
  }

  // Floor selector
  container.querySelectorAll('.floor-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.floor-btn').forEach(b => {
        b.classList.remove('bg-secondary', 'text-black');
        b.classList.add('text-gray-300');
      });
      btn.classList.add('bg-secondary', 'text-black');
      btn.classList.remove('text-gray-300');
      if (activeViewer) activeViewer.setFloorFocus(btn.getAttribute('data-floor'));
    });
  });

  const bookTourBtn = container.querySelector('#twin-book-tour-btn');
  if (bookTourBtn) bookTourBtn.addEventListener('click', () => store.openModal('book-tour', { property: prop }));

  const viewDetailsBtn = container.querySelector('#twin-view-details-btn');
  if (viewDetailsBtn) viewDetailsBtn.addEventListener('click', () => store.setRoute('property-detail', prop.id));
}
