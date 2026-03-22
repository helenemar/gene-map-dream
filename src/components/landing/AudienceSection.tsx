import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Heart, GraduationCap, Stethoscope, Users, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AUDIENCE_ICONS = [
  <Brain className="w-5 h-5" />,
  <Heart className="w-5 h-5" />,
  <BookOpen className="w-5 h-5" />,
  <Users className="w-5 h-5" />,
  <Stethoscope className="w-5 h-5" />,
  <GraduationCap className="w-5 h-5" />,
];

const AudienceSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-28 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary text-sm font-medium mb-2">{t.landing.audienceLabel}</p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            {t.landing.audienceTitle}
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {t.landing.audience.map((title, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4 p-5 rounded-xl bg-background border border-border hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {AUDIENCE_ICONS[i]}
              </div>
              <span className="font-medium text-sm text-foreground">{title}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
