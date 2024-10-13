
export const HomeIcon = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
}
export const TransferIcon = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
}

export const TransactionsIcon = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
}

export const DownloadIcon = (props: any) => {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
    )
}

export const ProfileIcon = () => {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-circle-user"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>)
}

export const Send = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-send"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" />
        </svg>
    )
}

export const Tick = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-check text-purple-700"><path d="M20 6 9 17l-5-5" /></svg>
)

export const USD = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width={30} height={30} fill="#269B56" className="w-9">
        <circle cx="50" cy="50" r="45" fill="#fff">
        </circle>
        <path d="M500.496 5C223.572 5 5 229.506 5 500.002c0 276.43 224.506 495.001 495.002 495.001 276.43 0 495.001-224.506 495.001-495.001C995.003 226.539 773.464 5 500.496 5zM297.183 628.253l77.708-14.416c16.418 75.066 56.67 112.154 119.671 112.154 59.34 0 102.858-46.483 102.858-105.824 0-66.264-58.352-95.935-120.66-124.616-69.231-31.648-140.44-66.264-140.44-159.231 0-72.198 49.45-129.561 135.495-152.308V114.78h69.23v69.23c59.935 7.913 98.408 38.177 128.968 97.814l-73.88 42.132c-21.757-40.055-53.9-62.802-90.692-62.802-46.483 0-82.088 32.637-82.088 75.165 0 44.505 32.638 63.297 90.99 90.99 30.659 14.834 57.362 29.67 81.099 42.527 59.34 31.648 87.033 81.099 87.033 150.33 0 87.033-60.33 167.143-141.43 181.979v75.165h-69.23v-69.23C362.726 785.43 320 743.3 297.155 628.277zm296.28-302.812c0-.297.297-.396.693-.396z">
        </path>
    </svg>
)
export const EUR = () => (
    <svg className="w-9" xmlns="http://www.w3.org/2000/svg" width={30} height={30} viewBox="0 0 1000 1000" fill="#00309B"><circle cx="500" cy="500" r="450" fill="#fff"></circle>
        <path d="M5 500.002v.395-.395c.099-89.506 22.55-172.682 67.253-249.726 44.209-74.473 103.55-133.814 178.023-178.023C327.419 27.45 410.694 5 500.002 5c89.308 0 172.583 22.45 249.726 67.253C824.2 116.462 883.54 175.803 927.75 250.276c44.803 77.143 67.253 160.418 67.253 249.726 0 89.308-22.45 172.583-67.253 249.726C883.541 824.2 824.2 883.54 749.728 927.75c-77.143 44.803-160.418 67.253-249.726 67.253-89.308 0-172.583-22.45-249.726-67.253-74.473-44.209-133.814-103.55-178.023-178.022C27.55 672.684 5.099 589.508 5 500.002zm210.66 80.604h57.363c7.912 0 7.912 2.967 9.89 8.901 7.912 33.627 19.78 65.275 35.605 96.924 37.582 72.198 101.868 112.747 183.956 125.605 52.418 9.89 112.748 1.978 167.144-17.803 2.967-1.978 6.923-6.923 6.923-9.89V707.2c-75.165 49.45-148.352 53.407-225.496 10.88-48.461-26.704-81.099-81.1-85.055-137.474h249.232c.989-18.791 5.934-36.593 9.89-54.395H356.1v-55.385h281.87c1.977-19.78 5.933-37.583 10.878-57.363H363.023c3.956-47.473 50.44-128.572 120.66-150.33 67.253-22.748 132.528-16.814 192.858 27.692 4.945-19.78 16.813-72.198 16.813-75.165-58.352-36.594-140.44-42.528-202.748-26.703-114.726 27.692-184.946 98.901-209.671 213.627 0 2.967-2.967 6.923-2.967 10.879H235.44c-3.956 0-5.934 1.978-7.912 6.923-3.956 14.835-5.934 28.681-10.879 43.517 0 1.978-.989 4.945-.989 6.923h57.363v52.417h-34.616c-6.923 0-7.912 2.968-10.879 10.88-3.956 14.835-5.934 27.692-10.879 42.527 0 2.967-.989 2.967-.989 3.956z"></path></svg>
)
export const AUD = () => (
    <svg className="w-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" fill="#F3A022"><circle cx="500" cy="500" r="450" fill="#fff"></circle><path d="M500.496 5C223.572 5 5 229.506 5 500.002c0 276.43 224.506 495.001 495.002 495.001 276.43 0 495.001-224.506 495.001-495.001C995.003 226.539 773.464 5 500.496 5zM154.341 755.662 357.09 211.704c2.967-6.923 6.923-6.923 9.89 0l199.78 543.958c.99 4.945-.989 6.923-5.934 6.923h-56.374c-2.967 0-6.923-.99-7.912-4.945l-41.538-117.693c-.99-3.956-4.946-4.945-7.913-4.945H274.012c-3.956 0-6.923.99-7.912 4.945L221.594 757.64c-1.978 3.956-3.956 4.945-7.912 4.945h-52.418c-5.934 0-7.912-2.967-6.923-6.923zm143.407-204.726c-2.967 5.934 0 8.901 4.945 8.901H417.42c5.934 0 7.912-2.967 6.923-7.912l-57.363-160.22c-1.978-4.945-7.912-4.945-9.89 0zm250.22 31.648c-.988-4.945.99-7.912 4.946-8.9l47.473-8.902c2.967-.989 5.934 0 7.912 4.945 18.791 47.473 39.56 75.165 82.088 75.165 38.571 0 73.187-31.648 73.187-75.165 0-101.868-188.902-77.143-188.902-205.715 0-53.407 37.583-92.967 97.913-110.77v-48.461c0-3.956 2.967-5.934 6.923-5.934h38.571c4.945 0 6.923 1.978 6.923 5.934v48.462c40.55 6.923 72.198 22.747 89.012 65.275 1.978 4.945 1.978 8.9-1.978 10.879l-42.528 24.725c-3.956 1.978-7.912.989-9.89-2.967-12.857-26.703-36.594-39.56-61.319-39.56-32.637 0-57.363 22.747-57.363 52.417 0 31.649 22.748 45.495 63.297 64.286 22.747 10.88 43.517 20.77 59.341 30.66 40.55 25.714 64.286 58.351 64.286 110.77 0 62.307-42.528 120.659-102.858 132.527v50.44c0 4.945-1.978 7.912-6.923 7.912h-38.571c-3.956 0-6.923-2.967-6.923-7.912V706.21c-79.121-16.813-109.78-48.462-124.616-123.627z"></path></svg>
)

