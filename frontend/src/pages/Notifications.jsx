import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
      const list = Array.isArray(data)? data : Array.isArray(data?.results)? data.results : data?.notifications || [];
      setNotifications(Array.isArray(list)? list : []);
    } catch (err) {
      console.error("NOTIFICATIONS ERROR:", err);
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || "Notifications load failed.");
    } finally {
      if (isRefresh) setRefreshing(false); else setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const unreadCount = useMemo(() => notifications.filter(n =>!n.is_read).length, [notifications]);

  const handleMarkRead = async (notification) => {
    if (!notification?.id || notification.is_read || markingId === notification.id || markingAll) return;
    setMarkingId(notification.id);
    setError("");
    try {
      const updated = await markNotificationRead(notification.id);
      setNotifications(prev => prev.map(item => item.id === notification.id? {...item,...updated, is_read: true } : item));
      window.dispatchEvent(new Event("notifications-change"));
    } catch (err) {
      setError(err.response?.data?.detail || "Mark as read failed.");
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n =>!n.is_read);
    if (unread.length === 0) return;
    setMarkingAll(true);
    setError("");
    try {
      const results = await Promise.allSettled(unread.map(n => markNotificationRead(n.id)));
      const ok = new Set();
      results.forEach((r,i)=>{ if (r.status==="fulfilled") ok.add(unread[i].id); });
      setNotifications(prev => prev.map(n => ok.has(n.id)? {...n, is_read: true } : n));
      window.dispatchEvent(new Event("notifications-change"));
      if (ok.size!== unread.length) setError(`${unread.length - ok.size} notifications could not be marked.`);
    } catch {
      setError("Mark all as read failed.");
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
      case "payment": return "💳";
      case "offer": return "🏷️";
      default: return "🔔";
    }
  };

  const getColor = (type) => {
    switch (type?.toLowerCase()) {
      case "success": return {bg:'#f0fdf4',bd:'#bbf7d0',dot:'#067D62'};
      case "warning": return {bg:'#fffbeb',bd:'#fde68a',dot:'#e47911'};
      case "error": return {bg:'#fef2f2',bd:'#fecaca',dot:'#CC0C39'};
      case "order": return {bg:'#eff6ff',bd:'#bfdbfe',dot:'#0066c0'};
      case "delivery": return {bg:'#f0fdf4',bd:'#bbf7d0',dot:'#067D62'};
      case "payment": return {bg:'#fef8f2',bd:'#f0e6d8',dot:'#e47911'};
      default: return {bg:'#f7fafa',bd:'#d5d9d9',dot:'#565959'};
    }
  };

  const formatDate = (createdAt) => {
    if (!createdAt) return "";
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return String(createdAt).slice(0,16);
    const now = new Date();
    const diffMs = now - d;
    const mins = Math.floor(diffMs/60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins/60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs/24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
  };

  if (loading) {
    return (
      <div className="bg-[#EAEDED] min-h-screen p-4">
        <div className="max-w- mx-auto flex flex-col gap-2">
          {[1,2,3,4,5].map(i=>(<div key={i} className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EAEDED] min-h-screen py-2">
      <div className="max-w- mx-auto px-2">
        <div className="bg-white border border-[#d5d9d9] rounded- p-4 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text- font-medium flex items-center gap-2 text-[#0F1111]">
              Notifications
              {unreadCount>0 && <span className="bg-[#f08804] text-white text- px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
              <span className="text- font-normal text-[#565959] ml-2">{notifications.length} total</span>
            </h1>
            <p className="text- text-[#565959] mt-1">{unreadCount>0? `${unreadCount} unread • Stay updated on orders, delivery, offers` : "You're all caught up. ✓ No new notifications"}</p>
          </div>
          <div className="flex gap-2">
            {unreadCount>0 && (
              <button onClick={handleMarkAllRead} disabled={markingAll} className="h-8 px-3 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded- text- font-medium shadow-sm disabled:opacity-50">
                {markingAll? 'Marking...' : `Mark all read (${unreadCount})`}
              </button>
            )}
            <button onClick={()=>loadNotifications(true)} disabled={refreshing} className="h-8 px-3 bg-white border border-[#d5d9d9] rounded- text- shadow-sm hover:bg-[#f7fafa] disabled:opacity-50">
              {refreshing? '...' : '↻ Refresh'}
            </button>
          </div>
        </div>

        {error && <div className="mt-2 bg-white border-l- border-[#c40000] p-3 text- text-[#c40000] shadow-sm rounded- flex justify-between">⚠ {error} <button onClick={()=>setError("")} className="text-[#0066c0] font-bold">Dismiss</button></div>}

        {notifications.length===0? (
          <div className="mt-2 bg-white border border-[#d5d9d9] rounded- p-10 text-center shadow-sm">
            <div className="text- mb-3">🔔</div>
            <h2 className="text- font-bold">No Notifications</h2>
            <p className="text- text-[#565959] mt-1">You don't have any notifications yet. Orders, delivery updates, and offers will appear here.</p>
            <div className="flex gap-2 justify-center mt-4">
              <button onClick={()=>loadNotifications(true)} disabled={refreshing} className="h-8 px-4 bg-[#FFD814] border border-[#FCD200] rounded- text- shadow-sm font-bold">
                Refresh
              </button>
              <Link to="/orders" className="h-8 px-4 bg-white border border-[#d5d9d9] rounded- text- grid place-items-center">View Orders</Link>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {notifications.map((n)=>{
              const type = (n.type || "info").toLowerCase();
              const isUnread =!n.is_read;
              const isMarking = markingId===n.id;
              const col = getColor(type);
              return (
                <div key={n.id} className={`bg-white border rounded- p-3 flex gap-3 shadow-sm hover:shadow-md transition ${isUnread? 'border-l- border-l-[#e77600] border-[#e77600]/30 bg-[#fef8f2]/30' : 'border-[#d5d9d9]'}`}>
                  <div className="w-10 h-10 rounded-full grid place-items-center text- shrink-0 font-bold" style={{background:col.bg, border:`1px solid ${col.bd}`, color:col.dot}}>
                    {getIcon(type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text- font-bold text-[#0F1111]">{n.title || "Notification"}</h3>
                      {isUnread && <span className="w-2 h-2 rounded-full bg-[#f08804] animate-pulse" />}
                      <span className="text- px-1.5 py-0.5 bg-[#f0f2f2] border border-[#d5d9d9] rounded-full uppercase">{type}</span>
                      <span className="text- text-[#767676] ml-auto">{formatDate(n.created_at || n.createdAt)}</span>
                    </div>
                    <p className="text- text-[#0F1111] mt-1 leading- line-clamp-2">{n.message || n.body || "You have a new notification."}</p>
                    {n.order_id && <Link to={`/orders/${n.order_id}`} className="text- text-[#0066c0] hover:underline mt-1 inline-block">View Order #{n.order_id} →</Link>}
                  </div>
                  {isUnread && (
                    <button onClick={()=>handleMarkRead(n)} disabled={isMarking || markingAll} className="h-7 px-2.5 bg-white border border-[#d5d9d9] rounded- text- shadow-sm self-center hover:bg-[#f7fafa] disabled:opacity-50">
                      {isMarking? '...' : 'Mark read'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 bg-white border border-[#d5d9d9] rounded- p-3 text- text-[#565959] leading-">
          <b>Tips:</b> Enable browser notifications • Prime members get early access to deals • Order updates via SMS • Manage in <Link to="/settings" className="text-[#0066c0] hover:underline">Settings → Notifications</Link>
        </div>
      </div>
    </div>
  );
}

export default Notifications;