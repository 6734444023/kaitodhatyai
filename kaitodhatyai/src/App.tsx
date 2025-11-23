import { MapPin, Menu, X, LogIn, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './App.css';
import MapComponent from './MapComponent';
import LandingPage from './LandingPage';
import { auth, googleProvider } from './firebase-config';
import { signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';

// Wrapper for MapComponent to handle URL params
function MapRoute({ user }: { user: User | null }) {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const mode = (modeParam === 'SHOP') ? 'SHOP' : 'HELP';
  
  return <MapComponent user={user} mode={mode} />;
}

function Navbar({ user, isMobileMenuOpen, setIsMobileMenuOpen }: { user: User | null, isMobileMenuOpen: boolean, setIsMobileMenuOpen: (open: boolean) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMapPage = location.pathname === '/map';

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <nav className="navbar">
        <div className="container flex items-center justify-between">
          <div className="brand flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="brand-icon">
              <MapPin size={24} color="white" />
            </div>
            <span className="brand-name">hatyaitongrod</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="nav-actions flex items-center gap-4 hidden-mobile">
            {user ? (
              <div className="flex items-center gap-2">
                <img src={user.photoURL || ''} alt="User" className="w-8 h-8 rounded-full border border-gray-300" />
                <span className="text-sm font-medium">{user.displayName}</span>
                <button onClick={handleLogout} className="btn btn-sm btn-outline flex items-center gap-1">
                  <LogOut size={16} /> <span>ออกระบบ</span>
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="btn btn-primary text-sm flex items-center gap-1">
                <LogIn size={16} /> เข้าสู่ระบบ
              </button>
            )}

            <button
              className={`btn btn-primary text-sm ${isMapPage ? 'btn-switch-view' : ''}`}
              onClick={() => navigate('/map?mode=HELP')}
            >
              เข้าสู่แผนที่สด (Live Map)
            </button>
            {isMapPage && (
              <button
                className="btn btn-outline text-sm"
                onClick={() => navigate('/')}
              >
                หน้าหลัก
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="menu-btn mobile-only" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-menu animate-fade-in">
            <div className="mobile-menu-content">
               {user ? (
                  <div className="mobile-user-profile">
                    <img src={user.photoURL || ''} alt="User" className="w-10 h-10 rounded-full border border-gray-300" />
                    <span className="font-medium">{user.displayName}</span>
                  </div>
                ) : null}
              
              <button
                className="btn btn-primary btn-full"
                onClick={() => { navigate('/map?mode=HELP'); setIsMobileMenuOpen(false); }}
              >
                เข้าสู่แผนที่สด (Live Map)
              </button>
              
              {isMapPage && (
                <button
                  className="btn btn-outline btn-full"
                  onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}
                >
                  กลับหน้าหลัก
                </button>
              )}

              <div className="divider"></div>

              {user ? (
                <button onClick={handleLogout} className="btn btn-outline btn-full flex items-center justify-center gap-2 text-red-500 border-red-500">
                  <LogOut size={18} /> ออกระบบ
                </button>
              ) : (
                <button onClick={handleLogin} className="btn btn-primary btn-full flex items-center justify-center gap-2">
                  <LogIn size={18} /> เข้าสู่ระบบ
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
  );
}

// Component: Main App
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="app">
        <Navbar user={user} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        
        {/* Main Content Area */}
        <main className="main-content-area">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/map" element={<MapRoute user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;