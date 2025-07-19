import { render } from '@testing-library/react';
import React from 'react';
import type { CellPlugin } from '../../core/types';
import { HTMLRenderer } from '../HTMLRenderer';

jest.mock('react', () => {
  const r = jest.requireActual('react');

  return { ...r, memo: (x) => x };
});

const somePlugin: CellPlugin<{ text: string }> = {
  id: 'somePlugin',
  version: 1,
  cellClassName: 'some-class',
  Renderer: (props) => <p>{props.data.text}</p>,
};

const cellPlugins = [somePlugin];

describe('HTMLRenderer', () => {
  describe('rendering html content from slate', () => {
    [
      {
        id: '1',
        version: 1,
        rows: [
          {
            id: 'someid',
            cells: [
              {
                id: '4c0f5ab5-f331-4d69-8850-7de0df917cc2',
                size: 12,

                plugin: {
                  id: 'somePlugin',
                  version: 1,
                },
                dataI18n: {
                  en: {
                    text: 'Hello world',
                  },
                },
              },
            ],
          },
        ],
      },
    ].forEach((c, k) => {
      describe(`case ${k}`, () => {
        it('should render the expected content', () => {
          const { container, getByText } = render(
            <HTMLRenderer value={c} cellPlugins={cellPlugins} />
          );
          
          // Check that the text content is rendered
          expect(getByText('Hello world')).toBeInTheDocument();
          
          // Check that the row structure is present
          const rowElement = container.querySelector('.react-page-row');
          expect(rowElement).toBeInTheDocument();
          
          // Check that the cell structure is present
          const cellElement = container.querySelector('.react-page-cell');
          expect(cellElement).toBeInTheDocument();
          expect(cellElement).toHaveClass('react-page-cell-sm-12');
          expect(cellElement).toHaveClass('react-page-cell-xs-12');
          expect(cellElement).toHaveClass('react-page-cell-leaf');
          
          // Check that the plugin's custom class is applied
          const cellInner = container.querySelector('.react-page-cell-inner');
          expect(cellInner).toHaveClass('some-class');
          
          // Check that the paragraph element is rendered
          const paragraphElement = container.querySelector('p');
          expect(paragraphElement).toBeInTheDocument();
          expect(paragraphElement).toHaveTextContent('Hello world');
        });
      });
    });
  });
});
