import { useState, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus, Trash2, Camera, X, Scale } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

const calculateAge = (birthDate: string): string => {
  const birth = new Date(birthDate);
  const now = new Date();
  
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years > 0) {
    return years === 1 ? `1 rok` : years < 5 ? `${years} lata` : `${years} lat`;
  }
  
  return months === 1 ? `1 miesiąc` : months < 5 ? `${months} miesiące` : `${months} miesięcy`;
};

const NewDogsTab = () => {
  const { dogs, addDog, removeDog, addDogPhoto, removeDogPhoto, getDogLatestWeight } = useApp();
  const { t } = useLanguage();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [breed, setBreed] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDog, setSelectedDog] = useState<string | null>(null);
  const [deletePhotoInfo, setDeletePhotoInfo] = useState<{ dogId: string; photoId: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!name.trim() || !birthDate) return;
    await addDog({ name: name.trim(), birth_date: birthDate, sex, breed: breed.trim() || undefined });
    setName("");
    setBirthDate("");
    setSex("male");
    setBreed("");
    setShowForm(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingFor) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      await addDogPhoto(uploadingFor, dataUrl);
      setUploadingFor(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const openPhotoPicker = (dogId: string) => {
    setUploadingFor(dogId);
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6" role="main" aria-label={t("myDogs")}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("myDogs")}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-3 rounded-full bg-primary text-primary-foreground active:scale-95 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label={showForm ? t("cancel") : t("addDog")}
          aria-expanded={showForm}
        >
          <Plus className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-4 mb-6 animate-fade-in-up space-y-4" role="form" aria-label={t("addDog")}>
          <div>
            <label htmlFor="dog-name" className="sr-only">{t("dogName")}</label>
            <input
              id="dog-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("dogName")}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="birth-date" className="sr-only">{t("birthDate")}</label>
            <input
              id="birth-date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={t("birthDate")}
            />
          </div>
          {/* Sex buttons with outline style for active */}
          <fieldset>
            <legend className="sr-only">{t("sex")}</legend>
            <div className="flex gap-2" role="radiogroup">
              <button
                onClick={() => setSex("male")}
                className={`flex-1 py-3 rounded-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                  sex === "male" 
                    ? "border-2 border-primary bg-transparent text-primary" 
                    : "bg-secondary text-secondary-foreground border-2 border-transparent"
                }`}
                role="radio"
                aria-checked={sex === "male"}
                aria-label={t("male")}
              >
                ♂️ {t("male")}
              </button>
              <button
                onClick={() => setSex("female")}
                className={`flex-1 py-3 rounded-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                  sex === "female" 
                    ? "border-2 border-primary bg-transparent text-primary" 
                    : "bg-secondary text-secondary-foreground border-2 border-transparent"
                }`}
                role="radio"
                aria-checked={sex === "female"}
                aria-label={t("female")}
              >
                ♀️ {t("female")}
              </button>
            </div>
          </fieldset>
          <div>
            <label htmlFor="dog-breed" className="sr-only">{t("breed")}</label>
            <input
              id="dog-breed"
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder={t("breed")}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!name.trim() || !birthDate}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-50 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={t("addDog")}
          >
            {t("addDog")}
          </button>
        </div>
      )}

      {/* Dogs list - 2 columns on larger phones, 1 on small */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label={t("myDogs")}>
        {dogs.map((dog) => {
          const weight = getDogLatestWeight(dog.id);
          const age = calculateAge(dog.birth_date);
          const avatar = dog.photos[0]?.data_url;

          return (
            <div
              key={dog.id}
              className="bg-card rounded-xl p-4 animate-fade-in-up"
              role="listitem"
              aria-label={`${dog.name}, ${dog.sex === "male" ? t("male") : t("female")}, ${age}`}
            >
              <div className="flex items-start gap-4">
                {/* Large Avatar */}
                <button
                  onClick={() => setSelectedDog(selectedDog === dog.id ? null : dog.id)}
                  className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label={`Pokaż zdjęcia ${dog.name}`}
                  aria-expanded={selectedDog === dog.id}
                >
                  {avatar ? (
                    <img src={avatar} alt={`Zdjęcie ${dog.name}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl" aria-hidden="true">{dog.sex === "male" ? "🐕" : "🐩"}</span>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground truncate">{dog.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    <span aria-hidden="true">{dog.sex === "male" ? "♂️" : "♀️"}</span> {dog.breed || t("mixedBreed")}
                  </p>
                  <p className="text-sm text-muted-foreground">{age}</p>
                  
                  {weight && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-primary font-semibold">
                      <Scale className="w-4 h-4" aria-hidden="true" />
                      <span aria-label={`Waga: ${weight} kilogramów`}>{weight} kg</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => openPhotoPicker(dog.id)}
                    className="p-2 rounded-lg bg-secondary text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label={`Dodaj zdjęcie ${dog.name}`}
                  >
                    <Camera className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setDeleteId(dog.id)}
                    className="p-2 rounded-lg bg-destructive/10 text-destructive focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label={`${t("deleteDog")}: ${dog.name}`}
                  >
                    <Trash2 className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Photo gallery */}
              {selectedDog === dog.id && dog.photos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border" role="region" aria-label={`Galeria zdjęć ${dog.name}`}>
                  <div className="grid grid-cols-3 gap-2">
                    {dog.photos.map((photo) => (
                      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                        <img src={photo.data_url} alt={`Zdjęcie ${dog.name}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => setDeletePhotoInfo({ dogId: dog.id, photoId: photo.id })}
                          className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          aria-label={`${t("deletePhoto")}: ${dog.name}`}
                        >
                          <X className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {dogs.length === 0 && !showForm && (
        <div className="text-center py-12" role="status">
          <p className="text-muted-foreground text-lg mb-4">{t("noDogs")}</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={t("addFirstDog")}
          >
            <Plus className="w-5 h-5 inline-block mr-2" aria-hidden="true" />
            {t("addFirstDog")}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
        aria-label="Wybierz zdjęcie"
      />

      <ConfirmDialog
        open={!!deleteId}
        title={t("deleteDog")}
        message={t("deleteDogConfirm")}
        onConfirm={async () => {
          if (deleteId) await removeDog(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={!!deletePhotoInfo}
        title={t("deletePhoto")}
        message={t("deletePhotoConfirm")}
        onConfirm={async () => {
          if (deletePhotoInfo) await removeDogPhoto(deletePhotoInfo.dogId, deletePhotoInfo.photoId);
          setDeletePhotoInfo(null);
        }}
        onCancel={() => setDeletePhotoInfo(null)}
      />
    </div>
  );
};

export default NewDogsTab;
