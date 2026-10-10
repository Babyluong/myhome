import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { resetPasswordRequestSchema, type ResetPasswordRequestData } from '@/lib/validators'
import { requestPasswordReset } from '@/services/authService'
import { useToast } from '@/stores/toastStore'

interface ResetPasswordFormProps {
  onBack: () => void
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const toast = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResetPasswordRequestData>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ResetPasswordRequestData) => {
    setIsLoading(true)

    try {
      const result = await requestPasswordReset(data.email)

      if (result.success) {
        setIsSuccess(true)
        toast.success('Email Sent', 'Check your email for reset instructions')
      } else {
        toast.error('Error', result.error || 'Failed to send reset email')
      }
    } catch {
      toast.error('Error', 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-6"
      >
        <div className="w-14 h-14 bg-emerald-950/60 border border-emerald-800/60 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-emerald-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2">
          Periksa E-mel Anda
        </h3>
        
        <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
          Arahan tetapan semula kata laluan telah dihantar ke{' '}
          <span className="font-medium text-teal-400">{getValues('email')}</span>
        </p>
        
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Tidak menerima e-mel? Sila semak folder spam atau cuba lagi.
          </p>
          
          <Button
            type="button"
            variant="ghost"
            className="text-slate-300 hover:text-white"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Kembali ke Log Masuk
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="text-left mb-5">
        <h3 className="text-lg font-semibold text-white mb-1">
          Tetapan Semula Kata Laluan
        </h3>
        <p className="text-xs sm:text-sm text-slate-400">
          Masukkan alamat e-mel berdaftar anda untuk menerima pautan tetapan semula.
        </p>
      </div>

      <Input
        {...register('email')}
        type="email"
        label="Alamat E-mel / Email"
        placeholder="nama@moh.gov.my"
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        autoComplete="email"
        required
      />

      <Button
        type="submit"
        className="w-full h-11 sm:h-12 text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-lg shadow-teal-950/60"
        isLoading={isLoading}
      >
        {isLoading ? 'Menghantar Pautan...' : 'Hantar Pautan Tetapan Semula'}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full text-slate-400 hover:text-white text-xs"
        onClick={onBack}
        leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
      >
        Kembali ke Log Masuk
      </Button>
    </motion.form>
  )
}

export default ResetPasswordForm

