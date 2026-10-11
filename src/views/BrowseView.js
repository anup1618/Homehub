import { store } from '../store.js';
import { renderPropertyCard, wirePropertyCardEvents } from '../utils/propertyCard.js';

export function renderBrowseView(container) {
  const filteredList = store.getFilteredProperties();
  const filters = store.state.filters;

  const html = `
    <div class="min-h-screen pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <span class="text-secondary text-xs uppercase font-bold tracking-widest block mb-1">Listings</span>
          <h1 class="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white">Browse Properties</h1>
          <p class="text-xs sm:text-sm text-gray-400 mt-1 font-light">Every property verified with a 3D architectural digital twin.</p>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-400 font-medium">Showing <strong class="text-white">${filteredList.length}</strong> properties</span>
          <button class="btn-glass px-4 py-2 text-xs font-semibold cursor-pointer" id="reset-filters-btn">
            Reset Filters
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Filter Sidebar -->
        <div class="lg:col-span-4 glass-panel-heavy p-6 rounded-3xl border border-white/10 space-y-6 sticky top-28">
          <div class="flex justify-between items-center pb-4 border-b border-white/10">
            <h3 class="font-display text-lg font-bold text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary">tune</span> Filters
            </h3>
            <span class="text-[11px] text-secondary font-bold uppercase tracking-wider">Active</span>
          </div>

          <!-- Keyword Search -->
          <div>
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Location or Name</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-3 text-gray-400 text-sm">search</span>
              <input type="text" id="browse-search-input" value="${filters.keyword}" placeholder="Bel Air, New York, Miami..." class="w-full bg-surface-high border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none">
            </div>
          </div>

          <!-- Type Filter -->
          <div>
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Property Type</label>
            <div class="grid grid-cols-2 gap-2">
              ${['All', 'Villa', 'Penthouse', 'Waterfront', 'Modern Estate'].map(t => `
                <button class="type-filter-btn px-3 py-2 rounded-xl text-xs font-medium border transition-all text-center ${filters.type === t ? 'bg-secondary text-black font-bold border-secondary shadow-[0_0_15px_rgba(68,226,205,0.3)]' : 'bg-surface-high/60 text-gray-300 border-white/5 hover:border-secondary/30'}" data-type="${t}">
                  ${t}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Price Range -->
          <div>
            <div class="flex justify-between items-center mb-2 text-xs">
              <span class="font-semibold text-gray-300 uppercase tracking-wider">Max Price</span>
              <span class="text-secondary font-bold font-display" id="price-slider-display">$${(filters.maxPrice / 1000000).toFixed(1)}M</span>
            </div>
            <input type="range" min="5000000" max="30000000" step="500000" value="${filters.maxPrice}" id="price-slider" class="w-full">
            <div class="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>$5M</span><span>$15M</span><span>$30M+</span>
            </div>
          </div>

          <!-- Bedroom Filter -->
          <div>
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Min Bedrooms</label>
            <div class="flex gap-2">
              ${['Any', '5', '6', '7', '8'].map(b => `
                <button class="bed-filter-btn flex-1 py-2 rounded-xl text-xs font-medium border transition-all text-center ${filters.beds === b ? 'bg-secondary text-black font-bold border-secondary' : 'bg-surface-high/60 text-gray-300 border-white/5 hover:border-secondary/30'}" data-beds="${b}">
                  ${b === 'Any' ? 'Any' : b + '+'}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Sort -->
          <div>
            <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Sort By</label>
            <select id="sort-select" class="w-full bg-surface-high border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-secondary focus:ring-1 focus:ring-secondary outline-none cursor-pointer">
              <option value="featured" ${filters.sortBy === 'featured' ? 'selected' : ''}>Featured</option>
              <option value="price-desc" ${filters.sortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
              <option value="price-asc" ${filters.sortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
              <option value="sqft" ${filters.sortBy === 'sqft' ? 'selected' : ''}>Largest First</option>
            </select>
          </div>
        </div>

        <!-- Property Grid -->
        <div class="lg:col-span-8">
          ${filteredList.length === 0 ? `
            <div class="glass-panel rounded-3xl p-16 text-center border-white/10">
              <span class="material-symbols-outlined text-6xl text-gray-600 mb-3">search_off</span>
              <h3 class="font-display text-2xl font-bold text-white mb-2">No Results</h3>
              <p class="text-sm text-gray-400 max-w-md mx-auto mb-6">Try widening your filters or adjusting the price range.</p>
              <button class="btn-primary px-6 py-2.5 text-xs font-bold" id="grid-reset-btn">Reset Filters</button>
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              ${filteredList.map(p => renderPropertyCard(p)).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Filter listeners
  const searchInput = container.querySelector('#browse-search-input');
  if (searchInput) searchInput.addEventListener('input', e => store.setFilters({ keyword: e.target.value }));

  container.querySelectorAll('.type-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => store.setFilters({ type: btn.getAttribute('data-type') }));
  });

  const priceSlider = container.querySelector('#price-slider');
  if (priceSlider) {
    priceSlider.addEventListener('input', e => {
      const val = parseInt(e.target.value, 10);
      const display = container.querySelector('#price-slider-display');
      if (display) display.textContent = `$${(val / 1000000).toFixed(1)}M`;
      store.setFilters({ maxPrice: val });
    });
  }

  container.querySelectorAll('.bed-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => store.setFilters({ beds: btn.getAttribute('data-beds') }));
  });

  const sortSelect = container.querySelector('#sort-select');
  if (sortSelect) sortSelect.addEventListener('change', e => store.setFilters({ sortBy: e.target.value }));

  const resetBtn = container.querySelector('#reset-filters-btn');
  const gridResetBtn = container.querySelector('#grid-reset-btn');
  if (resetBtn) resetBtn.addEventListener('click', () => store.resetFilters());
  if (gridResetBtn) gridResetBtn.addEventListener('click', () => store.resetFilters());

  // Property card events (shared utility)
  wirePropertyCardEvents(container);
}
