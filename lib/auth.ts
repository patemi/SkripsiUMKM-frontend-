// Authentication utility functions - OPTIMIZED VERSION
import { API_URL } from './api';

export interface AdminData {
  _id: string;
  username_admin: string;
  nama_admin: string;
  email_admin?: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  data?: AdminData;
  message?: string;
}

function setSessionCookie(name: string, value: string, maxAgeSeconds: number): void {
  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secureFlag}`;
}

function clearSessionCookie(name: string): void {
  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;
}

/**
 * Simpan token dan data admin ke localStorage dan cookie
 */
export function setAdminSession(token: string, adminData: AdminData): void {
  localStorage.setItem('token', token);
  localStorage.setItem('admin', JSON.stringify(adminData));

  // Set cookie untuk middleware check (7 hari)
  setSessionCookie('auth_token', token, 7 * 24 * 60 * 60);
}

export function setUserSession(token: string, userData: unknown): void {
  localStorage.setItem('userToken', token);
  localStorage.setItem('userData', JSON.stringify(userData));

  // Set cookie untuk middleware check (7 hari)
  setSessionCookie('user_auth_token', token, 7 * 24 * 60 * 60);
}

/**
 * Hapus semua data session
 */
export function clearAdminSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('admin');
  localStorage.removeItem('user');

  // Hapus cookie juga
  clearSessionCookie('auth_token');
}

export function clearUserSession(): void {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
  clearSessionCookie('user_auth_token');
}

/**
 * Cek apakah admin sudah login (simplified - fast check)
 */
export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  const adminData = localStorage.getItem('admin');
  const userData = localStorage.getItem('user');
  
  // Simple check: ada token, ada admin data, tidak ada user data
  return !!(token && adminData && !userData);
}

/**
 * Dapatkan data admin dari localStorage
 */
export function getAdminData(): AdminData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const adminData = localStorage.getItem('admin');
    if (!adminData) return null;
    return JSON.parse(adminData);
  } catch (error) {
    console.error('Error parsing admin data:', error);
    return null;
  }
}

/**
 * Login admin (simplified)
 */
export async function loginAdmin(username: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username_admin: username,
        password_admin: password,
      }),
    });
    
    const data = await response.json();
    
    if (data.success && data.token && data.data) {
      setAdminSession(data.token, data.data);
    }
    
    return data;
  } catch (error) {
    console.error('Error during login:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat login. Periksa koneksi Anda.',
    };
  }
}

/**
 * Logout admin
 */
export function logoutAdmin(): void {
  clearAdminSession();
}
