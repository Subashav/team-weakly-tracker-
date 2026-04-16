'use client';

import './Bubbles.css';

const Bubbles = () => {
  return (
    <div className="bubbles-container">
      {Array.from({ length: 25 }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
};

export default Bubbles;
