import React from "react";
import './AnimatedOutroCTA.css';

function AnimatedOutroCTA() {
  return (
    <section className="outro-cta">
      <div className="outro-bg-anim">
        <svg width="100%" height="65" viewBox="0 0 1440 65" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
          <path d="M0,45 Q350,0 720,33 T1440,45 V65H0Z" fill="#e6ded7" opacity=".81"></path>
        </svg>
        {/* Placeholder for celebratory/confetti particles if desired */}
      </div>
      <div className="outro-content">
        <h2 className="outro-headline">Ready to Shape Your Career Story?</h2>
        <div className="outro-sub">Join thousands accelerating with SkillFlux.</div>
        <a href="/signup" className="outro-btn-glow">Get Started Now</a>
      </div>
    </section>
  );
}

export default AnimatedOutroCTA;
