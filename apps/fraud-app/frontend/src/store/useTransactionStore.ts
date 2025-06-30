import { Transaction } from "@/types/index"
import { create } from "zustand"
import { devtools, persist } from 'zustand/middleware'

interface ITransactionStore {
    transactions: Transaction[] | []
    actions: {
        addTransaction: (transaction: Transaction) => void
    }
}

const useTransactionStore = create<ITransactionStore>()(
    devtools(
        (set) => ({
            transactions: [],
            actions: {
                addTransaction: (transaction) => set((state) => {
                    const parsedTransaction = transaction;
                    return { transactions: [parsedTransaction, ...state.transactions] }
                })
            }
        })
    )
)

export const useTransaction = () => useTransactionStore((state) => state.transactions)
export const useTransactionActions = () => useTransactionStore((state) => state.actions)