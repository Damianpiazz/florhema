import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: "Florhema — Servicio de Hemoterapia",
  description: "Sistema de gestión del servicio de hemoterapia",
}

export default function Home() {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:block bg-muted">
        <img
          src="/login-hemoterapia.png"
          alt=""
          className="absolute inset-0 size-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>

      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">
        <div className="max-w-lg">
          <div className="flex items-center gap-2 mb-16">
            <img src="/icon-florhema.png" alt="Florhema" className="size-8" />
            <span className="text-base font-semibold tracking-tight text-foreground">
              Florhema
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground leading-[1.1]">
            Gestión del servicio de hemoterapia
          </h1>

          <p className="mt-6 text-muted-foreground leading-relaxed">
            Florhema digitaliza y centraliza la gestión del banco de sangre: registro de donantes,
            control de donaciones y serología, gestión de transfusiones, compatibilidad transfusional,
            y seguimiento de pacientes críticos, gestantes y recién nacidos.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/login">
                <LogIn className="mr-2 size-4" />
                Ingresar
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
