import React from 'react';
import { Heart,   } from 'lucide-react';
import './ThankYouPage.css';

const ThankYouPage: React.FC = () => {



  return (
    <div className="thank-you-container">
      <div className="thank-you-content animate-fade-in">
        <div className="thank-you-card">
          <div className="thank-you-icon">
            <Heart size={40} fill="#2563eb" />
          </div>
          
          <h1 className="thank-you-title">สวัสดีครับ</h1>
          <p className="thank-you-message">
            แพลตฟอร์ม "หาดใหญ่ต้องรอด" เกิดขึ้น<br />
            เพื่อช่วยเหลือผู้ประสบภัยและประสานงานในยามวิกฤต<br />
            เราขอขอบคุณหน่วยงานทุกหน่วยงานที่ร่วมใช้งานและส่งต่อความช่วยเหลือ
            <br/>เเละขอเป็นกำลังใจให้ทุกท่านผ่านพ้นวิกฤตนี้ไปด้วยกัน <br/>ตอนนี้ทางเราได้ส่งข้อมูลไปยัง BDI (สถาบันข้อมูลขนาดใหญ่) <br/>เพื่อรวมศูนย์ข้อมูลความช่วยเหลือในนามรัฐบาลเรียบร้อยแล้ว
                       <br/>ขอบคุณครับ
          </p>


     
        </div>
        
        <footer className="text-sm text-gray-500 mt-8">
           ขอบคุณทางจุฬาลงกรณ์มหาวิทยาลัย อาจารย์ เเละพี่ๆที่ให้ความสนับสนุน
        </footer>
      </div>
    </div>
  );
};

export default ThankYouPage;
