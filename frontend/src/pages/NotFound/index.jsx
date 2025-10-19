import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1>404</h1>
      <h2>Página Não Encontrada</h2>
      <p>A página que você está procurando não existe ou foi movida.</p>
      <Link to="/" className="btn-principal">
        Voltar ao Início
      </Link>
    </div>
  );
};

export default NotFound;