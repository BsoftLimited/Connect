import React from "react";

const App = () => {
    const [count, setCount] = React.useState(0);

    const increment = () => {
        setCount(count + 1);
    }
    
    return (
        <div>
            <h1>Welcome to the App Page</h1>
            <p onClick={increment}>This is the connect application page.</p>
            <div>
                <p>Count: {count}</p>
                <button onClick={increment}>Increment</button>
            </div>
        </div>
    );
}

export default App;