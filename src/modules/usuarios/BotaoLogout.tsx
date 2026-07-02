import { logout } from './usuarios.actions'

export default function BotaoLogout() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm text-zinc-400 hover:text-white transition-colors"
      >
        Sair
      </button>
    </form>
  )
}