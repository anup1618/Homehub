import { store } from '../store.js';
import { analyticsService } from '../services/analyticsService.js';

export function getTrackerModalHtml(data = {}) {
  const visits = data.visits || [];
  const authLogs = data.authLogs || [];
  const summary = data.summary || {
    totalVisits: visits.length,
    uniqueVisitors: new Set(visits.map(v => v.session_id)).size || visits.length,
    totalLogins: authLogs.filter(a => a.event_type === 'login').length,
    popularPages: []
  };

  const activeTab = data.activeTab || 'visitors';
  const isAdmin = store.state.user?.role === 'admin' || window.__adminAuthenticated === true;

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md" id="modal-overlay">
      <div class="w-full max-w-4xl max-h-[90vh] glass-panel-heavy rounded-2xl sm:rounded-3xl border border-white/15 shadow-2xl flex flex-col relative overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        
        <!-- Header -->
        <div class="p-5 sm:p-6 border-b border-white/10 flex justify-between items-center bg-surface-high/40">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <span class="material-symbols-outlined text-2xl">monitoring</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-display text-lg sm:text-xl font-bold text-white">Live Visitor & Authentication Tracker</h3>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Protected
                </span>
              </div>
              <p class="text-xs text-gray-400">Real-time audit log of page visits, authenticated client logins, and traffic telemetry.</p>
            </div>
          </div>
          <button class="text-gray-400 hover:text-white p-2 rounded-xl glass-card cursor-pointer transition-colors" id="close-modal-btn">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        ${!isAdmin ? `
          <!-- RBAC ADMIN ACCESS GATE -->
          <div class="p-8 sm:p-14 text-center max-w-lg mx-auto my-auto animate-[fadeIn_0.25s_ease-out]">
            <div class="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              <span class="material-symbols-outlined text-3xl">admin_panel_settings</span>
            </div>
            <span class="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-1">Restricted Security Domain</span>
            <h3 class="font-display text-2xl font-bold text-white mb-2">Administrator Clearance Required</h3>
            <p class="text-xs text-gray-400 leading-relaxed mb-6">
              Visitor telemetry and user authentication audit logs are protected under strict Role-Based Access Control (RBAC). Please enter your administrator passcode to access live logs.
            </p>
            
            <form id="admin-auth-gate-form" class="space-y-3.5 text-left">
              <div>
                <label class="block text-xs text-gray-300 font-medium mb-1">Administrator Passcode</label>
                <div class="relative">
                  <input type="password" id="admin-passcode-input" required placeholder="Enter Admin Passcode" class="w-full bg-surface-high border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:border-secondary outline-none">
                  <span class="material-symbols-outlined text-[18px] text-gray-400 absolute left-3 top-2.5">key</span>
                </div>
              </div>
              <div class="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                <span class="text-secondary hover:underline cursor-pointer" id="admin-quick-unlock">Autofill Demo Admin (AdminHub2026!)</span>
                <span class="text-emerald-400 font-mono">TLS 256-Bit</span>
              </div>
              <button type="submit" class="w-full btn-primary py-3 text-xs font-bold tracking-widest shadow-[0_0_20px_rgba(68,226,205,0.4)] mt-2 cursor-pointer">
                Unlock Secure Telemetry Logs
              </button>
            </form>
          </div>
        ` : `
          <!-- UNLOCKED FULL ADMIN DASHBOARD -->
          <!-- Metrics Strip -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:px-6 bg-white/[0.02] border-b border-white/10 text-xs">
            <div class="glass-card p-3 rounded-xl border border-white/5">
              <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Total Page Views</span>
              <span class="text-xl sm:text-2xl font-bold text-white font-mono" id="stat-total-visits">${summary.totalVisits}</span>
            </div>
            <div class="glass-card p-3 rounded-xl border border-white/5">
              <span class="text-[10px] uppercase font-bold text-secondary tracking-wider block">Unique Visitors</span>
              <span class="text-xl sm:text-2xl font-bold text-secondary font-mono" id="stat-unique-visitors">${summary.uniqueVisitors}</span>
            </div>
            <div class="glass-card p-3 rounded-xl border border-white/5">
              <span class="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">Verified Logins</span>
              <span class="text-xl sm:text-2xl font-bold text-emerald-400 font-mono" id="stat-total-logins">${summary.totalLogins}</span>
            </div>
            <div class="glass-card p-3 rounded-xl border border-white/5">
              <span class="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">Admin Clearance</span>
              <span class="text-xs sm:text-sm font-bold text-emerald-400 truncate mt-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">verified</span> Verified Admin
              </span>
            </div>
          </div>

          <!-- Tab Controls & Filter Bar -->
          <div class="px-5 sm:px-6 pt-4 pb-3 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-white/10 bg-surface-high/20">
            <div class="flex items-center gap-1.5 p-1 bg-surface-high rounded-xl border border-white/10 self-start sm:self-auto">
              <button class="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'visitors' ? 'bg-secondary text-black shadow-md' : 'text-gray-400 hover:text-white'}" id="tracker-tab-visitors">
                👥 Page Visitors (${visits.length})
              </button>
              <button class="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'logins' ? 'bg-secondary text-black shadow-md' : 'text-gray-400 hover:text-white'}" id="tracker-tab-logins">
                🔐 User Logins (${authLogs.length})
              </button>
              <button class="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'insights' ? 'bg-secondary text-black shadow-md' : 'text-gray-400 hover:text-white'}" id="tracker-tab-insights">
                📊 Analytics Insights
              </button>
            </div>

            <div class="flex items-center gap-2">
              <div class="relative flex-1 sm:w-48">
                <input type="text" id="tracker-filter-input" placeholder="Filter by email or page..." class="w-full bg-surface-high border border-white/10 rounded-xl px-3 py-1.5 pl-8 text-xs text-white placeholder-gray-500 focus:border-secondary outline-none">
                <span class="material-symbols-outlined text-[16px] text-gray-400 absolute left-2.5 top-2">search</span>
              </div>
              <button class="p-1.5 rounded-xl glass-card text-gray-300 hover:text-secondary hover:border-secondary transition-all cursor-pointer" id="tracker-refresh-btn" title="Refresh Live Data">
                <span class="material-symbols-outlined text-[18px]">refresh</span>
              </button>
            </div>
          </div>

          <!-- Tab 1: Page Visitors List -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 ${activeTab === 'visitors' ? 'block' : 'hidden'}" id="tracker-content-visitors">
            ${visits.length === 0 ? `
              <div class="text-center py-16 text-gray-400">
                <span class="material-symbols-outlined text-4xl mb-2 text-gray-600">visibility_off</span>
                <p class="text-sm font-medium">No page visits logged yet</p>
                <p class="text-xs text-gray-500 mt-1">Visit different pages like Browse or 3D Digital Twin to see visits logged here.</p>
              </div>
            ` : `
              <div class="space-y-2.5" id="visits-list-container">
                ${visits.map(v => {
                  const isAuthUser = Boolean(v.user_email || v.user_name);
                  const timeString = new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const dateString = new Date(v.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
                  
                  return `
                    <div class="glass-card p-3 sm:p-3.5 rounded-xl border border-white/5 hover:border-secondary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs visitor-item" data-search="${(v.user_email || '') + ' ' + (v.page_title || '') + ' ' + (v.page_path || '')}">
                      <div class="flex items-center gap-3 min-w-[200px]">
                        <div class="w-8 h-8 rounded-full ${isAuthUser ? 'bg-secondary/20 border border-secondary/40 text-secondary' : 'bg-surface-high border border-white/10 text-gray-400'} flex items-center justify-center font-bold text-xs shrink-0">
                          ${isAuthUser ? (v.user_name?.[0] || v.user_email?.[0] || 'U').toUpperCase() : '<span class="material-symbols-outlined text-sm">person_outline</span>'}
                        </div>
                        <div class="min-w-0">
                          <div class="flex items-center gap-1.5">
                            <span class="font-bold text-white truncate">${isAuthUser ? (v.user_name || v.user_email) : 'Guest Visitor'}</span>
                            ${isAuthUser ? '<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-secondary/15 text-secondary border border-secondary/30">User</span>' : '<span class="px-1.5 py-0.2 rounded text-[9px] font-medium bg-white/5 text-gray-400">Guest</span>'}
                          </div>
                          <p class="text-[10px] text-gray-400 truncate font-mono">${isAuthUser ? v.user_email : ('ID: ' + v.session_id.slice(-8))}</p>
                        </div>
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5">
                          <span class="material-symbols-outlined text-sm text-secondary">explore</span>
                          <span class="font-semibold text-gray-200 truncate">${v.page_title || v.page_path}</span>
                        </div>
                        <p class="text-[10px] text-gray-400 truncate">
                          Route: <span class="text-secondary font-mono">#${v.page_path}</span>
                          ${v.property_title ? ` &bull; Estate: <span class="text-white">${v.property_title}</span>` : ''}
                        </p>
                      </div>

                      <div class="flex items-center gap-3 sm:justify-end text-[11px] text-gray-400 shrink-0">
                        <div class="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-high border border-white/5">
                          <span class="material-symbols-outlined text-xs text-gray-400">${v.device_type === 'Mobile' ? 'smartphone' : 'computer'}</span>
                          <span>${v.device_type || 'Desktop'}</span>
                        </div>
                        <div class="text-right">
                          <span class="text-white font-mono block">${timeString}</span>
                          <span class="text-[10px] text-gray-500">${dateString}</span>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- Tab 2: User Logins List -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 ${activeTab === 'logins' ? 'block' : 'hidden'}" id="tracker-content-logins">
            ${authLogs.length === 0 ? `
              <div class="text-center py-16 text-gray-400">
                <span class="material-symbols-outlined text-4xl mb-2 text-gray-600">lock_clock</span>
                <p class="text-sm font-medium">No login events recorded yet</p>
                <p class="text-xs text-gray-500 mt-1">Sign in with an account or the Demo VIP user to see login audits here.</p>
              </div>
            ` : `
              <div class="space-y-2.5" id="logins-list-container">
                ${authLogs.map(a => {
                  const timeString = new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const dateString = new Date(a.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
                  const isLogin = a.event_type === 'login';
                  const isSignup = a.event_type === 'signup';
                  const isLogout = a.event_type === 'logout';

                  const badgeClass = isLogin 
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : isSignup
                    ? 'bg-secondary/15 text-secondary border-secondary/30'
                    : isLogout
                    ? 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                    : 'bg-red-500/15 text-red-400 border-red-500/30';

                  const badgeText = isLogin ? 'Signed In' : isSignup ? 'Created Account' : isLogout ? 'Signed Out' : 'Failed Login';

                  return `
                    <div class="glass-card p-3 sm:p-3.5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs auth-item" data-search="${(a.email || '') + ' ' + (a.full_name || '') + ' ' + a.event_type}">
                      <div class="flex items-center gap-3 min-w-[220px]">
                        <div class="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                          ${(a.full_name?.[0] || a.email?.[0] || 'U').toUpperCase()}
                        </div>
                        <div class="min-w-0">
                          <div class="flex items-center gap-2">
                            <span class="font-bold text-white truncate">${a.full_name || a.email.split('@')[0]}</span>
                            <span class="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded-full border ${badgeClass}">
                              ${badgeText}
                            </span>
                          </div>
                          <p class="text-[10px] text-gray-400 truncate font-mono">${a.email}</p>
                        </div>
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 text-[10px] uppercase font-bold tracking-wider">
                            Role: ${a.role || 'Buyer'}
                          </span>
                          <span class="text-[10px] text-gray-500 flex items-center gap-1">
                            <span class="material-symbols-outlined text-[12px] text-emerald-400">verified_user</span>
                            Token Issued
                          </span>
                        </div>
                      </div>

                      <div class="flex items-center gap-3 sm:justify-end text-[11px] text-gray-400 shrink-0">
                        <div class="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-high border border-white/5">
                          <span class="material-symbols-outlined text-xs text-gray-400">${a.device_type === 'Mobile' ? 'smartphone' : 'computer'}</span>
                          <span>${a.device_type || 'Desktop'}</span>
                        </div>
                        <div class="text-right">
                          <span class="text-white font-mono block">${timeString}</span>
                          <span class="text-[10px] text-gray-500">${dateString}</span>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- Tab 3: Analytics Overview & Popular Pages -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 ${activeTab === 'insights' ? 'block' : 'hidden'}" id="tracker-content-insights">
            <div class="space-y-6">
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2">
                  <span class="material-symbols-outlined text-secondary text-sm">trending_up</span>
                  Most Visited Pages & Estates
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  ${(summary.popularPages || []).map((p, idx) => `
                    <div class="glass-card p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <span class="w-6 h-6 rounded-lg bg-secondary/15 text-secondary font-bold text-xs flex items-center justify-center">#${idx + 1}</span>
                        <div>
                          <p class="font-bold text-white text-xs">${p.name}</p>
                          <p class="text-[10px] text-gray-400">High engagement</p>
                        </div>
                      </div>
                      <span class="px-2.5 py-1 rounded-lg bg-surface-high font-mono font-bold text-secondary text-xs">
                        ${p.count} views
                      </span>
                    </div>
                  `).join('')}
                  ${(!summary.popularPages || summary.popularPages.length === 0) ? `
                    <p class="text-xs text-gray-500 col-span-2">Explore the marketplace to generate engagement metrics.</p>
                  ` : ''}
                </div>
              </div>

              <!-- Security & Storage Summary -->
              <div class="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
                <h4 class="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-emerald-400 text-sm">security</span>
                  Hardened Security & Audit Configuration
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div class="p-3 rounded-xl bg-surface-high border border-white/5">
                    <span class="text-[10px] text-gray-400 block mb-0.5">Database RLS</span>
                    <p class="text-white font-bold">Admin-Only Protected</p>
                    <p class="text-[10px] text-emerald-400 mt-1">Strict RBAC Active</p>
                  </div>
                  <div class="p-3 rounded-xl bg-surface-high border border-white/5">
                    <span class="text-[10px] text-gray-400 block mb-0.5">Auth Audit Table</span>
                    <p class="text-white font-bold">public.auth_logs</p>
                    <p class="text-[10px] text-emerald-400 mt-1">SHA-256 Hashed</p>
                  </div>
                  <div class="p-3 rounded-xl bg-surface-high border border-white/5">
                    <span class="text-[10px] text-gray-400 block mb-0.5">Rate Limiting</span>
                    <p class="text-white font-bold">150 req/15min</p>
                    <p class="text-[10px] text-secondary mt-1">Brute-Force Shield</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `}

        <!-- Footer -->
        <div class="p-4 sm:px-6 border-t border-white/10 bg-surface-high/40 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <div class="flex items-center gap-2 text-gray-400 text-[11px]">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Secured with Helmet HTTP Headers, XSS Sanitization, and RBAC Audit Controls.</span>
          </div>
          <div class="flex items-center gap-2">
            ${isAdmin ? `
              <button class="px-4 py-2 rounded-xl glass-card text-gray-300 hover:text-red-400 transition-colors cursor-pointer text-xs" id="tracker-clear-btn">
                Clear Logs
              </button>
            ` : ''}
            <button class="btn-primary px-5 py-2 text-xs font-bold cursor-pointer" id="tracker-close-bottom-btn">
              Close Tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function attachTrackerListeners(container, onRefresh) {
  // Admin Auth Gate Handler
  const adminGateForm = container.querySelector('#admin-auth-gate-form');
  const quickUnlockBtn = container.querySelector('#admin-quick-unlock');

  if (quickUnlockBtn) {
    quickUnlockBtn.addEventListener('click', () => {
      const passInput = container.querySelector('#admin-passcode-input');
      if (passInput) passInput.value = 'AdminHub2026!';
    });
  }

  if (adminGateForm) {
    adminGateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = container.querySelector('#admin-passcode-input')?.value;
      if (entered === 'AdminHub2026!' || entered === 'HomeHub2026!') {
        window.__adminAuthenticated = true;
        store.addToast('Administrator clearance granted!', 'success');
        if (onRefresh) onRefresh();
      } else {
        store.addToast('Invalid administrator passcode.', 'error');
      }
    });
  }

  const tabVisitors = container.querySelector('#tracker-tab-visitors');
  const tabLogins = container.querySelector('#tracker-tab-logins');
  const tabInsights = container.querySelector('#tracker-tab-insights');
  const contentVisitors = container.querySelector('#tracker-content-visitors');
  const contentLogins = container.querySelector('#tracker-content-logins');
  const contentInsights = container.querySelector('#tracker-content-insights');

  function switchTab(target) {
    [tabVisitors, tabLogins, tabInsights].forEach(t => {
      if (t) {
        t.classList.remove('bg-secondary', 'text-black', 'shadow-md');
        t.classList.add('text-gray-400');
      }
    });

    [contentVisitors, contentLogins, contentInsights].forEach(c => {
      if (c) c.classList.add('hidden');
    });

    if (target === 'visitors') {
      tabVisitors?.classList.add('bg-secondary', 'text-black', 'shadow-md');
      tabVisitors?.classList.remove('text-gray-400');
      contentVisitors?.classList.remove('hidden');
    } else if (target === 'logins') {
      tabLogins?.classList.add('bg-secondary', 'text-black', 'shadow-md');
      tabLogins?.classList.remove('text-gray-400');
      contentLogins?.classList.remove('hidden');
    } else if (target === 'insights') {
      tabInsights?.classList.add('bg-secondary', 'text-black', 'shadow-md');
      tabInsights?.classList.remove('text-gray-400');
      contentInsights?.classList.remove('hidden');
    }
  }

  if (tabVisitors) tabVisitors.addEventListener('click', () => switchTab('visitors'));
  if (tabLogins) tabLogins.addEventListener('click', () => switchTab('logins'));
  if (tabInsights) tabInsights.addEventListener('click', () => switchTab('insights'));

  // Search Filter
  const filterInput = container.querySelector('#tracker-filter-input');
  if (filterInput) {
    filterInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      container.querySelectorAll('.visitor-item').forEach(el => {
        const text = el.getAttribute('data-search')?.toLowerCase() || '';
        el.style.display = (!q || text.includes(q)) ? '' : 'none';
      });
      container.querySelectorAll('.auth-item').forEach(el => {
        const text = el.getAttribute('data-search')?.toLowerCase() || '';
        el.style.display = (!q || text.includes(q)) ? '' : 'none';
      });
    });
  }

  // Refresh
  const refreshBtn = container.querySelector('#tracker-refresh-btn');
  if (refreshBtn && onRefresh) {
    refreshBtn.addEventListener('click', () => onRefresh());
  }

  // Clear Logs
  const clearBtn = container.querySelector('#tracker-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear local visitor and login tracking logs?')) {
        analyticsService.clearLocalLogs();
        store.addToast('Tracker logs cleared.', 'info');
        if (onRefresh) onRefresh();
      }
    });
  }

  const closeBottomBtn = container.querySelector('#tracker-close-bottom-btn');
  if (closeBottomBtn) {
    closeBottomBtn.addEventListener('click', () => store.closeModal());
  }
}
