import { MapPin, X, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import "./App.css";
import MapComponent from "./MapComponent";
import ThankYouPage from "./pages/ThankYouPage";
import {
  auth,
  db,
  messaging,
  getToken,
  onMessage,
} from "./firebase-config";
import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
} from "firebase/firestore";

// Component: Notification Toast
function NotificationToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 10000); // Auto close after 10s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 right-4 left-4 md:left-auto md:w-96 bg-green-600 text-white px-4 py-3 rounded-lg shadow-xl z-[2000] animate-fade-in flex items-start gap-3 border-l-4 border-white">
      <Bell className="shrink-0 mt-1" size={20} />
      <div className="flex-1">
        <h4 className="font-bold text-sm mb-1">แจ้งเตือน!</h4>
        <p className="text-sm leading-tight">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="hover:bg-green-700 p-1 rounded shrink-0"
      >
        <X size={18} />
      </button>
    </div>
  );
}

// Wrapper for MapComponent to handle URL params
function MapRoute({ user }: { user: User | null }) {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get("mode");
  const mode = modeParam === "SHOP" ? "SHOP" : "HELP";

  return <MapComponent user={user} mode={mode} />;
}

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between">
        <div
          className="brand flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="brand-icon">
            <MapPin size={24} color="white" />
          </div>
          <span className="brand-name">hatyaitongrod</span>
        </div>
      </div>
    </nav>
  );
}

// Component: Main App
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // Request FCM Token
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, {
            // vapidKey: 'YOUR_VAPID_KEY_HERE' // Optional: Add VAPID key if needed
          });
          // console.log('FCM Token:', token);

          if (user) {
            await setDoc(
              doc(db, "users", user.uid),
              {
                fcmToken: token,
                updatedAt: new Date(),
              },
              { merge: true }
            );
          }
        }
      } catch (error) {
        console.error("Error getting permission/token", error);
      }
    };

    requestPermission();

    // Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      // console.log('Message received. ', payload);
      setNotification(payload.notification?.body || "มีข้อความใหม่");
    });

    return () => unsubscribe();
  }, [user]);

  // Listen for notifications (When someone accepts help) - Local Listener Fallback
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "needs"), where("userId", "==", user.uid));

    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const data = change.doc.data();
          if (data.status === "ACCEPTED") {
            const helperName = data.helperName || "อาสาสมัคร";
            const helperPhone = data.helperPhone || "-";
            const message = `หมุดของคุณได้รับการช่วยเหลือแล้ว! โดย ${helperName} (โทร: ${helperPhone}) กรุณารอการติดต่อกลับ`;

            // In-app notification
            setNotification(message);

            // System Notification (Chrome/Mobile)
            if (Notification.permission === "granted") {
              // Try to use Service Worker registration for better mobile support
              if (
                "serviceWorker" in navigator &&
                navigator.serviceWorker.ready
              ) {
                navigator.serviceWorker.ready.then((registration) => {
                  registration.showNotification("มีผู้ช่วยเหลือแล้ว!", {
                    body: message,
                    icon: "/pwa-192x192.png",
                    tag: "help-accepted",
                    // @ts-ignore
                    vibrate: [200, 100, 200],
                  });
                });
              } else {
                // Fallback to standard Notification API
                new Notification("มีผู้ช่วยเหลือแล้ว!", {
                  body: message,
                  icon: "/pwa-192x192.png",
                });
              }
            }
          }
        }
      });
    });

    return () => unsubscribeSnapshot();
  }, [user]);

  return (
    <Router>
      <div className="app">
        {notification && (
          <NotificationToast
            message={notification}
            onClose={() => setNotification(null)}
          />
        )}
        <Navbar />

        {/* Main Content Area */}
        <main className="main-content-area">
          <Routes>
            <Route path="/" element={<ThankYouPage />} />
            <Route path="/map" element={<MapRoute user={user} />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
