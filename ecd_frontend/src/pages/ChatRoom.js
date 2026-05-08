import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import ParentSidebar from '../components/ParentSidebar';

// helpers
const isTeacherRole = (role) =>
  (role || '').toString().trim().toLowerCase() === 'teacher';

const toRoomParticipant = (userId) => `user:${userId}`;

const makeRoom = (userIdA, userIdB) => [toRoomParticipant(userIdA), toRoomParticipant(userIdB)].sort().join('||');

const getLastSeenStorageKey = (userId) => `chat_last_seen_${userId}`;

const readLastSeenMap = (userId) => {
  if (!userId) return {};

  try {
    return JSON.parse(localStorage.getItem(getLastSeenStorageKey(userId)) || '{}');
  } catch (_) {
    return {};
  }
};

const writeLastSeenMap = (userId, value) => {
  if (!userId) return;
  localStorage.setItem(getLastSeenStorageKey(userId), JSON.stringify(value));
};

const formatTime = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString();
};

const roleBadge = (role) => {
  const r = (role || '').toLowerCase();
  if (r === 'teacher') return { bg: '#dbeafe', color: '#1d4ed8' };
  if (r === 'admin') return { bg: '#fee2e2', color: '#b91c1c' };
  return { bg: '#d1fae5', color: '#065f46' };
};

const avatarGradient = (role) => {
  const r = (role || '').toLowerCase();
  if (r === 'teacher') return 'linear-gradient(135deg,#3b82f6,#6366f1)';
  if (r === 'admin') return 'linear-gradient(135deg,#ef4444,#f97316)';
  return 'linear-gradient(135deg,#10b981,#34d399)';
};

