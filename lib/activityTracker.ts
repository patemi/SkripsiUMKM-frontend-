// Activity tracker untuk user
import { API_URL } from './api';

const ACTIVITY_UPDATE_INTERVAL = 2 * 60 * 1000; // Update setiap 2 menit
let activityInterval: NodeJS.Timeout | null = null;

/**
 * Kirim update activity ke backend
 */
async function updateActivity(): Promise<void> {
  try {
    // Support both admin and user tokens
    const token = localStorage.getItem('userToken') || localStorage.getItem('token');
    const userData = localStorage.getItem('userData') || localStorage.getItem('user');
    const adminData = localStorage.getItem('admin');
    
    // Hanya jalankan untuk user (bukan admin)
    if (!token || !userData || adminData) {
      console.log('⏭️ Skipping activity update (not a user or no token)');
      return;
    }
    
    const response = await fetch(`${API_URL}/user/activity`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ Activity updated at:', new Date().toLocaleTimeString());
    } else {
      console.log('⚠️ Activity update failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Failed to update activity:', error);
  }
}

/**
 * Start activity tracking
 */
export function startActivityTracking(): void {
  // Stop existing interval jika ada
  if (activityInterval) {
    stopActivityTracking();
  }
  
  // Update activity immediately
  updateActivity();
  
  // Set interval untuk update berkala
  activityInterval = setInterval(() => {
    updateActivity();
  }, ACTIVITY_UPDATE_INTERVAL);
  
  console.log('Activity tracking started');
}

/**
 * Stop activity tracking
 */
export function stopActivityTracking(): void {
  if (activityInterval) {
    clearInterval(activityInterval);
    activityInterval = null;
    console.log('Activity tracking stopped');
  }
}

/**
 * Track user events (mouse, keyboard, scroll)
 */
export function setupActivityListeners(): void {
  if (typeof window === 'undefined') return;
  
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  let lastUpdate = Date.now();
  
  const handleActivity = () => {
    const now = Date.now();
    // Hanya update jika sudah lebih dari 1 menit sejak update terakhir
    if (now - lastUpdate > 60 * 1000) {
      updateActivity();
      lastUpdate = now;
    }
  };
  
  events.forEach(event => {
    window.addEventListener(event, handleActivity, { passive: true });
  });
}
