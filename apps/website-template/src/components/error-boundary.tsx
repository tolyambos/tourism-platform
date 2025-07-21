'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 m-2 bg-red-100 border border-red-400 rounded">
          <p className="text-red-700 font-semibold">
            Error in {this.props.componentName || 'component'}
          </p>
          {this.state.error && (
            <p className="text-red-600 text-sm mt-1">{this.state.error.toString()}</p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}