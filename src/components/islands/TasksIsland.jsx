// /src/components/islands/TasksIsland.jsx
// [fix] Close tık çalışır. [drag] Sadece handle butonundan. [pos] İlk konum: topbar sağ-alt.

import { useEffect, useRef, useState } from "react";

const LS_POS_KEY = "island:tasks:pos";
const LS_VIS_KEY = "island:tasks:visible";

export default function TasksIsland({ defaultVisible = false, tasks = [] }) {
  const [visible, setVisible] = useState(() => {
    const v = localStorage.getItem(LS_VIS_KEY);
    return v == null ? defaultVisible : v === "1";
  });
  useEffect(() => { localStorage.setItem(LS_VIS_KEY, visible ? "1" : "0"); }, [visible]);

  const [pos, setPos] = useState(() => {
    const p = localStorage.getItem(LS_POS_KEY);
    return p ? JSON.parse(p) : null;
  });
  useEffect(() => { if (pos) localStorage.setItem(LS_POS_KEY, JSON.stringify(pos)); }, [pos]);

  const [items, setItems] = useState(() =>
    tasks.length ? tasks : [
      { id: "t1", text: "Hafta içi gezi planını gözden geçir", done: false },
      { id: "t2", text: "Favori 5 an için foto seç", done: true },
      { id: "t3", text: "Anılar notlarını parlat", done: false },
    ]
  );

  // refs & drag (sadece handle)
  const wrapRef = useRef(null);
  const handleRef = useRef(null);
  const dragRef = useRef({ active:false, sx:0, sy:0, px:0, py:0, w:0, h:0 });

  // ilk yerleşim: topbar sağ-alt
  useEffect(() => {
    if (!visible) return;
    if (pos !== null) return;
    const place = () => {
      const topbar = document.querySelector(".topbar");
      const wb = wrapRef.current?.getBoundingClientRect();
      const tb = topbar?.getBoundingClientRect();
      const w = wb?.width || 300;
      const h = wb?.height || 200;
      const yBase = (tb?.bottom ?? 0) + 12;
      const x = window.innerWidth - w - 16;
      const y = Math.min(yBase, window.innerHeight - h - 8);
      setPos({ x: Math.max(8, x), y: Math.max(8, y) });
    };
    requestAnimationFrame(() => requestAnimationFrame(place));
  }, [visible, pos]);

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    const onDown = (e) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      dragRef.current = {
        active: true,
        sx: e.clientX, sy: e.clientY,
        px: pos?.x ?? r.left, py: pos?.y ?? r.top,
        w: r.width, h: r.height,
      };
      handle.setPointerCapture?.(e.pointerId);
      wrap.classList.add("is-dragging");
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.sx;
      const dy = e.clientY - dragRef.current.sy;
      const nx = dragRef.current.px + dx;
      const ny = dragRef.current.py + dy;
      const vw = window.innerWidth, vh = window.innerHeight;
      const w = dragRef.current.w, h = dragRef.current.h;
      setPos({ x: clamp(nx, 8, vw - w - 8), y: clamp(ny, 8, vh - h - 8) });
    };
    const onUp = (e) => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      handle.releasePointerCapture?.(e.pointerId);
      wrapRef.current?.classList.remove("is-dragging");
    };

    handle.addEventListener("pointerdown", onDown);
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    return () => {
      handle.removeEventListener("pointerdown", onDown);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
    };
  }, [pos]);

  if (!visible || pos === null) return null;

  return (
    <div
      ref={wrapRef}
      className="island tasks-island"
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      role="region" aria-label="Yapılacaklar adası"
    >
      <div className="island-head">
        <button
          ref={handleRef}
          className="drag-handle-btn"
          aria-label="Taşı"
          title="Taşı"
        >
          ⠿
        </button>
        <strong className="title">Bugün / Hafta</strong>
        <button className="close" aria-label="Kapat" onClick={() => setVisible(false)}>✕</button>
      </div>

      <ul className="island-list" role="list">
        {items.map(it => (
          <li key={it.id} className={`i-item ${it.done ? "done" : ""}`}>
            <label>
              <input
                type="checkbox"
                checked={it.done}
                onChange={() =>
                  setItems(prev => prev.map(p => p.id === it.id ? { ...p, done: !p.done } : p))
                }
                aria-label={it.text}
              />
              <span>{it.text}</span>
            </label>
          </li>
        ))}
      </ul>

      <div className="island-actions">
        <button className="btn sm" aria-label="Tümünü gör">Tümünü gör</button>
      </div>
    </div>
  );
}

function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
