import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserPlus, GitBranch, Share2, ArrowRight } from 'lucide-react';

const STEP_ICONS = [
  <UserPlus className="w-6 h-6" />,
  <GitBranch className="w-6 h-6" />,
  <Share2 className="w-6 h-6" />,
];

const StepsSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-28 bg-card border-y border-border">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            {t.landing.stepsTitle}
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
            {t.landing.stepsSub}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

          {t.landing.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="flex flex-col items-center text-center relative"
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center mb-5 relative">
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                  {i + 1}
                </span>
                <span className="text-primary">{STEP_ICONS[i]}</span>
              </div>
              <h3 className="text-base font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            to="/comment-faire-un-genogramme"
            className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline underline-offset-4 transition-colors group"
          >
            {t.landing.stepsGuideLink}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default StepsSection;