export const Eye = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
    </svg>
)

export const ClosedEye = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-eye-off"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" /></svg>
)

export const USDLogo = ({ width, height }: { height?: string, width?: string }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" fill="#269B56" width={width || 30} height={height || 30}>
            <circle cx="50" cy="50" r="45" fill="#fff">
            </circle>
            <path d="M500.496 5C223.572 5 5 229.506 5 500.002c0 276.43 224.506 495.001 495.002 495.001 276.43 0 495.001-224.506 495.001-495.001C995.003 226.539 773.464 5 500.496 5zM297.183 628.253l77.708-14.416c16.418 75.066 56.67 112.154 119.671 112.154 59.34 0 102.858-46.483 102.858-105.824 0-66.264-58.352-95.935-120.66-124.616-69.231-31.648-140.44-66.264-140.44-159.231 0-72.198 49.45-129.561 135.495-152.308V114.78h69.23v69.23c59.935 7.913 98.408 38.177 128.968 97.814l-73.88 42.132c-21.757-40.055-53.9-62.802-90.692-62.802-46.483 0-82.088 32.637-82.088 75.165 0 44.505 32.638 63.297 90.99 90.99 30.659 14.834 57.362 29.67 81.099 42.527 59.34 31.648 87.033 81.099 87.033 150.33 0 87.033-60.33 167.143-141.43 181.979v75.165h-69.23v-69.23C362.726 785.43 320 743.3 297.155 628.277zm296.28-302.812c0-.297.297-.396.693-.396z">
            </path>
        </svg>
    )
}
export const YENLogo = ({ width, height }: { height?: string, width?: string }) => (
    <svg viewBox="0 0 24 24" width={width || 30} height={height || 30} xmlns="http://www.w3.org/2000/svg"><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21ZM14.83,6.45,12,10.7,9.17,6.45a1,1,0,0,0-1.39-.28A1,1,0,0,0,7.5,7.55l2.11,3.17H9a1,1,0,0,0,0,2H11l.05.08v.92H9a1,1,0,0,0,0,2h2V18a1,1,0,0,0,2,0V15.72h2a1,1,0,0,0,0-2H13V12.8l.05-.08H15a1,1,0,0,0,0-2h-.61L16.5,7.55a1,1,0,0,0-.28-1.38A1,1,0,0,0,14.83,6.45Z" fill="#6563ff" /></svg>
)
export const EUROLogo = ({ width, height }: { height?: string, width?: string }) => (
    <svg viewBox="0 0 24 24" width={width || 30} height={height || 30} xmlns="http://www.w3.org/2000/svg"><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Zm.59-13.33a3.34,3.34,0,0,1,2.62,1.38,1,1,0,0,0,1.4.19,1,1,0,0,0,.18-1.41,5.32,5.32,0,0,0-4.2-2.16A5.57,5.57,0,0,0,7.46,9.5H6a1,1,0,0,0,0,2H7c0,.17,0,.33,0,.5s0,.33,0,.5H6a1,1,0,0,0,0,2H7.46a5.57,5.57,0,0,0,5.13,3.83,5.32,5.32,0,0,0,4.2-2.16A1,1,0,1,0,15.21,15a3.34,3.34,0,0,1-2.62,1.38A3.42,3.42,0,0,1,9.67,14.5H12a1,1,0,0,0,0-2H9.05A4.23,4.23,0,0,1,9,12a4.23,4.23,0,0,1,.05-.5H12a1,1,0,0,0,0-2H9.67A3.42,3.42,0,0,1,12.59,7.67Z" fill="#6563ff" /></svg>
)

