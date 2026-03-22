import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import aboutIllustration from '@/assets/about-illustration.png';

const AboutSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="dot-grid rounded-2xl border border-border p-8 flex items-center justify-center"
          >
            <img src={aboutIllustration} alt={t.landing.aboutImgAlt} className="w-full h-auto max-w-md" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
              {t.landing.aboutTitle}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-[15px]">
              <p>{t.landing.aboutP1}</p>
              <p>{t.landing.aboutP2}</p>
              <p>{t.landing.aboutP3}</p>
              <p>{t.landing.aboutP4}</p>
              <p>{t.landing.aboutP5}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
