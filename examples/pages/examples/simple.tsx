import React, { useState, useTransition, startTransition } from 'react';

// The editor core
import type { Value } from '@react-page/editor';
import Editor from '@react-page/editor';

// import the main css, uncomment this: (this is commented in the example because of https://github.com/vercel/next.js/issues/19717)
// import '@react-page/editor/lib/index.css';

// The rich text area plugin
import slate from '@react-page/plugins-slate';
// image
import image from '@react-page/plugins-image';
import PageLayout from '../../components/PageLayout';

// Stylesheets for the rich text area plugin
// uncomment this
//import '@react-page/plugins-slate/lib/index.css';

// Stylesheets for the imagea plugin
//import '@react-page/plugins-image/lib/index.css';

// Define which plugins we want to use.
const cellPlugins = [slate(), image];

const SAMPLE_VALUE: Value = {
  id: 'simple-example',
  rows: [
    {
      id: 'sample-row',
      cells: [
        {
          id: 'sample-cell',
          size: 12,
          plugin: {
            id: 'ory/editor/core/content/slate',
            version: 1,
          },
          dataI18n: {
            default: {
              slate: [
                {
                  type: 'HEADINGS/HEADING-ONE',
                  children: [{ text: 'Simple Example with React 19' }],
                },
                {
                  type: 'PARAGRAPH/PARAGRAPH',
                  children: [
                    {
                      text: 'This is a simple example that demonstrates React 19\'s useTransition hook for non-blocking updates. Try editing this content and notice the "Updating..." indicator in the top right corner during state transitions.',
                    },
                  ],
                },
              ],
            },
          },
          rows: [],
          inline: null,
        },
      ],
    },
  ],
  version: 1,
};

export default function SimpleExample() {
  const [value, setValue] = useState<Value>(SAMPLE_VALUE);
  const [isPending, startTransition] = useTransition();

  // React 19: Use useTransition for non-blocking updates
  const handleChange = (newValue: Value) => {
    startTransition(() => {
      setValue(newValue);
    });
  };

  return (
    <PageLayout>
      {isPending && (
        <div
          style={{
            position: 'fixed',
            top: 10,
            right: 10,
            padding: 8,
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          Updating...
        </div>
      )}
      <Editor cellPlugins={cellPlugins} value={value} onChange={handleChange} />
    </PageLayout>
  );
}
