import { supabase, isLiveMode } from './supabase.js';

const LOCAL_VISITS_KEY = 'homehub_analytics_visits';
const LOCAL_AUTH_LOGS_KEY = 'homehub_analytics_auth_logs';
const SESSION_ID_KEY = 'homehub_visitor_session_id';

// Generate or retrieve persistent visitor session ID
function getSessionId() {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

// Detect simple device type
function getDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

function getLocalVisits() {
  try {
    const data = localStorage.getItem(LOCAL_VISITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalVisits(visits) {
  try {
    // Keep last 150 entries in local storage
    localStorage.setItem(LOCAL_VISITS_KEY, JSON.stringify(visits.slice(0, 150)));
  } catch (e) {
    console.error('Failed to save local visits:', e);
  }
}

function getLocalAuthLogs() {
  try {
    const data = localStorage.getItem(LOCAL_AUTH_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalAuthLogs(logs) {
  try {
    // Keep last 150 entries
    localStorage.setItem(LOCAL_AUTH_LOGS_KEY, JSON.stringify(logs.slice(0, 150)));
  } catch (e) {
    console.error('Failed to save local auth logs:', e);
  }
}

export const analyticsService = {
  /**
   * Track a page view / visitor navigation
   */
  async trackPageView({ route, pageTitle, propertyId = null, propertyTitle = null, user = null }) {
    const visitRecord = {
      id: 'visit_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      session_id: getSessionId(),
      user_id: user?.id || null,
      user_email: user?.email || null,
      user_name: user?.fullName || (user?.email ? user.email.split('@')[0] : null),
      page_path: route || 'home',
      page_title: pageTitle || (route.charAt(0).toUpperCase() + route.slice(1)),
      property_id: propertyId,
      property_title: propertyTitle,
      referrer: document.referrer || 'Direct Visit',
      device_type: getDeviceType(),
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString()
    };

    // Always keep a local copy for instant dashboard inspection
    const local = getLocalVisits();
    local.unshift(visitRecord);
    saveLocalVisits(local);

    // Sync to Supabase if live mode
    if (isLiveMode) {
      try {
        await supabase.from('page_visits').insert([{
          session_id: visitRecord.session_id,
          user_id: visitRecord.user_id,
          user_email: visitRecord.user_email,
          user_name: visitRecord.user_name,
          page_path: visitRecord.page_path,
          page_title: visitRecord.page_title,
          property_id: visitRecord.property_id,
          property_title: visitRecord.property_title,
          referrer: visitRecord.referrer,
          device_type: visitRecord.device_type,
          user_agent: visitRecord.user_agent
        }]);
      } catch (err) {
        console.warn('Analytics page_visit sync warning:', err);
      }
    }

    return visitRecord;
  },

  /**
   * Track an authentication event (Login, Signup, Logout)
   */
  async trackAuthEvent({ eventType = 'login', user = null, email = '' }) {
    const authLog = {
      id: 'auth_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      user_id: user?.id || null,
      email: email || user?.email || 'unknown',
      full_name: user?.fullName || (user?.email ? user.email.split('@')[0] : 'Client'),
      role: user?.role || 'buyer',
      event_type: eventType,
      device_type: getDeviceType(),
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString()
    };

    // Always keep local copy
    const localLogs = getLocalAuthLogs();
    localLogs.unshift(authLog);
    saveLocalAuthLogs(localLogs);

    // Sync to Supabase if live
    if (isLiveMode) {
      try {
        await supabase.from('auth_logs').insert([{
          user_id: authLog.user_id,
          email: authLog.email,
          full_name: authLog.full_name,
          role: authLog.role,
          event_type: authLog.event_type,
          device_type: authLog.device_type,
          user_agent: authLog.user_agent
        }]);

        if (user?.id && eventType === 'login') {
          await supabase.from('profiles').update({
            last_login_at: new Date().toISOString()
          }).eq('id', user.id);
        }
      } catch (err) {
        console.warn('Analytics auth_log sync warning:', err);
      }
    }

    return authLog;
  },

  /**
   * Fetch all recorded page visits
   */
  async getPageVisits() {
    if (isLiveMode) {
      try {
        const { data, error } = await supabase
          .from('page_visits')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Error fetching visits from Supabase:', err);
      }
    }

    return getLocalVisits();
  },

  /**
   * Fetch all recorded login/auth logs
   */
  async getAuthLogs() {
    if (isLiveMode) {
      try {
        const { data, error } = await supabase
          .from('auth_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Error fetching auth logs from Supabase:', err);
      }
    }

    return getLocalAuthLogs();
  },

  /**
   * Compute analytics summary metrics
   */
  async getSummaryMetrics() {
    const visits = await this.getPageVisits();
    const authLogs = await this.getAuthLogs();

    const uniqueSessions = new Set(visits.map(v => v.session_id)).size;
    const uniqueUsers = new Set(visits.filter(v => v.user_email).map(v => v.user_email)).size;
    const loginsCount = authLogs.filter(a => a.event_type === 'login').length;

    // Page frequency
    const pageCounts = {};
    for (const v of visits) {
      const key = v.page_title || v.page_path;
      pageCounts[key] = (pageCounts[key] || 0) + 1;
    }

    const popularPages = Object.entries(pageCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalVisits: visits.length,
      uniqueVisitors: uniqueSessions || visits.length,
      uniqueIdentifiedUsers: uniqueUsers,
      totalLogins: loginsCount,
      popularPages,
      recentVisits: visits.slice(0, 30),
      recentAuthLogs: authLogs.slice(0, 30)
    };
  },

  /**
   * Reset local logs if desired
   */
  clearLocalLogs() {
    localStorage.removeItem(LOCAL_VISITS_KEY);
    localStorage.removeItem(LOCAL_AUTH_LOGS_KEY);
  }
};
