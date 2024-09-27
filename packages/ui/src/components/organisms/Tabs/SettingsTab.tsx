import { PersonalInfo } from "../../molecules/PersonalInfo"
import { Preferences } from "../../molecules/Preferences"
import { user, preference } from "@repo/db/type"

interface SettingsTabProps {
    userDetails: user
    userPreference: preference
    updatePreference: (payload: Partial<preference>) => Promise<{
        message: string;
        statusCode: number;
    }>
}
export const SettingsTab: React.FC<SettingsTabProps> = ({ userDetails, userPreference, updatePreference }) => {
    return (
        <div className="space-y-6">
            <PersonalInfo userDetails={userDetails} />
            <Preferences userDetails={userDetails} userPreference={userPreference} updatePreference={updatePreference} />
        </div>
    )
}