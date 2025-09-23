// App.jsx
// [update] IslandDock kaldırıldı. Topbar'a "Hızlı" menüsü eklendi (🌙 Özel Gün, ✅ Yapılacaklar, ↺ Konumları Sıfırla)

import { Outlet, useLocation } from "react-router-dom";
import Overlay from "./components/Overlay.jsx";
import NavMenu from "./components/NavMenu.jsx";
import { useEffect, useRef, useState } from "react";
import StarsFull from "./components/StarsFull.jsx";
import CoupleFollowersFX from "./components/CoupleFollowersFX.jsx";

// islands
import SpecialDayIsland from "./components/islands/SpecialDayIsland.jsx";
import TasksIsland from "./components/islands/TasksIsland.jsx";

export default function App() {
  const { pathname } = useLocation();
  const onHome = pathname === "/";

  // Overlay state
  const [overlayClosed, setOverlayClosed] = useState(false);

  // İlk çarpışmada 1 kez çalınacak ses
  const audioRef = useRef(null);
  const [playedOnce, setPlayedOnce] = useState(false);

  // [islands] dock yerine: Topbar hızlı menü
  const [quickOpen, setQuickOpen] = useState(false);

  // [islands] LS tetik için küçük flip-flop
  const [forceOpenSpecial, setForceOpenSpecial] = useState(false);
  const [forceOpenTasks, setForceOpenTasks] = useState(false);

  // [islands] özel günler placeholder (gerçeğini sen dolduracaksın)
  const specialDays = [
    { id: "yildonumu", title: "1. Yılımız", dateISO: "2025-09-26", note: "A&H" },
    { id: "dogum-gunu", title: "Hatice'nin Doğum Günü", dateISO: "2025-05-18", note: "Küçük prenses" },
  ];

  // Overlay kapanınca takip bileşenine haber ver
  useEffect(() => {
    if (overlayClosed) {
      setTimeout(() => window.dispatchEvent(new Event("overlay-closed")), 0);
    }
  }, [overlayClosed]);

  // Overlay açıkken scroll kilidi
  useEffect(() => {
    if (!overlayClosed) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [overlayClosed]);

  function handleFirstCollision() {
    if (playedOnce) return;
    setPlayedOnce(true);
    try { audioRef.current?.play().catch(() => {}); } catch {}
  }

  // [quick actions] – Topbar menüsünden kontrol
  function openSpecialFromQuick() {
    localStorage.setItem("island:special:visible", "1");
    setForceOpenSpecial(v => !v);
    setQuickOpen(false);
  }
  function openTasksFromQuick() {
    localStorage.setItem("island:tasks:visible", "1");
    setForceOpenTasks(v => !v);
    setQuickOpen(false);
  }
  function resetIslandPositions() {
    localStorage.removeItem("island:special:pos");
    localStorage.removeItem("island:tasks:pos");
    setForceOpenSpecial(v => !v);
    setForceOpenTasks(v => !v);
    setQuickOpen(false);
  }

  // Topbar dışında tıklayınca quick menüyü kapat
  useEffect(() => {
    if (!quickOpen) return;
    const onDoc = (e) => {
      const m = document.getElementById("quick-menu");
      const b = document.getElementById("quick-btn");
      if (!m || !b) return;
      if (!m.contains(e.target) && !b.contains(e.target)) setQuickOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [quickOpen]);

  return (
    <div className="app-root">
      {!overlayClosed ? (
        <Overlay onClose={() => setOverlayClosed(true)} />
      ) : (
        <>
          {/* Tam ekran yıldız arka plan */}
          <StarsFull />

          {/* Sadece Home'da figürler */}
          {onHome && (
            <CoupleFollowersFX
              imgHatice="/hatice.png"
              imgBen="/ben.png"
              size={90}
              spacing={22}
              followLag={0.0005}
              bounceDist={150}
              maxHearts={220}
              followWhileHeld     // basılıyken takip
              idleWander
              heartRainAfterCollision
              onFirstCollision={handleFirstCollision}
              respawnOnCollide
              respawnMargin={110}
              respawnMinSeparation={240}
              heartScaleMin={1.2}
              heartScaleMax={3.9}
            />
          )}

          {/* Ses (global 1 kez) */}
          <audio ref={audioRef} src="/sounds/first-collision.mp3" preload="auto" />

          {/* Topbar + Hızlı ada menüsü */}
          <header className="topbar topbar-lg">
            <div className="brand">1. Yılımız</div>
            <NavMenu />

            {/* [quick] küçük menü */}
            <div className="topbar-quick">
              <button
                id="quick-btn"
                className="btn quick-btn"
                aria-haspopup="menu"
                aria-expanded={quickOpen ? "true" : "false"}
                aria-controls="quick-menu"
                onClick={() => setQuickOpen(v => !v)}
                title="Hızlı"
              >
                ⚡
              </button>

              {quickOpen && (
                <div id="quick-menu" role="menu" className="quick-menu">
                  <button role="menuitem" className="quick-item" onClick={openSpecialFromQuick} aria-label="Özel gün sayacını aç">🌙 Özel Gün</button>
                  <button role="menuitem" className="quick-item" onClick={openTasksFromQuick} aria-label="Yapılacaklar adasını aç">✅ Yapılacaklar</button>
                  <div className="quick-sep" />
                  <button role="menuitem" className="quick-item" onClick={resetIslandPositions} aria-label="Konumları sıfırla">↺ Konumları sıfırla</button>
                </div>
              )}
            </div>
          </header>

          <main className={`page ${onHome ? "home-empty" : ""}`}>
            <Outlet />
          </main>

          <footer className="footer">
            Made with{" "}
            <button id="footer-heart" className="footer-heart" aria-label="Favorileri aç" title="Favorileri aç">♥</button>{" "}
            by A&amp;H
          </footer>

          {/* ========= Islands (yalnızca Home'da görünür) ========= */}
          {onHome && (
            <>
              <SpecialDayIsland key={`special-${forceOpenSpecial}`} days={specialDays} />
              <TasksIsland key={`tasks-${forceOpenTasks}`} />
            </>
          )}
        </>
      )}
    </div>
  );
}
