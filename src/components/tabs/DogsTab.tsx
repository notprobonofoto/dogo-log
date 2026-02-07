import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import dogPaws from "@/assets/dog-paws.png";
import { Plus, Trash2, Dog } from "lucide-react";

const DogsTab = () => {
  const { data, addDog, removeDog } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [breed, setBreed] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) return;
    addDog({ name: name.trim(), birthDate, sex, breed: breed || undefined });
    setShowForm(false);
    setName("");
    setBirthDate("");
    setBreed("");
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      removeDog(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-safe">
      <div className="flex items-center justify-center gap-3 pt-4 mb-2">
        <h1 className="text-xl font-extrabold text-foreground">Pieski</h1>
      </div>
      <div className="flex justify-center mb-4">
        <img src={dogPaws} alt="" className="w-24 h-24 animate-wiggle" />
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg transition-all active:scale-95 mb-4 animate-fade-in-up"
        >
          <Plus className="w-5 h-5" /> Dodaj pieska
        </button>
      )}

      {showForm && (
        <div className="bg-card rounded-xl p-4 mb-4 space-y-3 animate-slide-up-bounce">
          <h3 className="font-bold text-foreground">Nowy piesek 🐶</h3>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Imię pieska"
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          <div className="flex gap-2">
            <button onClick={() => setSex("male")}
              className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${sex === "male" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              ♂️ Chłopiec
            </button>
            <button onClick={() => setSex("female")}
              className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${sex === "female" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              ♀️ Dziewczynka
            </button>
          </div>
          <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Rasa (opcjonalnie)"
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground font-semibold">Anuluj</button>
            <button onClick={handleSubmit} disabled={!name.trim()} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-40">Dodaj</button>
          </div>
        </div>
      )}

      {/* Dog cards */}
      <div className="space-y-3">
        {data.dogs.length === 0 && !showForm && (
          <div className="text-center py-8 animate-fade-in-up">
            <Dog className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Nie masz jeszcze żadnych piesków</p>
            <p className="text-sm text-muted-foreground">Dodaj pierwszego pieska powyżej!</p>
          </div>
        )}
        {data.dogs.map((dog, i) => (
          <div key={dog.id} className="bg-card rounded-xl p-4 flex items-center justify-between animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
                {dog.sex === "male" ? "🐕" : "🐩"}
              </div>
              <div>
                <p className="font-bold text-foreground">{dog.name}</p>
                <p className="text-xs text-muted-foreground">
                  {dog.sex === "male" ? "♂️" : "♀️"}
                  {dog.breed ? ` · ${dog.breed}` : ""}
                  {dog.birthDate ? ` · ur. ${dog.birthDate}` : ""}
                </p>
              </div>
            </div>
            <button onClick={() => handleDelete(dog.id)} className={`p-2 rounded-lg transition-all ${confirmDelete === dog.id ? "bg-destructive text-destructive-foreground" : "text-muted-foreground"}`}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DogsTab;
