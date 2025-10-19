import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaSignOutAlt } from 'react-icons/fa';
import Logo from '../../assets/logo-escola-bosque.png';
import './index.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const getHomeLink = () => {
    return user?.tipo === 'suporte' ? '/dashboard-suporte' : '/dashboard-usuario';
  };

  return (
    <header className="header">
      <div className="header-container container">
        <Link to={getHomeLink()} className="header-logo">
          <img src={Logo} alt="Logo Escola Bosque" className="header-logo-img" />
          <h1>Escola Bosque</h1>
          <span>| Suporte</span>
        </Link>
        <nav className="header-nav">
          {user && (
            <>
              <span className="header-welcome">
                Olá, {user.nome}
              </span>
              <button onClick={handleLogout} className="btn-logout" title="Sair">
                <FaSignOutAlt size={20} />
                <span>Sair</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;