export const INRLogo = ({ width, height }: { height?: string, width?: string }) => (
    <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" width={width || 30} height={height || 30} className="bg-violet-300 rounded-full p-1"><rect fill="none" height="256" width="256" /><line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="24" x1="72" x2="200" y1="80" y2="80" /><line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="24" x1="72" x2="200" y1="40" y2="40" /><path d="M108,40a52,52,0,0,1,0,104H72l88,80" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="24" /></svg>
)

export const BDTLogo = ({ width, height }: { height?: string, width?: string }) => (
    <svg width={width || 30} height={height || 30} className="icon icon-tabler icon-tabler-currency-taka" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0h24v24H0z" fill="none" stroke="none" />
        <circle cx="16.5" cy="15.5" r="1" /><path d="M7 7a2 2 0 1 1 4 0v9a3 3 0 0 0 6 0v-.5" /><path d="M8 11h6" />
    </svg>
)

export const Deposit = () => (
    <div className="p-5 bg-purple-200 rounded-full hover:bg-purple-300 transform ease in-out duration-200">
        <svg width="35" height="35" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ms-ds-0 me-ds-0 mt-ds-0 mb-ds-0 stroke-ds-icon w-ds-icon-md h-ds-icon-md text-[#7F00FF]">
            <path d="M5 20H19" stroke-linecap="round" stroke-linejoin="round" className="fill-transparent stroke-current"></path>
            <path d="M16.2524 12.5846L13.0023 15.8348C12.4487 16.3884 11.5512 16.3884 10.9976 15.8348L7.74744 12.5846M11.9999 15.5968L11.9999 4.25" stroke-linecap="round" stroke-linejoin="round" className="fill-transparent stroke-current">
            </path></svg>
    </div>
)