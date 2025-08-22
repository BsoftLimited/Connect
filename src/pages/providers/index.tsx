import { type Component, JSX } from "solid-js";
import { ThemeProvider } from "./theme";
import { UserContextProvider } from "./user";
import { AppContextProvider } from "./app";
import { UploadContextProvider } from "./upload";
import { ContextMenuProvider } from "./context-menu";

export interface MultiProviderProps {
    providers: Component<{ children: JSX.Element }>[];
    children: JSX.Element;
}

export const MultiProvider: Component<MultiProviderProps> = (props) => {
    return props.providers.reduceRight(
        (child, Provider) => <Provider>{child}</Provider>,
        props.children
    );
};

const AllProviders: Component<{ children: JSX.Element }> = (props) => {
    return (
        <ThemeProvider>
            <UserContextProvider>
                <ContextMenuProvider>
                    {props.children}
                </ContextMenuProvider>
            </UserContextProvider>
        </ThemeProvider>
    );
}

export default AllProviders;