'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { SchedulePaymentSchema, schedulePaymentPayload } from './schedulePaymentSchema'

export const userFormSchedulePayment = () =>
    useForm<schedulePaymentPayload>({
        resolver: zodResolver(SchedulePaymentSchema),
    })