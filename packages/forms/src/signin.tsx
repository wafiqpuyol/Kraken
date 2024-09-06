'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { LoginSchema, loginPayload } from './loginSchema'


export const userFormSignIn = () =>
    useForm<loginPayload>({
        resolver: zodResolver(LoginSchema),
    })