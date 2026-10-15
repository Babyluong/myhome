import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Send welcome email to new user with temporary password
 * Uses Supabase's built-in email system (configured with Resend SMTP)
 */
export async function sendWelcomeEmail(
  email: string,
  employeeId: string,
  fullName: string,
  temporaryPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      // In mock mode, just log
      console.log(`[MOCK] Welcome email would be sent to ${email} for employee ${employeeId}`)
      return { success: true }
    }

    if (!email) {
      return {
        success: false,
        error: 'Email address is required',
      }
    }

    // Use Supabase Admin API to send custom email with temporary password
    // Note: This requires a custom email template or we use the Invite user function
    // For now, we'll use the invite function which sends an email with a password reset link
    // In production, you should configure a custom email template in Supabase that includes the password
    
    const resetLink = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetLink,
    })

    if (error) {
      console.error('Error sending welcome email:', error)
      return {
        success: false,
        error: error.message || 'Failed to send welcome email',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email',
    }
  }
}

/**
 * Send password reset email
 * Uses Supabase's built-in email system (configured with Resend SMTP)
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      console.log(`[MOCK] Password reset email would be sent to ${email}`)
      return { success: true }
    }

    if (!email) {
      return {
        success: false,
        error: 'Email address is required',
      }
    }

    const resetLink = `${window.location.origin}/reset-password`
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetLink,
    })

    if (error) {
      console.error('Error sending password reset email:', error)
      return {
        success: false,
        error: error.message || 'Failed to send password reset email',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in sendPasswordResetEmail:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email',
    }
  }
}

