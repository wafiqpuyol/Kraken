import { PersonalInfo } from "../../molecules/PersonalInfo"
import { Preferences } from "../../molecules/Preferences"

export const SettingsTab = () => {
    return (
        <div className="space-y-6">
            <PersonalInfo />
            <Preferences />
        </div>
    )
}