import { Home, Search, Library, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // ❌ Hide bottom nav on full player screen
  if (location.pathname === '/player') {
    return null;
  }

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: MessageCircle, label: 'Ask', path: '/ask-luna' }, // ✅ NEW
    { icon: Library, label: 'Library', path: '/library' },
  ];

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-40
        h-16
        pointer-events-auto
      "
    >
      <div className="max-w-md mx-auto px-4 h-full">
        <motion.nav
          className="
            h-full
            glass-card
            rounded-t-3xl
            flex justify-around items-center
          "
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              location.pathname === item.path ||
              (item.path === '/search' &&
                location.pathname.startsWith('/mood'));

            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  flex flex-col items-center gap-1
                  px-3 py-2
                  rounded-2xl
                  transition-all
                  ${isActive ? 'bg-violet-twilight/30' : ''}
                `}
                whileTap={{ scale: 0.9 }}
              >
                <Icon
                  size={22}
                  className={
                    isActive
                      ? 'text-violet-twilight'
                      : 'text-lavender'
                  }
                />
                <span
                  className={`text-xs ${
                    isActive
                      ? 'text-violet-twilight'
                      : 'text-lavender'
                  }`}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </motion.nav>
      </div>
    </div>
  );
}