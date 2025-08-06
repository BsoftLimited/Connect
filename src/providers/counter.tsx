import { createContext, useContext, type ParentComponent, createSignal } from "solid-js";

// 1. Define your context type
interface CounterContextType {
  count: () => number;
  increment: () => void;
  reset: () => void;
}

// 2. Create context with default value
const CounterContext = createContext<CounterContextType>();

// 3. Create provider component
const CounterProvider: ParentComponent = (props) => {
  const [count, setCount] = createSignal(0);

  const counter: CounterContextType = {
    count,
    increment: () => setCount(c => c + 1),
    reset: () => setCount(0)
  };

  return (
    <CounterContext.Provider value={counter}>
        {props.children}
    </CounterContext.Provider>
  );
};

// 4. Create custom hook for consuming context
const useCounter = () => {
  const context = useContext(CounterContext);
  if (!context) throw new Error("useCounter must be used within a CounterProvider");
  return context;
};

export { CounterProvider, useCounter };