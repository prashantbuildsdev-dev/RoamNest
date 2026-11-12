import { createContext, useContext, useState, useRef, useEffect } from "react";
import "./MessageContext.css";

const MessageContext = createContext();

export function MessageProvider({ children }) {

    const [message, setMessage] = useState(null);
    const timeoutRef = useRef(null);

    const showMessage = (text, type = "success") => {

        clearTimeout(timeoutRef.current);

        setMessage({
            text,
            type
        });

        timeoutRef.current = setTimeout(() => {
            setMessage(null);
        }, 3500);

    };

    const hideMessage = () => {
        clearTimeout(timeoutRef.current);
        setMessage(null);
    };

    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);

    return (
        <MessageContext.Provider value={{ showMessage, hideMessage }}>

            {children}

            {message && (
                <div className={`app-message ${message.type}`} role="alert">

                    <span>{message.text}</span>

                    <button onClick={hideMessage}>
                        ×
                    </button>

                </div>
            )}

        </MessageContext.Provider>
    );

}

export function useMessage() {

    const context = useContext(MessageContext);

    if (!context) {
        throw new Error("useMessage must be used inside MessageProvider");
    }

    return context;

}