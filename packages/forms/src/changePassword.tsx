'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { changePasswordPayload, ChangePasswordSchema } from './changePasswordSchema'


export const useFormChangePassword = () =>
    useForm<changePasswordPayload>({
        resolver: zodResolver(ChangePasswordSchema),
    })