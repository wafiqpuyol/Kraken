import { PDFDownloadLink } from "@react-pdf/renderer"
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "./Dialog"
import { useTranslations } from "next-intl"
import { Invoice } from "./Invoice"
import { p2ptransfer } from "@repo/db/type"
import { cn } from "../../lib/utils"
import { useSession } from "next-auth/react"

interface SupportedCurrencyDialogProps {
    children: React.ReactNode
    transactionDetail: p2ptransfer
}
export const TransactionModal: React.FC<SupportedCurrencyDialogProps> = ({ children, transactionDetail }) => {
    console.log(transactionDetail);
    const session = useSession()
    const t = useTranslations("TransactionModal")
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] bg-white" onInteractOutside={(e) => {
                e.preventDefault();
            }}>
                <DialogTitle className="mb-4">{t(`${transactionDetail.transactionType}`)}</DialogTitle>
                <div className="flex justify-between mb-3">
                    <div className="flex flex-col gap-y-3">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">{t("sender_name")}</span>
                            <span className="font-medium text-sm">{
                                transactionDetail.sender_name === session.data?.user?.name ? "You" : transactionDetail.sender_name
                            }</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">{t("receiver_name")}</span>
                            <span className="font-medium text-sm">{
                                transactionDetail.receiver_name === session.data?.user?.name ? "You" : transactionDetail.receiver_name}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">{t("amount")}</span>
                            <span className="font-medium text-sm">{transactionDetail.amount / 100} {transactionDetail.currency}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">{t("fee")}</span>
                            <span className="font-medium text-sm">{transactionDetail.transactionCategory === "International" ?
                                transactionDetail.international_trxn_fee : transactionDetail.domestic_trxn_fee} {transactionDetail.fee_currency}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-3">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">{t("time")}</span>
                            <span className="font-medium text-sm">{new Date(transactionDetail.timestamp).toLocaleString().split(",").reverse().join().replace(",", "  ")}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">{t("transaction_ID")}</span>
                            <span className="font-medium text-sm">{transactionDetail.transactionID}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">{t("status")}</span>
                            <span className={cn("rounded-lg  p-1 font-medium text-sm", transactionDetail.status === "Success" ? "text-green-500" : "text-red-500")}
                            >{transactionDetail.status}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">{t("category")}</span>
                            <span className="p-1 font-medium text-sm">{transactionDetail.transactionCategory}</span>
                        </div>
                    </div>

                </div>
                <PDFDownloadLink document={<Invoice invoice={transactionDetail} />}>
                    <button type="button" className="bg-purple-600 hover:bg-purple-800 transition duration-300 text-white font-bold py-2 px-4 rounded">
                        {t("download_button")}
                    </button>
                </PDFDownloadLink>
            </DialogContent>
        </Dialog>
    )
}