import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Particle Logic
    const particles: any[] = [];
    const particleCount = 70; // Giảm số lượng chút để đỡ lag trên máy yếu

    class Particle {
      x: number;
      y: number;
      z: number;
      vz: number;
      size: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.z = Math.random() * 1000;
        this.vz = Math.random() * 1 + 0.5; // Tốc độ bay
        this.size = 2;
      }

      update() {
        this.z -= this.vz;
        if (this.z <= 0) {
          this.z = 1000;
          this.x = Math.random() * canvas!.width;
          this.y = Math.random() * canvas!.height;
        }
      }

      draw() {
        if (!ctx) return;
        const scale = 1000 / (1000 + this.z);
        const x2d = (this.x - canvas!.width / 2) * scale + canvas!.width / 2;
        const y2d = (this.y - canvas!.height / 2) * scale + canvas!.height / 2;
        const size = this.size * scale;
        const opacity = 1 - this.z / 1000;

        ctx.beginPath();
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102, 126, 234, ${opacity})`;
        ctx.fill();
      }
    }

    // Init particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1, // Nằm trên gradient nhưng dưới nội dung
        pointerEvents: 'none'
      }} 
    />
  );
};

export default ParticleBackground;