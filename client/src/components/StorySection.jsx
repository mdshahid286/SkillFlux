import React from "react";
import './StorySection.css';

function StorySection({ title, painPoint, narrative, solutionTitle, solutionDesc, animationType }) {
  return (
    <section className={`story-section story-${animationType}`}>
      <div className="story-pain">
        <div className="story-label">Pain Point</div>
        <h2 className="story-title story-painpoint">{title}</h2>
        <div className="story-painpoint-desc">{painPoint}</div>
        <div className="story-narrative">{narrative}</div>
      </div>
      {/* Animated SVG/Lottie/graphic for pain point could go here */}

      <div className="story-solution">
        <div className="story-label solution-label">Solution</div>
        <h3 className="story-solution-title">{solutionTitle}</h3>
        <div className="story-solution-desc">{solutionDesc}</div>
        {/* Animated transition to solution, Lottie/SVG/parallax based on animationType */}
      </div>
      {/* Feature visual or live demo space (use animationType) */}
      <div className={`story-visual-anim story-anim-${animationType}`}>
        {/* TODO: Lottie, Parallax, Canvas, or relevant feature visual here */}
      </div>
    </section>
  );
}

export default StorySection;
