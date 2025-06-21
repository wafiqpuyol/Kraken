import {  useTranslations } from 'next-intl';
import { DialogContent } from "../molecules/Dialog"


export const Enable2FAPrompt = () => {
    const t = useTranslations("AddMoney")
    return (<DialogContent className="sm:max-w-[425px] bg-white p-8" onInteractOutside={(e) => {
        e.preventDefault();
    }}>
        <p className="my-4 font-semibold text-lg">{t("title1")}</p>
        <span className="px-2 text-sm font-medium text-slate-500 leading-[1.8rem]">Got to settings &gt; select <span className="font-bold py-[2px] border-black/40 px-[5px] rounded-lg border-[1px] mr-2">Security</span> Tab &gt; click on {" "}
            <span className="font-bold py-[2px] border-black/40 px-[5px] rounded-lg border-[1px] mr-2">Authenticator app</span>
            Enable Button.</span>
    </DialogContent>)
}