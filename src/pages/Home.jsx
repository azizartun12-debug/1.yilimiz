import { Link } from "react-router-dom";
import Stars from "../components/StarsFull.jsx";

export default function Home() {
  return (
    <div className="grid">
      <section className="hero">
        {/* yıldızlı arka plan */}
        <Stars density={0.8} speed={0.05} />

        <h1 className="hero-title">1. Yılımız</h1>
        <p className="hero-sub">
          Bizim için seçtiğimiz özel bölümlerle dolu, küçük bir anı sitesi ♥
        </p>

        <div className="hero-actions">
          <Link to="/memories" className="btn">Anılar</Link>
          <Link to="/special-days" className="btn">Özel Günler</Link>
          <Link to="/trips" className="btn">Geziler</Link>
          <Link to="/todos" className="btn">Yapılacaklar</Link>
          <Link to="/games" className="btn">Oyunlar</Link>
        </div>
      </section>

      <div className="card">
        <h2>Küçük Not</h2>
        <p>
          Geri sayım overlay’i sayfa açılışında çıkar. İstediğinde "Devam" ile
          ana sayfaya geçebilirsin. Tarih geldiğinde overlay otomatik kapanır.
        </p>
      </div>
    </div>
  );
}
