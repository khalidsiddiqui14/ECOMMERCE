import { useCallback, useEffect, useMemo, useState } from "react";
import { getNotifications, markNotificationRead } from "../services/notificationService";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const data = await getNotifications();
      const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      setNotifications(list);
    } catch (err) {
      console.error("NOTIFICATIONS ERROR:", err);
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || "Notifications load nahi ho paayi.");
    } finally {
      if (isRefresh) setRefreshing(false); else setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications]);

  const handleMarkRead = async (notification) => {
    if (!notification?.id || notification.is_read || markingId === notification.id || markingAll) return;
    setMarkingId(notification.id);
    setError("");
    try {
      const updated = await markNotificationRead(notification.id);
      setNotifications(prev => prev.map(item => item.id === notification.id ? { ...item, ...updated, is_read: true } : item));
    } catch (err) {
      setError(err.response?.data?.detail || "Notification read mark nahi ho paayi.");
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) return;
    setMarkingAll(true);
    setError("");
    try {
      const results = await Promise.allSettled(unread.map(n => markNotificationRead(n.id)));
      const ok = new Set();
      results.forEach((r,i)=>{ if (r.status==="fulfilled") ok.add(unread[i].id); });
      setNotifications(prev => prev.map(n => ok.has(n.id) ? { ...n, is_read: true } : n));
      if (ok.size !== unread.length) setError("Some notifications could not be marked as read.");
    } catch {
      setError("Notifications mark as read nahi ho paayi.");
    } finally {
      setMarkingAll(false);
    }
  };

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "success": return "✓";
      case "warning": return "!";
      case "error": return "×";
      case "order": return "📦";
      case "delivery": return "🚚";
      default: return "🔔";
    }
  };

  const getColor = (type) => {
    switch (type?.toLowerCase()) {
      case "success": return {bg:'#f0fdf4',bd:'#bbf7d0',dot:'#22c55e'};
      case "warning": return {bg:'#fffbeb',bd:'#fde68a',dot:'#f59e0b'};
      case "error": return {bg:'#fef2f2',bd:'#fecaca',dot:'#ef4444'};
      case "order": return {bg:'#eff6ff',bd:'#bfdbfe',dot:'#3b82f6'};
      default: return {bg:'#fafaf7',bd:'#ece8de',dot:'#8c8881'};
    }
  };

  const formatDate = (createdAt) => {
    if (!createdAt) return "";
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return "";
    const now = new Date();
    const diffMs = now - d;
    const mins = Math.floor(diffMs/60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins/60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs/24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
  };

  if (loading) {
    return (
      <main className="notifications-page" style={{minHeight:'100vh',background:'#fafaf7',padding:'32px 24px'}}>
        <div style={{maxWidth:720,margin:'0 auto',display:'flex',flexDirection:'column',gap:12}}>
          {[1,2,3,4,5].map(i=>(<div key={i} style={{height:88,background:'#fff',border:'1px solid #ece8de',borderRadius:16,animation:'pulse 1.5s infinite'}} />))}
        </div>
      </main>
    );
  }

  return (
    <main className="notifications-page" style={{minHeight:'100vh',background:'#fafaf7',padding:'32px 24px'}}>
      <div className="notifications-container" style={{maxWidth:720,margin:'0 auto'}}>
        {/* Header */}
        <div className="notifications-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:24,flexWrap:'wrap',gap:16}}>
          <div>
            <h1 style={{margin:'0 0 8px',fontSize:'clamp(28px,4vw,36px)',fontWeight:900,letterSpacing:'-.03em',color:'#1a1816',display:'flex',alignItems:'center',gap:12}}>
              Notifications
              {unreadCount>0 && <span style={{minWidth:28,height:28,padding:'0 8px',display:'inline-flex',alignItems:'center',justifyContent:'center',background:'#1a1816',color:'#fff',borderRadius:999,fontSize:12,fontWeight:800}}>{unreadCount}</span>}
            </h1>
            <p style={{margin:0,color:'#8c8881',fontSize:14}}>{unreadCount>0 ? `${unreadCount} unread notification${unreadCount===1?'':'s'} • Stay updated` : "You're all caught up. ✓"}</p>
          </div>
          <div style={{display:'flex',gap:8}}>
            {unreadCount>0 && (
              <button type="button" onClick={handleMarkAllRead} disabled={markingAll}
                style={{minHeight:40,padding:'0 16px',borderRadius:999,border:'1px solid #1a1816',background:'#1a1816',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',opacity: markingAll ? .6 : 1}}>
                {markingAll ? 'Marking...' : 'Mark all as read ✓'}
              </button>
            )}
            <button type="button" onClick={()=>loadNotifications(true)} disabled={refreshing}
              style={{minHeight:40,padding:'0 16px',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}}>
              {refreshing ? '...' : '↻ Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" style={{display:'flex',gap:10,padding:'12px 14px',marginBottom:16,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,color:'#991b1b',fontSize:13,fontWeight:600}}>
            ⚠️ {error}
          </div>
        )}

        {notifications.length===0 ? (
          <div style={{textAlign:'center',padding:'80px 32px',background:'#fff',border:'1px solid #ece8de',borderRadius:24}}>
            <div style={{width:72,height:72,margin:'0 auto 16px',display:'grid',placeItems:'center',background:'#fafaf7',border:'1px solid #ece8de',borderRadius:'50%',fontSize:32}}>🔔</div>
            <h2 style={{margin:'0 0 8px',fontSize:20,fontWeight:900}}>No Notifications</h2>
            <p style={{margin:'0 0 20px',color:'#8c8881',fontSize:13}}>You don't have any notifications yet. We'll notify you when something happens.</p>
            <button type="button" onClick={()=>loadNotifications(true)} disabled={refreshing}
              style={{minHeight:42,padding:'0 20px',borderRadius:999,background:'#1a1816',color:'#fff',border:0,fontWeight:700,fontSize:13,cursor:'pointer'}}>
              {refreshing ? 'Refreshing...' : 'Refresh →'}
            </button>
          </div>
        ) : (
          <div className="notifications-list" style={{display:'flex',flexDirection:'column',gap:12}}>
            {notifications.map((n, idx)=>{
              const type = (n.type || "info").toLowerCase();
              const isUnread = !n.is_read;
              const isMarking = markingId===n.id;
              const col = getColor(type);
              return (
                <article key={n.id} className={`notification-card notification-${type} ${isUnread ? 'notification-unread' : 'notification-read'}`}
                  style={{
                    display:'flex',gap:14,padding:16,background: isUnread ? '#fff' : '#fafaf7',
                    border:`1px solid ${isUnread ? '#ece8de' : '#f1eee8'}`,borderRadius:16,
                    boxShadow: isUnread ? '0 2px 10px rgba(0,0,0,.04)' : 'none',
                    position:'relative',overflow:'hidden',transition:'.2s',
                    animation:`fadeIn .3s both`,animationDelay:`${idx*40}ms`
                  }}>
                  {isUnread && <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:col.dot}} />}

                  <div className="notification-icon" style={{
                    width:44,height:44,flexShrink:0,borderRadius:12,display:'grid',placeItems:'center',
                    background:col.bg,border:`1px solid ${col.bd}`,fontSize:18,fontWeight:800,color:col.dot
                  }}>
                    {getIcon(type)}
                  </div>

                  <div className="notification-content" style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                      <h3 style={{margin:0,fontSize:14,fontWeight:800,color:'#1a1816',lineHeight:1.3}}>{n.title || "Notification"}</h3>
                      {isUnread && <span style={{width:6,height:6,borderRadius:'50%',background:col.dot,display:'inline-block',boxShadow:`0 0 0 3px ${col.bg}`}} />}
                      <time dateTime={n.created_at} style={{fontSize:11,color:'#b8b3a9',fontWeight:600,marginLeft:'auto'}}>{formatDate(n.created_at)}</time>
                    </div>
                    <p style={{margin:'6px 0 0',fontSize:13,color:'#3d3935',lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                      {n.message || "You have a new notification."}
                    </p>
                  </div>

                  {isUnread && (
                    <div className="notification-actions" style={{display:'flex',alignItems:'center'}}>
                      <button type="button" onClick={()=>handleMarkRead(n)} disabled={isMarking || markingAll}
                        style={{
                          minHeight:32,padding:'0 12px',borderRadius:999,border:'1px solid #ece8de',
                          background:'#fff',fontSize:11,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',
                          opacity: isMarking ? .6 : 1,transition:'.2s'
                        }}>
                        {isMarking ? '...' : 'Mark read'}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {notifications.length>0 && (
          <div style={{textAlign:'center',marginTop:20,fontSize:11,color:'#b8b3a9',fontWeight:600}}>
            {notifications.length} notifications • {unreadCount} unread
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1} 50%{opacity:.6}}
      `}</style>
    </main>
  );
}

export default Notifications;