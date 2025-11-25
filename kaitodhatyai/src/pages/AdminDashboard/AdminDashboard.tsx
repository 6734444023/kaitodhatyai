import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { CheckCircle, Clock, Navigation, Phone, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase-config";
import "./AdminDashboard.css";

interface NeedPin {
  id: string;
  lat: number;
  lng: number;
  type: "HELP" | "SHOP";
  need?: string;
  shopName?: string;
  isOpen?: boolean;
  phone: string;
  status: "OPEN" | "ACCEPTED" | "RESOLVED";
  helperPhone?: string;
  helperName?: string;
  timestamp: Timestamp;
  name?: string;
  userId?: string;
}

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"waiting" | "helped">("waiting");
  const [searchName, setSearchName] = useState("");
  const [typeInput, setTypeInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  // const { needs: adminNeeds, loading } = useNeeds("HELP");
  const adminNeeds = [];
  const loading = false;
  // Hardcoded password for simplicity as requested
  const ADMIN_CODE = "admin1234";

  useEffect(() => {
    if (!isAuthenticated) return;

    // // Query for HELP pins only
    // // แก้ไข: เอา orderBy ออกจาก Query เพื่อเลี่ยงปัญหา Index และมา Sort ใน JS แทน
    // const q = query(collection(db, "needs"), where("type", "==", "HELP"));

    // const unsubscribe = onSnapshot(
    //   q,
    //   (snapshot) => {
    //     const fetchedNeeds = snapshot.docs.map(
    //       (doc) =>
    //         ({
    //           id: doc.id,
    //           ...doc.data(),
    //         } as NeedPin)
    //     );

    //     // Sort client-side (Newest first)
    //     fetchedNeeds.sort((a, b) => {
    //       const timeA = a.timestamp?.seconds || 0;
    //       const timeB = b.timestamp?.seconds || 0;
    //       return timeB - timeA;
    //     });

    //     setNeeds(fetchedNeeds);
    //   },
    //   (error) => {
    //     console.error("Error fetching needs:", error);
    //     alert(
    //       "เกิดข้อผิดพลาดในการดึงข้อมูล (ดู Console เพื่อตรวจสอบรายละเอียด)"
    //     );
    //   }
    // );

    // return () => unsubscribe();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_CODE) {
      setIsAuthenticated(true);
    } else {
      alert("รหัสผ่านไม่ถูกต้อง");
    }
  };

  const handleMarkAsHelped = async (id: string) => {
    if (window.confirm("ยืนยันว่าผู้ประสบภัยรายนี้ได้รับความช่วยเหลือแล้ว?")) {
      try {
        await updateDoc(doc(db, "needs", id), {
          status: "RESOLVED",
        });
      } catch (error) {
        console.error("Error updating status:", error);
        alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
      }
    }
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  };

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const applyFilters = () => {};

  const clearFilters = () => {};

  // Filter data based on tabs
  const waitingList = adminNeeds.filter((n) => n.status === "OPEN");
  const helpedList = adminNeeds.filter(
    (n) => n.status === "ACCEPTED" || n.status === "RESOLVED"
  );

  const currentList = activeTab === "waiting" ? waitingList : helpedList;

  // if (!isAuthenticated) {
  //   return (
  //     <div className="admin-container">
  //       <div className="admin-login">
  //         <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
  //         <form
  //           onSubmit={handleLogin}
  //           className="flex flex-col gap-4 items-center"
  //         >
  //           <input
  //             type="password"
  //             placeholder="กรอกรหัสผ่านเพื่อเข้าสู่ระบบ"
  //             value={password}
  //             onChange={(e) => setPassword(e.target.value)}
  //           />
  //           <button type="submit" className="btn btn-primary">
  //             เข้าสู่ระบบ
  //           </button>

  //           <div className="mt-4 text-center">
  //             <p className="text-sm text-gray-500 mb-2">
  //               ไม่มีรหัสผ่าน? ติดต่อขอรหัสได้ที่
  //             </p>
  //             <a
  //               href="https://www.facebook.com/kluay.game"
  //               target="_blank"
  //               rel="noopener noreferrer"
  //               className="btn btn-outline flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
  //             >
  //               <Facebook size={18} /> ติดต่อผู้ดูแลระบบ (Facebook)
  //             </a>
  //           </div>
  //         </form>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="admin-container w-full">
      <div className="dashboard-header">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted">จัดการข้อมูลผู้ประสบภัยน้ำท่วมหาดใหญ่</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{waitingList.length}</div>
          <div className="stat-label">รอความช่วยเหลือ</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "#10b981" }}>
            {helpedList.length}
          </div>
          <div className="stat-label">ได้รับความช่วยเหลือแล้ว</div>
        </div>
      </div>
      {/* Search */}
      <div className="search-container">
        <div className="search-field">
          <label>ค้นหาชื่อผู้ประสบภัย</label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="ค้นหาชื่อผู้ประสบภัย"
          />
        </div>

        <button className="search-btn" onClick={applyFilters}>
          ค้นหา
        </button>
        <button className="clear-btn" onClick={clearFilters}>
          ล้างค่า
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "waiting" ? "active" : ""}`}
          onClick={() => setActiveTab("waiting")}
        >
          รอความช่วยเหลือ ({waitingList.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "helped" ? "active" : ""}`}
          onClick={() => setActiveTab("helped")}
        >
          ได้รับความช่วยเหลือแล้ว ({helpedList.length})
        </button>
      </div>

      <div className="needs-list">
        {loading ? (
          <div className="text-center py-8 text-muted">
            กำลังโหลดรายการขอความช่วยเหลือ...
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-8 text-muted">
            ไม่มีข้อมูลในรายการนี้
          </div>
        ) : (
          currentList.map((item) => (
            <div key={item.id} className={`need-card status-${item.status}`}>
              <div className="need-card-header">
                <div className="need-info">
                  <h3>
                    <User size={20} className="inline mr-2" />
                    {item.name || "ไม่ระบุชื่อ"}
                  </h3>
                  <div className="need-meta">
                    <span>
                      <Phone size={16} className="inline mr-1" />
                      {item.phone}
                    </span>
                    <span>
                      <Clock size={16} className="inline mr-1" />
                      {formatTime(item.timestamp)}
                    </span>
                  </div>
                </div>
                <span className={`badge badge-${item.status.toLowerCase()}`}>
                  {item.status === "OPEN"
                    ? "รอความช่วยเหลือ"
                    : item.status === "ACCEPTED"
                    ? "กำลังช่วยเหลือ"
                    : "ช่วยเหลือแล้ว"}
                </span>
              </div>

              <div className="need-content">
                <strong>สิ่งที่ต้องการ:</strong> {item.need}
              </div>

              {item.status === "ACCEPTED" && (
                <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-200">
                  <strong>ผู้ช่วยเหลือ:</strong> {item.helperName} (
                  {item.helperPhone})
                </div>
              )}

              <div className="need-actions">
                <button
                  className="btn btn-map flex-1"
                  onClick={() => openGoogleMaps(item.lat, item.lng)}
                >
                  <Navigation size={18} className="mr-2" /> ดูแผนที่ (Google
                  Maps)
                </button>

                {item.status !== "RESOLVED" && (
                  <button
                    className="btn btn-resolve flex-1"
                    onClick={() => handleMarkAsHelped(item.id)}
                  >
                    <CheckCircle size={18} className="mr-2" />{" "}
                    ทำเครื่องหมายว่าช่วยเหลือแล้ว
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
