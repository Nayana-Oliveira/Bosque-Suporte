import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const setAuthData = (data) => {
    if (data && data.accessToken && data.user) {
      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
      setUser(data.user);
    } else {
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const loadUserOnMount = useCallback(async () => {
    try {
      const { data } = await api.post('/auth/refresh');
      setAuthData(data);
    } catch (error) {
      console.log('Não foi possível atualizar a sessão.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserOnMount();
  }, [loadUserOnMount]);

  const login = async (email, senha) => {
    try {
      const { data } = await api.post('/auth/login', { email, senha });
      setAuthData(data);
      toast.success('Login realizado com sucesso!');

      if (data.user.tipo === 'suporte') {
        navigate('/dashboard-suporte');
      } else {
        navigate('/dashboard-usuario');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error(error.response?.data?.message || 'Email ou senha inválidos.');
      setAuthData(null);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setAuthData(null);
      navigate('/login');
      toast.success('Logout realizado com sucesso.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};