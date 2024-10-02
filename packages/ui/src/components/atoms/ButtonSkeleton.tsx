import { Skeleton } from "../molecules/Skeleton"

export const ButtonSkeleton = () => {
    return (
        <div className="cursor-pointer rounded-lg w-[100px]">
            <Skeleton className='bg-purple-500 p-x-4 p-y-2 h-[40px]' />
        </div>
    )
}

