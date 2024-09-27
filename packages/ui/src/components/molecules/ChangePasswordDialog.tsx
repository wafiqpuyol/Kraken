import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader } from "./Dialog"
import { changePasswordPayload } from "@repo/forms/changePasswordSchema"
import { ChangePasswordForm } from "../templates/ChangePassword"
import { useTranslations } from "next-intl"

interface ChangePasswordDialogProps {
    children: React.ReactNode
    changePasswordAction: (payload: changePasswordPayload) => Promise<{
        message: string | undefined;
        status: number;
    }>
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ children, changePasswordAction }) => {
    const t = useTranslations("ChangePasswordDialog")
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] bg-white" onInteractOutside={(e) => {
                e.preventDefault();
            }}>
                <DialogHeader>
                    <DialogTitle className="text-2xl mb-3">{t("title")}</DialogTitle>
                </DialogHeader>
                <ChangePasswordForm changePasswordAction={changePasswordAction} />
            </DialogContent>
        </Dialog>
    )
}
