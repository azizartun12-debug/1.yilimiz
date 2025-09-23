import { NavLink } from "react-router-dom";

export default function NavMenu() {
  const linkClass = ({ isActive }) => ({ className: isActive ? "active" : "" });
  return (
    <nav className="nav">
      <NavLink to="/" {...linkClass}>Ana Sayfa</NavLink>
      <NavLink to="/memories" {...linkClass}>Anılar</NavLink>
      <NavLink to="/special-days" {...linkClass}>Özel Günler</NavLink>
      <NavLink to="/trips" {...linkClass}>Geziler</NavLink>
      <NavLink to="/todos" {...linkClass}>Yapılacaklar</NavLink>
      <NavLink to="/games" {...linkClass}>Oyunlar</NavLink>
    </nav>
  );
}