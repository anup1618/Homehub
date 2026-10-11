import './styles/main.css';
import { store } from './store.js';
import { initShaderBackground } from './components/ShaderBackground.js';
import { renderNavbar } from './components/Navbar.js';
import { renderModals } from './components/Modals.js';
import { renderHomeView } from './views/HomeView.js';
import { renderBrowseView } from './views/BrowseView.js';
import { renderPropertyDetailView } from './views/PropertyDetailView.js';
import { renderDigitalTwinView } from './views/DigitalTwinView.js';
import { renderAdvisorsView } from './views/AdvisorsView.js';
import { renderListPropertyView } from './views/ListPropertyView.js';

function renderFooter(container) {
  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-6 md:px-12 py-16">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div class="space-y-4 md:col-span-1">
          <div class="flex items-center gap-2">
            <span class="font-display text-2xl font-bold tracking-tight text-white glow-text">Home<span class="text-secondary">Hub</span></span>
          </div>
          <p class="text-xs text-gray-400 font-light leading-relaxed">
            A premium real estate marketplace offering verified 3D digital twins, live IoT telemetry, and dedicated private client advisory.
          </p>
          <div class="flex items-center gap-3 pt-2">
            <span class="text-[10px] uppercase font-bold tracking-widest text-secondary border border-secondary/30 px-3 py-1 rounded-full bg-secondary/10">Global</span>
            <span class="text-[10px] uppercase font-bold tracking-widest text-emerald-400 border border-emerald-400/30 px-3 py-1 rounded-full bg-emerald-400/10 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> DB & Auth Active
            </span>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-widest text-white">Markets</h4>
          <ul class="space-y-2 text-xs text-gray-400 font-light">
            <li><a href="#browse" class="hover:text-secondary transition-colors" data-route="browse">Bel Air & Beverly Hills</a></li>
            <li><a href="#browse" class="hover:text-secondary transition-colors" data-route="browse">Manhattan</a></li>
            <li><a href="#browse" class="hover:text-secondary transition-colors" data-route="browse">Miami Venetian Islands</a></li>
            <li><a href="#browse" class="hover:text-secondary transition-colors" data-route="browse">Palm Jumeirah, Dubai</a></li>
            <li><a href="#browse" class="hover:text-secondary transition-colors" data-route="browse">Cap d'Antibes, Riviera</a></li>
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-widest text-white">Services</h4>
          <ul class="space-y-2 text-xs text-gray-400 font-light">
            <li><a href="#digital-twin" class="hover:text-secondary transition-colors" data-route="digital-twin">3D Digital Twin Viewer</a></li>
            <li><a href="#list-property" class="hover:text-secondary transition-colors" data-route="list-property">AI Property Valuation</a></li>
            <li><a href="#advisors" class="hover:text-secondary transition-colors" data-route="advisors">Private Client Advisory</a></li>
            <li><a href="#list-property" class="hover:text-secondary transition-colors" data-route="list-property">Off-Market Listings</a></li>
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-widest text-white">Contact & Security</h4>
          <p class="text-xs text-gray-400 font-light">
            450 North Rodeo Drive, Beverly Hills, CA 90210
          </p>
          <p class="text-xs text-secondary font-mono">
            advisory@homehub.luxury<br>+1 (800) 555-HOME
          </p>
          <p class="text-[11px] text-gray-500 pt-1">
            Protected by Supabase Auth with Row-Level Security
          </p>
        </div>
      </div>

      <div class="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <p>&copy; 2026 HomeHub Luxury Real Estate Inc. All rights reserved.</p>
        <div class="flex items-center gap-6">
          <a href="#" class="hover:text-gray-300 transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-gray-300 transition-colors">Terms of Luxury Service</a>
          <a href="#" class="hover:text-gray-300 transition-colors">Brokerage Disclosures</a>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-route]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      store.setRoute(link.getAttribute('data-route'));
    });
  });
}

const VIEW_MAP = {
  home: renderHomeView,
  browse: renderBrowseView,
  'property-detail': renderPropertyDetailView,
  'digital-twin': renderDigitalTwinView,
  advisors: renderAdvisorsView,
  'list-property': renderListPropertyView,
};

function renderCurrentView(container, route) {
  const renderFn = VIEW_MAP[route] || renderHomeView;
  renderFn(container);
}

window.addEventListener('DOMContentLoaded', async () => {
  const navContainer = document.getElementById('nav-container');
  const viewContainer = document.getElementById('view-container');
  const footerContainer = document.getElementById('footer-container');
  const modalsContainer = document.getElementById('modals-container');

  initShaderBackground('shader-bg-canvas');

  // Initial render — footer is static, only rendered once
  if (navContainer) renderNavbar(navContainer);
  if (footerContainer) renderFooter(footerContainer);
  if (viewContainer) renderCurrentView(viewContainer, store.state.currentRoute);
  if (modalsContainer) renderModals(modalsContainer);

  // Initialize Auth & Supabase Database connections
  await store.init();

  // Track scalar snapshots so we only re-render what actually changed
  let prevRoute = store.state.currentRoute;
  let prevFavCount = store.state.favorites.length;
  let prevModal = store.state.activeModal;
  let prevToastCount = store.state.toasts.length;
  let prevFilters = JSON.stringify(store.state.filters);
  let prevUser = store.state.user ? store.state.user.id : null;
  let prevPropsCount = store.state.properties.length;

  store.subscribe(() => {
    const s = store.state;
    const currentUser = s.user ? s.user.id : null;
    const routeChanged = s.currentRoute !== prevRoute;
    const favChanged = s.favorites.length !== prevFavCount;
    const modalChanged = s.activeModal !== prevModal;
    const toastChanged = s.toasts.length !== prevToastCount;
    const filtersChanged = JSON.stringify(s.filters) !== prevFilters;
    const userChanged = currentUser !== prevUser;
    const propsChanged = s.properties.length !== prevPropsCount;

    // Only update the navbar when route, favourite count, or authenticated user changes
    if (routeChanged || favChanged || userChanged) {
      if (navContainer) renderNavbar(navContainer);
    }

    // Only re-render the active view when route, browse filters, or properties change
    if (routeChanged || filtersChanged || propsChanged) {
      if (viewContainer) renderCurrentView(viewContainer, s.currentRoute);
    }

    // Only re-render modals/toasts when modal state or toasts change
    if (modalChanged || toastChanged || favChanged || userChanged) {
      if (modalsContainer) renderModals(modalsContainer);
    }

    prevRoute = s.currentRoute;
    prevFavCount = s.favorites.length;
    prevModal = s.activeModal;
    prevToastCount = s.toasts.length;
    prevFilters = JSON.stringify(s.filters);
    prevUser = currentUser;
    prevPropsCount = s.properties.length;
  });

  // Hash-based navigation — delegates through the store so subscribers fire correctly
  const validRoutes = ['home', 'browse', 'property-detail', 'digital-twin', 'advisors', 'list-property'];
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && validRoutes.includes(hash)) {
      store.setRoute(hash);
    }
  });
});
