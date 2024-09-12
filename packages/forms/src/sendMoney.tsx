'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { SendMoneySchema, sendMoneyPayload } from './sendMoneySchema'

export const userFormSendMoney = () =>
    useForm<sendMoneyPayload>({
        resolver: zodResolver(SendMoneySchema),
    })