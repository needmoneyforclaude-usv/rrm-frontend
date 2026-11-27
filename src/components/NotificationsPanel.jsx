import {useEffect, useState} from 'react';
import {getNotifications, markAsRead} from '../api/notifications.js';
import {formatDateTime} from '../utils/format.js';

const REFRESH_MS = 30000;

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const load = () => {
    getNotifications().then(setNotifications).catch(() => null);
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  const unread = notifications.filter((n) => !n.is_read).length;

  const handleRead = async (notification) => {
    if (notification.is_read) {
      return;
    }
    await markAsRead(notification.id).catch(() => null);
    load();
  };

  return (
    <div className="notifications">
      <button
        type="button"
        className="btn btn-link notifications-button"
        onClick={() => {
          if (!open) {
            load();
          }
          setOpen(!open);
        }}
        aria-label="Notificari"
      >
        &#128276;
        {unread > 0 && <span className="notifications-count">{unread}</span>}
      </button>
      {open && (
        <div className="notifications-panel">
          <h3>Notificari</h3>
          {notifications.length === 0 ? (
            <p className="muted">Nu ai notificari.</p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={n.is_read ? '' : 'notification-unread'}
                  onClick={() => handleRead(n)}
                >
                  <span>{n.message}</span>
                  <span className="muted">{formatDateTime(n.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
