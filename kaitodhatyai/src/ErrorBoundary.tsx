import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", textAlign: "center", marginTop: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>เกิดข้อผิดพลาด (Something went wrong)</h1>
          <div style={{ padding: "1rem", background: "#fee2e2", color: "#991b1b", borderRadius: "0.5rem", overflow: "auto", maxWidth: "800px", margin: "0 auto", textAlign: "left" }}>
            <p style={{ fontWeight: "bold" }}>Error: {this.state.error?.message}</p>
            <pre style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>{this.state.error?.stack}</pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "#2563eb", color: "white", border: "none", borderRadius: "0.25rem", cursor: "pointer" }}
          >
            โหลดหน้าเว็บใหม่ (Reload)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
