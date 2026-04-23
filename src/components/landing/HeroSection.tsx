import React from 'react';
import { Button } from '@/components/ui/button';
import gogyIcon from '@/assets/genogy-icon.webp';
import heroComposition from '@/assets/hero-mockup-composition.webp';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface Props {
  onAuth: (view: 'login' | 'signup') => void;
}

const HeroSection: React.FC<Props> = ({ onAuth }) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient orbs */}
      <div className="absolute top-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] rounded-full bg-brand-orange/5 blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-5 sm:px-12 lg:px-24 pt-10 sm:pt-14 pb-14 sm:pb-20 lg:pt-16 lg:pb-24 relative">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img src={gogyIcon} alt="" className="w-12 h-12 sm:w-[64px] sm:h-[64px] mb-4 sm:mb-6" />

            <h1 className="text-[1.5rem] sm:text-[1.85rem] lg:text-[2.3rem] font-extrabold leading-[1.12] tracking-[-0.01em] mb-3 sm:mb-4">
              {t.landing.heroTitle1}
              <br />
              {t.landing.heroTitle2}{' '}
              <span className="text-primary">{t.landing.heroTitle3}</span>{' '}
              {t.landing.heroTitle4}
            </h1>

            <p className="text-muted-foreground text-[13px] sm:text-[14px] leading-[1.5] mb-1 max-w-[420px]">
              {t.landing.heroSub1}<br className="hidden sm:block" />{t.landing.heroSub2}
            </p>
            <p className="text-foreground/50 text-[11.5px] sm:text-[12.5px] leading-[1.5] mb-5 sm:mb-6 max-w-[420px]">
              {t.landing.heroSub3}<br className="hidden sm:block" />{t.landing.heroSub4}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Button variant="brand" size="lg" onClick={() => onAuth('signup')} className="gap-2 px-8 rounded-full">
                {t.landing.ctaBeta}
              </Button>
              <Button variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="border-primary text-primary bg-transparent hover:bg-primary/5 rounded-full px-8">
                {t.landing.ctaDiscover}
              </Button>
            </div>
          </motion.div>

          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block"
            >
              <img
                src={heroComposition}
                alt={t.landing.heroImgAlt}
                className="w-full h-auto"
                style={{
                  filter: 'drop-shadow(0 20px 40px hsl(var(--foreground) / 0.08)) drop-shadow(0 8px 16px hsl(var(--foreground) / 0.04))',
                }}
                loading="eager"
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
