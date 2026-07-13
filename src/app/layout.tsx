import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getUsuarioLogado } from "@/modules/usuarios/usuarios.actions";
import BotaoLogout from "@/modules/usuarios/components/BotaoLogout";
import SinoNotificacoes from "@/modules/notificacoes/SinoNotificacoes";
import { primeiroNome } from "@/lib/utils";
import { ThemeProvider } from "@/lib/ThemeProvider";
import ThemeToggle from "@/modules/tema/ThemeToggle";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meu App",
  description: "Meu app Next.js com modo offline",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Meu App",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#09090b",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const usuario = await getUsuarioLogado()

  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('theme');
                if (t === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered:', registration.scope);
                    })
                    .catch(function(err) {
                      console.log('SW registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <nav className="border-b px-6 py-4" style={{ borderColor: 'var(--border-color)' }}>
            <div className="max-w-3xl mx-auto flex items-center gap-6">
              <Link href="/" className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Meu App
              </Link>
              <Link href="/posts" className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                Posts
              </Link>
              <Link href="/mapa" className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                Mapa
              </Link>

              <div className="ml-auto flex items-center gap-4">
                <ThemeToggle />
                {usuario ? (
                <>
                  <SinoNotificacoes />
                  <Link
                    href={`/usuarios/${usuario.id}`}
                    className="text-sm transition-colors flex items-center gap-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      {usuario.nome.charAt(0).toUpperCase()}
                    </span>
                    {primeiroNome(usuario.nome)}
                  </Link>
                  <BotaoLogout />
                </>
              ) : (
                <Link href="/usuarios/login" className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  Entrar
                </Link>
              )}
              </div>
            </div>
          </nav>
          <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
