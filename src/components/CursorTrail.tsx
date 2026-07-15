import React, { useEffect, useRef } from 'react';

const CursorTrail: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastTime = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Limit trail creation rate to 50ms for performance
      if (Date.now() - lastTime < 50) return;
      lastTime = Date.now();

      if (!containerRef.current) return;

      const star = document.createElement('div');
      star.className = 'absolute pointer-events-none text-yellow-400 font-bold z-[9999] opacity-100 select-none';
      star.style.left = `${e.clientX}px`;
      star.style.top = `${e.clientY}px`;
      star.style.fontSize = `${Math.random() * 10 + 10}px`; // 10px to 20px
      star.style.textShadow = '0 0 5px rgba(250, 204, 21, 0.8)';
      star.innerHTML = '✦';

      // Random movement for animation
      const dx = (Math.random() - 0.5) * 50;
      const dy = (Math.random() - 0.5) * 50 + 20;
      
      star.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
      ], {
        duration: 800 + Math.random() * 400,
        easing: 'ease-out',
        fill: 'forwards'
      });

      containerRef.current.appendChild(star);

      // Clean up after animation
      setTimeout(() => {
        if (containerRef.current && containerRef.current.contains(star)) {
          containerRef.current.removeChild(star);
        }
      }, 1500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[9999]" />;
};

export default CursorTrail;
