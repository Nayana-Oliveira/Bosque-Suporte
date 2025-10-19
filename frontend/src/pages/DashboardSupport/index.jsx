import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import TicketList from '../../components/TicketList';
import NewUserModal from '../../components/NewUserModal';
import { FaSearch, FaUserPlus } from 'react-icons/fa';
import './index.css';

const DashboardSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState('aberto');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filterStatus) params.status = filterStatus;
      if (filterCategoria) params.categoria = filterCategoria;
      if (searchTerm) params.search = searchTerm;

      const { data } = await api.get('/tickets', { params });
      setTickets(data);
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      toast.error('Não foi possível carregar os tickets.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategoria, searchTerm]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Painel de Suporte</h2>
        <button className="btn-principal" onClick={() => setModalIsOpen(true)}>
          <FaUserPlus /> Criar Novo Usuário
        </button>
      </header>

      <form className="filters-bar card" onSubmit={handleSearch}>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-btn">
            <FaSearch />
          </button>
        </div>

        <div className="filter-group">
          <div className="filter-container">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="aberto">Aberto</option>
              <option value="pendente">Pendente</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>
          
          <div className="filter-container">
            <label htmlFor="categoria-filter">Categoria</label>
            <select
              id="categoria-filter"
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="tecnologia">Tecnologia</option>
              <option value="infraestrutura">Infraestrutura</option>
              <option value="administrativo">Administrativo</option>
              <option value="financeiro">Financeiro</option>
              <option value="pedagogico">Pedagógico</option>
              <option value="outro">Outro</option>
            </select>
          </div>
        </div>
      </form>

      {loading ? (
        <p>Carregando tickets...</p>
      ) : (
        <TicketList tickets={tickets} />
      )}
      
      {modalIsOpen && (
        <NewUserModal
          isOpen={modalIsOpen}
          onClose={() => setModalIsOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardSupport;