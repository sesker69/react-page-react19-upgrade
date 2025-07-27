// Polyfill for findDOMNode that was removed in React 19
// This is a temporary workaround for dependencies that still use findDOMNode

import { findDOMNode } from 'react-dom';

// If findDOMNode doesn't exist (React 19), create a polyfill
if (!findDOMNode) {
  const originalReactDOM = require('react-dom');

  // Create a simple polyfill that returns the node itself if it's already a DOM node
  // or tries to find the DOM node from a React component instance
  const findDOMNodePolyfill = (componentOrElement) => {
    if (componentOrElement == null) {
      return null;
    }

    // If it's already a DOM node, return it
    if (componentOrElement.nodeType === 1) {
      return componentOrElement;
    }

    // If it's a React component instance, try to get the DOM node
    if (
      componentOrElement._reactInternalFiber ||
      componentOrElement._reactInternalInstance
    ) {
      // For React components, we can't easily get the DOM node in React 19
      // This is a best-effort approach
      console.warn(
        'findDOMNode is deprecated and has been removed in React 19. Please update your components to use refs instead.'
      );
      return null;
    }

    // Fallback: return the element itself if it looks like a DOM node
    if (
      componentOrElement &&
      typeof componentOrElement === 'object' &&
      componentOrElement.nodeType
    ) {
      return componentOrElement;
    }

    return null;
  };

  // Add the polyfill to react-dom
  originalReactDOM.findDOMNode = findDOMNodePolyfill;

  // Also add it to the default export if it exists
  if (originalReactDOM.default) {
    originalReactDOM.default.findDOMNode = findDOMNodePolyfill;
  }
}
