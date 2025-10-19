import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  FaPaperPlane, FaDownload, FaFileAlt, FaArrowLeft,
  FaUserCircle, FaUserShield, FaTag
} from 'react-icons/fa';
import './index.css';

const TicketDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  
  const [newMessage, setNewMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSupport = user?.tipo === 'suporte';

  const fetchTicketDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [ticketRes, messagesRes, attachmentsRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/messages`),
        api.get(`/tickets/${id}/attachments`),
      ]);
      
      setTicket(ticketRes.data);
      setMessages(messagesRes.data);
      setAttachments(attachmentsRes.data);
      setNewStatus(ticketRes.data.status);
      setNewPriority(ticketRes.data.prioridade || 'baixa');
      
    } catch (error) {
      console.error('Erro ao buscar detalhes do ticket:', error);
      toast.error('Não foi possível carregar o ticket.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const { data } = await api.post(`/tickets/${id}/messages`, {
        mensagem: newMessage,
      });
      setMessages([...messages, data]);
      setNewMessage('');
      toast.success('Mensagem enviada!');
    } catch (error) {
      toast.error('Falha ao enviar mensagem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTicket = async () => {
    if (!isSupport) return;

    setIsSubmitting(true);
    try {
      const { data } = await api.put(`/tickets/${id}/status`, {
        status: newStatus,
        prioridade: newPriority,
      });
      setTicket(data);
      toast.success('Ticket atualizado com sucesso!');
    } catch (error) {
      toast.error('Falha ao atualizar ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getHomeLink = () => {
    return isSupport ? '/dashboard-suporte' : '/dashboard-usuario';
  };

  const formatDate = (dateString) => {
    const options = { dateStyle: 'short', timeStyle: 'short' };
    return new Date(dateString).toLocaleString('pt-BR', options);
  };
  
  const getStatusClass = (status) => {
    const map = {
      aberto: 'status-aberto',
      pendente: 'status-pendente',
      concluido: 'status-concluido',
    };
    return map[status] || 'status-fechado';
  };
  
  const formatCategory = (categoria) => {
    if (!categoria) return '-';
    return categoria.charAt(0).toUpperCase() + categoria.slice(1);
  };

  if (loading) {
    return <p>Carregando ticket...</p>;
  }

  if (!ticket) {
    return <p>Ticket não encontrado.</p>;
  }

  return (
    <div className="ticket-details-container">
      <Link to={getHomeLink()} className="back-link">
        <FaArrowLeft /> Voltar para o Dashboard
      </Link>

      <div className="ticket-grid">
        <div className="ticket-main-content">
          <header className="ticket-header card">
            <div className="ticket-header-top">
              <span className={`status ${getStatusClass(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className="ticket-category-badge">
                <FaTag /> {formatCategory(ticket.categoria)}
              </span>
            </div>
            <h2>{ticket.titulo}</h2>
            <p>
              Aberto por <strong>{ticket.nome_usuario}</strong> em {formatDate(ticket.data_criacao)}
            </p>
          </header>

          <div className="ticket-chat card">
            <div className="ticket-description">
              <strong>Descrição Original:</strong>
              <p>{ticket.descricao}</p>
            </div>
            
            <div className="messages-list">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-bubble ${
                    msg.usuario_id === user.id ? 'message-own' : 'message-other'
                  }`}
                >
                  <div className="message-sender">
                    {msg.tipo_usuario === 'suporte' ? <FaUserShield /> : <FaUserCircle />}
                    <strong>{msg.nome_usuario}</strong>
                    <span>{formatDate(msg.data_envio)}</span>
                  </div>
                  <p>{msg.mensagem}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="ticket-reply card">
            <h3>Responder</h3>
            <form onSubmit={handleSendMessage}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                rows="5"
                required
              ></textarea>
              <button type="submit" className="btn-principal" disabled={isSubmitting}>
                <FaPaperPlane /> Enviar Resposta
              </button>
            </form>
          </div>
        </div>

        <aside className="ticket-sidebar">
          {isSupport && (
            <div className="support-controls card">
              <h3>Painel de Controle</h3>
              <div className="form-group">
                <label htmlFor="status">Alterar Status</label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="aberto">Aberto</option>
                  <option value="pendente">Pendente</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="priority">Alterar Prioridade</label>
                <select
                  id="priority"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              <button
                className="btn-principal"
                onClick={handleUpdateTicket}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          )}

          <div className="attachments-list card">
            <h3>Anexos</h3>
            {attachments.length > 0 ? (
              <ul>
                {attachments.map((file) => (
                  <li key={file.id}>
                    <FaFileAlt />
                    <a
                      href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${file.caminho}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={file.nome_arquivo}
                    >
                      {file.nome_arquivo}
                    </a>
                    <a
                      href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${file.caminho}`}
                      download={file.nome_arquivo}
                      className="download-icon"
                    >
                      <FaDownload />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum anexo encontrado.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TicketDetails;