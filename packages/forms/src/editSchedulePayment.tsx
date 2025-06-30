'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {  EditSchdulePaymentSchema,editSchdulePaymentPayload} from './editSchedulePaymentSchema'

export const userFormEditSchedulePayment = (defaultPayload:editSchdulePaymentPayload) =>
    useForm<editSchdulePaymentPayload>({
        resolver: zodResolver(EditSchdulePaymentSchema),
        defaultValues:{
            amount:defaultPayload.amount,
            payee_name:defaultPayload.payee_name,
            payee_number:defaultPayload.payee_number,
            payment_date:defaultPayload.payment_date,
            currency:defaultPayload.currency
        }
    })