// AdminDashboard.tsx  (WITH PAGINATION + PAGE LIMIT)

import {
  collection,
  doc,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { Clock, Facebook, Navigation, Phone, Search, User } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./AdminDashboard.css";
import { db } from "./firebase-config";
import PaginationControl from "./pages/AdminDashboard/components/PaginationControl";
import { useAdminAuth } from "./providers/AdminAuthProvider";

interface NeedPin {
  id: string;
  lat?: number;
  lng?: number;
  type: "HELP" | "SHOP";
  need?: string;
  phone?: string;
  status: "OPEN" | "ACCEPTED" | "RESOLVED";
  helperPhone?: string;
  helperName?: string;
  timestamp?: Timestamp;
  name?: string;
  userId?: string;
}

type SortBy = "newest" | "oldest" | "name-asc" | "name-desc";

const AdminDashboard: React.FC = () => {
  const { isAuth, login } = useAdminAuth();
  const [password, setPassword] = useState("");

  const [needs, setNeeds] = useState<NeedPin[]>([]);
  const [activeTab, setActiveTab] = useState<NeedPin["status"]>("OPEN");

  // SEARCH + SORT
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const searchRef = useRef<number | null>(null);

  // PAGINATION
  const [pageSize, setPageSize] = useState(100); // default 100
  const [page, setPage] = useState(1);

  // debounce search 300ms
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1); // reset page on search
    }, 300);
  }, [searchTerm]);

  // Load data
  useEffect(() => {
    if (!isAuth) return;

    const q = query(collection(db, "needs"), where("type", "==", "HELP"));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: NeedPin[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<NeedPin, "id">),
      }));
      // default newest sort
      list.sort(
        (a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
      );
      setNeeds(list);
    });

    return () => unsub();
  }, [isAuth]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(password);
  };

  const formatTime = (ts?: Timestamp) => {
    if (!ts) return "-";
    try {
      return ts.toDate().toLocaleString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const openGoogleMaps = (lat?: number, lng?: number) => {
    if (!lat || !lng) return alert("ตำแหน่งไม่พร้อมใช้งาน");
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    );
  };

  const handleAccept = async (id: string) => {
    const helperName = window.prompt("ชื่อผู้ช่วยเหลือ:");
    if (helperName === null) return;
    const helperPhone = window.prompt("เบอร์ผู้ช่วยเหลือ:");
    if (helperPhone === null) return;

    const ok = window.confirm("ยืนยันรับเรื่อง?");
    if (!ok) return;

    await updateDoc(doc(db, "needs", id), {
      status: "ACCEPTED",
      helperName,
      helperPhone,
    });
  };

  const handleResolve = async (id: string) => {
    const ok = window.confirm("ยืนยันว่าช่วยเหลือแล้ว?");
    if (!ok) return;

    await updateDoc(doc(db, "needs", id), { status: "RESOLVED" });
  };

  // filter + sort (before pagination)
  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    let list = needs.filter((n) => n.status === activeTab);

    if (term) {
      list = list.filter((n) => {
        const name = (n.name || "").toLowerCase();
        const phone = (n.phone || "").toLowerCase();
        const need = (n.need || "").toLowerCase();
        return (
          name.includes(term) || phone.includes(term) || need.includes(term)
        );
      });
    }

    list = [...list]; // clone before sorting

    switch (sortBy) {
      case "newest":
        list.sort(
          (a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
        );
        break;
      case "oldest":
        list.sort(
          (a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0)
        );
        break;
      case "name-asc":
        list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
    }
    return list;
  }, [needs, activeTab, debouncedSearch, sortBy]);

  // pagination calculations
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const paginated = filtered.slice(pageStart, pageEnd);

  const counts = {
    open: needs.filter((n) => n.status === "OPEN").length,
    accepted: needs.filter((n) => n.status === "ACCEPTED").length,
    resolved: needs.filter((n) => n.status === "RESOLVED").length,
  };

  if (!isAuth) {
    return (
      <div className="admin-container">
        <div className="admin-login">
          <h1>Admin Dashboard</h1>
          <form
            onSubmit={handleLogin}
            style={{ gap: "4px", display: "flex", flexDirection: "column" }}
          >
            <input
              type="password"
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: "12px" }}
            >
              เข้าสู่ระบบ
            </button>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 mb-2">
                ไม่มีรหัสผ่าน? ติดต่อขอรหัสได้ที่
              </p>
              <a
                href="https://www.facebook.com/profile.php?id=61584432652391"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Facebook size={18} /> ติดต่อผู้ดูแลระบบ (Facebook)
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="text-muted">
          ระบบจัดการผู้ประสบภัย — พร้อมค้นหา/กรอง/แบ่งหน้า
        </p>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{counts.open}</div>
          <div className="stat-label">รอความช่วยเหลือ</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "#f59e0b" }}>
            {counts.accepted}
          </div>
          <div className="stat-label">กำลังช่วยเหลือ</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "#10b981" }}>
            {counts.resolved}
          </div>
          <div className="stat-label">ช่วยเหลือแล้ว</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "OPEN" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("OPEN");
            setPage(1);
          }}
        >
          รอ ({counts.open})
        </button>
        <button
          className={`tab-btn ${activeTab === "ACCEPTED" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("ACCEPTED");
            setPage(1);
          }}
        >
          กำลังช่วยเหลือ ({counts.accepted})
        </button>
        <button
          className={`tab-btn ${activeTab === "RESOLVED" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("RESOLVED");
            setPage(1);
          }}
        >
          ช่วยเหลือแล้ว ({counts.resolved})
        </button>
      </div>

      {/* Filter + search + sort + page size */}
      <div className="filters-row" style={{ marginBottom: 10 }}>
        <div style={{ flex: 1, display: "flex", gap: 8 }}>
          <Search size={18} />
          <input
            className="search-input"
            placeholder="ค้นหาชื่อ / เบอร์ / สิ่งที่ต้องการ..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />

          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortBy);
              setPage(1);
            }}
          >
            <option value="newest">ใหม่สุด → เก่าสุด</option>
            <option value="oldest">เก่าสุด → ใหม่สุด</option>
            <option value="name-asc">ชื่อ A → Z</option>
            <option value="name-desc">ชื่อ Z → A</option>
          </select>

          <select
            className="filter-select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={50}>50 รายการ</option>
            <option value={100}>100 รายการ (ค่าเริ่มต้น)</option>
            <option value={200}>200 รายการ</option>
            <option value={500}>500 รายการ</option>
          </select>
        </div>
      </div>

      {/* Pagination Controls */}
      <PaginationControl
        page={page}
        totalPages={totalPages}
        total={total}
        pageStart={pageStart}
        pageEnd={pageEnd}
        setPage={setPage}
      />

      {/* Needs list */}
      <div className="needs-list">
        {paginated.length === 0 ? (
          <div className="empty-state">ไม่มีข้อมูล</div>
        ) : (
          paginated.map((item) => (
            <div key={item.id} className={`need-card status-${item.status}`}>
              <div className="need-card-header">
                <div className="need-info">
                  <h3>
                    <User size={18} /> {item.name || "ไม่ระบุชื่อ"}
                  </h3>
                  <div className="need-meta">
                    <span>
                      <Phone size={14} /> {item.phone || "-"}
                    </span>
                    <span>
                      <Clock size={14} /> {formatTime(item.timestamp)}
                    </span>
                  </div>
                </div>

                <span
                  className={
                    "badge " +
                    (item.status === "OPEN"
                      ? "badge-open"
                      : item.status === "ACCEPTED"
                      ? "badge-accepted"
                      : "badge-resolved")
                  }
                >
                  {item.status === "OPEN"
                    ? "รอช่วยเหลือ"
                    : item.status === "ACCEPTED"
                    ? "กำลังช่วยเหลือ"
                    : "ช่วยเหลือแล้ว"}
                </span>
              </div>

              <div className="need-content">
                <strong>สิ่งที่ต้องการ:</strong> {item.need || "-"}
              </div>

              {(item.status === "ACCEPTED" || item.status === "RESOLVED") && (
                <div className="help-box">
                  <strong>ผู้ช่วยเหลือ: </strong> {item.helperName} (
                  {item.helperPhone})
                </div>
              )}

              <div className="need-actions">
                {item.status === "OPEN" && (
                  <button
                    className="btn btn-resolve"
                    onClick={() => handleAccept(item.id)}
                  >
                    รับเรื่อง (Accept)
                  </button>
                )}

                {item.status !== "RESOLVED" && (
                  <button
                    className="btn btn-map"
                    onClick={() => handleResolve(item.id)}
                  >
                    ช่วยเหลือแล้ว
                  </button>
                )}

                <button
                  className="btn btn-map"
                  onClick={() => openGoogleMaps(item.lat, item.lng)}
                >
                  <Navigation size={14} /> แผนที่
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <PaginationControl
        page={page}
        totalPages={totalPages}
        total={total}
        pageStart={pageStart}
        pageEnd={pageEnd}
        setPage={setPage}
      />
    </div>
  );
};

export default AdminDashboard;
