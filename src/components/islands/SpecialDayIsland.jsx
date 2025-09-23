// /src/components/islands/SpecialDayIsland.jsx
// [fix] Close çalışmıyor -> drag sadece handle'da. [pos] İlk konum: topbar sağ-alt.
// [perf] Tek interval, unmount cleanup.

import { useEffect, useMemo, useRef, useState } from "react";

const LS_POS_KEY = "island:special:pos";
const LS_VIS_KEY = "island:special:visible";

export default function SpecialDayIsland({ days = [], defaultVisible = true }) {
  // görünürlük (persist)
  const [visible, setVisible] = useState(() => {
    const v = localStorage.getItem(LS_VIS_KEY);
    return v == null ? defaultVisible : v === "1";
  });
  useEffect(() => { localStorage.setItem(LS_VIS_KEY, visible ? "1" : "0"); }, [visible]);

  // pozisyon (persist) – ilk mount’ta topbar ölçülerek ayarlanır
  const [pos, setPos] = useState(() => {
    const p = localStorage.getItem(LS_POS_KEY);
    return p ? JSON.parse(p) : null; // null => mount sonrası ölçüp yerleştireceğiz
  });
  useEffect(() => { if (pos) localStorage.setItem(LS_POS_KEY, JSON.stringify(pos)); }, [pos]);

  // en yakın özel gün
  const next = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const list = days
      .map(d => ({ ...d, t: new Date(d.dateISO + "T00:00:00") }))
      .filter(d => d.t >= start)
      .sort((a, b) => a.t - b.t);
    return list[0] || null;
  }, [days]);

  // sayaç
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!visible || !next) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [visible, next]);
  const diffMs = next ? (new Date(next.dateISO + "T00:00:00").getTime() - now) : 0;
  const reached = next && diffMs <= 0;
  const cd = formatCountdown(Math.max(0, diffMs));

  // refs
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
      const h = wb?.height || 160;
      const yBase = (tb?.bottom ?? 0) + 12;      // topbar’ın altı
      const x = window.innerWidth - w - 16;      // sağdan 16
      const y = Math.min(yBase, window.innerHeight - h - 8);
      setPos({ x: Math.max(8, x), y: Math.max(8, y) });
    };
    // iki kare bekle: ölçüler otursun
    requestAnimationFrame(() => requestAnimationFrame(place));
  }, [visible, pos]);

  // DRAG — sadece handle üzerinde
  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    const onDown = (e) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      dragRef.current.active = true;
      const r = wrap.getBoundingClientRect();
      dragRef.current = {
        active: true,
        sx: e.clientX,
        sy: e.clientY,
        px: pos?.x ?? r.left,
        py: pos?.y ?? r.top,
        w: r.width,
        h: r.height,
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
      setPos({
        x: clamp(nx, 8, vw - w - 8),
        y: clamp(ny, 8, vh - h - 8),
      });
    };

    const onUp = (e) => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      handle.releasePointerCapture?.(e.pointerId);
      wrapRef.current?.classList.remove("is-dragging");
      // kenara hafif snap
      const vw = window.innerWidth, vh = window.innerHeight;
      const w = dragRef.current.w, h = dragRef.current.h;
      setPos(p => ({
        x: (vw - p.x - w) < 20 ? vw - w - 8 : (p.x < 20 ? 8 : p.x),
        y: (vh - p.y - h) < 20 ? vh - h - 8 : (p.y < 20 ? 8 : p.y),
      }));
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

  if (!visible || !next || pos === null) {
    // mount sırasında ölçüm için boş render – layout büyütmesin
    return null;
  }

  return (
    <div
      ref={wrapRef}
      className={`island special-island ${reached ? "is-celebrate" : ""}`}
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      role="region"
      aria-label="Özel gün geri sayım adası"
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
        <strong className="title">{next.title || "Özel Gün"}</strong>
        <button className="close" aria-label="Kapat" onClick={() => setVisible(false)}>✕</button>
      </div>

      <div className="island-body">
        <div className="countdown-row">
          <span className="cd">{cd}</span>
          <small className="date">{formatDate(next.dateISO)}</small>
        </div>
        {next.note ? <div className="note">{next.note}</div> : null}
      </div>

      {reached && <span className="celebrate" aria-hidden="true">Kutlu Olsun! 🎉</span>}
    </div>
  );
}

function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function pad(n){ return String(n).padStart(2,"0"); }
function formatCountdown(ms){
  const s = Math.floor(ms/1000);
  const d = Math.floor(s/86400);
  const h = Math.floor((s%86400)/3600);
  const m = Math.floor((s%3600)/60);
  const ss = s%60;
  if (s <= 24*3600) return `${pad(h + d*24)}:${pad(m)}:${pad(ss)}`; // ≤24h
  return `${pad(d)}:${pad(h)}:${pad(m)}`;                           // gg:hh:mm
}
function formatDate(iso){
  try{ const d = new Date(iso+"T00:00:00"); return d.toLocaleDateString("tr-TR",{day:"2-digit",month:"long",year:"numeric"}); }
  catch{ return iso; }
}
