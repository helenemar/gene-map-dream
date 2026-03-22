import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import abstract160 from '@/assets/abstract-160.svg';
import abstract122 from '@/assets/abstract-122.svg';
import abstract206 from '@/assets/abstract-206.svg';
import abstract65 from '@/assets/abstract-65.svg';

const ABSTRACT_IMAGES = [abstract160, abstract122, abstract206, abstract65];

const FeaturesSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 max-w-xl"
        >
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            {t.landing.featuresTitle}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t.landing.featuresSub}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {t.landing.features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="group flex flex-col items-center text-center p-6 rounded-2xl hover:bg-card hover:shadow-sm border border-transparent hover:border-border transition-all duration-300"
            >
              <div className="w-16 h-16 mb-5 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <img src={ABSTRACT_IMAGES[i]} alt="" className="w-10 h-10" />
              </div>
              <h3 className="text-[15px] font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
