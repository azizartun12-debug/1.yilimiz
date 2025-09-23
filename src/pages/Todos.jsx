import { useEffect, useState } from "react";
import { useAuth } from "../services/auth.jsx";
import { addTodo, listTodos, removeTodo, toggleTodo } from "../services/todos";
import "./Todos.css"; // animasyon için ekledik

export default function Todos() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");

  async function refresh() {
    if (!user) return;
    const rows = await listTodos(user.uid);
    setItems(rows);
  }

  useEffect(() => { refresh(); }, [user]);

  async function add() {
    if (!text.trim()) return;
    await addTodo(user.uid, text.trim());
    setText("");
    refresh();
  }

  async function toggle(id, done) {
    await toggleTodo(user.uid, id, !done);
    refresh();
  }

  async function remove(id) {
    await removeTodo(user.uid, id);
    refresh();
  }

  return (
    <div className="card">
      <h2>Yapılacaklar</h2>

      <div className="input-row">
        <input
          placeholder="Birlikte yapalım…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn" onClick={add} disabled={loading || !user}>
          Ekle
        </button>
      </div>

      <div className="list" style={{ marginTop: 12 }}>
        {items.map((it) => (
          <div className="list-item" key={it.id}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={!!it.done}
                onChange={() => toggle(it.id, it.done)}
              />
              <span className={`todo-text ${it.done ? "done" : ""}`}>
                {it.text}
              </span>
            </label>
            <div>
              <button
                className="btn"
                onClick={() => remove(it.id)}
                disabled={!user}
              >
                Sil
              </button>
            </div>
          </div>
        ))}
        {loading && <div style={{ opacity: 0.7 }}>Giriş yapılıyor…</div>}
        {!loading && items.length === 0 && (
          <div style={{ opacity: 0.7 }}>Kayıt yok.</div>
        )}
      </div>
    </div>
  );
}
