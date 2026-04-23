import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ChevronDown, Menu } from 'lucide-react';
import gogyIcon from '@/assets/genogy-icon.webp';
import { useLanguage, Lang } from '@/contexts/LanguageContext';

const FLAG_FR = (
  <svg viewBox="0 0 36 24" className="w-5 h-3.5 rounded-[2px] overflow-hidden" aria-hidden="true">
    <rect width="12" height="24" fill="#002395" /><rect x="12" width="12" height="24" fill="#fff" /><rect x="24" width="12" height="24" fill="#ED2939" />
  </svg>
);
const FLAG_EN = (
  <svg viewBox="0 0 36 24" className="w-5 h-3.5 rounded-[2px] overflow-hidden" aria-hidden="true">
    <rect width="36" height="24" fill="#012169" />
    <path d="M0,0 L36,24 M36,0 L0,24" stroke="#fff" strokeWidth="4" />
    <path d="M0,0 L36,24 M36,0 L0,24" stroke="#C8102E" strokeWidth="2.5" />
    <path d="M18,0 V24 M0,12 H36" stroke="#fff" strokeWidth="6" />
    <path d="M18,0 V24 M0,12 H36" stroke="#C8102E" strokeWidth="3.5" />
  </svg>
);
const FLAG_DE = (
  <svg viewBox="0 0 36 24" className="w-5 h-3.5 rounded-[2px] overflow-hidden" aria-hidden="true">
    <rect width="36" height="8" fill="#000" /><rect y="8" width="36" height="8" fill="#DD0000" /><rect y="16" width="36" height="8" fill="#FFCC00" />
  </svg>
);
const FLAGS: Record<Lang, React.ReactNode> = { fr: FLAG_FR, en: FLAG_EN, de: FLAG_DE };

interface Props {
  onAuth: (view: 'login' | 'signup') => void;
}

const LandingHeader: React.FC<Props> = ({ onAuth }) => {
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={gogyIcon} alt="Genogy" className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="text-sm sm:text-[15px] font-semibold tracking-tight">Genogy</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-lg gap-1 sm:gap-1.5 px-2 h-8 sm:h-9">
                  {FLAGS[lang]}
                  <span className="text-xs font-medium">{lang.toUpperCase()}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                {(['fr', 'en', 'de'] as Lang[]).map((l) => (
                  <DropdownMenuItem key={l} onClick={() => setLang(l)} className="gap-2.5 cursor-pointer">
                    {FLAGS[l]}
                    <span className={lang === l ? 'font-semibold' : ''}>
                      {l === 'fr' ? t.common.french : l === 'en' ? t.common.english : t.common.german}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5 text-sm h-9" onClick={() => onAuth('login')}>
              {t.landing.login}
            </Button>
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-lg px-5 text-sm h-9" onClick={() => onAuth('signup')}>
              {t.landing.signup}
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="sm:hidden h-9 w-9 p-0" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-5 h-5" /><span className="sr-only">Menu</span>
          </Button>
        </div>
      </header>

      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[280px] p-0">
          <SheetHeader className="p-5 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <img src={gogyIcon} alt="Genogy" className="w-7 h-7" />
              <span className="text-sm font-semibold">Genogy</span>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col p-5 gap-1">
            <button onClick={() => { setMobileMenuOpen(false); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
              {t.landing.featuresTitle}
            </button>
            <button onClick={() => { setMobileMenuOpen(false); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
              {t.landing.faqTitle}
            </button>
            <div className="my-3 border-t border-border" />
            <p className="px-3 text-xs font-medium text-muted-foreground mb-1">{lang === 'fr' ? 'Langue' : lang === 'de' ? 'Sprache' : 'Language'}</p>
            <div className="flex gap-2 px-3 mb-3">
              {(['fr', 'en', 'de'] as Lang[]).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${lang === l ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="my-1 border-t border-border" />
            <div className="flex flex-col gap-2 pt-3">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg w-full" onClick={() => { setMobileMenuOpen(false); onAuth('login'); }}>{t.landing.login}</Button>
              <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-lg w-full" onClick={() => { setMobileMenuOpen(false); onAuth('signup'); }}>{t.landing.signup}</Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default LandingHeader;
