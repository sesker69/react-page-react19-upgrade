import React from 'react';
import ErrorCell from './ErrorCell';

interface CellErrorGateProps {
  children: React.ReactNode;
  nodeId: string;
  shouldShowError?: boolean;
}

interface CellErrorGateState {
  error: Error | null;
}

export class CellErrorGate extends React.Component<
  CellErrorGateProps,
  CellErrorGateState
> {
  constructor(props: CellErrorGateProps) {
    super(props);
    this.state = {
      error: null,
    };
  }

  componentDidCatch(error: Error) {
    this.setState({ error });
    console.error(error);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error && this.props.shouldShowError) {
      return (
        <ErrorCell
          nodeId={this.props.nodeId}
          error={this.state.error}
          resetError={this.reset}
        />
      );
    }
    return this.props.children;
  }
}
