import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./Dialog"
import { useModal } from "./ModalProvider"
import { Hourglass } from "../../icons/index"
import { useRouter } from "next/navigation"
import { FaArrowLeft } from "react-icons/fa";


export const LimitExceedModal = () => {
    const { open } = useModal()
    const router = useRouter()

    return (
        <Dialog open={open}>
            <DialogContent className="bg-white text-slate-600 w-[1000px] flex flex-col">
                <div className="flex items-center gap-1 font-bold cursor-pointer absolute" onClick={() => router.back()}>
                    <FaArrowLeft />
                    <p>Back</p>
                </div>
                <div className="p-3 rounded-full bg-purple-500 self-center mb-4 mt-10"><Hourglass /></div>
                <DialogHeader className="self-center px-5">
                    <DialogTitle className="text-xl text-center text-slate-800 font-extrabold">You have reached your daily withdrawal limit {new Date(Date.now()).toDateString()}.</DialogTitle>
                </DialogHeader>
                <div className="self-center px-8 text-slate-500 mb-5 font-medium text-sm mt-2">
                    This means you cannot make any withdrawals today.
                    Please try again tomorrow when your daily limit is reset. Consider making smaller transactions to stay within your daily limit.
                </div>
            </DialogContent>
        </Dialog>
    )
}