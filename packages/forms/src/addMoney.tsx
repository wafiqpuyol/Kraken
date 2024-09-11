'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AddMoneySchema, addMoneyPayload } from './addMoneySchema'

export const userFormAddMoney = () =>
    useForm<addMoneyPayload>({
        resolver: zodResolver(AddMoneySchema),
    })