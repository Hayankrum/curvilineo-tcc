export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-6xl mb-6">📡</div>
      <h1 className="text-2xl font-bold text-white mb-4">Você está offline</h1>
      <p className="text-zinc-400 mb-6 max-w-md">
        Verifique sua conexão com a internet e tente novamente.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-zinc-800 text-white border border-zinc-700 px-6 py-3 rounded-lg hover:bg-zinc-700 transition-colors"
      >
        Tentar Novamente
      </button>
    </div>
  );
}