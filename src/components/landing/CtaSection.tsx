import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  onAuth: (view: 'login' | 'signup') => void;
}

const CtaSection: React.FC<Props> = ({ onAuth }) => {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-28 bg-foreground text-background relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto px-6 text-center relative"
      >
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
          {t.landing.ctaTitle}
        </h2>
        <p className="text-background/60 mb-8 max-w-lg mx-auto">
          {t.landing.ctaSub}
        </p>
        <Button
          size="xl"
          onClick={() => onAuth('signup')}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          {t.landing.ctaButton}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </section>
  );
};

export default CtaSection;
