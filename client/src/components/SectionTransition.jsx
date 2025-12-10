import React from "react";
import './SectionTransition.css';

function SectionTransition({ type = "parallax-fade" }) {
  return (
    <div className={`section-transition section-${type}`}>
      {/* Example: fade, SVG wave, line, parallax element, or swirl */}
      {type === "parallax-fade" && (
        <svg width="100%" height="60" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
          <path d="M0,30 Q360,0 720,30 T1440,30 V60H0Z" fill="#eee7e1" opacity="0.7"/>
        </svg>
      )}
      {type === "step-dissolve" && <div className='transition-step-bar'></div>}
      {type === "slide-split" && <div className='transition-slide'></div>}
      {type === "swirl-scroll" && <svg width="100%" height="34" viewBox="0 0 1440 34" fill="none"><path d="M0,22 Q460,0 829,22.5 T1440,13 Q1100,34 0,30Z" fill="#e6ded7" opacity="0.61"/></svg>}
    </div>
  );
}

export default SectionTransition;
