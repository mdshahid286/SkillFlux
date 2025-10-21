import React from 'react';
import { INPUT_CLASS_NAME } from './InputGroup';

export const FeaturedSkillInput = ({
  skill,
  rating,
  setSkillRating,
  placeholder,
  circleColor = '#3b82f6',
  className = ''
}) => {
  return (
    <div className={className}>
      <input
        type="text"
        value={skill}
        onChange={(e) => setSkillRating(e.target.value, rating)}
        placeholder={placeholder}
        className={INPUT_CLASS_NAME}
      />
      <div className="mt-2 flex gap-1">
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setSkillRating(skill, level)}
            className={`h-6 w-6 rounded-full border-2 transition-all ${
              rating >= level
                ? 'border-transparent'
                : 'border-gray-300 bg-white'
            }`}
            style={rating >= level ? { backgroundColor: circleColor } : {}}
          />
        ))}
      </div>
    </div>
  );
};

