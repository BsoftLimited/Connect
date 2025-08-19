import { type Component, JSX } from "solid-js";

export interface MultiProviderProps {
    providers: Component<{ children: JSX.Element }>[];
    children: JSX.Element;
}

const MultiProvider: Component<MultiProviderProps> = (props) => {
    return props.providers.reduceRight(
        (child, Provider) => <Provider>{child}</Provider>,
        props.children
    );
};

export { MultiProvider };