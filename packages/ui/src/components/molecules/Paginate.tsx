"use client"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { ReactNode, useCallback, useEffect } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../atoms/Pagination"

interface PaginationDemoProps {
    totalCount: number;
    page: number;
}
export const PaginationDemo: React.FC<PaginationDemoProps> = ({ page, totalCount }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const totalPageCount = Math.ceil(totalCount / 10);


    console.log(totalPageCount);
    useEffect(() => {
        const page = searchParams.get("page")
        if (page !== null && totalPageCount < parseInt(page)) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("page", String(totalPageCount));
            router.replace(`${pathname}?${newSearchParams.toString()}`);
        }
    }, [searchParams.get("page") !== null, totalCount])

    const buildLink = useCallback(
        (newPage: number) => {
            const key = 'page';
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set(key, String(newPage));
            return `${pathname}?${newSearchParams.toString()}`;
        },
        [searchParams, pathname]
    );

    const renderPageNumbers = (className: string) => {
        const items: ReactNode[] = [];
        const maxVisiblePages = 5;

        if (totalPageCount <= maxVisiblePages) {
            for (let i = 1; i <= totalPageCount; i++) {
                items.push(
                    <PaginationItem className={className} key={i} >
                        <PaginationLink onClick={() => router.push(buildLink(i))} isActive={page === i}>
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        } else {
            items.push(
                <PaginationItem className={className} key={1}>
                    <PaginationLink onClick={() => router.push(buildLink(1))} isActive={page === 1}>
                        1
                    </PaginationLink>
                </PaginationItem>
            );

            if (page > 3) {
                items.push(
                    <PaginationItem key='ellipsis-start'>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            const start = Math.max(2, page - 1);
            const end = Math.min(totalPageCount - 1, page + 1);

            for (let i = start; i <= end; i++) {
                items.push(
                    <PaginationItem className={className} key={i}>
                        <PaginationLink onClick={() => router.push(buildLink(i))} isActive={page === i}>
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            if (page < totalPageCount - 2) {
                items.push(
                    <PaginationItem key='ellipsis-end'>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            items.push(
                <PaginationItem className={className} key={totalPageCount}>
                    <PaginationLink
                        onClick={() => router.push(buildLink(totalPageCount))}
                        isActive={page === totalPageCount}
                    >
                        {totalPageCount}
                    </PaginationLink>
                </PaginationItem>
            );
        }
        return items;
    };

    return (
        <Pagination>
            <PaginationContent className='max-sm:gap-0 mt-6'>
                <PaginationItem>
                    <PaginationPrevious
                        onClick={() => router.push(buildLink(Math.max(page - 1, 1)))}
                        aria-disabled={page === 1}
                        tabIndex={page === 1 ? -1 : undefined}
                        className={
                            page === 1 ? 'pointer-events-none opacity-50' : "cursor-pointer"
                        }
                    />
                </PaginationItem>
                {renderPageNumbers("cursor-pointer")}
                <PaginationItem>
                    <PaginationNext
                        onClick={() => router.push(buildLink(Math.min(page + 1, totalPageCount)))}
                        aria-disabled={page === totalPageCount}
                        tabIndex={page === totalPageCount ? -1 : undefined}
                        className={
                            page === totalPageCount
                                ? 'pointer-events-none opacity-50'
                                : "cursor-pointer"
                        }
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}
