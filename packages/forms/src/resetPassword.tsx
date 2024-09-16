'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { resetPasswordPayload } from './resetPasswordSchema'
import { PasswordMatchSchema } from './changePasswordSchema'

export const userFormResetPassword = () =>
    useForm<resetPasswordPayload>({
        resolver: zodResolver(PasswordMatchSchema),
    })