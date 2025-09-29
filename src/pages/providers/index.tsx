import { type Component, JSX, type ParentComponent } from "solid-js";

export interface MultiProviderProps {
    providers: ParentComponent<{ children: JSX.Element }>[];
    children: JSX.Element;
}

export const MultiProvider: Component<MultiProviderProps> = (props) => {
    return props.providers.reduceRight(
        (child, Provider) => <Provider>{child}</Provider>,
        props.children
    );
};