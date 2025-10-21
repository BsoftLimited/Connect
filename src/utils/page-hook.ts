import { createSignal } from "solid-js";

type PanelsState<T> = {
    show: boolean,
    panel?: T,
    params?: any
}

export type PageState<T, R> = {
    currentPage: T,
    panelState: PanelsState<R>,
    params?: any
}

const usePage = <T, R>(initialPage: T) =>{
    const [pageState, setPageState] = createSignal<PageState<T, R>>({ currentPage: initialPage, panelState: { show: false } });

    return {
        pageState,
        closePanel: () =>{
            setPageState((init)=>{
                return {...init, panelState: { show: false }}
            });
        },
        openPanel: (panel: R, params?: any) => {
            setPageState((init)=>{
                return {...init, panelState: { show: true, panel, params } }
            });
        },
        choosePage: (page: T, params?: any) => {
            setPageState((init)=>{
                return {...init, currentPage: page, params, panelState: { show: false } }
            });
        },
    };
}

export default usePage;