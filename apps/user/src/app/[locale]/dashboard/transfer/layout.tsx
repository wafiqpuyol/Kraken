import { Transfer } from '@repo/ui/Transfer'
import { ModalProvider } from "@repo/ui/ModalProvider"

interface LayoutProps {
    children: React.ReactNode
}
const layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <Transfer>
            <ModalProvider>
                {children}
            </ModalProvider>
        </Transfer>
    )
}

export default layout