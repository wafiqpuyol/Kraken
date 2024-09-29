import { PDFDownloadLink } from "@react-pdf/renderer"
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "./Dialog"
import { useTranslations } from "next-intl"
import { Invoice } from "./Invoice"

interface SupportedCurrencyDialogProps {
    children: React.ReactNode
    transactionDetail: any
}
export const TransactionModal: React.FC<SupportedCurrencyDialogProps> = ({ children, transactionDetail }) => {
    const t = useTranslations("TransactionModal")
    const invoiceTranslator = useTranslations("Invoice")
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
                            <span className="font-medium text-sm">{transactionDetail.user_p2ptransfer_fromUserIdTouser.name}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">{t("receiver_name")}</span>
                            <span className="font-medium text-sm">{transactionDetail.user_p2ptransfer_toUserIdTouser.name}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">{t("amount")}</span>
                            <span className="font-medium text-sm">{transactionDetail.amount} {transactionDetail.currency}</span>
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
                    </div>

                </div>
                <PDFDownloadLink document={<Invoice invoice={transactionDetail} translation={invoiceTranslator} />}>
                    <button type="button" className="bg-purple-600 hover:bg-purple-800 transition duration-300 text-white font-bold py-2 px-4 rounded">
                        {t("download_button")}
                    </button>
                </PDFDownloadLink>
            </DialogContent>
        </Dialog>
    )
}