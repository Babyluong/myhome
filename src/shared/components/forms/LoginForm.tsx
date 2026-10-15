import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { LogIn, User, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui'
import { loginSchema, type LoginFormData } from '@/lib/validators'
import { login } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/toastStore'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  onShowResetPassword: () => void
  onSuccess: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onShowResetPassword,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showResetPrompt, setShowResetPrompt] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login: storeLogin } = useAuthStore()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      employeeId: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setShowResetPrompt(false)

    try {
      const result = await login(data.employeeId, data.password)

      if (result.success && result.user) {
        toast.success('Login Successful', `Welcome back, ${result.user.full_name}!`)
        storeLogin(result.user)
        onSuccess()
      } else {
        if (result.requiresPasswordReset) {
          setShowResetPrompt(true)
        }

        if (result.attemptsRemaining !== undefined && result.attemptsRemaining > 0) {
          setError('root', {
            message: result.error || 'Invalid credentials',
          })
          toast.error('Login Failed', result.error)
        } else if (result.isLocked) {
          toast.error('Account Locked', result.error || 'Too many failed attempts')
        } else {
          setError('root', {
            message: result.error || 'Invalid credentials',
          })
          toast.error('Login Failed', result.error || 'Invalid credentials')
        }
      }
    } catch {
      toast.error('Error', 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* Error Alert */}
      {errors.root && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 flex items-start gap-2.5"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-red-200 leading-relaxed">{errors.root.message}</p>
        </motion.div>
      )}

      {/* Reset Password Prompt */}
      {showResetPrompt && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col gap-2"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                Account Temporarily Locked
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                Your account was locked due to consecutive failed attempts. Please reset your password to continue.
              </p>
            </div>
          </div>
          <div className="pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8 border-amber-500/40 hover:bg-amber-500/10 text-amber-800 dark:text-amber-200"
              onClick={onShowResetPassword}
            >
              Reset Password
            </Button>
          </div>
        </motion.div>
      )}

      {/* Employee ID */}
      <div className="space-y-1.5">
        <label htmlFor="login-employee-id" className="block text-xs font-medium text-text-secondary">
          Employee ID
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-accent-base transition-colors">
            <User className="w-4 h-4" />
          </div>
          <input
            id="login-employee-id"
            {...register('employeeId')}
            type="text"
            placeholder="e.g. MOH-12345"
            autoComplete="username"
            className={cn(
              'w-full h-11 pl-10 pr-3.5 bg-surface border border-border-default rounded-lg',
              'text-text-primary placeholder:text-text-muted font-normal text-sm',
              'focus:outline-none focus:ring-2 focus:ring-accent-base/20 focus:border-accent-base',
              'hover:border-border-strong transition-colors duration-150',
              errors.employeeId && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            )}
          />
        </div>
        {errors.employeeId && (
          <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">{errors.employeeId.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="block text-xs font-medium text-text-secondary">
            Password
          </label>
          <button
            type="button"
            onClick={onShowResetPassword}
            className="text-xs text-accent-base hover:underline font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base rounded px-1"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-accent-base transition-colors">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="login-password"
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            autoComplete="current-password"
            className={cn(
              'w-full h-11 pl-10 pr-10 bg-surface border border-border-default rounded-lg',
              'text-text-primary placeholder:text-text-muted font-normal text-sm',
              'focus:outline-none focus:ring-2 focus:ring-accent-base/20 focus:border-accent-base',
              'hover:border-border-strong transition-colors duration-150',
              errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base rounded"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'w-full h-11 text-sm font-semibold rounded-lg transition-colors duration-150',
            'bg-accent-base text-accent-foreground hover:bg-accent-hover hover:shadow-elevation-2 active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
            'shadow-elevation-1 flex items-center justify-center gap-2 cursor-pointer border border-accent-hover/30',
            'disabled:opacity-50 disabled:pointer-events-none'
          )}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign in to Ecosystem</span>
              <LogIn className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </motion.form>
  )
}

export default LoginForm
