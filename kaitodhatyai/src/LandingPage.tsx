import { MapPin, LifeBuoy, HandHeart, Waves, Navigation, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page-container" style={{ height: '100%', overflowY: 'auto' }}>
      {/* Hero Section */}
      <header className="hero">
        <div className="container flex items-center justify-between hero-content">

          {/* Illustration Area */}
          <div className="hero-visual animate-fade-in">
            <div className="illustration-container">
              <div className="hand-help animate-float">
                <HandHeart size={120} className="text-primary" strokeWidth={1.5} />
              </div>
              <div className="water-waves">
                <Waves size={80} className="wave-1" />
                <Waves size={80} className="wave-2" />
                <Waves size={80} className="wave-3" />
              </div>
              <div className="floating-items">
                <div className="float-item item-1"><MapPin size={24} /></div>
                <div className="float-item item-2"><LifeBuoy size={24} /></div>
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
              และขอความช่วยเหลือฉุกเฉินได้ทันที เชื่อมต่อผู้ให้และผู้รับแบบเรียลไทม์
            </p>
            <div className="hero-cta flex gap-4">
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/map?mode=HELP')}>
                <MapPin size={20} className="mr-2" />
                แจ้งขอความช่วยเหลือ
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/map?mode=SHOP')}>
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
            ขอความช่วยเหลือง่ายๆ ใน 4 ขั้นตอน
          </h2>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card animate-fade-in delay-100">
              <div className="step-icon-wrapper color-4">
                <LogIn size={40} className="step-icon" />
              </div>
              <h3>1. เข้าสู่ระบบ</h3>
              <p>กดปุ่มเข้าสู่ระบบเพื่อยืนยันตัวตน (หากใช้มือถือให้กดเมนู 3 ขีดมุมขวาบน)</p>
            </div>

            {/* Step 2 */}
            <div className="step-card animate-fade-in delay-200">
              <div className="step-icon-wrapper">
                <MapPin size={40} className="step-icon" />
              </div>
              <h3>2. ปักหมุดตำแหน่ง</h3>
              <p>ระบุตำแหน่งของคุณบนแผนที่เพื่อให้เจ้าหน้าที่เข้าถึงได้แม่นยำ</p>
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
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="footer">
        <div className="container flex items-center justify-between">
          <div className="footer-contact flex items-center gap-2">
            {/* <Phone size={18} /> */}
            <span>สายด่วนฉุกเฉิน: 1669 แพทย์ฉุกเฉิน,1663 กู้ภัย</span>
          </div>
          <p className="copyright">© 2024 hatyaitongrod create by Patcharakiri Sichat computer science Chulalongkorn 0991648465</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
