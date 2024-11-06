"use client"
import { Dispatch, SetStateAction, useContext, useState, createContext } from "react";
import { LimitExceedModal } from "./LimitExceedModal"

type ModalContextType = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
};
const ModalContext = createContext<ModalContextType>({
    open: false,
    setOpen: () => { },
});
export const useModal = () => {
    return useContext(ModalContext);
};
export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    return (
        <ModalContext.Provider value={{ open, setOpen }}>
            {children}
            <LimitExceedModal />
        </ModalContext.Provider>
    );
}