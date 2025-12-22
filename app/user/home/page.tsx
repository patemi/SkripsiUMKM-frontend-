'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMapPin, FiClock, FiPhone, FiInstagram, FiEye, FiFilter, FiSearch, FiLogOut, FiUser, FiList, FiCheckCircle, FiXCircle, FiArrowUp, FiTrash2, FiAlertTriangle, FiMenu, FiX } from 'react-icons/fi';
import { API_URL } from '@/lib/api';
import { startActivityTracking, stopActivityTracking, setupActivityListeners } from '@/lib/activityTracker';
import Map from '@/components/ui/Map';

interface UMKM {
  _id: string;
  nama_umkm: string;
  kategori: string;
  deskripsi: string;
  alamat: string;
  maps?: string;
  foto_umkm: string[];
  pembayaran: string[];
  jam_operasional: { [key: string]: string };
  kontak: {
    telepon?: string;
    whatsapp?: string;
    instagram?: string;
  };
  views: number;
  status: string;
  alasan_penolakan?: string;
  user_id?: string;
  nama_user?: string;
}

const kategoriList = ['Semua', 'Kuliner', 'Fashion', 'Kerajinan', 'Jasa', 'Agribisnis & Pertanian', 'Toko Kelontong'];

export default function UserHomePage() {
  const router = useRouter();
  const [umkmList, setUmkmList] = useState<UMKM[]>([]);
  const [filteredUMKM, setFilteredUMKM] = useState<UMKM[]>([]);
  const [myUMKM, setMyUMKM] = useState<UMKM[]>([]);
  const [showMyUMKM, setShowMyUMKM] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMyUMKM, setLoadingMyUMKM] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedUMKM, setSelectedUMKM] = useState<string[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deletingUMKM, setDeletingUMKM] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const [showLocationSuccess, setShowLocationSuccess] = useState(false);
  const [showLocationError, setShowLocationError] = useState(false);
  const [detectedCoords, setDetectedCoords] = useState<{lat: number; lng: number} | null>(null);
  const [locationError, setLocationError] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards'); // 'cards' or 'map'
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const myUMKMScrollRef = useRef<HTMLDivElement>(null);

  // Function to handle location permission acceptance
  const handleLocationPermissionAccept = () => {
    setShowLocationPermission(false);
    getUserLocationWithModal();
  };

  // Function to handle search and scroll to results
  const handleSearch = () => {
    if (resultsRef.current) {
      const offset = 100; // offset for header
      const targetPosition = resultsRef.current.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Function to handle Enter key on search
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Function to check if UMKM is currently open
  const isUMKMOpen = (jamOperasional: { [key: string]: string }) => {
    const now = new Date();
    const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const currentDay = days[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

    const todaySchedule = jamOperasional[currentDay];
    if (!todaySchedule || todaySchedule === 'Tutup') {
      return false;
    }

    if (todaySchedule === '24 Jam') {
      return true;
    }

    // Parse time range (e.g., "08:00 - 17:00")
    const timeRange = todaySchedule.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
    if (!timeRange) {
      return false;
    }

    const openTime = parseInt(timeRange[1]) * 60 + parseInt(timeRange[2]);
    const closeTime = parseInt(timeRange[3]) * 60 + parseInt(timeRange[4]);

    // Handle cases where closing time is past midnight
    if (closeTime < openTime) {
      return currentTime >= openTime || currentTime <= closeTime;
    }

    return currentTime >= openTime && currentTime <= closeTime;
  };

  // Removed animation observer to fix rendering issues

  // Protect route - check if user is logged in dan start activity tracking
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
      console.log('⚠️ No token or userData found, redirecting to login...');
      router.push('/user/login');
      return;
    }

    console.log('✅ User authenticated, starting activity tracking...');
    
    // Start activity tracking untuk user
    startActivityTracking();
    setupActivityListeners();

    // Check if should open UMKM Saya modal from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const shouldOpenModal = urlParams.get('openMyUMKM');
    
    if (shouldOpenModal === 'true') {
      console.log('✅ Detected openMyUMKM param, opening modal...');
      // Remove param from URL without reload
      window.history.replaceState({}, '', '/user/home');
      
      // Open modal AND load data simultaneously
      setShowMyUMKM(true);
      fetchMyUMKM();
    }

    // Cleanup
    return () => {
      stopActivityTracking();
    };
  }, [router]);

  useEffect(() => {
    // Restore filter state from sessionStorage
    const savedKategori = sessionStorage.getItem('filterKategori');
    const savedSearch = sessionStorage.getItem('filterSearch');
    const savedSortDistance = sessionStorage.getItem('filterSortDistance');
    
    if (savedKategori) {
      setSelectedKategori(savedKategori);
      // Auto-open filter if there's a saved filter
      if (savedKategori !== 'Semua') {
        setShowFilter(true);
      }
    }
    if (savedSearch) {
      setSearchQuery(savedSearch);
    }
    if (savedSortDistance === 'true') {
      setSortByDistance(true);
      setShowFilter(true);
    }
  }, []);

  useEffect(() => {
    // Get user data from localStorage
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      try {
        const data = JSON.parse(userDataStr);
        // Normalize _id from id (backend returns 'id' not '_id')
        if (data.id && !data._id) {
          data._id = data.id;
        }
        setUserData(data);
        console.log('✅ User data loaded:', data);
        console.log('✅ User ID:', data._id || data.id);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    } else {
      console.warn('⚠️ No user data found in localStorage');
    }
  }, []);

  useEffect(() => {
    fetchUMKM();
  }, []);

  // Refresh myUMKM when returning from create page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userData?._id) {
        // Refresh data when page becomes visible again
        console.log('🔄 Page visible, refreshing data...');
        fetchUMKM();
        // If modal is open, refresh my UMKM too
        if (showMyUMKM) {
          fetchMyUMKM();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userData, showMyUMKM]);

  // Track scroll position for back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Filter UMKM based on category and search
    console.log('Filter effect triggered');
    console.log('umkmList length:', umkmList.length);
    console.log('selectedKategori:', selectedKategori);
    console.log('searchQuery:', searchQuery);
    console.log('sortByDistance:', sortByDistance);
    console.log('filterOpenNow:', filterOpenNow);
    
    let filtered = [...umkmList];

    if (selectedKategori !== 'Semua') {
      filtered = filtered.filter(umkm => umkm.kategori === selectedKategori);
      console.log('After category filter:', filtered.length);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(umkm =>
        umkm.nama_umkm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        umkm.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        umkm.alamat.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('After search filter:', filtered.length);
    }

    // Filter by open now status
    if (filterOpenNow) {
      filtered = filtered.filter(umkm => isUMKMOpen(umkm.jam_operasional));
      console.log('After open now filter:', filtered.length);
    }

    // Sort by distance if user location is available
    if (sortByDistance && userLocation) {
      console.log('🔍 Sorting by distance from:', userLocation);
      
      filtered = filtered
        .map(umkm => {
          const umkmCoords = extractCoordinates(umkm.maps || '');
          if (umkmCoords && userLocation) {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              umkmCoords.lat,
              umkmCoords.lng
            );
            console.log(`📍 ${umkm.nama_umkm}: ${distance.toFixed(2)}km from user`);
            return { ...umkm, distance };
          }
          return { ...umkm, distance: 999999 };
        })
        .filter(umkm => (umkm as any).distance <= 20) // Only show UMKM within 20km radius
        .sort((a, b) => (a.distance || 999999) - (b.distance || 999999));
      
      console.log('After distance sort, showing:', filtered.length, 'UMKM within 20km radius');
    }

    console.log('Setting filteredUMKM to:', filtered.length, 'items');
    setFilteredUMKM(filtered);
  }, [selectedKategori, searchQuery, umkmList, sortByDistance, userLocation, filterOpenNow]);

  const fetchUMKM = async () => {
    console.log('🔄 Starting to fetch UMKM data...');
    setLoading(true);
    setError(null);
    
    try {
      const url = 'http://localhost:5000/api/umkm?status=approved';
      console.log('📡 Fetching from:', url);
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📊 Response status:', res.status, res.statusText);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const response = await res.json();
      console.log('✅ Response received:', response);
      console.log('✅ Data is array?', Array.isArray(response.data));
      console.log('✅ Data length:', response.data?.length);
      
      if (response.success && Array.isArray(response.data)) {
        console.log('✅ Setting', response.data.length, 'UMKM items');
        const data = response.data;
        setUmkmList(data);
        setFilteredUMKM(data);
        console.log('✅ State updated successfully');
      } else {
        console.error('❌ Invalid response format:', response);
        setError('Format data tidak valid');
        setUmkmList([]);
        setFilteredUMKM([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching UMKM:', error);
      setError(error.message || 'Gagal memuat data UMKM');
      setUmkmList([]);
      setFilteredUMKM([]);
    } finally {
      console.log('✅ Fetch complete, setting loading to false');
      setLoading(false);
      
      // Restore scroll position after data is loaded
      const savedScrollPosition = sessionStorage.getItem('homeScrollPosition');
      if (savedScrollPosition) {
        // Wait for filters to be applied before scrolling
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedScrollPosition),
            behavior: 'instant'
          });
          sessionStorage.removeItem('homeScrollPosition');
        }, 200);
      }
    }
  };

  const handleLogout = () => {
    // Clear all user data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    
    // Clear filter and scroll states
    sessionStorage.removeItem('filterKategori');
    sessionStorage.removeItem('filterSearch');
    sessionStorage.removeItem('filterSortDistance');
    sessionStorage.removeItem('homeScrollPosition');
    
    console.log('✅ User logged out successfully');
    
    // Redirect to landing page
    router.push('/');
  };

  const fetchMyUMKM = async () => {
    // Get userData from localStorage to ensure it's available
    const userDataStr = localStorage.getItem('userData');
    const currentUserData = userDataStr ? JSON.parse(userDataStr) : null;
    const userId = currentUserData?._id || currentUserData?.id;
    
    if (!userId) {
      console.log('❌ No user ID found');
      return;
    }
    
    setLoadingMyUMKM(true);
    try {
      const userToken = localStorage.getItem('userToken');
      console.log('🔍 Fetching UMKM for user ID:', userId);
      console.log('🔍 User name:', currentUserData.nama_user);
      
      const res = await fetch(`${API_URL}/umkm`, {
        headers: {
          'Authorization': userToken ? `Bearer ${userToken}` : '',
        }
      });
      const response = await res.json();
      
      console.log('📦 Total UMKM from API:', response.data?.length);
      
      if (response.success && Array.isArray(response.data)) {
        // Log semua user_id untuk debugging
        response.data.forEach((item: any, index: number) => {
          console.log(`UMKM ${index + 1}: ${item.nama_umkm} - user_id:`, item.user_id, '- nama_user:', item.nama_user);
        });
        
        // Filter UMKM yang ditambahkan oleh user ini
        // Compare as string karena ObjectId dari MongoDB
        const userUMKM = response.data.filter((item: any) => {
          // Handle berbagai format user_id
          let itemUserId;
          
          if (typeof item.user_id === 'object' && item.user_id !== null) {
            // Jika user_id adalah object (populated)
            itemUserId = item.user_id._id || item.user_id.id || item.user_id;
          } else {
            // Jika user_id adalah string
            itemUserId = item.user_id;
          }
          
          const currentUserId = userId;
          const match = String(itemUserId) === String(currentUserId);
          
          if (match) {
            console.log('✅ Match found:', item.nama_umkm, '- Status:', item.status);
          }
          
          return match;
        });
        
        console.log('📊 Filtered user UMKM:', userUMKM.length, 'items');
        console.log('📊 Breakdown:', {
          approved: userUMKM.filter((u: UMKM) => u.status === 'approved').length,
          pending: userUMKM.filter((u: UMKM) => u.status === 'pending').length,
          rejected: userUMKM.filter((u: UMKM) => u.status === 'rejected').length
        });
        
        setMyUMKM(userUMKM);
        
        // Restore scroll position after data is set
        setTimeout(() => {
          const savedScrollPos = sessionStorage.getItem('myUMKMScrollPosition');
          if (savedScrollPos && myUMKMScrollRef.current) {
            console.log('✅ Restoring scroll to:', savedScrollPos);
            myUMKMScrollRef.current.scrollTop = parseInt(savedScrollPos);
            sessionStorage.removeItem('myUMKMScrollPosition');
          }
        }, 100);
      }
    } catch (error) {
      console.error('❌ Error fetching my UMKM:', error);
    } finally {
      setLoadingMyUMKM(false);
    }
  };

  const toggleMyUMKM = () => {
    // Selalu fetch data terbaru setiap modal dibuka
    if (!showMyUMKM) {
      fetchMyUMKM();
    }
    setShowMyUMKM(!showMyUMKM);
  };

  const handleDeleteSelected = async () => {
    if (selectedUMKM.length === 0) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setDeletingUMKM(true);
    
    try {
      const token = localStorage.getItem('userToken');
      const deletePromises = selectedUMKM.map(umkmId =>
        fetch(`${API_URL}/umkm/${umkmId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      );
      
      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.ok).length;
      
      if (successCount > 0) {
        setDeleteMessage(`Berhasil menghapus ${successCount} UMKM`);
        setShowDeleteSuccess(true);
        // Refresh data
        await fetchMyUMKM();
        setSelectedUMKM([]);
        setDeleteMode(false);
      } else {
        setDeleteMessage('Gagal menghapus UMKM. Silakan coba lagi.');
        setShowDeleteError(true);
      }
    } catch (error) {
      console.error('Error deleting UMKM:', error);
      setDeleteMessage('Terjadi kesalahan saat menghapus UMKM');
      setShowDeleteError(true);
    } finally {
      setDeletingUMKM(false);
    }
  };

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
    }, 100);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const getUserLocation = () => {
    // Show permission modal first
    setShowLocationPermission(true);
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    // Haversine formula to calculate distance in kilometers
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const extractCoordinates = (mapsUrl: string): {lat: number; lng: number} | null => {
    if (!mapsUrl) return null;
    
    // Try to extract coordinates from Google Maps URL
    // Format: https://maps.google.com/?q=-7.5678,110.1234 or various other formats
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng format
      /q=(-?\d+\.\d+),(-?\d+\.\d+)/, // q=lat,lng format
      /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ll=lat,lng format
    ];
    
    for (const pattern of patterns) {
      const match = mapsUrl.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        // Validate coordinates
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
    }
    
    return null;
  };

  const getUserLocationWithModal = async () => {
    setLoadingLocation(true);
    console.log('📍 Requesting user location...');
    
    if (!navigator.geolocation) {
      console.error('❌ Geolocation not supported');
      setLocationError('Browser Anda tidak mendukung geolocation');
      setShowLocationError(true);
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('✅ Location detected:', { latitude, longitude });
        setUserLocation({ lat: latitude, lng: longitude });
        setDetectedCoords({ lat: latitude, lng: longitude });
        setSortByDistance(true);
        setLoadingLocation(false);
        setShowLocationSuccess(true);
        
        // Auto-close success modal after 3 seconds
        setTimeout(() => {
          setShowLocationSuccess(false);
        }, 3000);
      },
      (error) => {
        console.error('❌ Error getting location:', error.message);
        let errorMsg = 'Tidak dapat mengakses lokasi Anda';
        
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Izin akses lokasi ditolak. Silakan ubah pengaturan browser Anda.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Informasi lokasi tidak tersedia.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Permintaan lokasi timeout. Silakan coba lagi.';
        }
        
        setLocationError(errorMsg);
        setShowLocationError(true);
        setLoadingLocation(false);
      }
    );
  };

  const isOpen = (jamOperasional: { [key: string]: string }) => {
    const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const today = days[new Date().getDay()];
    const jadwal = jamOperasional[today];

    if (!jadwal || jadwal.toLowerCase() === 'tutup') return false;
    if (jadwal.toLowerCase() === 'buka 24 jam') return true;

    // Parse jam operasional (format: "08:00 - 22:00")
    const [start, end] = jadwal.split('-').map(t => t.trim());
    if (!start || !end) return false;

    const now = new Date();
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchUMKM();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  console.log('🎨 RENDER - loading:', loading, 'error:', error, 'umkmList:', umkmList.length, 'filteredUMKM:', filteredUMKM.length);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat UMKM...</p>
          <p className="text-xs text-gray-400 mt-2">Pastikan backend berjalan di port 5000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg min-h-screen w-screen animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 transform animate-slideInUp border border-yellow-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 shadow-lg">
                <FiAlertTriangle className="h-12 w-12 text-white animate-pulse" strokeWidth={2.5} />
              </div>
              
              <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-3">
                Konfirmasi Hapus
              </h3>
              <p className="text-gray-600 mb-2 text-lg font-medium">
                Hapus {selectedUMKM.length} UMKM?
              </p>
              <p className="text-gray-500 mb-8 text-sm">
                Tindakan ini tidak dapat dibatalkan dan semua data UMKM akan dihapus permanen.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg min-h-screen w-screen animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 transform animate-slideInUp border border-green-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-6 shadow-lg">
                <FiCheckCircle className="h-12 w-12 text-white animate-scaleIn" strokeWidth={2.5} />
              </div>
              
              <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-3">
                Berhasil Dihapus!
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                {deleteMessage}
              </p>
              
              <button
                onClick={() => setShowDeleteSuccess(false)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Error Modal */}
      {showDeleteError && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg min-h-screen w-screen animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 transform animate-slideInUp border border-red-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 mb-6 shadow-lg">
                <FiXCircle className="h-12 w-12 text-white animate-scaleIn" strokeWidth={2.5} />
              </div>
              
              <h3 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-3">
                Gagal Menghapus
              </h3>
              <p className="text-gray-600 mb-8 text-base leading-relaxed">
                {deleteMessage}
              </p>
              
              <button
                onClick={() => setShowDeleteError(false)}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Permission Modal */}
      {showLocationPermission && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-in">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-t-2xl text-white">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-white/20 p-3 rounded-full">
                    <FiMapPin className="text-2xl" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center">Aktifkan Lokasi</h3>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 text-center mb-6">
                  Izinkan akses lokasi untuk menemukan UMKM terdekat dengan Anda
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLocationPermission(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Nanti
                  </button>
                  <button
                    onClick={handleLocationPermissionAccept}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition"
                  >
                    Aktifkan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Success Modal */}
      {showLocationSuccess && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-in">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl text-white">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-white/20 p-3 rounded-full">
                    <FiCheckCircle className="text-2xl" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center">Lokasi Terdeteksi</h3>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 text-center mb-4">
                  Lokasi Anda telah terdeteksi dengan sukses
                </p>
                
                {detectedCoords && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-600 font-medium mb-2">Koordinat Anda:</p>
                    <p className="text-sm font-mono text-blue-600">
                      {detectedCoords.lat.toFixed(4)}, {detectedCoords.lng.toFixed(4)}
                    </p>
                  </div>
                )}
                
                <p className="text-sm text-gray-500 text-center">
                  Menampilkan UMKM dalam radius 20km dari lokasi Anda
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Error Modal */}
      {showLocationError && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-in">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-t-2xl text-white">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-white/20 p-3 rounded-full">
                    <FiXCircle className="text-2xl" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center">Lokasi Gagal Dideteksi</h3>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 text-center mb-6">
                  {locationError}
                </p>
                
                <button
                  onClick={() => setShowLocationError(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal UMKM Saya */}
      {showMyUMKM && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-3 sm:p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 relative z-10">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-white truncate">Riwayat UMKM Saya</h2>
                  <p className="text-xs sm:text-sm text-blue-100 mt-0.5 sm:mt-1 line-clamp-1">Kelola dan pantau status pengajuan UMKM Anda</p>
                </div>
                <button
                  onClick={() => {
                    setShowMyUMKM(false);
                    setDeleteMode(false);
                    setSelectedUMKM([]);
                  }}
                  className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <FiXCircle size={24} className="text-white sm:w-7 sm:h-7" />
                </button>
              </div>
            </div>
            
            <div ref={myUMKMScrollRef} className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gray-50">
              {loadingMyUMKM ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Memuat UMKM Anda...</p>
                </div>
              ) : myUMKM.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                  <FiList className="mx-auto text-gray-300 mb-4" size={64} />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada UMKM</h3>
                  <p className="text-gray-500 mb-6">Anda belum menambahkan UMKM apapun</p>
                  <Link href="/user/umkm/create">
                    <button
                      onClick={() => setShowMyUMKM(false)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Tambah UMKM Pertama
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {/* Action Bar with Delete Controls */}
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <button
                        onClick={() => {
                          setDeleteMode(!deleteMode);
                          setSelectedUMKM([]);
                        }}
                        className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                          deleteMode 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <FiTrash2 size={16} />
                        <span>{deleteMode ? 'Batal Pilih' : 'Pilih & Hapus'}</span>
                      </button>
                      
                      {deleteMode && (
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-1">
                          <button
                            onClick={() => {
                              if (selectedUMKM.length === myUMKM.length) {
                                setSelectedUMKM([]);
                              } else {
                                setSelectedUMKM(myUMKM.map(u => u._id));
                              }
                            }}
                            className="px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors text-sm sm:text-base"
                          >
                            {selectedUMKM.length === myUMKM.length ? 'Hapus Semua Pilihan' : 'Pilih Semua'}
                          </button>
                          
                          {selectedUMKM.length > 0 && (
                            <button
                              onClick={handleDeleteSelected}
                              disabled={deletingUMKM}
                              className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                              {deletingUMKM ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                  <span>Menghapus...</span>
                                </>
                              ) : (
                                <>
                                  <FiTrash2 size={16} />
                                  <span>Hapus {selectedUMKM.length} UMKM</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-600 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-blue-800">
                          <span className="font-semibold">Total {myUMKM.length} UMKM</span> - 
                          <span className="ml-1 sm:ml-2 text-green-700">{myUMKM.filter(u => u.status === 'approved').length} Disetujui</span>,
                          <span className="ml-1 sm:ml-2 text-yellow-700">{myUMKM.filter(u => u.status === 'pending').length} Pending</span>,
                          <span className="ml-1 sm:ml-2 text-red-700">{myUMKM.filter(u => u.status === 'rejected').length} Ditolak</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {myUMKM.map((umkm) => (
                    <div 
                      key={umkm._id} 
                      className={`bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-md hover:shadow-lg transition-all border-2 ${
                        deleteMode && selectedUMKM.includes(umkm._id)
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-100 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-4">
                        {/* Checkbox for Delete Mode */}
                        {deleteMode && (
                          <div className="flex-shrink-0 pt-2">
                            <input
                              type="checkbox"
                              checked={selectedUMKM.includes(umkm._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUMKM([...selectedUMKM, umkm._id]);
                                } else {
                                  setSelectedUMKM(selectedUMKM.filter(id => id !== umkm._id));
                                }
                              }}
                              className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
                            />
                          </div>
                        )}
                        
                        {/* Foto */}
                        <div className="flex-shrink-0">
                          {umkm.foto_umkm && umkm.foto_umkm.length > 0 ? (
                            <img
                              src={umkm.foto_umkm[0]}
                              alt={umkm.nama_umkm}
                              className="w-20 h-20 sm:w-32 sm:h-32 object-cover rounded-lg shadow-md"
                            />
                          ) : (
                            <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                              <span className="text-2xl sm:text-4xl font-bold text-white">
                                {umkm.nama_umkm.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1 sm:mb-1 truncate">{umkm.nama_umkm}</h3>
                              <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                {umkm.kategori}
                              </span>
                            </div>
                            
                            {/* Status Badge */}
                            <div className="flex-shrink-0">
                              {umkm.status === 'approved' && (
                                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-green-100 border-2 border-green-500 text-green-800 rounded-lg">
                                  <FiCheckCircle size={16} className="flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                                  <div className="text-left">
                                    <p className="text-[10px] sm:text-xs font-medium">Status</p>
                                    <p className="text-xs sm:text-sm font-bold">Disetujui</p>
                                  </div>
                                </div>
                              )}
                              {umkm.status === 'pending' && (
                                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-yellow-100 border-2 border-yellow-500 text-yellow-800 rounded-lg">
                                  <FiClock size={16} className="flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                                  <div className="text-left">
                                    <p className="text-[10px] sm:text-xs font-medium">Status</p>
                                    <p className="text-xs sm:text-sm font-bold">Pending</p>
                                  </div>
                                </div>
                              )}
                              {umkm.status === 'rejected' && (
                                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-red-100 border-2 border-red-500 text-red-800 rounded-lg">
                                  <FiXCircle size={16} className="flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                                  <div className="text-left">
                                    <p className="text-[10px] sm:text-xs font-medium">Status</p>
                                    <p className="text-xs sm:text-sm font-bold">Ditolak</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Info Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                            <div className="flex items-center text-xs sm:text-sm text-gray-600">
                              <FiMapPin className="mr-1.5 sm:mr-2 text-blue-600 flex-shrink-0" size={14} />
                              <span className="truncate">{umkm.alamat}</span>
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-gray-600">
                              <FiEye className="mr-1.5 sm:mr-2 text-blue-600 flex-shrink-0" size={14} />
                              <span className="font-semibold">{umkm.views || 0} views</span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{umkm.deskripsi}</p>

                          {/* Action Buttons */}
                          <div className="flex items-center">{umkm.status === 'approved' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Save scroll position of modal
                                  if (myUMKMScrollRef.current) {
                                    sessionStorage.setItem('myUMKMScrollPosition', myUMKMScrollRef.current.scrollTop.toString());
                                  }
                                  // Save scroll position and filter state
                                  sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
                                  sessionStorage.setItem('filterKategori', selectedKategori);
                                  sessionStorage.setItem('filterSearch', searchQuery);
                                  sessionStorage.setItem('filterSortDistance', sortByDistance.toString());
                                  // Navigate with query parameter
                                  router.push(`/user/umkm/${umkm._id}?from=myumkm`);
                                }}
                                className="flex-1 w-full px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2"
                              >
                                <FiEye className="" size={14} />
                                Lihat Detail
                              </button>
                            )}
                            {umkm.status === 'pending' && (
                              <div className="flex-1 px-3 sm:px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs sm:text-sm font-medium text-center">
                                Menunggu Verifikasi Admin
                              </div>
                            )}
                            {umkm.status === 'rejected' && (
                              <div className="flex-1">
                                <div className="px-3 sm:px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm font-medium text-center mb-2">
                                  Pengajuan Ditolak
                                </div>
                                {umkm.alasan_penolakan && (
                                  <div className="px-3 sm:px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-[10px] sm:text-xs text-red-700 font-medium mb-1">Alasan Penolakan:</p>
                                    <p className="text-xs sm:text-sm text-red-800">{umkm.alasan_penolakan}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <img src="/img/logo.png" alt="SoraUMKM" className="h-8 w-8 sm:h-10 sm:w-10" />
              <span className="text-base sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SoraUMKM
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4 lg:space-x-6">
              <Link 
                href="/user/umkm/create" 
                className="flex items-center gap-1 px-3 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-blue-50 md:hover:bg-transparent rounded-lg transition-colors"
              >
                <span>Tambah UMKM</span>
              </Link>
              <button
                onClick={toggleMyUMKM}
                className="flex items-center gap-2 px-3 py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-blue-50 md:hover:bg-transparent rounded-lg transition-colors"
              >
                <FiList size={18} />
                <span>UMKM Saya</span>
              </button>
              {userData && (
                <div className="flex items-center gap-2 md:space-x-4">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <FiUser className="text-blue-600" />
                    <span className="text-sm">{userData.nama_user}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-base"
                  >
                    <FiLogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-3">
              {/* User Name Display */}
              {userData && (
                <div className="flex items-center gap-2 text-gray-700">
                  <FiUser className="text-blue-600" size={18} />
                  <span className="text-sm font-medium">{userData.nama_user}</span>
                </div>
              )}
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4 animate-slideDown">
              <nav className="flex flex-col space-y-2">
                <Link 
                  href="/user/umkm/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <FiList size={20} />
                  <span>Tambah UMKM</span>
                </Link>
                <button
                  onClick={() => {
                    toggleMyUMKM();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-left"
                >
                  <FiList size={20} />
                  <span>UMKM Saya</span>
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FiLogOut size={20} />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-6 sm:py-10 lg:py-12">
        <div className="text-center mb-6 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Temukan UMKM Terbaik di Solo Raya
          </h1>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Dukung ekonomi lokal dengan menemukan produk dan jasa dari UMKM terpercaya di sekitar Anda
          </p>
        </div>
        {/* Search and Filter Section */}
        <div className="max-w-5xl mx-auto mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6">
            {/* Search Bar & Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari UMKM..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    sessionStorage.setItem('filterSearch', e.target.value);
                  }}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full pl-10 pr-10 py-3.5 md:py-3 text-base md:text-base rounded-lg border-2 md:border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      sessionStorage.setItem('filterSearch', '');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Hapus pencarian"
                  >
                    <FiXCircle size={20} />
                  </button>
                )}
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleSearch}
                  className="flex-1 md:flex-none px-4 md:px-6 py-3.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium whitespace-nowrap flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-base"
                >
                  <FiSearch size={18} />
                  <span>Cari</span>
                </button>
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-3.5 md:py-3 rounded-lg text-sm md:text-sm font-medium transition-all whitespace-nowrap ${
                    showFilter
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 md:border border-gray-200'
                  }`}
                >
                  <FiFilter size={16} />
                  <span>Filter</span>
                  {(selectedKategori !== 'Semua' || sortByDistance || filterOpenNow) && (
                    <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                      {(selectedKategori !== 'Semua' ? 1 : 0) + (sortByDistance ? 1 : 0) + (filterOpenNow ? 1 : 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Filter Options */}
            {showFilter && (
              <div className="space-y-4 pt-4 border-t border-gray-100 animate-fadeIn">
                {/* Category Filter */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FiFilter className="mr-2" size={14} />
                    Filter Kategori
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {kategoriList.map((kategori) => (
                      <button
                        key={kategori}
                        onClick={() => {
                          setSelectedKategori(kategori);
                          sessionStorage.setItem('filterKategori', kategori);
                          scrollToResults();
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                          selectedKategori === kategori
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {kategori}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Open Now Filter */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FiClock className="mr-2" size={14} />
                    Status Operasional
                  </label>
                  <button
                    onClick={() => {
                      setFilterOpenNow(!filterOpenNow);
                      scrollToResults();
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterOpenNow
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {filterOpenNow ? (
                      <>
                        <FiCheckCircle size={14} />
                        <span>✓ Buka Sekarang</span>
                      </>
                    ) : (
                      <>
                        <FiClock size={14} />
                        <span>Tampilkan Buka Sekarang</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FiMapPin className="mr-2" size={14} />
                    Urutkan Berdasarkan Lokasi
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <button
                      onClick={() => {
                        getUserLocation();
                        scrollToResults();
                      }}
                      disabled={loadingLocation}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        sortByDistance && userLocation
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loadingLocation ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          <span>Memuat...</span>
                        </>
                      ) : (
                        <>
                          <FiMapPin size={14} />
                          <span>{sortByDistance && userLocation ? '✓ Terdekat' : 'Tampilkan Terdekat'}</span>
                        </>
                      )}
                    </button>
                    {sortByDistance && userLocation && (
                      <button
                        onClick={() => {
                          setSortByDistance(false);
                          setUserLocation(null);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-all"
                      >
                        × Reset
                      </button>
                    )}
                    {userLocation && (
                      <span className="text-xs text-green-600 font-medium flex items-center">
                        <span className="w-2 h-2 bg-green-600 rounded-full mr-1 animate-pulse"></span>
                        Lokasi terdeteksi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div ref={resultsRef} className="text-center mb-4">
          <p className="text-gray-600">
            Menampilkan <span className="font-bold text-blue-600">{filteredUMKM.length}</span> UMKM
            {selectedKategori !== 'Semua' && <span className="font-semibold"> - Kategori: {selectedKategori}</span>}
            {searchQuery && <span className="font-semibold"> - Pencarian: "{searchQuery}"</span>}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-md p-2 inline-flex gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'map'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiMapPin className="w-5 h-5" />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* UMKM Grid */}
        {filteredUMKM.length === 0 ? (
          <div className="text-center py-20">
            <div>
              <FiMapPin className="mx-auto text-gray-300 mb-4" size={80} />
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                {sortByDistance && userLocation 
                  ? 'Tidak ada UMKM dengan lokasi terdekat' 
                  : 'Tidak ada UMKM ditemukan'}
              </h3>
              <p className="text-gray-500">
                {sortByDistance && userLocation ? (
                  <>
                    UMKM yang tersedia belum memiliki data lokasi (Google Maps).
                    <br />
                    Coba matikan filter "Terdekat Aktif" untuk melihat semua UMKM.
                  </>
                ) : searchQuery ? (
                  'Coba ubah kata kunci pencarian Anda'
                ) : (
                  'Coba pilih kategori lain'
                )}
              </p>
              {sortByDistance && userLocation && (
                <button
                  onClick={() => {
                    setSortByDistance(false);
                    setUserLocation(null);
                  }}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all"
                >
                  Tampilkan Semua UMKM
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'map' ? (
          // Map View
          <div className="mb-8">
            <Map
              markers={filteredUMKM
                .map((umkm) => {
                  const coords = extractCoordinates(umkm.maps || '');
                  if (!coords) return null;
                  return {
                    id: umkm._id,
                    nama: umkm.nama_umkm,
                    lat: coords.lat,
                    lng: coords.lng,
                    kategori: umkm.kategori,
                    distance: (umkm as any).distance,
                    alamat: umkm.alamat,
                  };
                })
                .filter((marker): marker is NonNullable<typeof marker> => marker !== null)}
              center={
                userLocation || { lat: -7.5598, lng: 110.8290 } // Default to Solo
              }
              zoom={13}
              height="600px"
              onClick={(marker) => {
                router.push(`/user/umkm/${marker.id}`);
              }}
              userLocation={userLocation || undefined}
              showUserLocation={!!userLocation}
            />
            <p className="text-center text-gray-600 mt-4 text-sm">
              💡 Klik marker pada map untuk melihat detail UMKM
            </p>
          </div>
        ) : (
          // Cards View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredUMKM.map((umkm, index) => (
              <div
                key={umkm._id}
                onClick={() => {
                  // Save scroll position and filter state
                  sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
                  sessionStorage.setItem('filterKategori', selectedKategori);
                  sessionStorage.setItem('filterSearch', searchQuery);
                  sessionStorage.setItem('filterSortDistance', sortByDistance.toString());
                  router.push(`/user/umkm/${umkm._id}`);
                }}
                className="cursor-pointer"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                  {/* Image */}
                  <div className="relative h-56 bg-gradient-to-br from-blue-400 to-indigo-500 overflow-hidden">
                    {umkm.foto_umkm && umkm.foto_umkm.length > 0 ? (
                      <img
                        src={umkm.foto_umkm[0]}
                        alt={umkm.nama_umkm}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-8xl font-bold text-white opacity-50">
                          {umkm.nama_umkm.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {isOpen(umkm.jam_operasional) ? (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center">
                          <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                          BUKA SEKARANG
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-full shadow-lg">
                          TUTUP
                        </span>
                      )}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute bottom-4 left-4">
                      <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-blue-600 text-sm font-bold rounded-full shadow-lg">
                        {umkm.kategori}
                      </span>
                    </div>

                    {/* Distance Badge - only show if location sorting is active */}
                    {sortByDistance && userLocation && (umkm as any).distance && (umkm as any).distance < 999999 && (
                      <div className="absolute bottom-4 right-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center">
                          📍 {((umkm as any).distance).toFixed(1)} km
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {umkm.nama_umkm}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                      {umkm.deskripsi}
                    </p>

                    {/* Location */}
                    <div className="flex items-start text-sm text-gray-500 mb-3">
                      <FiMapPin className="mr-2 mt-1 flex-shrink-0 text-blue-500" />
                      <span className="line-clamp-2">{umkm.alamat}</span>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center space-x-4 mb-4 text-sm">
                      {umkm.kontak.telepon && (
                        <div className="flex items-center text-gray-500">
                          <FiPhone className="mr-1 text-blue-500" />
                          <span>Telepon</span>
                        </div>
                      )}
                      {umkm.kontak.instagram && (
                        <div className="flex items-center text-gray-500">
                          <FiInstagram className="mr-1 text-pink-500" />
                          <span>Instagram</span>
                        </div>
                      )}
                    </div>

                    {/* Payment Methods */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {umkm.pembayaran.slice(0, 3).map((metode) => (
                        <span
                          key={metode}
                          className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded"
                        >
                          {metode}
                        </span>
                      ))}
                      {umkm.pembayaran.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                          +{umkm.pembayaran.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Views */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-gray-500 text-sm">
                        <FiEye className="mr-2" />
                        <span>{umkm.views.toLocaleString()} views</span>
                      </div>
                      <span className="text-blue-600 font-semibold text-sm">
                        Lihat Detail →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/img/logo.png" alt="SoraUMKM" className="h-10 w-10" />
                <span className="text-2xl font-bold">SoraUMKM</span>
              </div>
              <p className="text-gray-400 text-sm">
                Platform terpercaya untuk menemukan dan mendukung UMKM lokal di kawasan Solo Raya.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Navigasi</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/user/home" className="hover:text-white transition-colors">Jelajah UMKM</Link></li>
                <li><Link href="/user/umkm/create" className="hover:text-white transition-colors">Tambah UMKM</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Kategori</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Kuliner</li>
                <li>Fashion</li>
                <li>Kerajinan</li>
                <li>Jasa</li>
                <li>Agribisnis & Pertanian</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Wilayah Solo Raya</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Surakarta</li>
                <li>Boyolali</li>
                <li>Sukoharjo</li>
                <li>Karanganyar</li>
                <li>Wonogiri</li>
                <li>Sragen</li>
                <li>Klaten</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 SoraUMKM. Platform UMKM Solo Raya - Mendukung Ekonomi Lokal.</p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 z-50 animate-fadeIn"
          aria-label="Kembali ke atas"
        >
          <FiArrowUp size={24} />
        </button>
      )}
    </div>
  );
}
