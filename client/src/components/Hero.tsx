import React, { useState, useEffect } from 'react';

export const Hero: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: '--',
    hours: '--',
    minutes: '--',
    seconds: '--',
  });

  useEffect(() => {
    const target = new Date('December 6, 2026 06:00:00+05:30').getTime();

    const tick = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(d),
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="hero relative min-h-[710px] pt-[80px] flex items-center bg-cover bg-center"
      id="run"
      style={{
        background: `linear-gradient(90deg, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.90) 36%, rgba(255, 255, 255, 0.12) 70%), url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85") center/cover`,
      }}
    >
      <div className="c relative w-[92%] max-w-[1180px] mx-auto py-12 md:py-16">
        {/* Race Day Countdown Box */}
        <div className="count static md:absolute right-[5%] top-[140px] bg-white p-[17px] rounded-[12px] shadow-[0_15px_40px_rgba(6,43,99,0.15)] text-center w-max mb-6 md:mb-0 z-10 border border-slate-100">
          <strong className="block text-[11px] font-extrabold tracking-wider uppercase text-[#10294f] mb-2">
            RACE DAY COUNTDOWN
          </strong>
          <div className="timer flex gap-[7px] justify-center">
            <div className="bg-[#f2f6fa] px-[10px] py-[7px] rounded-[7px] min-w-[52px]">
              <b className="block text-[22px] font-black text-[#062b63] leading-tight">
                {timeLeft.days}
              </b>
              <small className="text-[9px] uppercase font-extrabold text-[#63748a] tracking-wider">
                Days
              </small>
            </div>
            <div className="bg-[#f2f6fa] px-[10px] py-[7px] rounded-[7px] min-w-[52px]">
              <b className="block text-[22px] font-black text-[#062b63] leading-tight">
                {timeLeft.hours}
              </b>
              <small className="text-[9px] uppercase font-extrabold text-[#63748a] tracking-wider">
                Hours
              </small>
            </div>
            <div className="bg-[#f2f6fa] px-[10px] py-[7px] rounded-[7px] min-w-[52px]">
              <b className="block text-[22px] font-black text-[#062b63] leading-tight">
                {timeLeft.minutes}
              </b>
              <small className="text-[9px] uppercase font-extrabold text-[#63748a] tracking-wider">
                Min
              </small>
            </div>
            <div className="bg-[#f2f6fa] px-[10px] py-[7px] rounded-[7px] min-w-[52px]">
              <b className="block text-[22px] font-black text-[#062b63] leading-tight">
                {timeLeft.seconds}
              </b>
              <small className="text-[9px] uppercase font-extrabold text-[#63748a] tracking-wider">
                Sec
              </small>
            </div>
          </div>
        </div>

        {/* Hero Copy Content */}
        <div className="copy max-w-[660px]">
          <div className="ey text-[13px] font-black tracking-[0.14em] text-[#f5661b] uppercase mb-2">
            Udupipages Beach Run 2026 • December 2026
          </div>

          <h1
            className="hero-h1 font-['Barlow_Condensed',sans-serif] uppercase font-black text-[#062b63] my-[17px] leading-[0.82] tracking-tight"
            style={{ fontSize: 'clamp(48px, 7.5vw, 95px)' }}
          >
            Trade the concrete jungle
            <br />
            <span className="text-[#f5661b]">for the serene sands of Udupi</span>
          </h1>

          <p className="text-[18px] text-[#34465e] max-w-[580px] my-4 leading-relaxed font-medium">
            Join runners from across Karnataka for an unforgettable coastal experience combining fitness, tourism, community and a cleaner Udupi.
          </p>

          <div className="line flex gap-[25px] flex-wrap font-extrabold text-[#10294f] text-[15px] my-[25px]">
            <span>📅 6th December 2026</span>
            <span>📍 Malpe Padukere Beach, to Kaup Beach Udupi</span>
          </div>

          <div className="actions flex gap-[15px] flex-wrap items-center">
            <a
              className="btn inline-block bg-[#f5661b] text-white px-[22px] py-[13px] rounded-[7px] font-black uppercase text-[14px] tracking-wider shadow-md hover:bg-[#e0550d] hover:-translate-y-0.5 transition-all cursor-pointer"
              href="#register"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('register');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.hash = 'register';
                }
              }}
            >
              Register Now →
            </a>
            <a
              className="btn alt inline-block bg-transparent text-[#062b63] border-2 border-[#062b63] px-[22px] py-[13px] rounded-[7px] font-black uppercase text-[14px] tracking-wider hover:bg-[#062b63] hover:text-white hover:-translate-y-0.5 transition-all cursor-pointer"
              href="#races"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('races') || document.getElementById('register') || document.getElementById('about');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.hash = 'races';
                }
              }}
            >
              Explore the Run
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
