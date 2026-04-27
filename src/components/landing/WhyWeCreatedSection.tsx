import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Stethoscope } from 'lucide-react';

const WhyWeCreatedSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-primary/5">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Pourquoi nous avons créé Genogy
          </h2>
          <p className="text-muted-foreground text-[15px] leading-relaxed max-w-2xl mx-auto">
            Genogy n'est pas un énième outil de schéma adapté au génogramme. C'est un outil
            co-créé par une psychologue clinicienne formée au génogramme systémique et une
            product designer — le seul de son genre, construit à partir de la pratique
            clinique réelle.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-[15px] mb-2">Une expertise clinique</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pensé par une psychologue formée au génogramme systémique, qui l'utilise
              chaque semaine en consultation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-[15px] mb-2">Un design pensé pour la pratique</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Conçu avec une product designer pour offrir une expérience claire, fluide et
              adaptée à votre rythme de travail.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-6 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-[15px] mb-2">Le seul outil de son genre</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Genogy est le seul outil de génogramme en ligne né de la pratique clinique
              réelle, et non d'une adaptation générique.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyWeCreatedSection;
