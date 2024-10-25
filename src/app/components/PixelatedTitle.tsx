'use client';

import React, { useRef, useEffect, useState } from 'react';

const PixelatedTitle: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 200 });

  const drawCanvas = (canvas: HTMLCanvasElement, width: number, height: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const text = 'Hashkey Chain';
    const pixelSize = Math.max(2, Math.floor(width / 200));
    
    canvas.width = width;
    canvas.height = height;

    const fontSize = Math.max(20, Math.floor(width / 10));
    ctx.font = `bold ${fontSize}px Arial`;
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

    return imageData;
  };

  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(800, window.innerWidth - 40);
      const height = Math.floor(width / 4);
      setDimensions({ width, height });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const imageData = drawCanvas(canvas, dimensions.width, dimensions.height);
    if (!imageData) return;

    const particles: { x: number; y: number; originX: number; originY: number; size: number; color: string }[] = [];
    const pixelSize = Math.max(2, Math.floor(dimensions.width / 200));

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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * dpr;
      const mouseY = (e.clientY - rect.top) * dpr;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const maxDistance = 100 * dpr;
        const force = (maxDistance - distance) / maxDistance;
        const directionX = forceDirectionX * force * 8;
        const directionY = forceDirectionY * force * 8;

        p.x += directionX;
        p.y += directionY;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
    };

    const handleMouseLeave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x = p.originX;
        p.y = p.originY;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [dimensions]);

  return <canvas ref={canvasRef} className="mx-auto max-w-full" />;
};

export default PixelatedTitle;
