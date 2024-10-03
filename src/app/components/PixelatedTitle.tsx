'use client';

import React, { useRef, useEffect } from 'react';

const PixelatedTitle: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const text = 'Hashkey Chain';
    const pixelSize = 4;
    
    canvas.width = 800;
    canvas.height = 200;

    ctx.font = 'bold 80px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y += pixelSize) {
      for (let x = 0; x < canvas.width; x += pixelSize) {
        const i = (y * canvas.width + x) * 4;
        if (imageData.data[i + 3] > 128) {
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    }

    const particles: { x: number; y: number; originX: number; originY: number; size: number; color: string }[] = [];

    for (let y = 0; y < canvas.height; y += pixelSize) {
      for (let x = 0; x < canvas.width; x += pixelSize) {
        const i = (y * canvas.width + x) * 4;
        if (imageData.data[i + 3] > 128) {
          particles.push({
            x: x,
            y: y,
            originX: x,
            originY: y,
            size: pixelSize,
            color: `rgb(${imageData.data[i]}, ${imageData.data[i + 1]}, ${imageData.data[i + 2]})`,
          });
        }
      }
    }

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const maxDistance = 100;
        const force = (maxDistance - distance) / maxDistance;
        const directionX = forceDirectionX * force * 8;
        const directionY = forceDirectionY * force * 8;

        p.x += directionX;
        p.y += directionY;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
    });

    canvas.addEventListener('mouseleave', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x = p.originX;
        p.y = p.originY;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
    });

  }, []);

  return <canvas ref={canvasRef} className="mx-auto" />;
};

export default PixelatedTitle;