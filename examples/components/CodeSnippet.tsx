// lazy load this file to keep initial bundle small

import SyntaxHighlighter from 'react-syntax-highlighter';

const vs2015 = require('react-syntax-highlighter/dist/styles/vs2015')
  .default as any;
import React from 'react';

const CodeSnippet: React.FC<{
  code: string;
  language: string;
}> = ({ code, language }) => (
  <SyntaxHighlighter wrapLongLines language={language} style={vs2015}>
    {code}
  </SyntaxHighlighter>
);

export default CodeSnippet;
