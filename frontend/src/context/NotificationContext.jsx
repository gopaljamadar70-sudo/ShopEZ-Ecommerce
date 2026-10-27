import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {notifications.map((n) => {
          let bg = 'bg-slate-900 text-white';
          let Icon = Info;
          if (n.type === 'success') {
            bg = 'bg-emerald-600 text-white';
            Icon = CheckCircle2;
          } else if (n.type === 'error') {
            bg = 'bg-rose-600 text-white';
            Icon = AlertCircle;
          }

          return (
            <div
              key={n.id}
              className={`${bg} pointer-events-auto p-4 rounded-xl shadow-lg flex items-center justify-between gap-3 transition-all transform duration-300 animate-slide-up`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{n.message}</span>
              </div>
              <button
                onClick={() => removeNotification(n.id)}
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
