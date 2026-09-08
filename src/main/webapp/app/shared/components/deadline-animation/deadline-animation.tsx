import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './deadline-animation.scss';

export interface DeadlineAnimationProps {
  initialDays?: number;
  animationSpeed?: number; // seconds per day
  className?: string;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 260;

export const DeadlineAnimation: React.FC<DeadlineAnimationProps> = ({ initialDays = 7, animationSpeed = 1, className = '' }) => {
  const { t } = useTranslation();
  const [days, setDays] = useState(initialDays);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  const grimProgress = useMemo(() => Math.max(0, Math.min(1, (initialDays - days) / initialDays)), [initialDays, days]);

  useEffect(() => {
    if (days <= 0) {
      return;
    }
    const interval = window.setInterval(() => {
      setDays(prev => Math.max(0, prev - 1));
    }, animationSpeed * 1000);
    return () => window.clearInterval(interval);
  }, [days, animationSpeed]);

  const draw = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      drawLoadingBar(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, grimProgress * 100, now);
    },
    [grimProgress],
  );

  useEffect(() => {
    const animate = (now: number) => {
      draw(now);
      requestRef.current = window.requestAnimationFrame(animate);
    };
    requestRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        window.cancelAnimationFrame(requestRef.current);
      }
    };
  }, [draw]);

  const grimLeft = `${10 + grimProgress * 80}%`;

  return (
    <div className={`deadline-animation ${className}`}>
      <h1 className="deadline-animation__title">{t('deadline.title')}</h1>

      <div className="deadline-animation__stage">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="deadline-animation__canvas" />
        <video
          className="deadline-animation__grim"
          src="/content/videos/grim-reaper.webm"
          autoPlay
          muted
          loop
          playsInline
          style={{ left: grimLeft }}
        />
      </div>

      {days === 0 ? (
        <div className="deadline-animation__message">{t('deadline.reached')}</div>
      ) : (
        <div className="deadline-animation__label">{t('deadline.label', { days })}</div>
      )}
    </div>
  );
};

const drawLoadingBar = (ctx: CanvasRenderingContext2D, width: number, height: number, grimPosition: number, now: number) => {
  ctx.clearRect(0, 0, width, height);

  const trackX = 80;
  const trackY = height / 2;
  const trackW = width - 160;
  const trackH = 16;
  const progress = grimPosition / 100;

  // Track background
  ctx.fillStyle = '#e2e4e9';
  roundRect(ctx, trackX, trackY - trackH / 2, trackW, trackH, trackH / 2);
  ctx.fill();

  // Red fill
  const fillW = trackW * progress;
  ctx.fillStyle = '#ff0a3b';
  roundRect(ctx, trackX, trackY - trackH / 2, fillW, trackH, trackH / 2);
  ctx.fill();

  // Person typing at the end of the bar
  drawPerson(ctx, trackX + trackW, trackY, now);
};

const drawPerson = (ctx: CanvasRenderingContext2D, x: number, y: number, now: number) => {
  ctx.save();
  ctx.translate(x, y);

  // Laptop screen
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(4, -32, 36, 24);
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(6, -26, 20, 2);
  ctx.fillRect(6, -22, 14, 2);

  // Laptop keyboard base
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(2, -8, 40, 8);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 7; i++) {
    ctx.fillRect(5 + i * 5, -6, 3, 3);
  }

  // Head
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(-10, -22, 9, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(-14, -14, 10, 18);

  // Arms typing
  const typingOffset = Math.sin(now / 120) * 3;
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(-10, -10);
  ctx.lineTo(4 + typingOffset, -2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-10, -10);
  ctx.lineTo(14 - typingOffset, -2);
  ctx.stroke();

  ctx.restore();
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

export default DeadlineAnimation;
