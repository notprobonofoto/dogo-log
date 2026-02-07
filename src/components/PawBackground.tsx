import { useMemo } from "react";
import pawPrint from "@/assets/paw-print.png";

interface Paw {
  id: number;
  left: string;
  top: string;
  delay: string;
  duration: string;
  rotate: string;
  size: number;
}

const PawBackground = () => {
  const paws = useMemo<Paw[]>(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${20 + Math.random() * 15}s`,
      rotate: `${Math.random() * 360}deg`,
      size: 24 + Math.random() * 32,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {paws.map((paw) => (
        <img
          key={paw.id}
          src={pawPrint}
          alt=""
          className="absolute animate-paw-drift opacity-15"
          style={{
            left: paw.left,
            top: paw.top,
            animationDelay: paw.delay,
            animationDuration: paw.duration,
            transform: `rotate(${paw.rotate})`,
            width: `${paw.size}px`,
            height: `${paw.size}px`,
          }}
        />
      ))}
    </div>
  );
};

export default PawBackground;
