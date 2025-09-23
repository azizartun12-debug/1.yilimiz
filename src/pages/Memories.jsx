// Memories.jsx
// [update] Favoriler tetikleyicisi: footer'daki "♥" (id="footer-heart").
// 2 sn içinde 3 tık → Favoriler bir kez açılır. Yeni paket YOK.

import { useEffect, useMemo, useRef, useState } from "react";

export default function Memories() {
  const timeline = useMemo(
    () =>
      [
        { id: "start-2024-09-26", dateISO: "2024-09-26", title: "Başlangıç", note: "Seni ilk kez o gün benimsedim.", coverUrl: "https://picsum.photos/seed/start/600/800", location: "İstanbul", accent: "silver", isMilestone: true },
        { id: "2024-10", dateISO: "2024-10-15", title: "Ekim 2024", note: "Birlikte ilk sonbaharımız.", coverUrl: "https://picsum.photos/seed/oct/800/600", location: "Kırklareli", accent: "lavender" },
        { id: "2024-11", dateISO: "2024-11-12", title: "Kasım 2024", note: "Sıcacık bir çay ve uzun sohbet.", coverUrl: "https://picsum.photos/seed/nov/800/600", accent: "blue" },
        { id: "2024-12", dateISO: "2024-12-22", title: "Aralık 2024", note: "Işıl ışıl bir akşam.", coverUrl: "https://picsum.photos/seed/dec/800/600", accent: "silver" },
        { id: "2025-01", dateISO: "2025-01-10", title: "Ocak 2025", note: "Karlı bir yürüyüş.", coverUrl: "https://picsum.photos/seed/jan/800/600", accent: "lavender" },
        { id: "2025-02", dateISO: "2025-02-14", title: "Şubat 2025", note: "Sevgililer günü küçük bir sürpriz.", coverUrl: "https://picsum.photos/seed/feb/800/600", accent: "pink" },
        { id: "2025-03", dateISO: "2025-03-08", title: "Mart 2025", note: "Yağmur sonrası kokular.", coverUrl: "https://picsum.photos/seed/mar/800/600", accent: "blue" },
        { id: "2025-04", dateISO: "2025-04-20", title: "Nisan 2025", note: "Açan çiçeklerin arasında.", coverUrl: "https://picsum.photos/seed/apr/800/600", accent: "lavender" },
        { id: "2025-05", dateISO: "2025-05-18", title: "Mayıs 2025", note: "Doğum günün ve ışıklar.", coverUrl: "https://picsum.photos/seed/may/800/600", accent: "pink" },
        { id: "2025-06", dateISO: "2025-06-07", title: "Haziran 2025", note: "Güneşli bir gezi.", coverUrl: "https://picsum.photos/seed/jun/800/600", accent: "blue" },
        { id: "2025-07", dateISO: "2025-07-26", title: "Temmuz 2025", note: "Akşam esintisi ve sen.", coverUrl: "https://picsum.photos/seed/jul/800/600", accent: "silver" },
        { id: "2025-08", dateISO: "2025-08-21", title: "Ağustos 2025", note: "Sahilde gün batımı.", coverUrl: "https://picsum.photos/seed/aug/800/600", accent: "lavender" },
        {
          id: "one-year-2025-09-26",
          dateISO: "2025-09-26",
          title: "1. Yıl",
          note: "Bir yıl boyunca biriktirdiğimiz her an…",
          coverUrl: "https://picsum.photos/seed/oneyear/800/600",
          accent: "pink",
          isMilestone: true,
          favorites: [
            { thumb: "https://picsum.photos/seed/fav1/400/300", text: "İlk kahve" },
            { thumb: "https://picsum.photos/seed/fav2/400/300", text: "Gizli not" },
            { thumb: "https://picsum.photos/seed/fav3/400/300", text: "Yağmurda yürüyüş" },
            { thumb: "https://picsum.photos/seed/fav4/400/300", text: "Film gecesi" },
            { thumb: "https://picsum.photos/seed/fav5/400/300", text: "Sürpriz fotoğraf" },
          ],
        },
      ].sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    []
  );

  // Modal
  const [openIndex, setOpenIndex] = useState(null);
  const modalCloseBtnRef = useRef(null);

  // Favoriler state (tek sefer)
  const [favOpen, setFavOpen] = useState(false);
  const favOpenedRef = useRef(false);
  const [burst, setBurst] = useState(false);
  const [aurora, setAurora] = useState(false);

  // 3 tık sayacı (2 sn)
  const clickTimerRef = useRef(null);
  const clicksRef = useRef(0);

  // Footer kalbi dinleyicisi
  useEffect(() => {
    const heartEl = document.getElementById("footer-heart");
    if (!heartEl) return;

    const onPointer = (e) => {
      // Favoriler açıldıysa bir daha çalışmaz
      if (favOpenedRef.current) return;

      // Ghost click azalt: sadece primary pointer
      if (e.pointerType === "mouse" && e.button !== 0) return;

      if (!clickTimerRef.current) {
        clickTimerRef.current = setTimeout(() => {
          clicksRef.current = 0;
          clearTimeout(clickTimerRef.current);
          clickTimerRef.current = null;
        }, 2000);
      }

      clicksRef.current += 1;

      if (clicksRef.current >= 3) {
        favOpenedRef.current = true;
        setFavOpen(true);

        // mikro efektler
        setBurst(true);
        setAurora(true);
        setTimeout(() => setBurst(false), 900);
        setTimeout(() => setAurora(false), 1500);

        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
          clickTimerRef.current = null;
        }
        clicksRef.current = 0;
      }
    };

    heartEl.addEventListener("pointerdown", onPointer, { passive: true });

    return () => {
      heartEl.removeEventListener("pointerdown", onPointer);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  // Modal kısayolları + scroll lock
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpenIndex(null);
      else if (e.key === "ArrowRight") setOpenIndex((i) => Math.min(i + 1, timeline.length - 1));
      else if (e.key === "ArrowLeft") setOpenIndex((i) => Math.max(i - 1, 0));
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => modalCloseBtnRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, timeline.length]);

  const openModal = (idx) => setOpenIndex(idx);
  const closeModal = () => setOpenIndex(null);
  const prev = () => setOpenIndex((i) => Math.max((i ?? 0) - 1, 0));
  const next = () => setOpenIndex((i) => Math.min((i ?? 0) + 1, timeline.length - 1));

  // milestone kalpleri (hafif)
  const HeartParticles = ({ count = 8 }) => (
    <div className="mem-heart-wrap" aria-hidden="true" style={inlineHeartsWrap}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="mem-heart" style={randHeartStyle(i)} />
      ))}
    </div>
  );

  const favList = useMemo(() => {
    const oneYear = timeline.find((t) => t.isMilestone && t.id.startsWith("one-year"));
    return oneYear?.favorites ?? [];
  }, [timeline]);

  return (
    <div className={`card memories-root ${aurora ? "mem-aurora-pulse" : ""}`}>
      <h2>Anılar</h2>
      <p className="mem-desc">26 Eyl 2024 → 26 Eyl 2025 arası her aydan bir fotoğraf. Kartlara tıklayınca tam ekran açılır.</p>

      {/* Zaman çizgisi */}
      <div className="mem-timeline"><div className="mem-line" /></div>

      <div className="memories-grid">
        {timeline.map((m, idx) => {
          const milestone = !!m.isMilestone;
          return (
            <button
              key={m.id}
              className={`mem-card accent-${m.accent || "silver"} ${milestone ? "is-milestone" : ""}`}
              onClick={() => openModal(idx)}
              aria-label={`${m.title || m.dateISO} detayını aç`}
            >
              {milestone && <HeartParticles count={10} />}

              <div className="mem-cover">
                <img src={m.coverUrl} alt={m.title || m.note || m.dateISO} loading="lazy" className="mem-img" />
              </div>

              <div className="mem-meta">
                <div className="mem-title">{m.title || formatMonth(m.dateISO)}</div>
                <div className="mem-sub">
                  <span className="mem-date">{formatDate(m.dateISO)}</span>
                  {m.location ? <span className="mem-dot">•</span> : null}
                  {m.location ? <span className="mem-loc">{m.location}</span> : null}
                </div>
                {m.note ? <div className="mem-note">{m.note}</div> : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Favoriler bölümü (easter egg) */}
      {favOpen && favList.length > 0 && (
        <div className="mem-fav-egg mem-fav-animate-in" role="region" aria-label="Favoriler">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span aria-hidden="true" style={{ filter: "drop-shadow(0 0 6px rgba(244,114,182,0.5))" }}>💗</span>
            <strong>Favoriler</strong>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>(1. yılın en özel 5 anı)</span>
          </div>
          <div className="mem-favs-grid">
            {favList.map((f, i) => (
              <div key={i} className="mem-fav-card">
                <img src={f.thumb} alt="" loading="lazy" />
                <p className="mem-fav-note">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {openIndex !== null && (
        <div
          className="mem-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Anı detayı"
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="mem-modal">
            <button className="mem-close" onClick={closeModal} aria-label="Kapat" ref={modalCloseBtnRef}>✕</button>
            <button className="mem-nav mem-prev" onClick={prev} aria-label="Önceki">‹</button>
            <button className="mem-nav mem-next" onClick={next} aria-label="Sonraki">›</button>

            <div className="mem-modal-content">
              <img
                src={timeline[openIndex].coverUrl}
                alt={timeline[openIndex].title || timeline[openIndex].note || timeline[openIndex].dateISO}
                className="mem-modal-img"
              />
              <div className="mem-modal-info">
                <div className="mem-modal-title">
                  {timeline[openIndex].title || formatMonth(timeline[openIndex].dateISO)}
                </div>
                <div className="mem-modal-sub">
                  <span>{formatDate(timeline[openIndex].dateISO)}</span>
                  {timeline[openIndex].location ? <span className="mem-dot">•</span> : null}
                  {timeline[openIndex].location ? <span>{timeline[openIndex].location}</span> : null}
                </div>
                {timeline[openIndex].note ? <div className="mem-modal-note">{timeline[openIndex].note}</div> : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aurora nabzı/parıltı patlaması için görünmeyen taşıyıcı */}
      {burst && <span className="mem-burst mem-burst-fixed" aria-hidden="true">{Array.from({ length: 8 }).map((_, i) => <i key={i} />)}</span>}
    </div>
  );
}

/* ----------------- yardımcılar ----------------- */

function formatDate(iso) { try { const d = new Date(iso + "T00:00:00"); return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" }); } catch { return iso; } }
function formatMonth(iso) { try { const d = new Date(iso + "T00:00:00"); return d.toLocaleDateString("tr-TR", { month: "long", year: "numeric" }); } catch { return iso; } }

const inlineHeartsWrap = { position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" };
function randHeartStyle(i) {
  const left = Math.random() * 100;
  const size = 8 + Math.random() * 10;
  const delay = Math.random() * 2;
  const duration = 3 + Math.random() * 2;
  const keyframes = `
    @keyframes memFloat${i} {
      0% { transform: translateY(20px) scale(0.9); opacity: 0; }
      20% { opacity: 0.7; }
      100% { transform: translateY(-80px) scale(1.2); opacity: 0; }
    }
  `;
  if (typeof document !== "undefined" && !document.getElementById(`memFloat${i}`)) {
    const style = document.createElement("style"); style.id = `memFloat${i}`; style.textContent = keyframes; document.head.appendChild(style);
  }
  return {
    position: "absolute",
    left: `${left}%`,
    bottom: 0,
    width: `${size}px`,
    height: `${size}px`,
    background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(255,192,203,0.6) 60%, rgba(255,192,203,0) 70%)",
    borderRadius: "50%",
    filter: "drop-shadow(0 0 6px rgba(255,192,203,0.6))",
    animation: `memFloat${i} ${duration}s ease-in ${delay}s infinite`,
  };
}
