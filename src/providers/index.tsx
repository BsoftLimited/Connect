import { type Component, type ParentComponent, JSX, mergeProps } from "solid-js";

export interface MultiProviderProps {
    providers: ParentComponent[];
    children: JSX.Element;
}

const MultiProvider: Component<MultiProviderProps> = ({ children, providers }) => {
    // Merge default props (Solid equivalent to React's PropsWithChildren)
    //const merged = mergeProps({ providers: [] }, props);

    return providers.reduceRight(
        (child, Provider) => <Provider>{child}</Provider>,
        children
    );
};

export { MultiProvider };