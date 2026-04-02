import { useEffect, useRef } from "react";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
const FONT_SIZE = 14;
const OPACITY = 0.04;

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let columns: number[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      const cols = Math.floor(canvas!.width / FONT_SIZE);
      columns = Array.from({ length: cols }, () => Math.random() * canvas!.height / FONT_SIZE);
    }

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      ctx!.fillStyle = `rgba(13, 13, 13, 0.05)`;
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      ctx!.fillStyle = `rgba(0, 255, 65, ${OPACITY})`;
      ctx!.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < columns.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * FONT_SIZE;
        const y = columns[i] * FONT_SIZE;
        ctx!.fillText(char, x, y);

        if (y > canvas!.height && Math.random() > 0.975) {
          columns[i] = 0;
        }
        columns[i]++;
      }
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
