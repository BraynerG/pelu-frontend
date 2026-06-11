import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { API_URL } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Controller } from 'react-hook-form';
import { PhoneInput } from '@/components/PhoneInput';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});

const registerSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  phone: z.string().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'register'>(defaultView);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: authLogin } = useAuth();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', name: '', phone: '' },
  });

  const onLoginSubmit = async (data: LoginValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al iniciar sesión');
      }

      authLogin(result.accessToken, result.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al registrarse');
      }

      setView('login');
      loginForm.setValue('email', data.email);
      setError('Registro exitoso. Por favor inicia sesión.');
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-neutral-900 text-white border-neutral-700 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-amber-400">
            {view === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            {view === 'login' 
              ? 'Ingresa tus credenciales para acceder.' 
              : 'Crea una cuenta para gestionar tus reservas.'}
          </DialogDescription>
        </DialogHeader>

        {view === 'login' ? (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-neutral-300">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="tu@email.com"
                className="bg-neutral-800 border-neutral-700 text-white focus:ring-amber-500"
                {...loginForm.register('email')}
              />
              {loginForm.formState.errors.email && (
                <p className="text-red-400 text-xs">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-neutral-300">Contraseña</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="******"
                className="bg-neutral-800 border-neutral-700 text-white focus:ring-amber-500"
                {...loginForm.register('password')}
              />
              {loginForm.formState.errors.password && (
                <p className="text-red-400 text-xs">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            {error && (
              <p className={`${error.includes('exitoso') ? 'text-green-400' : 'text-red-400'} text-sm text-center`}>{error}</p>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="link"
                onClick={() => setView('register')}
                className="text-amber-500 hover:text-amber-400 p-0"
              >
                ¿No tienes cuenta? Regístrate
              </Button>
              <div className="flex gap-2 justify-end w-full sm:w-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isSubmitting ? 'Cargando...' : 'Entrar'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name" className="text-neutral-300">Nombre</Label>
              <Input
                id="reg-name"
                placeholder="Tu nombre"
                className="bg-neutral-800 border-neutral-700 text-white focus:ring-amber-500"
                {...registerForm.register('name')}
              />
              {registerForm.formState.errors.name && (
                <p className="text-red-400 text-xs">{registerForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-neutral-300">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="tu@email.com"
                className="bg-neutral-800 border-neutral-700 text-white focus:ring-amber-500"
                {...registerForm.register('email')}
              />
              {registerForm.formState.errors.email && (
                <p className="text-red-400 text-xs">{registerForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-neutral-300">Contraseña</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="******"
                className="bg-neutral-800 border-neutral-700 text-white focus:ring-amber-500"
                {...registerForm.register('password')}
              />
              {registerForm.formState.errors.password && (
                <p className="text-red-400 text-xs">{registerForm.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-phone" className="text-neutral-300">Teléfono (Opcional)</Label>
              <Controller
                name="phone"
                control={registerForm.control}
                render={({ field }) => (
                  <PhoneInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Tu teléfono"
                    isDark={true}
                  />
                )}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="link"
                onClick={() => setView('login')}
                className="text-amber-500 hover:text-amber-400 p-0"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </Button>
              <div className="flex gap-2 justify-end w-full sm:w-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isSubmitting ? 'Cargando...' : 'Registrarse'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
