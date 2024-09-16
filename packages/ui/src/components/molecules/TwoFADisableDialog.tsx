import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader, DialogClose } from "./Dialog"

export const TwoFADisableDialog = ({ children }: { children: React.ReactNode }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] bg-white">
                <DialogHeader>
                    <DialogTitle>Cannot remove Authenticator app</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-500">At least one cross-device sign-in 2FA method is required to protect your account.</p>
                <p className="text-sm text-slate-500">Please add an authenticator app, hardware security key or cross-device passkey before deleting Authenticator app.</p>
                <DialogClose className="bg-purple-600 text-white rounded-xl py-2 font-medium"> Got it </DialogClose>
            </DialogContent>
        </Dialog>
    )
}