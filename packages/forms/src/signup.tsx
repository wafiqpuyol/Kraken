'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { SignUpSchema, signUpPayload } from './signupSchema'

export const userFormSignup = () =>
    useForm<signUpPayload>({
        resolver: zodResolver(SignUpSchema),
    })