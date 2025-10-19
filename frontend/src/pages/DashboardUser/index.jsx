import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FaPlus, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import NewTicketModal from '../../components/NewTicketModal';
import TicketList from '../../components/TicketList';
import './index.css';

const DashboardUser = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/tickets/user');
      setTickets(data);
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      toast.error('Não foi possível carregar seus tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenModal = () => setModalIsOpen(true);
  const handleCloseModal = () => setModalIsOpen(false);

  const handleTicketCreated = (newTicket) => {
    setTickets([newTicket, ...tickets]);
    fetchTickets();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Meus Chamados</h2>
        <button className="btn-principal" onClick={handleOpenModal}>
          <FaPlus /> Novo Ticket
        </button>
      </header>

      {loading ? (
        <p>Carregando tickets...</p>
      ) : (
        <TicketList tickets={tickets} />
      )}

      {modalIsOpen && (
        <NewTicketModal
          isOpen={modalIsOpen}
          onClose={handleCloseModal}
          onTicketCreated={handleTicketCreated}
        />
      )}
    </div>
  );
};

export default DashboardUser;