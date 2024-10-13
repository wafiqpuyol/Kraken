import { useEffect, useState } from 'react'

export const PageLoader = () => {
    const [visibleCircles, setVisibleCircles] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setVisibleCircles((prev) => (prev < 3 ? prev + 1 : 0))
        }, 500)

        return () => clearInterval(timer)
    }, [])

    return (
        <div className="min-h-screen bg-red-100 flex items-center w-screen justify-center">
            <div className="flex space-x-4">
                {[1, 2, 3].map((circle) => (
                    <div
                        key={circle}
                        className={`w-10 h-10 bg-purple-600 rounded-full shadow-lg transition-all duration-500 ease-in-out ${circle <= visibleCircles
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-0'
                            }`}
                    ></div>
                ))}
            </div>
        </div>
    )
}