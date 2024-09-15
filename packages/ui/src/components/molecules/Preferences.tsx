import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../atoms/Select"
import { Button } from "../atoms/Button"
import { Label } from "../atoms/Label"


export const Preferences = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Preferences</h2>
            <div className="space-y-4">
                {/* Language*/}
                <div className="flex justify-between items-center">
                    <div className="flex space-x-32">
                        <Label htmlFor="language" className="mt-2 text-slate-500 w-36">Language</Label>
                        <Select defaultValue="en-US">
                            <SelectTrigger id="language">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent className='bg-white text-black'>
                                <SelectItem className="cursor-pointer" value="en-US">U.S. English</SelectItem>
                                <SelectItem className="cursor-pointer" value="bn-BD">Bengali</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="link" className="text-purple-600">Edit</Button>
                </div>
                {/* Currency */}
                <div className="flex justify-between items-center">
                    <div className="flex space-x-[135px]">
                        <Label htmlFor="currency" className="mt-2 text-slate-500 w-36">Currency</Label>
                        <Select defaultValue="USD">
                            <SelectTrigger id="currency">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent className='bg-white text-black'>
                                <SelectItem className="cursor-pointer" value="USD">USD</SelectItem>
                                <SelectItem className="cursor-pointer" value="EUR">EUR</SelectItem>
                                <SelectItem className="cursor-pointer" value="GBP">GBP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="link" className="text-purple-600">Edit</Button>
                </div>
                {/* Timezone */}
                <div className="flex justify-between items-center">
                    <div className="flex space-x-[108px]">
                        <Label htmlFor="timezone" className="mt-2 text-slate-500 w-36">Timezone</Label>
                        <Select defaultValue="UTC">
                            <SelectTrigger id="timezone">
                                <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent className='bg-white text-black '>
                                <SelectItem value="UTC" className="cursor-pointer">[+00:00 UTC] UTC, Universal Time</SelectItem>
                                <SelectItem value="EST" className="cursor-pointer">[-05:00 EST] Eastern Standard Time</SelectItem>
                                <SelectItem value="CST" className="cursor-pointer">[-06:00 CST] Central Standard Time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="link" className="text-purple-600">Edit</Button>
                </div>
                {/* Auto log-out */}
                <div className="flex justify-between items-center">
                    <div className="flex space-x-[100px]">
                        <Label htmlFor="autoLogout" className="mt-2 text-slate-500 w-44">Auto log-out</Label>
                        <Select defaultValue="8">
                            <SelectTrigger id="autoLogout">
                                <SelectValue placeholder="Select auto log-out time" />
                            </SelectTrigger>
                            <SelectContent className='bg-white text-black'>
                                <SelectItem className="cursor-pointer" value="8">Default (8 hours)</SelectItem>
                                <SelectItem className="cursor-pointer" value="4">4 hours</SelectItem>
                                <SelectItem className="cursor-pointer" value="2">2 hours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="link" className="text-purple-600">Edit</Button>
                </div>
            </div>
        </div>
    )
}