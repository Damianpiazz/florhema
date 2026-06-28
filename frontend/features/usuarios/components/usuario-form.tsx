'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ErrorAlert } from '@/components/ui/error-alert'
import type { Usuario, CrearUsuarioInput, ActualizarUsuarioInput } from '../usuarios.schema'
import { usuariosService } from '../usuarios-service'

interface UsuarioFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario?: Usuario // undefined = create mode, defined = edit mode
  onSuccess: () => void
}

export function UsuarioForm({
  open,
  onOpenChange,
  usuario,
  onSuccess,
}: UsuarioFormProps) {
  const isEdit = !!usuario
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<string>('USER')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (usuario) {
        setEmail(usuario.email)
        setName(usuario.name ?? '')
        setRole(usuario.role)
        setPassword('')
      } else {
        setEmail('')
        setPassword('')
        setName('')
        setRole('USER')
      }
      setError(null)
    }
  }, [open, usuario])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isEdit) {
        const input: ActualizarUsuarioInput = { name: name || undefined }
        if (email !== usuario!.email) input.email = email
        if (role !== usuario!.role) input.role = role as ActualizarUsuarioInput['role']
        await usuariosService.actualizar(usuario!.id, input)
      } else {
        const input: CrearUsuarioInput = {
          email,
          password,
          name: name || undefined,
          role: role as CrearUsuarioInput['role'],
        }
        await usuariosService.crear(input)
      }
      onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error del servidor. Intente nuevamente.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifique los datos del usuario'
              : 'Complete los datos para crear un nuevo usuario'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorAlert message={error} />}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="USER">Usuario</SelectItem>
                <SelectItem value="INVITADO">Invitado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? 'Guardando...'
                : isEdit
                  ? 'Guardar Cambios'
                  : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
