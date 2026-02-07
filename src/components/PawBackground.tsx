import { useMemo } from "react";

interface Paw {
  id: number;
  left: string;
  top: string;
  delay: string;
  duration: string;
  rotate: string;
  scale: string;
}

const PawBackground = () => {
  const paws = useMemo<Paw[]>(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${15 + Math.random() * 10}s`,
      rotate: `${Math.random() * 360}deg`,
      scale: `${0.5 + Math.random() * 0.5}`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {paws.map((paw) => (
        <div
          key={paw.id}
          className="absolute text-primary/5 animate-paw-drift"
          style={{
            left: paw.left,
            top: paw.top,
            animationDelay: paw.delay,
            animationDuration: paw.duration,
            transform: `rotate(${paw.rotate}) scale(${paw.scale})`,
            fontSize: "2rem",
          }}
        >
          🐾
        </div>
      ))}
    </div>
  );
};

export default PawBackground;
