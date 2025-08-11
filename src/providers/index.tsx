import { type Component, type ParentComponent, JSX, mergeProps } from "solid-js";

export interface MultiProviderProps {
    providers: ParentComponent[];
    children: JSX.Element;
}

const MultiProvider: Component<MultiProviderProps> = ({ children, providers }) => {
    return providers.reduceRight(
        (child, Provider) => <Provider>{child}</Provider>,
        children
    );
};

export { MultiProvider };