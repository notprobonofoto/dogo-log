import { useMemo } from "react";
import pawPrint from "@/assets/paw-print-orange.png";

interface Paw {
  id: number;
  left: string;
  top: string;
  delay: string;
  duration: string;
  rotate: string;
  size: number;
  opacity: number;
}

const PawBackground = () => {
  const paws = useMemo<Paw[]>(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 20}s`,
      duration: `${25 + Math.random() * 20}s`,
      rotate: `${Math.random() * 360}deg`,
      size: 20 + Math.random() * 40,
      opacity: 0.06 + Math.random() * 0.08,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {paws.map((paw) => (
        <img
          key={paw.id}
          src={pawPrint}
          alt=""
          className="absolute animate-paw-drift-smooth"
          style={{
            left: paw.left,
            top: paw.top,
            animationDelay: paw.delay,
            animationDuration: paw.duration,
            transform: `rotate(${paw.rotate})`,
            width: `${paw.size}px`,
            height: `${paw.size}px`,
            opacity: paw.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default PawBackground;
