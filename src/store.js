import { properties as initialProperties } from './data/properties.js';
import { authService } from './services/authService.js';
import { dbService } from './services/dbService.js';
import { analyticsService } from './services/analyticsService.js';

class AppStore {
  constructor() {
    this.state = {
      currentRoute: 'home', // 'home' | 'browse' | 'property-detail' | 'digital-twin' | 'advisors' | 'list-property'
      selectedPropertyId: 'prop-bel-air-1240',
      activeModal: null, // null | 'favorites' | 'book-tour' | 'contact-advisor' | 'valuation-result' | 'auth' | 'my-tours' | 'tracker'
      modalPayload: null,
      filters: {
        keyword: '',
        type: 'All',
        minPrice: 0,
        maxPrice: 30000000,
        beds: 'Any',
        sortBy: 'featured'
      },
      properties: [...initialProperties],
      favorites: this.loadFavorites(),
      bookedTours: this.loadBookedTours(),
      toasts: [],
      user: null,
      session: null,
      authLoading: true,
      analyticsMetrics: null
    };

    this.listeners = new Set();
  }

  async init() {
    await this.initAuth();
    await this.loadPropertiesFromDb();

    // Track initial page arrival
    this.trackCurrentRouteView();
  }

  async initAuth() {
    try {
      this.state.authLoading = true;
      const user = await authService.getUser();
      const session = await authService.getSession();
      this.state.user = user;
      this.state.session = session;

      if (user?.id) {
        const cloudFavorites = await dbService.getUserFavorites(user.id);
        if (cloudFavorites && cloudFavorites.length > 0) {
          const merged = Array.from(new Set([...this.state.favorites, ...cloudFavorites]));
          this.state.favorites = merged;
          this.saveFavorites();
        }

        const cloudTours = await dbService.getUserTours(user.id);
        if (cloudTours && cloudTours.length > 0) {
          this.state.bookedTours = cloudTours;
          this.saveBookedTours();
        }
      }

      authService.onAuthStateChange(async (event, session, user) => {
        this.state.session = session;
        this.state.user = user;
        if (user?.id) {
          const cloudFavs = await dbService.getUserFavorites(user.id);
          if (cloudFavs) {
            this.state.favorites = Array.from(new Set([...this.state.favorites, ...cloudFavs]));
            this.saveFavorites();
          }
        }
        this.notify();
      });
    } catch (err) {
      console.warn('Auth initialization warning:', err);
    } finally {
      this.state.authLoading = false;
      this.notify();
    }
  }

