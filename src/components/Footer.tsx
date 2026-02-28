import React from 'react';
import { Link } from 'react-router-dom';
import gogyIcon from '@/assets/genogy-icon.svg';
import { Mail, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-foreground text-background/70">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1 – Branding */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={gogyIcon} alt="Genogy" className="w-7 h-7 brightness-0 invert opacity-80" />
              <span className="text-[15px] font-semibold text-background tracking-tight">Genogy</span>
            </Link>
            <p className="text-sm leading-relaxed text-background/50 max-w-[240px]">
              La cartographie systémique au service des professionnels.
            </p>
          </div>

          {/* Column 2 – Produit */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-background/40 mb-4">
              Produit
            </h4>
            <ul className="space-y-3">
              <li>
                <button onClick={() => scrollToSection('features')} className="text-sm hover:text-primary transition-colors">
                  Fonctionnalités
                </button>
              </li>
              <li>
                <span className="text-sm inline-flex items-center gap-1.5">
                  Tarifs
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                    Bêta
                  </span>
                </span>
              </li>
              <li>
                <button onClick={() => scrollToSection('faq')} className="text-sm hover:text-primary transition-colors">
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3 – Juridique */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-background/40 mb-4">
              Juridique
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors">Mentions légales</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors">Politique de confidentialité (RGPD)</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors">Conditions Générales d'Utilisation</a>
              </li>
            </ul>
          </div>

          {/* Column 4 – Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-background/40 mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:contact@genogy.app" className="text-sm inline-flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 shrink-0" />
                  contact@genogy.app
                </a>
              </li>
              <li className="flex items-center gap-3 pt-1">
                <a href="#" aria-label="Twitter" className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" aria-label="LinkedIn" className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-background/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-background/35">
            © {new Date().getFullYear()} Genogy. Tous droits réservés.
          </span>
          <span className="text-xs text-background/25">
            Conçu avec soin pour les professionnels de santé.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
