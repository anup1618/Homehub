import { store } from '../store.js';

/**
 * Returns the HTML string for a single property card.
 * Used in both HomeView and BrowseView to avoid duplication.
 */
export function renderPropertyCard(p) {
  const isFav = store.isFavorite(p.id);

  return `
    <div class="glass-card rounded-3xl overflow-hidden flex flex-col border-white/10 hover:border-secondary/40 transition-all duration-300 group">
      <div class="relative aspect-[16/11] overflow-hidden">
        <img src="${p.mainImage}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy">
        <div class="absolute inset-0 bg-gradient-to-t from-surface-low via-transparent to-black/30"></div>

        <div class="absolute top-4 left-4 flex gap-2">
          <span class="bg-secondary/90 backdrop-blur-md text-black font-bold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-lg">${p.badge}</span>
          <span class="bg-black/60 backdrop-blur-md text-white text-[10px] uppercase px-3 py-1 rounded-full border border-white/10">${p.type}</span>
        </div>

        <button
          class="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 backdrop-blur-md transition-all fav-toggle-btn cursor-pointer ${isFav ? 'text-secondary' : 'text-white hover:text-secondary hover:bg-black/80'}"
          data-id="${p.id}"
          title="${isFav ? 'Remove from saved' : 'Save property'}"
        >
          <span class="material-symbols-outlined text-[18px] ${isFav ? 'fill-1' : ''}">favorite</span>
        </button>

        <div class="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-secondary/30 text-[11px] text-secondary">
          <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
          3D Twin Ready
        </div>
      </div>

      <div class="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-baseline mb-1">
            <p class="font-display text-2xl font-bold text-secondary glow-text">${p.priceFormatted}</p>
            <span class="text-xs text-gray-400">${p.sqft.toLocaleString()} sq ft</span>
          </div>
          <h3 class="font-display text-lg font-bold text-white group-hover:text-secondary transition-colors mb-1 truncate">${p.title}</h3>
          <p class="text-xs text-gray-400 flex items-center gap-1 mb-4 truncate">
            <span class="material-symbols-outlined text-xs text-secondary">location_on</span>
            ${p.location}
          </p>
        </div>

        <div>
          <div class="grid grid-cols-3 gap-2 py-3 border-y border-white/10 text-center mb-5">
            <div>
              <span class="block font-bold text-white text-sm">${p.beds}</span>
              <span class="text-[10px] text-gray-400 uppercase">Beds</span>
            </div>
            <div>
              <span class="block font-bold text-white text-sm">${p.baths}</span>
              <span class="text-[10px] text-gray-400 uppercase">Baths</span>
            </div>
            <div>
              <span class="block font-bold text-white text-sm">${p.yearBuilt}</span>
              <span class="text-[10px] text-gray-400 uppercase">Built</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button class="flex-1 btn-primary py-2.5 text-xs font-bold prop-card-view-btn cursor-pointer" data-id="${p.id}">
              View Details
            </button>
            <button class="p-2.5 rounded-full btn-glass prop-card-twin-btn hover:border-secondary cursor-pointer" data-id="${p.id}" title="Open 3D viewer">
              <span class="material-symbols-outlined text-[18px]">view_in_ar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Wires up click events for all property cards rendered inside a container.
 * Call this once after injecting card HTML.
 */
export function wirePropertyCardEvents(container) {
  container.querySelectorAll('.prop-card-view-btn').forEach(btn => {
    btn.addEventListener('click', () => store.setRoute('property-detail', btn.getAttribute('data-id')));
  });

  container.querySelectorAll('.prop-card-twin-btn').forEach(btn => {
    btn.addEventListener('click', () => store.setRoute('digital-twin', btn.getAttribute('data-id')));
  });

  container.querySelectorAll('.fav-toggle-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      store.toggleFavorite(btn.getAttribute('data-id'));
    });
  });
}
