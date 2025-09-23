// IslandDock.jsx
// Küçük ada ikonları: özel gün (🌙) ve yapılacaklar (✅). Kapatılanları buradan aç.

export default function IslandDock({
  onOpenSpecial, onOpenTasks, onResetPositions
}) {
  return (
    <div className="island-dock" role="toolbar" aria-label="Hızlı ada menüsü">
      <button className="dock-btn" aria-label="Özel gün adasını aç" title="Özel Gün" onClick={onOpenSpecial}>🌙</button>
      <button className="dock-btn" aria-label="Yapılacaklar adasını aç" title="Yapılacaklar" onClick={onOpenTasks}>✅</button>
      <div className="dock-sep" />
      <button className="dock-btn" aria-label="Konumları sıfırla" title="Konumları sıfırla" onClick={onResetPositions}>↺</button>
    </div>
  );
}
