import { useEffect, useState } from "react";
import { useAuth } from "../services/auth.jsx";
import { addTrip, listTrips, removeTrip } from "../services/trips";

export default function Trips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  async function refresh() {
    if (!user) return;
    const rows = await listTrips(user.uid);
    setTrips(rows);
  }

  useEffect(() => { refresh(); }, [user]);

  async function add() {
    if (!name.trim()) return;
    await addTrip(user.uid, { name, note });
    setName(""); setNote("");
    refresh();
  }

  async function remove(id) {
    await removeTrip(user.uid, id);
    refresh();
  }

  return (
    <div className="card">
      <h2>Geziler</h2>
      <p>Gezi başlıkları ekleyip, her birine fotoğraf/not akışı ekleyeceğiz (şimdilik başlık + not CRUD).</p>

      <div className="input-row">
        <input placeholder="Gezi adı" value={name} onChange={(e)=>setName(e.target.value)} />
        <input placeholder="Kısa not" value={note} onChange={(e)=>setNote(e.target.value)} />
        <button className="btn" onClick={add}>Ekle</button>
      </div>

      <div className="list" style={{marginTop:12}}>
        {trips.map(t => (
          <div className="list-item" key={t.id}>
            <div>
              <strong>{t.name}</strong>
              {t.note && <div style={{fontSize:12, opacity:.8}}>{t.note}</div>}
            </div>
            <div>
              <button className="btn" onClick={()=>remove(t.id)}>Sil</button>
            </div>
          </div>
        ))}
        {trips.length === 0 && <div style={{opacity:.7}}>Kayıt yok.</div>}
      </div>
    </div>
  );
}