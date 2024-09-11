import { Transfer } from '@repo/ui/Transfer'

interface LayoutProps {
    children: React.ReactNode
}
const layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <Transfer>{children}</Transfer>
    )
}

export default layout