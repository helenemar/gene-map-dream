import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const GuideBlock: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/comment-faire-un-genogramme"
            className="group block rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-8 sm:p-10 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold mb-1.5">
                  {t.landing.guideBlockTitle}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.landing.guideBlockDesc}
                </p>
              </div>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5 rounded-full gap-2 shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                asChild
              >
                <span>
                  {t.landing.guideBlockCta}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default GuideBlock;
