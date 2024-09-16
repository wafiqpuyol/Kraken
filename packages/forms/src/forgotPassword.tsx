'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ForgotPasswordSchema, forgotPasswordPayload } from './forgotPasswordSchema'


export const useFormForgotPassword = () =>
    useForm<forgotPasswordPayload>({
        resolver: zodResolver(ForgotPasswordSchema),
    })