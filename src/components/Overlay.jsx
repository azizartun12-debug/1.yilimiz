import Countdown from "./Countdown.jsx";
import { useEffect, useState } from "react";

// Tarih kilidi ayarı (UI'dan erişilemez)
const LOCK_ENABLED = true;
const TARGET = "2025-09-26T00:00:00+03:00"; // tarih geldiğinde otomatik kapan

export default function Overlay({ onClose }) {
  const [done, setDone] = useState(false);
  const [closing, setClosing] = useState(false);

  // sayfa yüklendiğinde tarih kontrolü
  useEffect(() => {
    const now = new Date();
    const end = new Date(TARGET);
    if (now >= end) setDone(true);
  }, []);

  // otomatik kapanma
  useEffect(() => {
    if (done) handleClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function handleClose() {
    // Tarih kilidi aktifse ve tarih gelmediyse manuel kapanışı engelle
    if (LOCK_ENABLED) {
      const now = new Date();
      const end = new Date(TARGET);
      if (now < end) return; // kilit devam ediyor
    }
    setClosing(true);
    // animasyon süresi ile eşle
    setTimeout(() => onClose?.(), 550);
  }

  return (
    <div className={`overlay-root ${closing ? "overlay-closing" : ""}`}>
      <div className="overlay-inner">
        <Countdown target={TARGET} onEnd={() => setDone(true)} />
        <div className="overlay-actions">
          <button className="btn" onClick={handleClose}>Devam</button>
        </div>
        {LOCK_ENABLED && (
          <div style={{marginTop:10, fontSize:12, opacity:.6}}>
            Tarih geldiğinde otomatik açılacak.
          </div>
        )}
      </div>
    </div>
  );
}
