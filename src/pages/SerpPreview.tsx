import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fr } from '@/i18n/fr';

type Device = 'desktop' | 'mobile';

const titleLimits = { desktop: 60, mobile: 55 };
const descriptionLimits = { desktop: 155, mobile: 120 };

const getStatus = (value: string, limit: number) => {
  const length = value.trim().length;
  if (length === 0) return 'À compléter';
  if (length > limit) return 'Trop long';
  if (length > limit - 15) return 'Optimal';
  return 'Peut être plus précis';
};

const SerpPreview: React.FC = () => {
  const [device, setDevice] = useState<Device>('desktop');
  const [title, setTitle] = useState(fr.landing.metaTitle);
  const [description, setDescription] = useState(fr.landing.metaDesc);
  const [path, setPath] = useState('https://www.genogy-app.com/');

  const titleStatus = useMemo(() => getStatus(title, titleLimits[device]), [device, title]);
  const descriptionStatus = useMemo(() => getStatus(description, descriptionLimits[device]), [description, device]);

  return (
    <main className="min-h-screen bg-page-bg px-6 py-10 text-foreground">
      <Helmet>
        <title>Aperçu SERP Genogy</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">SEO</p>
            <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">Aperçu Google</h1>
          </div>
          <div className="inline-flex w-fit rounded-lg border border-border bg-card p-1">
            <Button type="button" variant={device === 'desktop' ? 'brand' : 'ghost'} size="sm" onClick={() => setDevice('desktop')}>
              <Monitor className="mr-2 h-4 w-4" /> Desktop
            </Button>
            <Button type="button" variant={device === 'mobile' ? 'brand' : 'ghost'} size="sm" onClick={() => setDevice('mobile')}>
              <Smartphone className="mr-2 h-4 w-4" /> Mobile
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="serp-title">Title</Label>
                <Input id="serp-title" value={title} onChange={(event) => setTitle(event.target.value)} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{title.length}/{titleLimits[device]} caractères</span>
                  <span>{titleStatus}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serp-description">Meta description</Label>
                <Textarea
                  id="serp-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-32"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{description.length}/{descriptionLimits[device]} caractères</span>
                  <span>{descriptionStatus}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serp-url">URL affichée</Label>
                <Input id="serp-url" value={path} onChange={(event) => setPath(event.target.value)} />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className={device === 'mobile' ? 'max-w-[390px]' : 'max-w-[650px]'}>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-page-bg text-sm font-bold text-primary">G</div>
                <div className="min-w-0">
                  <div className="truncate text-sm text-foreground">Genogy</div>
                  <div className="truncate text-xs text-muted-foreground">{path.replace(/^https?:\/\//, '')}</div>
                </div>
              </div>
              <h2 className="line-clamp-2 text-[20px] leading-snug text-primary md:text-[22px]">{title || 'Titre de la page'}</h2>
              <p className="mt-1 line-clamp-2 text-[14px] leading-6 text-muted-foreground md:text-[15px]">
                {description || 'Description de la page affichée dans les résultats Google.'}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default SerpPreview;