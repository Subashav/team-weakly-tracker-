'use client';

import { useEffect, useRef } from 'react';

const StarField = ({ starCount = 200, speed = 0.15, opacity = 0.25, maxSize = 1.5 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initStars = () => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * maxSize + 0.3,
          speedY: -(Math.random() * speed + speed * 0.3),
          speedX: (Math.random() - 0.5) * speed * 0.4,
          opacity: Math.random() * opacity * 0.6 + opacity * 0.2,
          twinkleSpeed: Math.random() * 0.005 + 0.002,
          twinkleOffset: Math.random() * Math.PI * 2
        });
      }
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of stars) {
        // Gentle twinkle
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        const alpha = star.opacity * twinkle;

        // Drift upward slowly
        star.y += star.speedY;
        star.x += star.speedX;

        // Wrap around
        if (star.y < -5) {
          star.y = canvas.height + 5;
          star.x = Math.random() * canvas.width;
        }
        if (star.x < -5) star.x = canvas.width + 5;
        if (star.x > canvas.width + 5) star.x = -5;

        // Draw star as soft circle
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 200, 240, ${alpha})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    initStars();
    animationId = requestAnimationFrame(draw);

    window.addEventListener('resize', () => {
      resize();
      initStars();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [starCount, speed, opacity, maxSize]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default StarField;
