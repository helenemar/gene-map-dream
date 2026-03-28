import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Cookie } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COOKIE_KEY = 'genogy_cookies_accepted';

const CookieBanner: React.FC = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_KEY);
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_KEY, 'rejected');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-[200] flex justify-center pointer-events-none"
        >
          <div className="pointer-events-auto w-full max-w-lg bg-card border border-border rounded-2xl shadow-lg p-4 flex items-center gap-4">
            <Cookie className="w-5 h-5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground flex-1">
              {t.cookieBanner.message}{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                {t.cookieBanner.learnMore}
              </Link>
            </p>
            <Button size="sm" variant="outline" onClick={handleAccept} className="shrink-0 rounded-xl">
              {t.cookieBanner.accept}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
