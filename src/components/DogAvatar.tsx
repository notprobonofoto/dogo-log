import { useData } from "@/contexts/DataContext";

interface DogAvatarProps {
  dogId: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const DogAvatar = ({ dogId, size = "md", className = "" }: DogAvatarProps) => {
  const { getDogAvatar, dogs } = useData();
  const avatar = getDogAvatar(dogId);
  const dog = dogs.find((d) => d.id === dogId);
  
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={dog?.name || "Piesek"}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-secondary flex items-center justify-center text-lg ${className}`}>
      {dog?.sex === "female" ? "🐩" : "🐕"}
    </div>
  );
};

export default DogAvatar;
