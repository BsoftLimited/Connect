import { type Component, type ParentComponent, JSX, mergeProps } from "solid-js";

export interface MultiProviderProps {
    providers: ParentComponent[];
    children: JSX.Element;
}

const MultiProvider: Component<MultiProviderProps> = (props) => {
    return props.providers.reduceRight(
        (child, Provider) => <Provider>{child}</Provider>,
        props.children
    );
};

export { MultiProvider };