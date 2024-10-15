import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader, DialogClose } from "./Dialog"
import { useTranslations } from "next-intl"

export const TwoFADisableDialog = ({ children, twoFAType }: { children: React.ReactNode, twoFAType: "signInTwoFA" | "withDrawTwoFA" }) => {
    const t = useTranslations("TwoFADisableDialog")
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] bg-white" onInteractOutside={(e) => {
                e.preventDefault();
            }}>
                <DialogHeader>
                    <DialogTitle>{twoFAType === "signInTwoFA" ? t("signIn2FA_title") : t("withdraw2FA_title")}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-500">{twoFAType === "signInTwoFA" ? t("signIn2FA_desc1") : t("withdraw2FA_desc1")}</p>
                <p className="text-sm text-slate-500">{t("desc2")} <span className="font-bold py-[2px] border-black/40 px-[5px] rounded-lg border-[1px]">{"Master Key"}</span> {t("desc3")}</p>
                <DialogClose className="bg-purple-600 text-white rounded-xl py-2 font-medium"> {t("btn")} </DialogClose>
            </DialogContent>
        </Dialog>
    )
}