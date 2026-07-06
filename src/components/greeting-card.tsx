'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { getGreetingTemplate } from '@/lib/i18n';
import { Sparkles, GraduationCap, BookOpen, Trophy, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { User } from '@/lib/types';

function useCurrentUser(): User | null {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  return useMemo(
    () => (currentUserId ? users.find((u) => u.id === currentUserId) ?? null : null),
    [currentUserId, users],
  );
}

export function GreetingCard() {
  const currentUser = useCurrentUser();
  const greetingSeen = useAppStore((s) => s.greetingSeen);
  const markGreetingSeen = useAppStore((s) => s.markGreetingSeen);
  const language = useAppStore((s) => s.language);
  const navigate = useAppStore((s) => s.navigate);

  const open = !!currentUser && !greetingSeen && currentUser.status === 'active';

  if (!currentUser) return null;

  const template = getGreetingTemplate(language, currentUser.name);
  const firstName = currentUser.name.split(' ')[0];
  void firstName;

  const handleExplore = () => {
    markGreetingSeen();
    navigate({ name: 'home' });
  };

  const handleDashboard = () => {
    markGreetingSeen();
    navigate({ name: 'dashboard' });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && markGreetingSeen()}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden"
        aria-describedby={undefined}
      >
        {/* Accessible name + description for screen readers (visible heading is below) */}
        <DialogHeader className="sr-only">
          <DialogTitle>{template.title}</DialogTitle>
          <DialogDescription>{template.subtitle}</DialogDescription>
        </DialogHeader>
        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-8 text-white">
          <button
            onClick={markGreetingSeen}
            className="absolute right-4 top-4 rounded-full bg-white/15 p-1.5 backdrop-blur hover:bg-white/25"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 text-white/80">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider font-medium">
              {language === 'es' ? 'Bienvenido a marqaicourses' :
               language === 'de' ? 'Willkommen bei marqaicourses' :
               language === 'ja' ? 'marqaicoursesへようこそ' :
               language === 'hi' ? 'marqaicourses में आपका स्वागत है' :
               language === 'fr' ? 'Bienvenue sur marqaicourses' :
               'Welcome to marqaicourses'}
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-bold leading-tight">
            {template.title}
          </h2>
          <p className="mt-2 text-sm text-white/85">
            {template.subtitle}
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-3">
            <FeaturePill
              icon={BookOpen}
              label={language === 'es' ? '6 Cursos' : language === 'de' ? '6 Kurse' : language === 'ja' ? '6コース' : language === 'hi' ? '6 कोर्स' : language === 'fr' ? '6 Cours' : '6 Courses'}
              color="from-emerald-500 to-teal-600"
            />
            <FeaturePill
              icon={Sparkles}
              label={language === 'es' ? 'Tutor IA 24/7' : language === 'de' ? 'KI-Tutor 24/7' : language === 'ja' ? 'AIチューター24h' : language === 'hi' ? 'AI ट्यूटर 24/7' : language === 'fr' ? 'Tuteur IA 24/7' : 'AI Tutor 24/7'}
              color="from-violet-500 to-purple-600"
            />
            <FeaturePill
              icon={Trophy}
              label={language === 'es' ? 'Certificados' : language === 'de' ? 'Zertifikate' : language === 'ja' ? '認定証' : language === 'hi' ? 'प्रमाणपत्र' : language === 'fr' ? 'Certificats' : 'Certificates'}
              color="from-amber-500 to-orange-600"
            />
          </div>

          <div className="mt-5 rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              {language === 'es' ? 'Tu cuenta está lista. Explora el catálogo de cursos y empieza tu primera lección hoy mismo.' :
               language === 'de' ? 'Ihr Konto ist bereit. Erkunden Sie den Katalog und starten Sie heute Ihre erste Lektion.' :
               language === 'ja' ? 'アカウントの準備ができました。コースカタログを探索して、今日最初のレッスンを始めましょう。' :
               language === 'hi' ? 'आपका खाता तैयार है। कोर्स कैटलॉग देखें और आज ही अपनी पहली पाठ शुरू करें।' :
               language === 'fr' ? "Votre compte est prêt. Explorez le catalogue et commencez votre première leçon aujourd'hui." :
               'Your account is ready. Browse the course catalog and start your first lesson today.'}
            </p>
          </div>

          <div className="mt-5 flex gap-2">
            <Button
              onClick={handleExplore}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              {language === 'es' ? 'Explorar Cursos' :
               language === 'de' ? 'Kurse erkunden' :
               language === 'ja' ? 'コースを探す' :
               language === 'hi' ? 'कोर्स देखें' :
               language === 'fr' ? 'Explorer les cours' :
               'Explore Courses'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={handleDashboard} variant="outline" className="flex-1">
              {language === 'es' ? 'Ir al Panel' :
               language === 'de' ? 'Zum Dashboard' :
               language === 'ja' ? 'ダッシュボードへ' :
               language === 'hi' ? 'डैशबोर्ड पर जाएँ' :
               language === 'fr' ? 'Tableau de bord' :
               'Go to Dashboard'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeaturePill({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border bg-card p-3 text-center">
      <span className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${color} text-white`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-[11px] font-medium leading-tight">{label}</span>
    </div>
  );
}
