import { store } from '../store.js';
import { properties } from '../data/properties.js';
import { advisors } from '../data/advisors.js';
import { analyticsService } from '../services/analyticsService.js';
import { getTrackerModalHtml, attachTrackerListeners } from './TrackerModal.js';
import { sanitizeText, sanitizeEmail, sanitizePhone } from '../utils/sanitize.js';

export function renderModals(container) {
  const state = store.state;
  const activeModal = state.activeModal;
  const payload = state.modalPayload;

  let modalHtml = '';

  // 1. Saved Properties Drawer
  if (activeModal === 'favorites') {
    const favProps = properties.filter(p => state.favorites.includes(p.id));
    modalHtml = `
      <div class="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm" id="modal-overlay">
        <div class="w-full max-w-md h-full glass-panel-heavy border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl animate-[slideInRight_0.3s_ease-out]">
          <div>
            <div class="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary fill-1">favorite</span>
                <h3 class="font-display text-xl font-bold text-white">Saved Properties</h3>
              </div>
              <button class="text-gray-400 hover:text-white p-1 rounded-lg glass-card cursor-pointer" id="close-modal-btn">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            ${favProps.length === 0 ? `
              <div class="text-center py-16 text-gray-400">
                <span class="material-symbols-outlined text-5xl mb-3 text-gray-600">favorite_border</span>
                <p class="font-medium text-base mb-1">No saved properties yet</p>
                <p class="text-xs text-gray-500 max-w-xs mx-auto mb-6">Browse properties and click the heart icon to save ones you like.</p>
                <button class="btn-primary px-6 py-2.5 text-xs font-bold" id="fav-explore-btn">Browse Properties</button>
              </div>
            ` : `
              <div class="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                ${favProps.map(p => `
                  <div class="glass-card p-3 rounded-xl flex gap-3.5 items-center group relative border-white/5 hover:border-secondary/30">
                    <img src="${p.mainImage}" alt="${p.title}" class="w-20 h-20 object-cover rounded-lg" loading="lazy">
                    <div class="flex-1 min-w-0">
                      <p class="text-xs text-secondary font-bold uppercase tracking-wider">${p.type}</p>
                      <h4 class="text-sm font-bold text-white truncate group-hover:text-secondary transition-colors">${p.title}</h4>
                      <p class="text-xs text-gray-400 truncate mb-1">${p.location}</p>
                      <p class="text-sm font-bold text-secondary">${p.priceFormatted}</p>
                    </div>
                    <div class="flex flex-col gap-2">
                      <button class="p-1.5 rounded-lg bg-white/5 hover:bg-secondary hover:text-black text-gray-300 transition-all view-prop-btn cursor-pointer" data-id="${p.id}" title="View">
                        <span class="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                      <button class="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all remove-fav-btn cursor-pointer" data-id="${p.id}" title="Remove">
                        <span class="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          ${favProps.length > 0 ? `
            <div class="pt-4 border-t border-white/10 space-y-3">
              <div class="flex justify-between text-xs text-gray-400">
                <span>Combined value</span>
                <span class="font-bold text-white text-sm">$${favProps.reduce((s, p) => s + p.price, 0).toLocaleString()}</span>
              </div>
              <button class="w-full btn-primary py-3 text-xs font-bold tracking-widest" id="book-collection-tour-btn">
                Talk to an Advisor
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 2. Book a Tour Modal
  else if (activeModal === 'book-tour') {
    const prop = payload?.property || store.getSelectedProperty();
    const currentUser = state.user;
    modalHtml = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" id="modal-overlay">
        <div class="w-full max-w-lg glass-panel-heavy rounded-2xl p-6 md:p-8 border border-white/15 shadow-2xl relative animate-[fadeIn_0.25s_ease-out]">
          <button class="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg glass-card cursor-pointer" id="close-modal-btn">
            <span class="material-symbols-outlined">close</span>
          </button>

          <div class="flex items-center gap-3 mb-4">
            <div class="p-2.5 rounded-xl bg-secondary/15 text-secondary border border-secondary/30">
              <span class="material-symbols-outlined text-2xl">calendar_month</span>
            </div>
            <div>
              <span class="text-xs uppercase tracking-widest font-bold text-secondary">Private Showing</span>
              <h3 class="font-display text-xl font-bold text-white">Book a VIP Tour</h3>
            </div>
          </div>

          <div class="glass-card p-3 rounded-xl flex items-center gap-3 mb-5 border-white/5">
            <img src="${prop.mainImage}" alt="${prop.title}" class="w-14 h-14 object-cover rounded-lg" loading="lazy">
            <div class="min-w-0">
              <h4 class="text-sm font-bold text-white truncate">${prop.title}</h4>
              <p class="text-xs text-gray-400 truncate">${prop.location}</p>
              <p class="text-xs text-secondary font-bold">${prop.priceFormatted}</p>
            </div>
          </div>

          <form id="tour-form" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 font-medium mb-1">Showing Format</label>
                <select id="tour-format" class="w-full bg-surface-high border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-secondary outline-none">
                  <option value="In-Person VIP Showing">In-Person VIP Showing</option>
                  <option value="Live 3D Digital Twin Session">Live 3D Digital Twin</option>
                  <option value="Private Helicopter Transfer">Helicopter + Ground Tour</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-300 font-medium mb-1">Preferred Date</label>
                <input type="date" id="tour-date" required class="w-full bg-surface-high border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-secondary outline-none">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 font-medium mb-1">Full Name</label>
                <input type="text" id="tour-name" required value="${currentUser?.fullName || ''}" placeholder="Alexander Wright" class="w-full bg-surface-high border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-secondary outline-none">
              </div>
              <div>
                <label class="block text-xs text-gray-300 font-medium mb-1">Email</label>
                <input type="email" id="tour-email" required value="${currentUser?.email || ''}" placeholder="alexander@example.com" class="w-full bg-surface-high border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-secondary outline-none">
              </div>
            </div>

            <div>
              <label class="block text-xs text-gray-300 font-medium mb-1">Phone Number</label>
              <input type="tel" id="tour-phone" placeholder="+1 (310) 555-0199" class="w-full bg-surface-high border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-secondary outline-none">
            </div>

            <div>
              <label class="block text-xs text-gray-300 font-medium mb-1">Special Preferences or Security Clearances</label>
              <textarea id="tour-notes" rows="2" placeholder="Private security escort, NDA required, etc." class="w-full bg-surface-high border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-secondary outline-none resize-none"></textarea>
            </div>

            <button type="submit" class="w-full btn-primary py-3 text-xs font-bold tracking-widest shadow-[0_0_20px_rgba(68,226,205,0.4)]">
              Confirm Reservation & Save to Database
            </button>
          </form>
        </div>
      </div>
    `;
  }

  // 3. Contact Advisor Modal
  else if (activeModal === 'contact-advisor') {
    const adv = payload?.advisor || advisors[0];
    modalHtml = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" id="modal-overlay">
        <div class="w-full max-w-md glass-panel-heavy rounded-2xl p-6 md:p-8 border border-white/15 shadow-2xl relative animate-[fadeIn_0.25s_ease-out]">
          <button class="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg glass-card cursor-pointer" id="close-modal-btn">
            <span class="material-symbols-outlined">close</span>
          </button>

          <div class="text-center mb-5">
            <img src="${adv.image}" alt="${adv.name}" class="w-20 h-20 object-cover rounded-full mx-auto mb-3 border-2 border-secondary p-0.5" loading="lazy">
            <h3 class="font-display text-xl font-bold text-white">${adv.name}</h3>
            <p class="text-xs text-secondary font-medium">${adv.title}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">${adv.territory} · ${adv.totalSales} closed</p>
          </div>

          <form id="advisor-contact-form" class="space-y-3.5">
            <div>
              <label class="block text-xs text-gray-300 font-medium mb-1">Full Name</label>
              <input type="text" required placeholder="Your full name" class="w-full bg-surface-high border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-secondary outline-none">
            </div>
            <div>
              <label class="block text-xs text-gray-300 font-medium mb-1">Email</label>
              <input type="email" required placeholder="you@example.com" class="w-full bg-surface-high border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-secondary outline-none">
            </div>
            <div>
              <label class="block text-xs text-gray-300 font-medium mb-1">Phone</label>
              <input type="tel" required placeholder="+1 (555) ..." class="w-full bg-surface-high border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-secondary outline-none">
            </div>
            <div>
              <label class="block text-xs text-gray-300 font-medium mb-1">What can we help with?</label>
              <select class="w-full bg-surface-high border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-secondary outline-none">
                <option>Buying a property</option>
                <option>Selling a property</option>
                <option>Portfolio management</option>
                <option>3D twin commissioning</option>
              </select>
            </div>
            <button type="submit" class="w-full btn-primary py-3 text-xs font-bold tracking-widest mt-2">
              Send Private Inquiry
            </button>
          </form>
        </div>
      </div>
    `;
  }

  // 4. SECURITY & AUTHENTICATION MODAL (Supabase Auth / JWT + RLS)
  else if (activeModal === 'auth') {
    const initialTab = payload?.tab || 'signin';
    modalHtml = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" id="modal-overlay">
        <div class="w-full max-w-md glass-panel-heavy rounded-2xl p-6 sm:p-8 border border-white/15 shadow-2xl relative animate-[fadeIn_0.25s_ease-out]">
          <button class="absolute top-5 right-5 text-gray-400 hover:text-white p-1.5 rounded-lg glass-card cursor-pointer transition-colors" id="close-modal-btn">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>

          <!-- Security Badge Header -->
          <div class="text-center mb-6">
            <div class="w-12 h-12 rounded-2xl bg-secondary/15 border border-secondary/30 text-secondary flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(68,226,205,0.25)]">
              <span class="material-symbols-outlined text-2xl">shield_lock</span>
            </div>
            <span class="text-[10px] uppercase font-bold tracking-widest text-secondary block">End-to-End Encrypted</span>
            <h3 class="font-display text-2xl font-bold text-white mt-0.5">HomeHub Private Access</h3>
            <p class="text-xs text-gray-400 mt-1">Connect your verified profile to save estates & manage off-market tours.</p>
          </div>

          <!-- Auth Tab Switcher -->
          <div class="flex p-1 bg-surface-high rounded-xl border border-white/10 mb-6">
            <button class="flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${initialTab === 'signin' ? 'bg-secondary text-black shadow-lg' : 'text-gray-400 hover:text-white'}" id="auth-tab-signin">
              Sign In
            </button>
            <button class="flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${initialTab === 'signup' ? 'bg-secondary text-black shadow-lg' : 'text-gray-400 hover:text-white'}" id="auth-tab-signup">
              Create Account
            </button>
          </div>

          <!-- SIGN IN FORM -->
          <form id="auth-signin-form" class="${initialTab === 'signin' ? 'block' : 'hidden'} space-y-4">
            <div>
              <label class="block text-xs text-gray-300 font-medium mb-1">Email Address</label>
              <div class="relative">
                <input type="email" id="signin-email" required placeholder="alexander@homehub.luxury" class="w-full bg-surface-high border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white focus:border-secondary outline-none">
                <span class="material-symbols-outlined text-[18px] text-gray-400 absolute left-3 top-2.5">mail</span>
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="block text-xs text-gray-300 font-medium">Password</label>
                <span class="text-[10px] text-secondary/80 hover:text-secondary cursor-pointer" id="auth-demo-fill">Use Demo VIP</span>
              </div>
              <div class="relative">
                <input type="password" id="signin-password" required placeholder="••••••••••••" class="w-full bg-surface-high border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-xs text-white focus:border-secondary outline-none">
                <span class="material-symbols-outlined text-[18px] text-gray-400 absolute left-3 top-2.5">key</span>
                <button type="button" class="absolute right-3 top-2.5 text-gray-400 hover:text-white toggle-pwd-btn cursor-pointer">
                  <span class="material-symbols-outlined text-[18px]">visibility</span>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between text-xs text-gray-400 pt-1">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked class="text-secondary rounded focus:ring-0">
                <span>Remember session</span>
              </label>
              <span class="text-secondary text-[11px] hover:underline cursor-pointer">Forgot credentials?</span>
            </div>

            <button type="submit" id="signin-submit-btn" class="w-full btn-primary py-3 text-xs font-bold tracking-widest shadow-[0_0_20px_rgba(68,226,205,0.4)] mt-2">
              Sign In Securely
            </button>
          </form>

          <!-- SIGN UP / REGISTER FORM -->
          <form id="auth-signup-form" class="${initialTab === 'signup' ? 'block' : 'hidden'} space-y-3.5">
            <div>
              <label class="block text-xs text-gray-300 font-medium mb-1">Full Legal Name</label>
              <div class="relative">
                <input type="text" id="signup-fullname" required placeholder="Elena Rostova" class="w-full bg-surface-high border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white focus:border-secondary outline-none">
                <span class="material-symbols-outlined text-[18px] text-gray-400 absolute left-3 top-2.5">person</span>
              </div>
            </div>

            <div>
              <label class="block text-xs text-gray-300 font-medium mb-1">Email Address</label>
              <div class="relative">
                <input type="email" id="signup-email" required placeholder="elena@privatecapital.com" class="w-full bg-surface-high border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white focus:border-secondary outline-none">
                <span class="material-symbols-outlined text-[18px] text-gray-400 absolute left-3 top-2.5">mail</span>
              </div>
            </div>

            <div>
              <label class="block text-xs text-gray-300 font-medium mb-1">Client Profile Role</label>
              <select id="signup-role" class="w-full bg-surface-high border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-secondary outline-none">
                <option value="buyer">Luxury Home Buyer & Collector</option>
                <option value="investor">Institutional / Private Family Office</option>
                <option value="seller">Estate Owner / Seller</option>
                <option value="advisor">Licensed Luxury Broker</option>
              </select>
            </div>

            <div>
              <label class="block text-xs text-gray-300 font-medium mb-1">Create Password (Min 6 chars)</label>
              <div class="relative">
                <input type="password" id="signup-password" required minlength="6" placeholder="••••••••••••" class="w-full bg-surface-high border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-xs text-white focus:border-secondary outline-none">
                <span class="material-symbols-outlined text-[18px] text-gray-400 absolute left-3 top-2.5">lock</span>
                <button type="button" class="absolute right-3 top-2.5 text-gray-400 hover:text-white toggle-pwd-btn cursor-pointer">
                  <span class="material-symbols-outlined text-[18px]">visibility</span>
                </button>
              </div>
            </div>

            <div class="pt-1">
              <label class="flex items-start gap-2 text-[11px] text-gray-400 cursor-pointer">
                <input type="checkbox" required checked class="mt-0.5 text-secondary rounded">
                <span>I agree to HomeHub's Privacy Protocol, Non-Disclosure & Luxury Services Agreement.</span>
              </label>
            </div>

            <button type="submit" id="signup-submit-btn" class="w-full btn-primary py-3 text-xs font-bold tracking-widest shadow-[0_0_20px_rgba(68,226,205,0.4)] mt-2">
              Register Private Profile
            </button>
          </form>

          <!-- Security Footer Notice -->
          <div class="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-500">
            <span class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-secondary"></span>
              Supabase Auth Cloud Shield
            </span>
            <span>256-Bit TLS Encryption</span>
          </div>
        </div>
      </div>
    `;
  }

  // 5. MY BOOKED TOURS MODAL
  else if (activeModal === 'my-tours') {
    const tours = state.bookedTours;
    modalHtml = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" id="modal-overlay">
        <div class="w-full max-w-xl glass-panel-heavy rounded-2xl p-6 md:p-8 border border-white/15 shadow-2xl relative animate-[fadeIn_0.25s_ease-out]">
          <button class="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg glass-card cursor-pointer" id="close-modal-btn">
            <span class="material-symbols-outlined">close</span>
          </button>

          <div class="flex items-center gap-3 mb-6">
            <div class="p-2.5 rounded-xl bg-secondary/15 text-secondary border border-secondary/30">
              <span class="material-symbols-outlined text-2xl">calendar_month</span>
            </div>
            <div>
              <span class="text-xs uppercase tracking-widest font-bold text-secondary">Verified Reservations</span>
              <h3 class="font-display text-xl font-bold text-white">My VIP Showings & Tours</h3>
            </div>
          </div>

          ${tours.length === 0 ? `
            <div class="text-center py-12 text-gray-400">
              <span class="material-symbols-outlined text-5xl mb-3 text-gray-600">event_busy</span>
              <p class="font-medium text-base mb-1">No Scheduled Tours</p>
              <p class="text-xs text-gray-500 max-w-xs mx-auto mb-6">You haven't requested any private property viewings yet.</p>
              <button class="btn-primary px-6 py-2.5 text-xs font-bold" id="tours-explore-btn">Browse Estates</button>
            </div>
          ` : `
            <div class="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              ${tours.map(t => `
                <div class="glass-card p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:border-secondary/30 transition-all">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold text-white">${t.propertyTitle || 'Estate Showing'}</span>
                      <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
                        ${t.status || 'Confirmed'}
                      </span>
                    </div>
                    <p class="text-xs text-gray-400 flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-sm text-secondary">schedule</span>
                      ${t.tour_date || t.date || 'Flexible Date'} &bull; ${t.tour_type || t.format || 'VIP In-Person'}
                    </p>
                    <p class="text-[11px] text-gray-500">Attendee: ${t.full_name || t.name || state.user?.fullName || 'Private Guest'} (${t.email || state.user?.email || ''})</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-secondary font-mono bg-secondary/10 px-3 py-1.5 rounded-lg border border-secondary/20">
                      ID: #${(t.id || 'tour').slice(-6)}
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  // 6. LIVE VISITOR & LOGIN TRACKER MODAL
  else if (activeModal === 'tracker') {
    const visits = payload?.visits || JSON.parse(localStorage.getItem('homehub_analytics_visits') || '[]');
    const authLogs = payload?.authLogs || JSON.parse(localStorage.getItem('homehub_analytics_auth_logs') || '[]');
    
    const uniqueSessions = new Set(visits.map(v => v.session_id)).size || visits.length;
    const loginsCount = authLogs.filter(a => a.event_type === 'login').length;

    const pageCounts = {};
    for (const v of visits) {
      const key = v.page_title || v.page_path;
      pageCounts[key] = (pageCounts[key] || 0) + 1;
    }
    const popularPages = Object.entries(pageCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const trackerData = {
      visits,
      authLogs,
      summary: {
        totalVisits: visits.length,
        uniqueVisitors: uniqueSessions,
        totalLogins: loginsCount,
        popularPages
      },
      activeTab: payload?.activeTab || 'visitors'
    };

    modalHtml = getTrackerModalHtml(trackerData);
  }

  // Toast container (always rendered)
  const toastsHtml = `
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      ${state.toasts.map(t => `
        <div class="glass-panel-heavy border ${t.type === 'error' ? 'border-red-500/40 text-red-200' : 'border-secondary/30 text-white'} p-4 rounded-xl shadow-2xl flex items-center gap-3 pointer-events-auto animate-[fadeInUp_0.2s_ease-out]">
          <span class="material-symbols-outlined ${t.type === 'error' ? 'text-red-400' : 'text-secondary'}">
            ${t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}
          </span>
          <p class="text-xs font-medium">${t.message}</p>
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = modalHtml + toastsHtml;

  // Event wiring
  const overlay = container.querySelector('#modal-overlay');
  const closeBtn = container.querySelector('#close-modal-btn');
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) store.closeModal(); });
  if (closeBtn) closeBtn.addEventListener('click', () => store.closeModal());

  const favExploreBtn = container.querySelector('#fav-explore-btn');
  if (favExploreBtn) {
    favExploreBtn.addEventListener('click', () => { store.closeModal(); store.setRoute('browse'); });
  }

  const toursExploreBtn = container.querySelector('#tours-explore-btn');
  if (toursExploreBtn) {
    toursExploreBtn.addEventListener('click', () => { store.closeModal(); store.setRoute('browse'); });
  }

  container.querySelectorAll('.view-prop-btn').forEach(btn => {
    btn.addEventListener('click', () => { store.closeModal(); store.setRoute('property-detail', btn.getAttribute('data-id')); });
  });

  container.querySelectorAll('.remove-fav-btn').forEach(btn => {
    btn.addEventListener('click', () => store.toggleFavorite(btn.getAttribute('data-id')));
  });

  // Tour Booking Form Submit (Sanitized & Validated)
  const tourForm = container.querySelector('#tour-form');
  if (tourForm) {
    tourForm.addEventListener('submit', async e => {
      e.preventDefault();
      const format = sanitizeText(container.querySelector('#tour-format')?.value || 'VIP In-Person Showing');
      const date = sanitizeText(container.querySelector('#tour-date')?.value || '');
      const name = sanitizeText(container.querySelector('#tour-name')?.value || '');
      const rawEmail = container.querySelector('#tour-email')?.value || '';
      const email = sanitizeEmail(rawEmail);
      const phone = sanitizePhone(container.querySelector('#tour-phone')?.value || '');
      const notes = sanitizeText(container.querySelector('#tour-notes')?.value || '');
      const prop = payload?.property || store.getSelectedProperty();

      if (!email) {
        store.addToast('Please enter a valid email address.', 'error');
        return;
      }

      await store.bookTour({
        propertyId: prop.id,
        propertyTitle: prop.title,
        format,
        date,
        name,
        email,
        phone,
        notes
      });
    });
  }

  // Advisor Form Submit
  const advisorForm = container.querySelector('#advisor-contact-form');
  if (advisorForm) {
    advisorForm.addEventListener('submit', e => {
      e.preventDefault();
      store.addToast('Inquiry sent! Your elite advisor will respond within 2 hours.', 'success');
      store.closeModal();
    });
  }

  const bookCollectionBtn = container.querySelector('#book-collection-tour-btn');
  if (bookCollectionBtn) {
    bookCollectionBtn.addEventListener('click', () => store.openModal('book-tour', { property: store.getSelectedProperty() }));
  }

  // Auth Modal Tab Switcher & Logic
  const tabSignin = container.querySelector('#auth-tab-signin');
  const tabSignup = container.querySelector('#auth-tab-signup');
  const formSignin = container.querySelector('#auth-signin-form');
  const formSignup = container.querySelector('#auth-signup-form');

  if (tabSignin && tabSignup && formSignin && formSignup) {
    tabSignin.addEventListener('click', () => {
      tabSignin.classList.add('bg-secondary', 'text-black', 'shadow-lg');
      tabSignin.classList.remove('text-gray-400');
      tabSignup.classList.remove('bg-secondary', 'text-black', 'shadow-lg');
      tabSignup.classList.add('text-gray-400');
      formSignin.classList.remove('hidden');
      formSignup.classList.add('hidden');
    });

    tabSignup.addEventListener('click', () => {
      tabSignup.classList.add('bg-secondary', 'text-black', 'shadow-lg');
      tabSignup.classList.remove('text-gray-400');
      tabSignin.classList.remove('bg-secondary', 'text-black', 'shadow-lg');
      tabSignin.classList.add('text-gray-400');
      formSignup.classList.remove('hidden');
      formSignin.classList.add('hidden');
    });
  }

  // Toggle Password Visibility
  container.querySelectorAll('.toggle-pwd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.querySelector('span').textContent = 'visibility_off';
        } else {
          input.type = 'password';
          btn.querySelector('span').textContent = 'visibility';
        }
      }
    });
  });

  // Demo VIP Account Autofill
  const demoFillBtn = container.querySelector('#auth-demo-fill');
  if (demoFillBtn) {
    demoFillBtn.addEventListener('click', () => {
      const emailInput = container.querySelector('#signin-email');
      const passInput = container.querySelector('#signin-password');
      if (emailInput && passInput) {
        emailInput.value = 'alexander@homehub.luxury';
        passInput.value = 'HomeHub2026!';
      }
    });
  }

  // Sign In Submit
  if (formSignin) {
    formSignin.addEventListener('submit', async e => {
      e.preventDefault();
      const email = container.querySelector('#signin-email').value;
      const pass = container.querySelector('#signin-password').value;
      const submitBtn = container.querySelector('#signin-submit-btn');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying Credentials...';
      }

      await store.login(email, pass);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In Securely';
      }
    });
  }

  // Sign Up Submit
  if (formSignup) {
    formSignup.addEventListener('submit', async e => {
      e.preventDefault();
      const fullName = container.querySelector('#signup-fullname').value;
      const email = container.querySelector('#signup-email').value;
      const role = container.querySelector('#signup-role').value;
      const password = container.querySelector('#signup-password').value;
      const submitBtn = container.querySelector('#signup-submit-btn');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Profile...';
      }

      await store.signup(email, password, { fullName, role });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register Private Profile';
      }
    });
  }

  // Attach Tracker Modal Listeners if active
  if (activeModal === 'tracker') {
    attachTrackerListeners(container, async () => {
      const metrics = await analyticsService.getSummaryMetrics();
      store.openModal('tracker', {
        visits: metrics.recentVisits,
        authLogs: metrics.recentAuthLogs,
        summary: metrics
      });
    });
  }
}
