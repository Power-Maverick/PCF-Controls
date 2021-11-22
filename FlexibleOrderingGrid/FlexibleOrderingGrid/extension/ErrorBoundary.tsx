import * as React from "react";

interface IErrorProps {}

interface IErrorState {
    // IS THIS THE CORRECT TYPE FOR THE state ?
    hasError: boolean;
}

class ErrorBoundary extends React.Component<IErrorProps, IErrorState> {
    //#region Global Variables
    private _error: any;
    private _errorInfo: React.ErrorInfo;
    //#endregion

    constructor(props: IErrorProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any): IErrorState {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: React.ErrorInfo): void {
        console.log("error: " + error);
        console.log("errorInfo: " + JSON.stringify(errorInfo));
        console.log("componentStack: " + errorInfo.componentStack);
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            <div>
                <h2>Something went wrong.</h2>
            </div>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
