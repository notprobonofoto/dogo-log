import { useState, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import dogPaws from "@/assets/dog-paws.png";
import { PlusCircle, Trash2, Dog, Camera, Image, X } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

const DogsTab = () => {
  const { data, addDog, removeDog, addDogPhoto, removeDogPhoto } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [breed, setBreed] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDog, setSelectedDog] = useState<string | null>(null);
  const [deletePhotoId, setDeletePhotoId] = useState<{ dogId: string; photoId: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!name.trim()) return;
    addDog({ name: name.trim(), birthDate, sex, breed: breed || undefined });
    setShowForm(false);
    setName("");
    setBirthDate("");
    setBreed("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, dogId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      // Resize image for storage optimization
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 400;
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
        } else {
          if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
        addDogPhoto(dogId, resizedDataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const dog = selectedDog ? data.dogs.find((d) => d.id === selectedDog) : null;

  return (
    <div className="min-h-screen pb-20 px-4 pt-safe">
      <div className="flex items-center justify-center gap-3 pt-4 mb-2">
        <h1 className="text-xl font-extrabold text-foreground">Pieski</h1>
      </div>
      <div className="flex justify-center mb-4">
        <img src={dogPaws} alt="" className="w-20 h-20 animate-wiggle" />
      </div>

      {!showForm && !selectedDog && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg transition-all active:scale-95 hover:scale-[1.02] animate-button-ready mb-4"
        >
          <PlusCircle className="w-6 h-6" />
          <span className="text-xs">Dodaj pieska</span>
        </button>
      )}

      {showForm && (
        <div className="bg-card rounded-xl p-4 mb-4 space-y-3 animate-slide-up-bounce">
          <h3 className="font-bold text-foreground">🐶</h3>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Imię pieska"
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          <div className="flex gap-2">
            <button onClick={() => setSex("male")}
              className={`flex-1 py-2 rounded-lg font-semibold text-xl transition-all ${sex === "male" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              ♂️
            </button>
            <button onClick={() => setSex("female")}
              className={`flex-1 py-2 rounded-lg font-semibold text-xl transition-all ${sex === "female" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              ♀️
            </button>
          </div>
          <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Rasa (opcjonalnie)"
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground font-semibold">Anuluj</button>
            <button onClick={handleSubmit} disabled={!name.trim()} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-40">✓</button>
          </div>
        </div>
      )}

      {/* Dog detail view */}
      {selectedDog && dog && (
        <div className="bg-card rounded-xl p-4 mb-4 space-y-4 animate-slide-up-bounce">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-lg">{dog.name}</h3>
            <button onClick={() => setSelectedDog(null)} className="p-2 text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-sm text-muted-foreground">
            {dog.sex === "male" ? "♂️" : "♀️"}
            {dog.breed ? ` · ${dog.breed}` : ""}
            {dog.birthDate ? ` · ${dog.birthDate}` : ""}
          </div>

          {/* Photo gallery */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-foreground">📷</span>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="p-2 rounded-lg bg-primary/10 text-primary active:scale-95"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-primary/10 text-primary active:scale-95"
              >
                <Image className="w-4 h-4" />
              </button>
            </div>
            
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFileChange(e, dog.id)}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, dog.id)}
            />

            {dog.photos.length === 0 ? (
              <p className="text-xs text-muted-foreground">Brak zdjęć</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {dog.photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square">
                    <img
                      src={photo.dataUrl}
                      alt={dog.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setDeletePhotoId({ dogId: dog.id, photoId: photo.id })}
                      className="absolute top-1 right-1 p-1 rounded-full bg-destructive/80 text-destructive-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dog cards */}
      {!selectedDog && (
        <div className="space-y-3">
          {data.dogs.length === 0 && !showForm && (
            <div className="text-center py-8 animate-fade-in-up">
              <Dog className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Brak piesków</p>
            </div>
          )}
          {data.dogs.map((dog, i) => (
            <div key={dog.id} className="bg-card rounded-xl p-4 flex items-center justify-between animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <button 
                className="flex items-center gap-3 flex-1 text-left"
                onClick={() => setSelectedDog(dog.id)}
              >
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {dog.photos.length > 0 ? (
                    <img src={dog.photos[0].dataUrl} alt={dog.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{dog.sex === "male" ? "🐕" : "🐩"}</span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-foreground">{dog.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {dog.sex === "male" ? "♂️" : "♀️"}
                    {dog.breed ? ` · ${dog.breed}` : ""}
                  </p>
                </div>
              </button>
              <button onClick={() => setDeleteId(dog.id)} className="p-2 text-muted-foreground active:scale-95">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Usuń pieska?"
        message="Usunięcie pieska usunie wszystkie jego dane: spacery, jedzenie, zdrowie i zdjęcia."
        onConfirm={() => { if (deleteId) { removeDog(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={!!deletePhotoId}
        title="Usuń zdjęcie?"
        message="Czy na pewno chcesz usunąć to zdjęcie?"
        onConfirm={() => { if (deletePhotoId) { removeDogPhoto(deletePhotoId.dogId, deletePhotoId.photoId); setDeletePhotoId(null); } }}
        onCancel={() => setDeletePhotoId(null)}
      />
    </div>
  );
};

export default DogsTab;
