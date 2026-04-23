import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', marginTop: '10vh' }}>
          <h2 style={{ color: 'var(--accent-danger)' }}>Something went wrong.</h2>
          <p className="mt-1">The application encountered an unexpected error.</p>
          <button className="btn-secondary mt-2" onClick={() => window.location.href = '/'}>
            Return to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
