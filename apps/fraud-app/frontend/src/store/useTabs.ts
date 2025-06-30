import { create } from "zustand";
import { SignallingManager } from "../libs/ws"
import { normalTab, realtimeTab, IBufferStore, AllChannelStreamData } from "@/types/index"
import { devtools, persist } from 'zustand/middleware'
import { Transaction, MonitoringData } from "@/types/index"

interface IActions {
    setActiveTab: (tab: normalTab | realtimeTab) => void;
    // setWSConnection: (onReady?: (instance: SignallingManager) => void) => void;
    setWSConnection: (socketInstance: SignallingManager) => void;
    setCloseConnection: () => void;
    setCurrentChannel: (channel: string) => void;
    setForcefullyDisconnect: () => void;
    setStoreInBufferStorage: (msgs: AllChannelStreamData, channel: realtimeTab) => void;
    setClearBufferStorage: (channel: realtimeTab) => void;
}

interface ITabStore {
    activeTab: normalTab | realtimeTab;
    actions: {
        setActiveTab: IActions["setActiveTab"];
    }
}

interface IWSStore {
    wsInstance: null | SignallingManager;
    currentActiveChannel: string | null
    forcefullyDisconnect: boolean,
    bufferStore: IBufferStore;
    actions: {
        setWSConnection: IActions["setWSConnection"];
        setCloseConnection: IActions["setCloseConnection"];
        setCurrentChannel: IActions["setCurrentChannel"];
        setForcefullyDisconnect: IActions["setForcefullyDisconnect"];
        setStoreInBufferStorage: IActions["setStoreInBufferStorage"];
        setClearBufferStorage: IActions["setClearBufferStorage"];
    }
}

const useTabStore = create<ITabStore>((set) => ({
    activeTab: "overview",
    actions: {
        setActiveTab: (tab) => set(() => ({ activeTab: tab })),
    }
}))

const useWSStore = create<IWSStore>()(
    devtools(
        persist(
            (set) => ({
                wsInstance: null,
                currentActiveChannel: null,
                forcefullyDisconnect: false,
                bufferStore: {
                    realtime_transaction: [],
                    realtime_monitor: []
                },
                actions: {
                    setWSConnection: (socketInstance: SignallingManager) => set(() => {
                        console.log("setting ws connection");
                        SignallingManager.isConnected = true
                        return { wsInstance: socketInstance };
                    }),
                    // setWSConnection: (onReady) => set(() => {
                    //     console.log("setting ws connection");
                    //     SignallingManager.isConnected = true
                    //     const instance = SignallingManager.getInstance()
                    //     if (onReady) onReady(instance)
                    //     return { wsInstance: instance };
                    // }),
                    setCloseConnection: () => set((state) => {
                        if (state.wsInstance) {
                            console.log("CLOSING connection from zustand");
                            SignallingManager.isConnected = false
                            state.wsInstance.closeConnection()
                        }
                        return { wsInstance: null };
                    }),
                    setCurrentChannel: (channel) => set(() => ({ currentActiveChannel: channel })),
                    setForcefullyDisconnect: () => set((state) => ({ forcefullyDisconnect: !state.forcefullyDisconnect })),
                    setStoreInBufferStorage: (msgs, channel) => set((state) => {
                        console.log("setting store in buffer storage");
                        switch (channel) {
                            case "realtime_monitor":
                                state.bufferStore.realtime_monitor = [
                                    msgs, ...state.bufferStore.realtime_monitor,
                                ] as MonitoringData[]
                                break;
                            case "realtime_transaction":
                                state.bufferStore.realtime_transaction = [
                                    msgs, ...state.bufferStore.realtime_transaction,
                                ] as Transaction[]
                                break;
                        }
                        return state
                    }),
                    setClearBufferStorage: (channel) => set((state) => {
                        console.log("setting store in buffer storage");
                        switch (channel) {
                            case "realtime_monitor":
                                state.bufferStore.realtime_monitor = [] as MonitoringData[]
                                break;
                            case "realtime_transaction":
                                state.bufferStore.realtime_transaction = [] as Transaction[]
                                break;
                        }
                        return state
                    })
                }
            }),
            {
                name: 'wsStore', partialize: (state) => ({
                    currentActiveChannel: state.currentActiveChannel,
                    forcefullyDisconnect: state.forcefullyDisconnect
                })
            }
        )
    )
)



export const useActiveTab = () => useTabStore((state) => state.activeTab)
export const useActiveTabActions = () => useTabStore((state) => state.actions)
export const useWSInstance = () => useWSStore((state) => state.wsInstance)
export const useForcefullyDisconnect = () => useWSStore((state) => state.forcefullyDisconnect)
export const useBufferStore = () => useWSStore((state) => state.bufferStore)
export const useWSActions = () => useWSStore((state) => state.actions)
