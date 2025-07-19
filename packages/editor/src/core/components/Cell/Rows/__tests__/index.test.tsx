import { render } from '@testing-library/react';
import React from 'react';
import Component from '../index';

// Mock the hooks module to avoid Redux dependency
jest.mock('../../../hooks', () => ({
  useNodeChildrenIds: jest.fn(() => [])
}));

describe('components/Cell/Rows', () => {
  it('renders a single div', () => {
    const { container } = render(<Component nodeId="some-node-id" />);
    const rowsDiv = container.querySelector('.react-page-cell-rows');
    expect(rowsDiv).toBeInTheDocument();
  });
});
