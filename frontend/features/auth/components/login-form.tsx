"use client"

import Link from 'next/link'
import { Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useLogin } from '@/features/auth/hooks/useLogin'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    loading,
    success,
    handleSubmit,
  } = useLogin()

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Ingresá tu email y contraseña para acceder al sistema
          </p>
        </div>

        {errors.general && (
          <div
            role="alert"
            className="text-sm font-normal text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2 text-center"
          >
            {errors.general}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="tecnico@hospital.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && <FieldError>{errors.email}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errors.password && <FieldError>{errors.password}</FieldError>}
        </Field>

        <Field>
          <Button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full hover:bg-primary/90',
              success &&
                'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Ingresando...
              </>
            ) : success ? (
              <>
                <Check className="size-4" />
                ¡Ingreso exitoso!
              </>
            ) : (
              'Ingresar'
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
