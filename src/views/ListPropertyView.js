import { store } from '../store.js';
import { sanitizeText, sanitizeEmail, sanitizePhone, sanitizeNumber } from '../utils/sanitize.js';

export function renderListPropertyView(container) {
  let currentStep = 1;
  const formData = {
    address: '',
    city: 'Los Angeles',
    type: 'Villa',
    beds: 6,
    baths: 7,
    sqft: 8500,
    lotSize: '1.2 Acres',
    yearBuilt: 2024,
    amenities: ['Infinity Pool', 'Smart Home', 'Wine Cellar'],
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ndaRequired: true
  };

  function estimateValuation(sqft, type, amenityCount) {
    const rateByType = { Penthouse: 1800, Waterfront: 1650, Villa: 1400 };
    const baseRate = rateByType[type] || 1200;
    const total = sqft * baseRate + amenityCount * 350000;
    return {
      low: Math.round(total * 0.92),
      est: Math.round(total),
      high: Math.round(total * 1.12)
    };
  }

  function renderWizard() {
    const val = estimateValuation(formData.sqft, formData.type, formData.amenities.length);

    const html = `
      <div class="min-h-screen pt-28 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
        <!-- Title -->
        <div class="text-center mb-10 space-y-2">
          <span class="text-secondary text-xs uppercase font-bold tracking-widest block">Seller Services</span>
          <h1 class="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white">List Your Property</h1>
          <p class="text-xs sm:text-sm text-gray-300 font-light max-w-xl mx-auto">
            Get an AI-generated market valuation, 3D digital twin, and matched with qualified buyers from our private network.
          </p>
        </div>

        <!-- Progress Steps -->
        <div class="flex items-center justify-between mb-10 max-w-2xl mx-auto relative">
          <div class="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 -z-10"></div>

          ${[
            { n: 1, label: 'Details' },
            { n: 2, label: 'Amenities' },
            { n: 3, label: 'Valuation' },
            { n: 4, label: 'Submit' }
          ].map(step => `
            <div class="flex flex-col items-center gap-1.5">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep >= step.n ? 'bg-secondary text-black shadow-[0_0_20px_rgba(68,226,205,0.5)]' : 'bg-surface-high text-gray-400 border border-white/10'}">
                ${step.n}
              </div>
              <span class="text-[10px] uppercase font-bold ${currentStep >= step.n ? 'text-secondary' : 'text-gray-500'}">${step.label}</span>
            </div>
          `).join('')}
        </div>

        <!-- Wizard Body -->
        <div class="glass-panel-heavy p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl">

          <!-- Step 1: Property Details -->
          ${currentStep === 1 ? `
            <div class="space-y-6">
              <h3 class="font-display text-2xl font-bold text-white mb-2">Step 1: Property Details</h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="block text-xs text-gray-300 font-semibold uppercase tracking-wider mb-1.5">Street Address</label>
                  <input type="text" id="wiz-address" value="${formData.address}" placeholder="e.g. 1080 Bel Air Crest Rd" class="w-full bg-surface-high border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-secondary outline-none">
                </div>

                <div>
                  <label class="block text-xs text-gray-300 font-semibold uppercase tracking-wider mb-1.5">City / Market</label>
                  <select id="wiz-city" class="w-full bg-surface-high border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-secondary outline-none cursor-pointer">
                    <option value="Los Angeles" ${formData.city === 'Los Angeles' ? 'selected' : ''}>Los Angeles / Beverly Hills</option>
                    <option value="New York" ${formData.city === 'New York' ? 'selected' : ''}>New York / Manhattan</option>
                    <option value="Miami" ${formData.city === 'Miami' ? 'selected' : ''}>Miami / Palm Beach</option>
                    <option value="Aspen" ${formData.city === 'Aspen' ? 'selected' : ''}>Aspen / Colorado</option>
                    <option value="Dubai" ${formData.city === 'Dubai' ? 'selected' : ''}>Dubai / UAE</option>
                    <option value="French Riviera" ${formData.city === 'French Riviera' ? 'selected' : ''}>Cap d'Antibes / France</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs text-gray-300 font-semibold uppercase tracking-wider mb-1.5">Property Type</label>
                  <select id="wiz-type" class="w-full bg-surface-high border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-secondary outline-none cursor-pointer">
                    <option value="Villa" ${formData.type === 'Villa' ? 'selected' : ''}>Modern Villa</option>
                    <option value="Penthouse" ${formData.type === 'Penthouse' ? 'selected' : ''}>Penthouse</option>
                    <option value="Waterfront" ${formData.type === 'Waterfront' ? 'selected' : ''}>Waterfront Estate</option>
                    <option value="Modern Estate" ${formData.type === 'Modern Estate' ? 'selected' : ''}>Alpine / Modern Estate</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs text-gray-300 font-semibold uppercase tracking-wider mb-1.5">Bedrooms</label>
                  <input type="number" id="wiz-beds" value="${formData.beds}" min="1" max="20" class="w-full bg-surface-high border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-secondary outline-none">
                </div>

                <div>
                  <label class="block text-xs text-gray-300 font-semibold uppercase tracking-wider mb-1.5">Bathrooms</label>
                  <input type="number" id="wiz-baths" value="${formData.baths}" min="1" max="25" class="w-full bg-surface-high border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-secondary outline-none">
                </div>

                <div>
                  <label class="block text-xs text-gray-300 font-semibold uppercase tracking-wider mb-1.5">Interior Sq Ft</label>
                  <input type="number" id="wiz-sqft" value="${formData.sqft}" min="2000" max="50000" step="500" class="w-full bg-surface-high border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-secondary outline-none">
                </div>

                <div>
                  <label class="block text-xs text-gray-300 font-semibold uppercase tracking-wider mb-1.5">Year Built</label>
                  <input type="number" id="wiz-year" value="${formData.yearBuilt}" min="1950" max="2026" class="w-full bg-surface-high border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-secondary outline-none">
                </div>
              </div>

              <div class="flex justify-end pt-4">
                <button class="btn-primary px-8 py-3.5 text-xs font-bold tracking-widest" id="wiz-next-1">
                  Next: Amenities &rarr;
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Step 2: Amenities -->
          ${currentStep === 2 ? `
            <div class="space-y-6">
              <h3 class="font-display text-2xl font-bold text-white mb-2">Step 2: Amenities</h3>
              <p class="text-xs text-gray-400">Select everything your property includes — this improves the accuracy of your estimate.</p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                ${[
                  "Infinity Pool",
                  "Smart Home System",
                  "Wine Cellar",
                  "Private Spa & Sauna",
                  "Helipad",
                  "Deep Water Dock",
                  "Underground Garage",
                  "Geothermal Heating",
                  "Private Beach",
                  "Tennis Court"
                ].map(amenity => {
                  const checked = formData.amenities.includes(amenity);
                  return `
                    <label class="flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${checked ? 'bg-secondary/15 border-secondary text-white' : 'bg-surface-high/60 border-white/5 text-gray-300 hover:border-white/20'}">
                      <input type="checkbox" class="amenity-checkbox hidden" value="${amenity}" ${checked ? 'checked' : ''}>
                      <span class="material-symbols-outlined text-sm ${checked ? 'text-secondary' : 'text-gray-500'}">
                        ${checked ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span class="text-xs font-medium">${amenity}</span>
                    </label>
                  `;
                }).join('')}
              </div>

              <div class="flex justify-between pt-6 border-t border-white/10">
                <button class="btn-glass px-6 py-3 text-xs font-bold" id="wiz-prev-2">&larr; Back</button>
                <button class="btn-primary px-8 py-3.5 text-xs font-bold tracking-widest" id="wiz-next-2">
                  Get AI Estimate &rarr;
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Step 3: Valuation -->
          ${currentStep === 3 ? `
            <div class="space-y-8 text-center">
              <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs uppercase font-bold tracking-widest">
                <span class="material-symbols-outlined text-sm">bolt</span> Estimate Ready
              </div>

              <div>
                <span class="text-xs text-gray-400 uppercase font-bold tracking-widest block mb-2">Estimated Market Value</span>
                <p class="font-display text-4xl sm:text-6xl font-extrabold text-secondary glow-text mb-2">
                  $${(val.est / 1000000).toFixed(2)}M
                </p>
                <p class="text-xs text-gray-400">
                  Range: <span class="text-white font-semibold">$${(val.low / 1000000).toFixed(2)}M – $${(val.high / 1000000).toFixed(2)}M</span>
                </p>
              </div>

              <div class="grid grid-cols-3 gap-4 max-w-lg mx-auto p-4 rounded-2xl bg-surface-high/60 border border-white/5 text-xs">
                <div>
                  <span class="text-gray-400 text-[10px] uppercase block">Model</span>
                  <span class="font-bold text-white">Spatial Comps AI</span>
                </div>
                <div>
                  <span class="text-gray-400 text-[10px] uppercase block">Accuracy</span>
                  <span class="font-bold text-secondary">97.8%</span>
                </div>
                <div>
                  <span class="text-gray-400 text-[10px] uppercase block">Twin Tier</span>
                  <span class="font-bold text-white">Platinum</span>
                </div>
              </div>

              <p class="text-xs text-gray-300 font-light max-w-md mx-auto">
                An advisor will review your listing and prepare a marketing package within 24 hours.
              </p>

              <div class="flex justify-between pt-6 border-t border-white/10">
                <button class="btn-glass px-6 py-3 text-xs font-bold" id="wiz-prev-3">&larr; Adjust</button>
                <button class="btn-primary px-8 py-3.5 text-xs font-bold tracking-widest" id="wiz-next-3">
                  Continue to Submit &rarr;
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Step 4: Submit -->
          ${currentStep === 4 ? `
            <div class="space-y-6">
              <h3 class="font-display text-2xl font-bold text-white mb-2">Step 4: Your Contact Info</h3>
              <p class="text-xs text-gray-400">Your information is kept strictly confidential and shared only with your assigned advisor.</p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-300 font-semibold uppercase tracking-wider mb-1.5">Full Name</label>
                  <input type="text" id="wiz-name" placeholder="Alex Sterling" class="w-full bg-surface-high border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-secondary outline-none">
                </div>

                <div>
                  <label class="block text-xs text-gray-300 font-semibold uppercase tracking-wider mb-1.5">Email Address</label>
                  <input type="email" id="wiz-email" placeholder="alex@example.com" class="w-full bg-surface-high border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-secondary outline-none">
                </div>

                <div class="sm:col-span-2">
                  <label class="block text-xs text-gray-300 font-semibold uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input type="tel" id="wiz-phone" placeholder="+1 (555) 019-2849" class="w-full bg-surface-high border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-secondary outline-none">
                </div>

                <div class="sm:col-span-2">
                  <label class="flex items-center gap-3 p-4 rounded-2xl bg-surface-high/60 border border-white/10 cursor-pointer">
                    <input type="checkbox" id="wiz-nda" checked class="text-secondary focus:ring-0">
                    <span class="text-xs text-gray-200">Require NDA before marketing this property</span>
                  </label>
                </div>
              </div>

              <div class="flex justify-between pt-6 border-t border-white/10">
                <button class="btn-glass px-6 py-3 text-xs font-bold" id="wiz-prev-4">&larr; Back</button>
                <button class="btn-primary px-8 py-3.5 text-xs font-bold tracking-widest shadow-[0_0_25px_rgba(68,226,205,0.5)]" id="wiz-submit">
                  Submit Listing
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Step listeners
    if (currentStep === 1) {
      const next1 = container.querySelector('#wiz-next-1');
      if (next1) {
        next1.addEventListener('click', () => {
          formData.address = sanitizeText(container.querySelector('#wiz-address')?.value || '');
          formData.city = sanitizeText(container.querySelector('#wiz-city')?.value || 'Los Angeles');
          formData.type = sanitizeText(container.querySelector('#wiz-type')?.value || 'Villa');
          formData.beds = sanitizeNumber(container.querySelector('#wiz-beds')?.value, 1, 30, 6);
          formData.baths = sanitizeNumber(container.querySelector('#wiz-baths')?.value, 1, 30, 7);
          formData.sqft = sanitizeNumber(container.querySelector('#wiz-sqft')?.value, 500, 100000, 8500);
          formData.yearBuilt = sanitizeNumber(container.querySelector('#wiz-year')?.value, 1800, 2030, 2024);
          currentStep = 2;
          renderWizard();
        });
      }
    } else if (currentStep === 2) {
      const prev2 = container.querySelector('#wiz-prev-2');
      const next2 = container.querySelector('#wiz-next-2');
      if (prev2) prev2.addEventListener('click', () => { currentStep = 1; renderWizard(); });

      container.querySelectorAll('.amenity-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
          const v = cb.value;
          if (cb.checked) {
            if (!formData.amenities.includes(v)) formData.amenities.push(v);
          } else {
            formData.amenities = formData.amenities.filter(a => a !== v);
          }
          renderWizard();
        });
      });

      if (next2) next2.addEventListener('click', () => { currentStep = 3; renderWizard(); });
    } else if (currentStep === 3) {
      const prev3 = container.querySelector('#wiz-prev-3');
      const next3 = container.querySelector('#wiz-next-3');
      if (prev3) prev3.addEventListener('click', () => { currentStep = 2; renderWizard(); });
      if (next3) next3.addEventListener('click', () => { currentStep = 4; renderWizard(); });
    } else if (currentStep === 4) {
      const prev4 = container.querySelector('#wiz-prev-4');
      const submitBtn = container.querySelector('#wiz-submit');
      if (prev4) prev4.addEventListener('click', () => { currentStep = 3; renderWizard(); });
      if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Saving to Database...';

          formData.ownerName = sanitizeText(container.querySelector('#wiz-name')?.value || store.state.user?.fullName || '');
          formData.ownerEmail = sanitizeEmail(container.querySelector('#wiz-email')?.value) || store.state.user?.email || '';
          formData.ownerPhone = sanitizePhone(container.querySelector('#wiz-phone')?.value || '');
          formData.ndaRequired = container.querySelector('#wiz-nda')?.checked ?? true;

          const val = estimateValuation(formData.sqft, formData.type, formData.amenities.length);
          formData.price = val.est;
          formData.priceFormatted = `$${val.est.toLocaleString()}`;
          formData.title = `${formData.type} at ${formData.address || 'Beverly Hills'}`;

          await store.submitListing(formData);
          store.addToast('Listing successfully submitted and registered in database!', 'success');
          setTimeout(() => store.setRoute('browse'), 1200);
        });
      }
    }
  }

  renderWizard();
}