  async loadPropertiesFromDb() {
    try {
      const dbProps = await dbService.getProperties();
      if (dbProps && dbProps.length > 0) {
        this.state.properties = dbProps;
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to load DB properties:', err);
    }
  }

  trackCurrentRouteView() {
    try {
      let propTitle = null;
      let propId = null;
      if (this.state.currentRoute === 'property-detail' || this.state.currentRoute === 'digital-twin') {
        const p = this.getSelectedProperty();
        propTitle = p ? p.title : null;
        propId = p ? p.id : null;
      }

      analyticsService.trackPageView({
        route: this.state.currentRoute,
        propertyId: propId,
        propertyTitle: propTitle,
        user: this.state.user
      });
    } catch (e) {
      console.warn('Analytics tracking error:', e);
    }
  }

  async login(email, password) {
    try {
      const { user, session } = await authService.signIn(email, password);
      this.state.user = user;
      this.state.session = session;

      // Track Login Event in Analytics Tracker
      await analyticsService.trackAuthEvent({
        eventType: 'login',
        user: user,
        email: email
      });

      if (user?.id) {
        const cloudFavs = await dbService.getUserFavorites(user.id);
        if (cloudFavs && cloudFavs.length > 0) {
          this.state.favorites = Array.from(new Set([...this.state.favorites, ...cloudFavs]));
          this.saveFavorites();
        }
      }

      this.addToast(`Welcome back, ${user.fullName || user.email}!`, 'success');
      this.closeModal();
      this.notify();
      return { success: true };
    } catch (err) {
      // Track Failed Login
      analyticsService.trackAuthEvent({
        eventType: 'failed_login',
        email: email
      });

      this.addToast(err.message || 'Failed to sign in', 'error');
      return { success: false, error: err.message };
    }
  }

  async signup(email, password, metadata = {}) {
    try {
      const { user, session } = await authService.signUp(email, password, metadata);
      this.state.user = user;
      this.state.session = session;

      // Track Signup Event in Analytics Tracker
      await analyticsService.trackAuthEvent({
        eventType: 'signup',
        user: user,
        email: email
      });

      this.addToast(`Account created successfully! Welcome to HomeHub.`, 'success');
      this.closeModal();
      this.notify();
      return { success: true };
    } catch (err) {
      this.addToast(err.message || 'Failed to create account', 'error');
      return { success: false, error: err.message };
    }
  }

  async logout() {
    try {
      const currentUser = this.state.user;
      await authService.signOut();
      
      // Track Logout Event
      if (currentUser) {
        analyticsService.trackAuthEvent({
          eventType: 'logout',
          user: currentUser,
          email: currentUser.email
        });
      }

      this.state.user = null;
      this.state.session = null;
      this.addToast('Successfully signed out.', 'info');
      this.notify();
    } catch (err) {
      this.addToast('Sign out error', 'error');
    }
  }

  async getAnalyticsData() {
    return await analyticsService.getSummaryMetrics();
  }

  loadFavorites() {
    try {
      const data = localStorage.getItem('homehub_favorites');
      return data ? JSON.parse(data) : ['prop-bel-air-1240'];
    } catch {
      return ['prop-bel-air-1240'];
    }
  }

  saveFavorites() {
    try {
      localStorage.setItem('homehub_favorites', JSON.stringify(this.state.favorites));
    } catch (e) {
      console.error(e);
    }
  }

  loadBookedTours() {
    try {
      const data = localStorage.getItem('homehub_tours');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveBookedTours() {
    try {
      localStorage.setItem('homehub_tours', JSON.stringify(this.state.bookedTours));
    } catch (e) {
      console.error(e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  setRoute(route, propertyId = null) {
    this.state.currentRoute = route;
    if (propertyId) {
      this.state.selectedPropertyId = propertyId;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Automatically track route navigation for visitor analytics
    this.trackCurrentRouteView();

    this.notify();
  }

  setFilters(newFilters) {
    this.state.filters = { ...this.state.filters, ...newFilters };
    this.notify();
  }

  resetFilters() {
    this.state.filters = {
      keyword: '',
      type: 'All',
      minPrice: 0,
      maxPrice: 30000000,
      beds: 'Any',
      sortBy: 'featured'
    };
    this.notify();
  }

  async toggleFavorite(propertyId) {
    const idx = this.state.favorites.indexOf(propertyId);
    if (idx >= 0) {
      this.state.favorites.splice(idx, 1);
      this.addToast('Removed from Saved Collection', 'info');
      if (this.state.user?.id) {
        await dbService.removeFavorite(this.state.user.id, propertyId);
      }
    } else {
      this.state.favorites.push(propertyId);
      this.addToast('Saved to Curated Portfolio', 'success');
      if (this.state.user?.id) {
        await dbService.addFavorite(this.state.user.id, propertyId);
      }
    }
    this.saveFavorites();
    this.notify();
  }

  isFavorite(propertyId) {
    return this.state.favorites.includes(propertyId);
  }

  openModal(modalName, payload = null) {
    this.state.activeModal = modalName;
    this.state.modalPayload = payload;
    document.body.style.overflow = 'hidden';
    this.notify();
  }

  closeModal() {
    this.state.activeModal = null;
    this.state.modalPayload = null;
    document.body.style.overflow = '';
    this.notify();
  }

  async bookTour(tourDetails) {
    const newTour = {
      ...tourDetails,
      id: 'tour-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    this.state.bookedTours.push(newTour);
    this.saveBookedTours();

    await dbService.bookTour(tourDetails, this.state.user?.id);

    this.addToast('VIP Tour Request Submitted!', 'success');
    this.closeModal();
    this.notify();
  }

  async submitListing(propertyData) {
    const saved = await dbService.createProperty(propertyData, this.state.user?.id);
    if (saved) {
      this.state.properties.unshift(saved);
      this.notify();
    }
    return saved;
  }

  addToast(message, type = 'info') {
    const id = Date.now() + Math.random();
    const toast = { id, message, type };
    this.state.toasts.push(toast);
    this.notify();

    setTimeout(() => {
      this.state.toasts = this.state.toasts.filter(t => t.id !== id);
      this.notify();
    }, 4000);
  }

  getSelectedProperty() {
    const props = this.state.properties;
    return props.find(p => p.id === this.state.selectedPropertyId) || props[0] || initialProperties[0];
  }

  getFilteredProperties() {
    const { keyword, type, minPrice, maxPrice, beds, sortBy } = this.state.filters;
    let list = [...this.state.properties];

    if (keyword) {
      const q = keyword.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.location.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      );
    }

    if (type && type !== 'All') {
      list = list.filter(p => p.type.toLowerCase() === type.toLowerCase());
    }

    if (minPrice > 0) {
      list = list.filter(p => p.price >= minPrice);
    }

    if (maxPrice < 30000000) {
      list = list.filter(p => p.price <= maxPrice);
    }

    if (beds && beds !== 'Any') {
      const bedNum = parseInt(beds, 10);
      list = list.filter(p => p.beds >= bedNum);
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'sqft') {
      list.sort((a, b) => b.sqft - a.sqft);
    }

    return list;
  }
}

export const store = new AppStore();
