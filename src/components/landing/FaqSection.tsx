import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';

const FaqSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">{t.landing.faqTitle}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t.landing.faqSub}
          </p>
        </motion.div>

        <Accordion type="single" collapsible className="w-full">
          {t.landing.faq.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <AccordionItem value={`faq-${i}`} className="border-b border-border">
                <AccordionTrigger className="text-left font-semibold text-[15px] hover:text-primary transition-colors py-5">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
