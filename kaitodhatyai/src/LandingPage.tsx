import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  HandHeart,
  LifeBuoy,
  LogIn,
  MapPin,
  Navigation,
  Trash2,
  Waves,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase-config";

function LandingPage() {
  const navigate = useNavigate();
  const [waitingCount, setWaitingCount] = useState(0);
  const [helpedCount, setHelpedCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // แยก Query เพื่อหลีกเลี่ยงปัญหา Index และ in operator
        const needsRef = collection(db, "needs");

        // Query 1: รอความช่วยเหลือ (OPEN)
        const waitingQuery = query(
          needsRef,
          where("type", "==", "HELP"),
          where("status", "==", "OPEN")
        );

        // Query 2: ช่วยเหลือแล้ว (ACCEPTED)
        const acceptedQuery = query(
          needsRef,
          where("type", "==", "HELP"),
          where("status", "==", "ACCEPTED")
        );

        // Query 3: ช่วยเหลือแล้ว (RESOLVED)
        const resolvedQuery = query(
          needsRef,
          where("type", "==", "HELP"),
          where("status", "==", "RESOLVED")
        );

        // ดึงข้อมูลแบบ Parallel
        const [waitingSnap, acceptedSnap, resolvedSnap] = await Promise.all([
          getCountFromServer(waitingQuery),
          getCountFromServer(acceptedQuery),
          getCountFromServer(resolvedQuery),
        ]);

        setWaitingCount(waitingSnap.data().count);
        setHelpedCount(acceptedSnap.data().count + resolvedSnap.data().count);
      } catch (error) {
        console.error(
          "Error fetching counts with aggregation, falling back to basic query:",
          error
        );

        // Fallback: ถ้า getCountFromServer พัง (เช่นไม่มี Index) ให้ใช้ getDocs แบบเดิมแต่ดึงครั้งเดียว
        try {
          const q = query(collection(db, "needs"), where("type", "==", "HELP"));
          const snapshot = await getDocs(q);
          let waiting = 0;
          let helped = 0;
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.status === "OPEN") waiting++;
            if (data.status === "ACCEPTED" || data.status === "RESOLVED")
              helped++;
          });
          setWaitingCount(waiting);
          setHelpedCount(helped);
        } catch (fallbackError) {
          console.error("Fallback fetch failed:", fallbackError);
        }
      }
    };

    fetchCounts();

    // Polling ทุก 30 วินาที
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="landing-page-container"
      style={{ height: "100%", overflowY: "auto" }}
    >
      {/* Stats Banner */}
      <div className="bg-white py-6 border-b border-gray-100 shadow-sm relative z-20">
        <div className="container flex justify-center gap-8 md:gap-16 text-center">
          <div className="animate-fade-in">
            <h3 className="text-4xl font-bold text-red-500 mb-1">
              {waitingCount}
            </h3>
            <p className="text-sm text-gray-500 font-medium">รอความช่วยเหลือ</p>
          </div>
          <div className="w-px bg-gray-200 h-16"></div>
          <div className="animate-fade-in delay-100">
            <h3 className="text-4xl font-bold text-green-500 mb-1">
              {helpedCount}
            </h3>
            <p className="text-sm text-gray-500 font-medium">ช่วยเหลือแล้ว</p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <header className="hero">
        <div className="container flex items-center justify-between hero-content">
          {/* Illustration Area */}
          <div className="hero-visual animate-fade-in">
            <div className="illustration-container">
              <div className="hand-help animate-float">
                <HandHeart
                  size={120}
                  className="text-primary"
                  strokeWidth={1.5}
                />
              </div>
              <div className="water-waves">
                <Waves size={80} className="wave-1" />
                <Waves size={80} className="wave-2" />
                <Waves size={80} className="wave-3" />
              </div>
              <div className="floating-items">
                <div className="float-item item-1">
                  <MapPin size={24} />
                </div>
                <div className="float-item item-2">
                  <LifeBuoy size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="hero-text animate-fade-in delay-200">
            <h1 className="hero-title">
              หาดใหญ่น้ำท่วม? <br />
              <span className="highlight">ปักหมุด</span> บอกความต้องการ!
            </h1>
            <p className="hero-subtitle">
              แพลตฟอร์มกลางเพื่อชาวหาดใหญ่และสงขลา แจ้งพิกัดน้ำท่วม
              และขอความช่วยเหลือฉุกเฉินได้ทันที
              เชื่อมต่อผู้ให้และผู้รับแบบเรียลไทม์
            </p>
            <div className="hero-cta flex gap-4">
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => navigate("/map?mode=HELP")}
              >
                <MapPin size={20} className="mr-2" />
                แจ้งขอความช่วยเหลือ
              </button>
              <button
                className="btn btn-outline btn-lg"
                onClick={() => navigate("/map?mode=SHOP")}
              >
                <Navigation size={20} className="mr-2" />
                ร้านค้าปักหมุด
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Steps Section */}
      <section className="steps-section">
        <div className="container">
          <h2 className="section-title text-center animate-fade-in delay-300">
            ขอความช่วยเหลือง่ายๆ ใน 5 ขั้นตอน
          </h2>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card animate-fade-in delay-100">
              <div className="step-icon-wrapper color-4">
                <LogIn size={40} className="step-icon" />
              </div>
              <h3>1. เข้าสู่ระบบ</h3>
              <p>
                กดปุ่มเข้าสู่ระบบเพื่อยืนยันตัวตน (หากใช้มือถือให้กดเมนู 3
                ขีดมุมขวาบน)
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card animate-fade-in delay-200">
              <div className="step-icon-wrapper">
                <MapPin size={40} className="step-icon" />
              </div>
              <h3>2. ปักหมุดตำแหน่ง</h3>
              <p>
                ระบุตำแหน่งของคุณบนแผนที่เพื่อให้เจ้าหน้าที่เข้าถึงได้แม่นยำ
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card animate-fade-in delay-300">
              <div className="step-icon-wrapper color-2">
                <LifeBuoy size={40} className="step-icon" />
              </div>
              <h3>3. ระบุสิ่งที่ต้องการ</h3>
              <p>แจ้งจำนวนคน อาหาร ยา หรือความช่วยเหลือทางการแพทย์ที่จำเป็น</p>
            </div>

            {/* Step 4 */}
            <div className="step-card animate-fade-in delay-400">
              <div className="step-icon-wrapper color-3">
                <HandHeart size={40} className="step-icon" />
              </div>
              <h3>4. รับความช่วยเหลือ</h3>
              <p>อาสาสมัครหรือทีมกู้ภัยที่อยู่ใกล้จะเห็นหมุดคุณและติดต่อกลับ</p>
            </div>

            {/* Step 5 */}
            <div className="step-card animate-fade-in delay-500">
              <div className="step-icon-wrapper color-5">
                <Trash2 size={40} className="step-icon" />
              </div>
              <h3>5. ลบหมุดเมื่อเสร็จสิ้น</h3>
              <p>
                ถ้าได้รับความช่วยเหลือแล้วรบกวนกดที่หมุดตัวเองแล้วลบออกด้วย
                ขอบคุณครับ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container flex items-center justify-between">
          <div className="footer-contact flex items-center justify-center gap-2 flex-wrap">
            {/* <Phone size={18} /> */}
            <span className="footer-phone">
              สายด่วนฉุกเฉิน: 1669 แพทย์ฉุกเฉิน, 1163 กู้ภัย
            </span>
          </div>
          <p className="copyright">
            create by Patcharakiri Sichat computer science Chulalongkorn
            0991648465
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
