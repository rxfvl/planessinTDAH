import { NavLink, Outlet } from 'react-router-dom';
import { Home, CalendarHeart, Lightbulb, UserRound, LogOut } from 'lucide-react';
import { logoutIdentity } from '../lib/store';
import { APP_CONFIG } from '../config';

const links = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/planes', label: 'Planes', icon: CalendarHeart },
  { to: '/ideas', label: 'Ideas', icon: Lightbulb },
  { to: '/personales', label: 'Personales', icon: UserRound },
];

export default function Layout({ user }) {
  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="sidebar-brand text-gradient">{APP_CONFIG.appName}</div>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className="nav-link">
            <Icon size={20} /> {label}
          </NavLink>
        ))}
        <div className="sidebar-user">
          <div className="avatar">{user.displayName[0]}</div>
          <span className="user-name font-semibold" style={{ flex: 1 }}>{user.displayName}</span>
          <button onClick={logoutIdentity} className="icon-btn" title="Salir"><LogOut size={18} /></button>
        </div>
      </nav>
      <main className="main-content"><Outlet /></main>
    </div>
  );
}
