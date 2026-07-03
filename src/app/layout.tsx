import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getUsuarioLogado } from "@/modules/usuarios/usuarios.actions";
import BotaoLogout from "@/modules/usuarios/BotaoLogout";
import SinoNotificacoes from "@/modules/notificacoes/SinoNotificacoes";
import { primeiroNome } from "@/lib/utils";

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
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
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
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <nav className="border-b border-zinc-800 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-6">
            <Link href="/" className="font-semibold text-white">
              Meu App
            </Link>
            <Link href="/posts" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Posts
            </Link>

            <div className="ml-auto flex items-center gap-4">
              {usuario ? (
              <>
                <SinoNotificacoes />
                <Link
                  href={`/usuarios/${usuario.id}`}
                  className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <span className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs">
                    {usuario.nome.charAt(0).toUpperCase()}
                  </span>
                  {primeiroNome(usuario.nome)}
                </Link>
                <BotaoLogout />
              </>
            ) : (
              <Link href="/usuarios/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Entrar
              </Link>
            )}
            </div>
          </div>
        </nav>
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
