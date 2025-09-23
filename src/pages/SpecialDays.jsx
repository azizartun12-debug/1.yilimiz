import { useEffect, useState } from "react";
import { useAuth } from "../services/auth.jsx";
import { addSpecialDay, listSpecialDays, removeSpecialDay } from "../services/specialDays";
import { daysUntil } from "../utils/dates";

export default function SpecialDays() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  async function refresh() {
    if (!user) return;
    const rows = await listSpecialDays(user.uid);
    setItems(rows);
  }

  useEffect(() => { refresh(); }, [user]);

  async function addItem() {
    if (!user) return;
    if (!title || !date) return;
    await addSpecialDay(user.uid, { title, date });
    setTitle("");
    setDate("");
    refresh();
  }

  async function remove(id) {
    if (!user) return;
    await removeSpecialDay(user.uid, id);
    refresh();
  }

  return (
    <div className="card">
      <h2>Özel Günler</h2>
      <div className="input-row">
        <input
          placeholder="Başlık (örn. Yıldönümü)"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e)=>setDate(e.target.value)}
        />
        <button className="btn" onClick={addItem} disabled={loading || !user}>
          Ekle
        </button>
      </div>

      <div className="list" style={{marginTop:12}}>
        {items.map(it => (
          <div className="list-item" key={it.id}>
            <div>
              <strong>{it.title}</strong>
              <div style={{fontSize:12, opacity:.8}}>
                Tarih: {it.date} • Kalan: {daysUntil(it.date)} gün
              </div>
            </div>
            <div>
              <button
                className="btn"
                onClick={()=>remove(it.id)}
                disabled={!user}
              >
                Sil
              </button>
            </div>
          </div>
        ))}
        {loading && <div style={{opacity:.7}}>Giriş yapılıyor…</div>}
        {!loading && items.length === 0 && <div style={{opacity:.7}}>Kayıt yok.</div>}
      </div>
    </div>
  );
}
