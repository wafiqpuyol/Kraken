import { PersonalInfo } from "../../molecules/PersonalInfo"
import { Preferences } from "../../molecules/Preferences"
import { user, preference, account as AccountType } from "@repo/db/type"
import { forgotPasswordPayload } from "@repo/forms/forgotPasswordSchema"
import { confirmMailPayload } from "@repo/forms/confirmMailSchema"

interface SettingsTabProps {
    userDetails: user
    userPreference: preference
    updatePreference: (payload: Partial<preference>) => Promise<{
        message: string;
        statusCode: number;
    }>
    account: AccountType
    changeEmailAction: (payload: forgotPasswordPayload) => Promise<{
        message: string;
        status: number;
    }>
    updateEmail: (payload: confirmMailPayload) => Promise<{
        message: string;
        status: number;
    }>
    cancelConfirmMail: () => Promise<{
        message: string;
        status: number;
    }>
}
export const SettingsTab: React.FC<SettingsTabProps> = ({ userDetails, userPreference, updatePreference, account, changeEmailAction, updateEmail, cancelConfirmMail }) => {
    return (
        <div className="space-y-6">
            <PersonalInfo userDetails={userDetails} account={account} changeEmailAction={changeEmailAction} updateEmail={updateEmail} cancelConfirmMail={cancelConfirmMail} />
            <Preferences userDetails={userDetails} userPreference={userPreference} updatePreference={updatePreference} />
        </div>
    )
}