import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Desafio NTT
        </h1>
        <p className="text-muted-foreground max-w-md text-sm">
          Frontend com React, Vite, Tailwind CSS e Shadcn UI.
        </p>
      </div>

      <div className="flex gap-3">
        <Button>Começar</Button>
        <Button variant="outline">Documentação</Button>
      </div>
    </div>
  )
}

export default App
