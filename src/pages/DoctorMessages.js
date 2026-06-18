import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useResponsive } from '../hooks/useResponsive';
import api from '../services/api';
import { io } from 'socket.io-client';

const COLORS = {
  navy: '#0A1628',
  card: '#0F1E35',
  teal: '#0B8F8F',
  mint: '#0DD6C8',
  text: '#FFFFFF',
  muted: '#7A9EAE',
};

function formatTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
}

export default function DoctorMessages({ doctorId, onLogout }) {
  const { isMobile } = useResponsive();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const listRef = useRef(null);
  const socketRef = useRef(null);
  const selectedConvRef = useRef(selectedConv);
  const [toast, setToast] = useState(null);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/doctors/${doctorId}/conversations`);
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  function showToast(title, body, type = 'info') {
    setToast({ title, body, type });
    setTimeout(() => setToast(null), 4000);
  }

  // Keep a ref of selected conversation to avoid stale closures in socket handlers
  useEffect(() => { selectedConvRef.current = selectedConv; }, [selectedConv]);

  // Initialize socket connection
  useEffect(() => {
    const SOCKET_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
    const token = localStorage.getItem('doctor_token');
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected', socket.id);
    });

    socket.on('new_message', (msg) => {
      // If message belongs to currently open conversation, dedupe and append it
      if (msg?.conversation_id && selectedConvRef.current && String(msg.conversation_id) === String(selectedConvRef.current.id)) {
        setMessages(prev => {
          // deduplicate by id
          if (prev.some(m => String(m.id) === String(msg.id))) return prev;
          const next = [...prev, msg];
          // cache to localStorage
          try {
            localStorage.setItem(`messages_${selectedConvRef.current.id}`, JSON.stringify(next));
          } catch (e) { /* ignore */ }
          return next;
        });
        setTimeout(() => scrollToBottom(), 50);
        return;
      }
      // Otherwise refresh conversation list to reflect unread counts / last message
      loadConversations();
      showToast('New message', msg.text || 'You have a new message');
    });

    socket.on('joined_window', () => {
      // no-op for now
    });

    socket.on('error', (e) => {
      console.warn('Socket error', e);
    });

    return () => {
      try { socket.disconnect(); } catch (e) { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const patientId = params.get('patientId');
    if (patientId && conversations.length > 0) {
      // try to find existing conv or start a new one
      const found = conversations.find(c => c.patient_id === patientId || String(c.patient_id) === String(patientId));
      if (found) selectConversation(found);
      else createConversationForPatient(patientId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, conversations]);

  async function loadMessages(convId) {
    try {
      // check cache first
      const cached = localStorage.getItem(`messages_${convId}`);
      if (cached) {
        setMessages(JSON.parse(cached));
        setTimeout(() => scrollToBottom(), 50);
      }
      // fetch fresh messages
      const res = await api.get(`/api/conversations/${convId}/messages`);
      const msgs = res.data.messages || [];
      setMessages(msgs);
      // cache for next time
      localStorage.setItem(`messages_${convId}`, JSON.stringify(msgs));
      setTimeout(() => scrollToBottom(), 50);
    } catch (err) {
      console.error('Failed to load messages', err);
      setMessages([]);
    }
  }

  async function selectConversation(conv) {
    setSelectedConv(conv);
    await loadMessages(conv.id);
    // Ask server to join socket room for this window so we get live updates
    try {
      socketRef.current?.emit('join_window', { windowId: conv.id });
    } catch (e) {
      // ignore
    }
  }

  async function createConversationForPatient(patientId) {
    try {
      const res = await api.post('/api/conversations', { patient_id: patientId, doctor_id: doctorId });
      const conv = res.data.conversation;
      if (conv) {
        setConversations(prev => [conv, ...prev]);
        selectConversation(conv);
        navigate('/messages');
      }
    } catch (err) {
      console.error('Failed to create conversation', err);
    }
  }

  async function sendMessage(e) {
    e?.preventDefault();
    if (!text.trim() || !selectedConv) return;
    const payload = { text: text.trim(), sender: 'doctor' };
    try {
      // optimistic
      const optimistic = { id: `temp-${Date.now()}`, text: text.trim(), sender: 'doctor', created_at: new Date().toISOString() };
      setMessages(prev => {
        if (prev.some(m => m.id === optimistic.id)) return prev;
        const next = [...prev, optimistic];
        localStorage.setItem(`messages_${selectedConv.id}`, JSON.stringify(next));
        return next;
      });
      setText('');
      scrollToBottom();
      const res = await api.post(`/api/conversations/${selectedConv.id}/messages`, payload);
      // replace optimistic if backend returned message
      if (res.data.message) {
        setMessages(prev => {
          const next = prev.map(m => m.id === optimistic.id ? res.data.message : m);
          localStorage.setItem(`messages_${selectedConv.id}`, JSON.stringify(next));
          return next;
        });
        showToast('Sent', 'Message delivered');
      } else {
        await loadMessages(selectedConv.id);
      }
    } catch (err) {
      console.error('Send failed', err);
    }
  }

  function scrollToBottom() {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.navy, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Navbar currentPage="messages" onLogout={onLogout} />
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '12px' : '40px 20px' }}>
        <h1 style={{ color: COLORS.text, fontSize: '28px', margin: 0 }}>Messages</h1>
        <p style={{ color: COLORS.muted, marginTop: '8px' }}>Communicate with patients. Chat history is persisted.</p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{ width: isMobile ? '100%' : '320px', backgroundColor: COLORS.card, border: `1px solid ${COLORS.teal}`, borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '12px', borderBottom: `1px solid ${COLORS.navy}`, fontWeight: 700, color: COLORS.mint }}>Conversations</div>
            <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
              {loading ? <div style={{ padding: 12, color: COLORS.muted }}>Loading...</div> : (
                conversations.length === 0 ? <div style={{ padding: 12, color: COLORS.muted }}>No conversations yet</div> : (
                  conversations.map(conv => (
                    <div key={conv.id} onClick={() => selectConversation(conv)} style={{ padding: 12, borderBottom: `1px solid ${COLORS.navy}`, cursor: 'pointer', backgroundColor: selectedConv?.id === conv.id ? 'rgba(13,143,143,0.06)' : 'transparent' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, color: COLORS.text }}>{conv.patient_name || `Patient ${String(conv.patient_id).slice(0,8)}`}</div>
                        <div style={{ color: COLORS.muted, fontSize: 12 }}>{conv.unread_count > 0 ? `${conv.unread_count}` : ''}</div>
                      </div>
                      <div style={{ color: COLORS.muted, marginTop: 6, fontSize: 13 }}>{conv.last_message?.text?.slice(0,60) || 'No messages yet'}</div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          <div style={{ flex: 1, backgroundColor: COLORS.card, border: `1px solid ${COLORS.teal}`, borderRadius: '12px', display: 'flex', flexDirection: 'column', minHeight: '60vh' }}>
            <div style={{ padding: '12px', borderBottom: `1px solid ${COLORS.navy}`, color: COLORS.text, fontWeight: 700 }}>{selectedConv ? (selectedConv.patient_name || `Patient ${String(selectedConv.patient_id).slice(0,8)}`) : 'Select a conversation'}</div>

            <div ref={listRef} style={{ padding: '12px', overflow: 'auto', flex: 1 }}>
              {selectedConv ? (
                messages.length === 0 ? <div style={{ color: COLORS.muted }}>No messages. Say hello 👋</div> : (
                  messages.map((m) => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'doctor' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                      <div style={{ maxWidth: '72%', backgroundColor: m.sender === 'doctor' ? COLORS.mint : COLORS.navy, color: m.sender === 'doctor' ? COLORS.navy : COLORS.text, padding: '8px 12px', borderRadius: 12 }}>
                        <div style={{ fontSize: 14 }}>{m.text}</div>
                        <div style={{ fontSize: 11, color: m.sender === 'doctor' ? '#052' : COLORS.muted, marginTop: 6, textAlign: 'right' }}>{formatTime(m.created_at)}</div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <div style={{ color: COLORS.muted }}>Pick a conversation to view messages</div>
              )}
            </div>

            <form onSubmit={sendMessage} style={{ padding: '12px', borderTop: `1px solid ${COLORS.navy}`, display: 'flex', gap: 8 }}>
              <input value={text} onChange={e => setText(e.target.value)} placeholder={selectedConv ? 'Type a message...' : 'Select a conversation'} disabled={!selectedConv} style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'transparent', color: COLORS.text }} />
              <button type="submit" disabled={!selectedConv || !text.trim()} style={{ backgroundColor: COLORS.teal, border: 'none', color: COLORS.navy, padding: '10px 14px', borderRadius: 8, fontWeight: 700 }}>Send</button>
            </form>
          </div>
        </div>
      </div>
      {toast && (
        <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 9999 }}>
          <div style={{ backgroundColor: toast.type === 'error' ? '#EF4444' : '#0DD6C8', color: '#052', padding: '12px 16px', borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.25)', minWidth: 200 }}>
            <div style={{ fontWeight: 800 }}>{toast.title}</div>
            <div style={{ fontSize: 13, marginTop: 4, color: '#052' }}>{toast.body}</div>
          </div>
        </div>
      )}
    </div>
  );
}
