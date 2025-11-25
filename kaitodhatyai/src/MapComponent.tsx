import type { User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import L from "leaflet";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet/dist/leaflet.css";
import {
  CheckCircle,
  Home,
  MapPin,
  Phone,
  Store,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import RequestFilter from "./components/RequestFilter";
import { db } from "./firebase-config"; // นำเข้า db ที่ตั้งค่าไว้
import "./MapComponent.css";

// กำหนด Type Interface
interface NeedPin {
  id: string;
  lat: number;
  lng: number;
  type: "HELP" | "SHOP"; // เพิ่มประเภทหมุด
  need?: string; // สำหรับ HELP
  shopName?: string; // สำหรับ SHOP
  isOpen?: boolean; // สำหรับ SHOP
  phone: string;
  status: "OPEN" | "ACCEPTED" | "RESOLVED";
  helperPhone?: string;
  helperName?: string; // เพิ่มชื่อผู้ช่วยเหลือ
  timestamp: Timestamp;
  name?: string;
  userId?: string; // เพิ่ม userId เพื่อตรวจสอบความเป็นเจ้าของ
}

// แก้ไขไอคอน Marker เริ่มต้นให้แสดงผลถูกต้อง
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// พิกัดเริ่มต้น: หาดใหญ่ (7.0000, 100.4781)
const HATYAI_CENTER: [number, number] = [7.0, 100.4781];
const INITIAL_ZOOM = 13;

// ฟังก์ชันกำหนดสี Marker ตามสถานะ
const getMarkerIcon = (pin: NeedPin): L.Icon | L.DivIcon => {
  // ถ้าเป็นโหมด HELP ให้แสดงเป็นชื่อคน (Label) แทนหมุด
  if (pin.type === "HELP") {
    let statusClass = "status-OPEN";
    if (pin.status === "ACCEPTED") statusClass = "status-ACCEPTED";
    if (pin.status === "RESOLVED") statusClass = "status-RESOLVED";

    const displayName = pin.name || "ผู้ประสบภัย";

    return L.divIcon({
      className: "custom-label-icon",
      html: `<div class="marker-pin-label ${statusClass}">
              <span>${displayName}</span>
             </div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }

  // ถ้าเป็นโหมด SHOP ให้แสดงชื่อร้านและสถานะ
  if (pin.type === "SHOP") {
    const shopName = pin.shopName || "ร้านค้า";
    const isOpen = pin.isOpen;
    const statusClass = isOpen ? "shop-OPEN" : "shop-CLOSED";
    const statusText = isOpen ? "เปิด" : "ปิด";

    return L.divIcon({
      className: "custom-label-icon",
      html: `<div class="marker-pin-label ${statusClass}">
              <span><i class="fas fa-store"></i> ${shopName} (${statusText})</span>
             </div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }

  // Fallback (ไม่น่าจะถูกเรียกใช้ถ้า type ถูกต้อง)
  return new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/blue-marker.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// =========================================================================
// Component: Modal สำหรับปักหมุด (รวมทั้ง Help และ Shop)
// =========================================================================
interface ReportModalProps {
  onClose: () => void;
  latLng: L.LatLng | null;
  mode: "HELP" | "SHOP";
  user: User | null;
}

const ReportModal: React.FC<ReportModalProps> = ({
  onClose,
  latLng,
  mode,
  user,
}) => {
  const [need, setNeed] = useState("");
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState(user?.displayName || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!latLng) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนปักหมุด");
      return;
    }

    if (!latLng || !phone) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (mode === "HELP" && !need) {
      alert("กรุณาระบุสิ่งที่ต้องการความช่วยเหลือ");
      return;
    }

    if (mode === "SHOP" && !shopName) {
      alert("กรุณาระบุชื่อร้านค้า");
      return;
    }

    setIsSubmitting(true);
    try {
      const pinData: any = {
        lat: latLng.lat,
        lng: latLng.lng,
        phone,
        name,
        type: mode,
        status: "OPEN",
        timestamp: Timestamp.now(),
        userId: user.uid, // บันทึก userId
      };

      if (mode === "HELP") {
        pinData.need = need;
      } else {
        pinData.shopName = shopName;
        pinData.isOpen = true;
      }

      await addDoc(collection(db, "needs"), pinData);
      alert(
        mode === "HELP"
          ? "แจ้งขอความช่วยเหลือเรียบร้อย!"
          : "ปักหมุดร้านค้าเรียบร้อย!"
      );
      onClose();
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            {mode === "HELP" ? (
              <MapPin size={24} className="mr-2 inline" />
            ) : (
              <Store size={24} className="mr-2 inline" />
            )}
            {mode === "HELP" ? "ปักหมุดขอความช่วยเหลือ" : "ปักหมุดร้านค้า"}
          </h3>
          <button onClick={onClose} className="btn-close">
            <X size={20} />
          </button>
        </div>

        {!user && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
            กรุณาเข้าสู่ระบบก่อนทำการปักหมุด
          </div>
        )}

        <p className="text-muted text-sm mb-3">
          ตำแหน่งที่เลือก: **
          {latLng
            ? `${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}`
            : "กำลังระบุ..."}
          **
        </p>

        <form onSubmit={handleSubmit}>
          {mode === "HELP" ? (
            <div className="form-group">
              <label htmlFor="need">
                สิ่งที่ต้องการ (เช่น อาหาร, ยา, ต้องการเรือ)
              </label>
              <textarea
                id="need"
                rows={3}
                value={need}
                onChange={(e) => setNeed(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="shopName">ชื่อร้านค้า</label>
              <input
                type="text"
                id="shopName"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="phone">เบอร์โทรศัพท์ติดต่อ (สำคัญมาก)</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">ชื่อผู้ติดต่อ / เจ้าของร้าน</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-secondary btn-full"
            disabled={isSubmitting || !user}
          >
            {isSubmitting
              ? "กำลังบันทึก..."
              : mode === "HELP"
              ? "ปักหมุดแจ้งความต้องการ"
              : "ปักหมุดร้านค้า"}
          </button>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// Component: Map Controller (Fly to specific location)
// =========================================================================
const MapController = ({ center }: { center: L.LatLngExpression | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16);
    }
  }, [center, map]);
  return null;
};

// =========================================================================
// Component: Map Click Handler
// =========================================================================
interface MapClickHandlerProps {
  onMapClick: (latLng: L.LatLng) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onMapClick }) => {
  // Hook นี้จะทำงานเมื่อมีการคลิกบนแผนที่
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

// =========================================================================
// Component: Live Map (Main Component)
// =========================================================================
interface MapComponentProps {
  user?: User | null;
  mode?: "HELP" | "SHOP";
}

const MapComponent: React.FC<MapComponentProps> = ({ user, mode = "HELP" }) => {
  const [pins, setPins] = useState<NeedPin[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedLatLng, setClickedLatLng] = useState<L.LatLng | null>(null);

  // Search State
  const [searchText, setSearchText] = useState("");
  const [mapFlyTo, setMapFlyTo] = useState<L.LatLngExpression | null>(null);

  const [filters, setFilters] = useState({ viewType: "mine", status: "" });

  const handleSearch = () => {
    // รองรับรูปแบบ "lat, lng" หรือ "lat lng"
    const parts = searchText.trim().split(/[\s,]+/);

    if (parts.length < 2) {
      alert(
        'กรุณากรอกพิกัดในรูปแบบ "ละติจูด, ลองจิจูด" (เช่น 7.0050, 100.4800)'
      );
      return;
    }

    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);

    if (isNaN(lat) || isNaN(lng)) {
      alert("กรุณากรอกพิกัดให้ถูกต้อง (ตัวเลข)");
      return;
    }

    const newLatLng = new L.LatLng(lat, lng);
    setMapFlyTo([lat, lng]); // Move map
    setClickedLatLng(newLatLng); // Set point for modal
    setIsModalOpen(true); // Open modal
  };

  // 1. ดึงข้อมูลหมุดแบบ Real-time จาก Firestore
  useEffect(() => {
    let q = query(collection(db, "needs"));
    if (filters.viewType === "mine" && user) {
      q = query(collection(db, "needs"), where("userId", "==", user.uid));
    }
    const unsub = onSnapshot(q, (snapshot) => {
      const fetchedPins: NeedPin[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as NeedPin)
      );

      // กรองเฉพาะหมุดที่ยัง OPEN หรือ ACCEPTED และมีพิกัดถูกต้อง เพื่อแสดงบนแผนที่
      // แก้ไข: แสดงหมุด RESOLVED ด้วย เพื่อให้เห็นสถานะว่าช่วยเหลือแล้ว
      setPins(
        fetchedPins.filter(
          (p) => typeof p.lat === "number" && typeof p.lng === "number"
        )
      );
    });

    // Cleanup function
    return () => unsub();
  }, [user, filters.viewType]);

  // 2. จัดการเมื่อผู้ใช้คลิกบนแผนที่
  const handleMapClick = (latLng: L.LatLng) => {
    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนปักหมุด");
      return;
    }
    setClickedLatLng(latLng);
    setIsModalOpen(true);
  };

  // 3. Logic สำหรับผู้ให้ความช่วยเหลือกด 'ฉันจะช่วย'
  const handleAcceptHelp = async (
    pinId: string,
    helperPhone: string,
    helperName: string
  ) => {
    if (!helperPhone) {
      alert("กรุณากรอกเบอร์โทรศัพท์ของคุณ");
      return;
    }

    // อัปเดตสถานะใน Firestore
    try {
      await updateDoc(doc(db, "needs", pinId), {
        status: "ACCEPTED",
        helperPhone: helperPhone,
        helperName: helperName, // บันทึกชื่อผู้ช่วยเหลือ
        timestamp: Timestamp.now(),
      });
      alert("รับความช่วยเหลือเรียบร้อย! กรุณาโทรติดต่อผู้ประสบภัยทันที");
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  // 4. Logic สำหรับลบหมุด (เฉพาะเจ้าของ)
  const handleDeletePin = async (pinId: string) => {
    if (!window.confirm("คุณต้องการลบหมุดนี้ใช่หรือไม่?")) return;
    try {
      await deleteDoc(doc(db, "needs", pinId));
      alert("ลบหมุดเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("เกิดข้อผิดพลาดในการลบหมุด");
    }
  };

  // 5. Logic สำหรับเปลี่ยนสถานะร้านค้า (เฉพาะเจ้าของ)
  const handleToggleShopStatus = async (
    pinId: string,
    currentStatus: boolean
  ) => {
    try {
      await updateDoc(doc(db, "needs", pinId), {
        isOpen: !currentStatus,
      });
    } catch (error) {
      console.error("Error updating shop status: ", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะร้านค้า");
    }
  };

  // 6. Logic สำหรับเปลี่ยนสถานะหมุดว่าได้รับความช่วยเหลือแล้ว (เฉพาะเจ้าของ)
  const handleMarkAsHelped = async (pinId: string) => {
    if (window.confirm("ยืนยันว่าผู้ประสบภัยรายนี้ได้รับความช่วยเหลือแล้ว?")) {
      try {
        await updateDoc(doc(db, "needs", pinId), {
          status: "RESOLVED",
        });
      } catch (error) {
        console.error("Error updating status:", error);
        alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
      }
    }
  };
  return (
    <div className="map-page-container">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <RequestFilter onChange={setFilters} />
        {user && user.uid && (
          <p style={{ color: "red" }}>
            *หากได้รับการช่วยเหลือแล้ว รบกวนกดปุ่ม "ได้รับความช่วยเหลือแล้ว"
            ในแผนที่
          </p>
        )}
      </div>

      {/* Search Box */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: 50,
          zIndex: 1000,
          background: "white",
          padding: "8px",
          borderRadius: "5px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          display: "flex",
          gap: "5px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="ค้นหาจากพิกัด (เช่น 7.005, 100.480)"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            width: "220px",
            padding: "5px",
            border: "1px solid #ccc",
            borderRadius: "3px",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "5px 10px",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          ค้นหา
        </button>
      </div>

      <MapContainer
        center={HATYAI_CENTER}
        zoom={INITIAL_ZOOM}
        scrollWheelZoom={true}
        className="leaflet-map-container"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Controller สำหรับเลื่อนแผนที่ */}
        <MapController center={mapFlyTo} />

        {/* Component สำหรับดักการคลิกบนแผนที่ */}
        <MapClickHandler onMapClick={handleMapClick} />

        {/* แสดงหมุดทั้งหมด */}
        <MarkerClusterGroup chunkedLoading>
          {pins.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              icon={getMarkerIcon(pin)}
            >
              <Popup>
                <div className="pin-popup">
                  {pin.type === "SHOP" ? (
                    <>
                      <h4>
                        <Store size={16} className="inline mr-1" />{" "}
                        {pin.shopName}
                      </h4>
                      <p
                        className={`${
                          pin.isOpen ? "text-green-600" : "text-red-600"
                        } font-semibold`}
                      >
                        สถานะ: {pin.isOpen ? "ร้านเปิด" : "ร้านปิด"}
                      </p>
                      <p>
                        <strong>เจ้าของร้าน:</strong> {pin.name || "ไม่ระบุ"}
                      </p>

                      {/* ปุ่มเปลี่ยนสถานะร้าน (เฉพาะเจ้าของ) */}
                      {user && user.uid === pin.userId && (
                        <button
                          onClick={() =>
                            handleToggleShopStatus(pin.id, pin.isOpen || false)
                          }
                          className={`btn btn-sm w-full mt-2 mb-2 ${
                            pin.isOpen ? "btn-outline-danger" : "btn-primary"
                          }`}
                          style={
                            pin.isOpen
                              ? { color: "red", borderColor: "red" }
                              : {}
                          }
                        >
                          {pin.isOpen ? "ปิดร้านชั่วคราว" : "เปิดร้าน"}
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <h4>
                        <Home size={16} className="inline mr-1" /> สถานะ:{" "}
                        {pin.status === "OPEN"
                          ? "เปิดรับความช่วยเหลือ"
                          : "มีผู้รับแล้ว"}
                      </h4>
                      <p>
                        <strong>ผู้ขอความช่วยเหลือ:</strong>{" "}
                        {pin.name || "ไม่ระบุ"}
                      </p>
                      <p>
                        <strong>ความต้องการ:</strong> {pin.need}
                      </p>
                    </>
                  )}

                  <p>
                    <strong>เบอร์โทร:</strong>{" "}
                    <Phone size={14} className="inline mr-1" />
                    {pin.phone}
                  </p>

                  {/* ปุ่มเปิด Google Maps */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${pin.lat},${pin.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary w-full flex items-center justify-center gap-1 mt-2"
                    style={{
                      textDecoration: "none",
                      color: "#007bff",
                      borderColor: "#007bff",
                    }}
                  >
                    <MapPin size={14} /> เปิดใน Google Maps
                  </a>

                  {/* ปุ่มลบหมุด (เฉพาะเจ้าของ) */}
                  {user && user.uid === pin.userId && (
                    <button
                      onClick={() => handleDeletePin(pin.id)}
                      className="btn btn-sm btn-outline-danger mt-2 w-full flex items-center justify-center gap-1"
                      style={{ color: "red", borderColor: "red" }}
                    >
                      <Trash2 size={14} /> ลบหมุดของฉัน
                    </button>
                  )}

                  {user && user.uid === pin.userId && (
                    <button
                      onClick={() => handleMarkAsHelped(pin.id)}
                      className="btn btn-sm btn-outline-success mt-2 w-full flex items-center justify-center gap-1"
                      style={{ color: "green", borderColor: "green" }}
                    >
                      <CheckCircle size={14} /> ได้รับความช่วยเหลือแล้ว
                    </button>
                  )}

                  {/* ฟอร์มช่วยเหลือ (เฉพาะหมุด HELP และไม่ใช่เจ้าของ) */}
                  {pin.type !== "SHOP" &&
                    pin.status === "OPEN" &&
                    (!user || user.uid !== pin.userId) && (
                      <AcceptHelpForm
                        pinId={pin.id}
                        onAccept={handleAcceptHelp}
                        user={user || null}
                      />
                    )}

                  {pin.status === "RESOLVED" && (
                    <div className="accepted-info">
                      <p className="text-sm text-green-600 font-semibold">
                        <CheckCircle size={14} className="inline mr-1" />{" "}
                        ช่วยเหลือเรียบร้อยแล้ว
                      </p>
                      {pin.helperName && (
                        <p className="text-xs">
                          <strong>ผู้ช่วย:</strong> {pin.helperName}
                        </p>
                      )}
                      <p className="text-xs text-muted mt-1">
                        เคสนี้ปิดงานแล้ว
                      </p>
                    </div>
                  )}

                  {pin.status === "ACCEPTED" &&
                    (pin.helperPhone || pin.helperName) && (
                      <div className="accepted-info">
                        <p className="text-sm text-green-600 font-semibold">
                          <UserIcon size={14} className="inline mr-1" />{" "}
                          มีผู้รับแล้ว
                        </p>
                        {pin.helperName && (
                          <p className="text-xs">
                            <strong>ชื่อผู้ช่วย:</strong> {pin.helperName}
                          </p>
                        )}
                        {pin.helperPhone && (
                          <p className="text-xs">
                            <strong>เบอร์โทร:</strong> {pin.helperPhone}
                          </p>
                        )}
                        <p className="text-xs text-muted mt-1">
                          กรุณาโทรตรวจสอบสถานะก่อนเดินทาง
                        </p>
                      </div>
                    )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Modal สำหรับการปักหมุด */}
      {isModalOpen && (
        <ReportModal
          onClose={() => setIsModalOpen(false)}
          latLng={clickedLatLng}
          mode={mode}
          user={user || null}
        />
      )}
    </div>
  );
};

export default MapComponent;

// =========================================================================
// Component: Form สำหรับกดรับความช่วยเหลือใน Popup
// =========================================================================
interface AcceptHelpFormProps {
  pinId: string;
  onAccept: (
    pinId: string,
    helperPhone: string,
    helperName: string
  ) => Promise<void>;
  user: User | null;
}

const AcceptHelpForm: React.FC<AcceptHelpFormProps> = ({
  pinId,
  onAccept,
  user,
}) => {
  const [helperPhone, setHelperPhone] = useState("");
  const [helperName, setHelperName] = useState(user?.displayName || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onAccept(pinId, helperPhone, helperName);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <p className="text-xs mb-1 font-semibold">
        ต้องการช่วยเหลือ? กรอกข้อมูล:
      </p>

      {!user && (
        <input
          type="text"
          placeholder="ชื่อของคุณ"
          value={helperName}
          onChange={(e) => setHelperName(e.target.value)}
          required
          className="input-inline mb-1"
        />
      )}

      <input
        type="tel"
        placeholder="เบอร์โทรของคุณ (สำคัญ)"
        value={helperPhone}
        onChange={(e) => setHelperPhone(e.target.value)}
        required
        className="input-inline"
      />
      <button
        type="submit"
        className="btn btn-secondary btn-full mt-2"
        disabled={isLoading || helperPhone.length < 9 || !helperName}
      >
        {isLoading ? "กำลังบันทึก..." : "ฉันจะช่วย (รับหมุดนี้)"}
      </button>
    </form>
  );
};
