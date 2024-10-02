'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ConfirmMailSchema, confirmMailPayload } from './confirmMailSchema'


export const useFormConfirmMail = () =>
    useForm<confirmMailPayload>({
        resolver: zodResolver(ConfirmMailSchema),
    })