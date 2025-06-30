import { Dialog, DialogContent, DialogClose, DialogTrigger } from "../molecules/Dialog"
import { Dispatch, SetStateAction } from "react";
import {Button} from "../atoms/Button"


interface IEarleyScheduleNoticeProps {
    setShowScheduleNotice: Dispatch<SetStateAction<boolean>>
    showScheduleNotice: boolean
}

export const EarleyScheduleNotice: React.FC<IEarleyScheduleNoticeProps> = ({ setShowScheduleNotice, showScheduleNotice }) => {
    return (
        <Dialog open={showScheduleNotice}>
            <DialogContent className="bg-white text-slate-600 w-[1000px] flex flex-col">
                🕐 Too Soon to Schedule
                For your security and to ensure successful processing, payments must be scheduled at least 15 minutes in advance.

                [Reschedule] [Send Now Instead]
                <DialogClose>
                    <Button onClick={() => setShowScheduleNotice(false)}>Cancel</Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    )
}