const nameInitials = (name) =>
  (name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const ChatRoom = () => {
  const navigate = useNavigate();

  const [me, setMe] = useState({ id: null, first_name: '', last_name: '', role: 'Parent' });
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});

  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);
  const unreadPollingRef = useRef(null);
  const lastMsgCountRef = useRef(0);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setMe({ id: u.id ?? null, first_name: u.first_name || '', last_name: u.last_name || '', role: u.role || 'Parent' });
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    if (!me.role || !me.id) return;
    const oppositeRole = isTeacherRole(me.role) ? 'PARENT' : 'TEACHER';
    setContactsLoading(true);
    API.get(`user_profiles/?role=${oppositeRole}`)
      .then((res) => {
        const list = (res.data || [])
          .map((p) => {
            const u = p.user || {};
            const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim();
            if (!fullName || !u.id || u.id === me.id || u.is_active === false) {
              return null;
            }

            return {
              userId: u.id,
              name: fullName,
              role: p.role,
              room: makeRoom(me.id, u.id),
            };
          })
          .filter(Boolean);
        setContacts(Array.from(new Map(list.map((contact) => [contact.userId, contact])).values()));
      })
      .catch(() => setContacts([]))
      .finally(() => setContactsLoading(false));
  }, [me.id, me.role]);

  const myFullName = `${me.first_name} ${me.last_name}`.trim() || 'User';

  const markRoomAsSeen = useCallback((room, roomMessages) => {
    if (!me.id || !roomMessages.length) return;

    const latestMessageId = roomMessages[roomMessages.length - 1]?.id;
    if (!latestMessageId) return;

    const lastSeenMap = readLastSeenMap(me.id);
    if ((lastSeenMap[room] || 0) < latestMessageId) {
      writeLastSeenMap(me.id, { ...lastSeenMap, [room]: latestMessageId });
    }

    setUnreadCounts((prev) => (prev[room] ? { ...prev, [room]: 0 } : prev));
  }, [me.id]);

  const refreshUnreadCounts = useCallback(async () => {
    if (!me.id) return;

    try {
      const res = await API.get(`chat_messages/?participant=${encodeURIComponent(toRoomParticipant(me.id))}`);
      const groupedMessages = (res.data || []).reduce((acc, msg) => {
        (acc[msg.room] = acc[msg.room] || []).push(msg);
        return acc;
      }, {});
      const lastSeenMap = readLastSeenMap(me.id);
      const nextUnreadCounts = {};

      Object.entries(groupedMessages).forEach(([room, roomMessages]) => {
        const lastSeenId = lastSeenMap[room] || 0;
        const unread = roomMessages.filter((msg) => msg.sender_name !== myFullName && msg.id > lastSeenId).length;
        if (unread > 0) {
          nextUnreadCounts[room] = unread;
        }
      });

      setUnreadCounts(nextUnreadCounts);
    } catch (_) {}
  }, [me.id, myFullName]);

  const fetchMessages = useCallback(async () => {
    if (!selectedContact) return;
    const room = selectedContact.room;
    try {
      const res = await API.get(`chat_messages/?room=${encodeURIComponent(room)}`);
      const data = res.data || [];
      if (data.length !== lastMsgCountRef.current) {
        setMessages(data);
        lastMsgCountRef.current = data.length;
      }
      markRoomAsSeen(room, data);
    } catch (_) {}
  }, [selectedContact, markRoomAsSeen]);

  useEffect(() => {
    if (!selectedContact) return;
    lastMsgCountRef.current = 0;
    setMessages([]);
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(pollingRef.current);
  }, [selectedContact, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!me.id) return undefined;

    refreshUnreadCounts();
    unreadPollingRef.current = setInterval(refreshUnreadCounts, 3000);

    return () => clearInterval(unreadPollingRef.current);
  }, [me.id, refreshUnreadCounts]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !selectedContact) return;
    const room = selectedContact.room;
    setSending(true);
    try {
      await API.post('chat_messages/', {
        sender_name: myFullName,
        sender_role: me.role,
        receiver_name: selectedContact.name,
        room,
        message: text,
      });
      setInput('');
      await fetchMessages();
      await refreshUnreadCounts();
    } catch (_) {} finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const teacher = isTeacherRole(me.role);
  const myInitials = `${me.first_name?.[0] || '?'}${me.last_name?.[0] || ''}`.toUpperCase();
  const oppositeLabel = teacher ? 'Parents' : 'Teachers';

  const grouped = messages.reduce((acc, msg) => {
    const key = formatDate(msg.timestamp);
    (acc[key] = acc[key] || []).push(msg);
    return acc;
  }, {});

  const S = {
    layout: { display: 'grid', gridTemplateColumns: teacher ? '240px 1fr' : '220px 1fr', minHeight: '100vh', background: '#f7f8fc' },
    tSidebar: { background: '#fff', borderRight: '1px solid #e5e7eb', padding: '20px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'sticky', top: 0, height: '100vh' },
    logoBox: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', marginBottom: 32 },
    logoIcon: { width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#a855f7,#d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 },
    logoText: { fontWeight: 700, fontSize: 18, color: '#111827' },
    navItem: (active) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, cursor: 'pointer', color: active ? '#7c3aed' : '#374151', background: active ? '#f3e8ff' : 'transparent', fontWeight: active ? 700 : 500, marginBottom: 4, transition: 'all 0.2s' }),
    iconSt: { width: 20, textAlign: 'center' },
    userSec: { borderTop: '1px solid #e5e7eb', paddingTop: 16, marginTop: 'auto' },
    userProf: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f9fafb', borderRadius: 12 },
    userAv: { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#a855f7,#d946ef)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
    main: { display: 'flex', height: '100vh', overflow: 'hidden' },
    contactsPanel: { width: 280, borderRight: '1px solid #e5e7eb', background: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0 },
    contactsHeader: { padding: '20px 20px 14px', borderBottom: '1px solid #e5e7eb' },
    contactsTitle: { fontSize: 16, fontWeight: 700, color: '#111827' },
    contactsSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    contactItem: (active) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer', background: active ? '#faf5ff' : 'transparent', borderLeft: active ? '3px solid #a855f7' : '3px solid transparent', transition: 'all 0.15s' }),
    contactAvatar: (role) => ({ width: 42, height: 42, borderRadius: '50%', background: avatarGradient(role), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }),
    contactName: { fontSize: 14, fontWeight: 600, color: '#111827' },
    contactRole: (role) => ({ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: roleBadge(role).bg, color: roleBadge(role).color, textTransform: 'uppercase', marginTop: 3 }),
    unreadBadge: { marginLeft: 'auto', minWidth: 22, height: 22, borderRadius: 999, background: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 7px', flexShrink: 0 },
    convo: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    convoHeader: { padding: '16px 24px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 },
    convoTitle: { fontSize: 16, fontWeight: 700, color: '#111827' },
    convoSub: { fontSize: 12, color: '#6b7280' },
    messages: { flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 },
    inputBar: { padding: '14px 24px', background: '#fff', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0 },
    textarea: { flex: 1, padding: '11px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'none', lineHeight: 1.5, maxHeight: 100, overflowY: 'auto', background: '#f9fafb', color: '#1f2937' },
    sendBtn: (disabled) => ({ width: 44, height: 44, borderRadius: 12, border: 'none', background: disabled ? '#e5e7eb' : 'linear-gradient(135deg,#a855f7,#d946ef)', color: disabled ? '#9ca3af' : '#fff', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: disabled ? 'none' : '0 4px 14px rgba(168,85,247,0.4)' }),
    empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', gap: 8 },
    dateDivider: { display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' },
    dateLine: { flex: 1, height: 1, background: '#e5e7eb' },
    dateLabel: { fontSize: 11, color: '#9ca3af', fontWeight: 600, whiteSpace: 'nowrap' },
    bubbleRow: (own) => ({ display: 'flex', flexDirection: own ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 }),
    avStyle: (role) => ({ width: 32, height: 32, borderRadius: '50%', background: avatarGradient(role), color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
    bubbleText: (own) => ({ background: own ? 'linear-gradient(135deg,#a855f7,#d946ef)' : '#fff', color: own ? '#fff' : '#1f2937', padding: '10px 14px', borderRadius: own ? '18px 4px 18px 18px' : '4px 18px 18px 18px', fontSize: 14, lineHeight: 1.5, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: own ? 'none' : '1px solid #e5e7eb', wordBreak: 'break-word' }),
    bubbleMeta: (own) => ({ fontSize: 11, color: '#9ca3af', marginTop: 3, textAlign: own ? 'right' : 'left' }),
    senderLabel: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 },
    senderName: { fontSize: 12, fontWeight: 600, color: '#374151' },
  };

  return (
    <div style={S.layout}>
      {teacher ? (
        <aside style={S.tSidebar}>
          <div>
            <div style={S.logoBox}>
              <div style={S.logoIcon}>👶</div>
              <div style={S.logoText}>GrowTogether</div>
            </div>
            <div style={S.navItem(false)} onClick={() => navigate('/teacher_dashboard')}><span style={S.iconSt}>🏠</span> Dashboard</div>
            <div style={S.navItem(false)} onClick={() => navigate('/students')}><span style={S.iconSt}>👥</span> Students</div>
            <div style={S.navItem(false)} onClick={() => navigate('/e-library')}><span style={S.iconSt}>📚</span> E-Library</div>
            <div style={S.navItem(false)} onClick={() => navigate('/publish-results')}><span style={S.iconSt}>📊</span> Publish Results</div>
            <div style={S.navItem(true)}><span style={S.iconSt}>💬</span> Chat Room</div>
          </div>
          <div style={S.userSec}>
            <div style={S.userProf}>
              <div style={S.userAv}>{myInitials}</div>
              <div>
                <div style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{me.first_name} {me.last_name}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{me.role}</div>
              </div>
              <div style={{ marginLeft: 'auto', cursor: 'pointer', color: '#9ca3af', fontSize: 16 }} onClick={handleLogout}>↗</div>
            </div>
          </div>
        </aside>
      ) : (
        <ParentSidebar activeKey="chat" userInfo={me} onLogout={handleLogout} />
      )}

      <div style={S.main}>
        {/* Contacts list */}
        <div style={S.contactsPanel}>
          <div style={S.contactsHeader}>
            <div style={S.contactsTitle}>💬 Messages</div>
            <div style={S.contactsSub}>Select a {oppositeLabel.slice(0, -1).toLowerCase()} to chat with</div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {contactsLoading ? (
              <div style={{ padding: '30px 20px', color: '#9ca3af', textAlign: 'center', fontSize: 13 }}>Loading contacts…</div>
            ) : contacts.length === 0 ? (
              <div style={{ padding: '30px 20px', color: '#9ca3af', textAlign: 'center', fontSize: 13 }}>No {oppositeLabel.toLowerCase()} registered yet</div>
            ) : (
              contacts.map((c) => {
                const active = selectedContact?.name === c.name;
                const unreadCount = unreadCounts[c.room] || 0;
                return (
                  <div key={c.userId} style={S.contactItem(active)} onClick={() => setSelectedContact(c)}>
                    <div style={S.contactAvatar(c.role)}>{nameInitials(c.name)}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={S.contactName}>{c.name}</div>
                      <span style={S.contactRole(c.role)}>{c.role}</span>
                    </div>
                    {unreadCount > 0 && <div style={S.unreadBadge}>{unreadCount > 9 ? '9+' : unreadCount}</div>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Conversation */}
        <div style={S.convo}>
          {!selectedContact ? (
            <div style={S.empty}>
              <div style={{ fontSize: 52 }}>💬</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginTop: 8 }}>Select a conversation</div>
              <div style={{ fontSize: 13 }}>Choose a {oppositeLabel.slice(0, -1).toLowerCase()} from the list to start chatting</div>
            </div>
          ) : (
            <>
              <div style={S.convoHeader}>
                <div style={{ ...S.contactAvatar(selectedContact.role), width: 40, height: 40 }}>{nameInitials(selectedContact.name)}</div>
                <div>
                  <div style={S.convoTitle}>{selectedContact.name}</div>
                  <div style={S.convoSub}>{selectedContact.role} · Private conversation</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Live
                </div>
              </div>

              <div style={S.messages}>
                {messages.length === 0 && (
                  <div style={S.empty}>
                    <div style={{ fontSize: 40 }}>👋</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginTop: 8 }}>No messages yet</div>
                    <div style={{ fontSize: 13 }}>Say hello to {selectedContact.name}!</div>
                  </div>
                )}
                {Object.entries(grouped).map(([date, msgs]) => (
                  <React.Fragment key={date}>
                    <div style={S.dateDivider}>
                      <div style={S.dateLine} />
                      <span style={S.dateLabel}>{date}</span>
                      <div style={S.dateLine} />
                    </div>
                    {msgs.map((msg) => {
                      const own = msg.sender_name === myFullName;
                      return (
                        <div key={msg.id} style={S.bubbleRow(own)}>
                          <div style={S.avStyle(msg.sender_role)}>{nameInitials(msg.sender_name)}</div>
                          <div>
                            {!own && (
                              <div style={S.senderLabel}>
                                <span style={S.senderName}>{msg.sender_name}</span>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: roleBadge(msg.sender_role).bg, color: roleBadge(msg.sender_role).color, textTransform: 'uppercase' }}>{msg.sender_role}</span>
                              </div>
                            )}
                            <div style={S.bubbleText(own)}>{msg.message}</div>
                            <div style={S.bubbleMeta(own)}>{formatTime(msg.timestamp)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div style={S.inputBar}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selectedContact.name}…`}
                  rows={1}
                  style={S.textarea}
                  onFocus={(e) => { e.target.style.borderColor = '#a855f7'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                />
                <button onClick={handleSend} disabled={!input.trim() || sending} style={S.sendBtn(!input.trim() || sending)}>
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;