import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import './index.css';

const TicketList = ({ tickets }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'aberto':
        return 'status-aberto';
      case 'pendente':
        return 'status-pendente';
      case 'concluido':
        return 'status-concluido';
      default:
        return 'status-fechado';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'baixa':
        return 'prioridade-baixa';
      case 'media':
        return 'prioridade-media';
      case 'alta':
        return 'prioridade-alta';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleString('pt-BR', options);
  };
  
  const formatCategory = (categoria) => {
    if (!categoria) return '-';
    return categoria.charAt(0).toUpperCase() + categoria.slice(1);
  };

  if (tickets.length === 0) {
    return <p className="no-tickets">Nenhum ticket encontrado para os filtros selecionados.</p>;
  }

  return (
    <div className="card ticket-list-container">
      <table className="ticket-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Status</th>
            <th>Categoria</th>
            <th>Prioridade</th>
            <th>Criado por</th>
            <th>Data Criação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>#{ticket.id}</td>
              <td className="ticket-titulo">{ticket.titulo}</td>
              <td>
                <span className={`status ${getStatusClass(ticket.status)}`}>
                  {ticket.status}
                </span>
              </td>
              <td className="ticket-categoria">
                {formatCategory(ticket.categoria)}
              </td>
              <td>
                <span className={`prioridade ${getPriorityClass(ticket.prioridade)}`}>
                  {ticket.prioridade || '-'}
                </span>
              </td>
              <td>{ticket.nome_usuario || 'Usuário'}</td>
              <td>{formatDate(ticket.data_criacao)}</td>
              <td>
                <Link to={`/ticket/${ticket.id}`} className="btn-action">
                  <FaEye />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketList;