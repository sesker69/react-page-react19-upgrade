// Polyfill for findDOMNode that was removed in React 19
// This fixes compatibility issues with older dependencies

const findDOMNodePolyfill = (componentOrElement) => {
  if (componentOrElement == null) {
    return null;
  }
  
  // If it's already a DOM node, return it
  if (componentOrElement.nodeType === 1) {
    return componentOrElement;
  }
  
  // If it's a React component instance with a ref
  if (componentOrElement.current && componentOrElement.current.nodeType === 1) {
    return componentOrElement.current;
  }
  
  // For React components, log a warning and return null
  if (componentOrElement._reactInternalFiber || componentOrElement._reactInternalInstance) {
    console.warn('findDOMNode is deprecated and has been removed in React 19. Please update your components to use refs instead.');
    return null;
  }
  
  // Fallback: return the element itself if it looks like a DOM node
  if (componentOrElement && typeof componentOrElement === 'object' && componentOrElement.nodeType) {
    return componentOrElement;
  }
  
  return null;
};

// Apply polyfill
if (typeof window !== 'undefined') {
  // Client-side polyfill
  try {
    const ReactDOM = require('react-dom');
    ReactDOM.findDOMNode = ReactDOM.findDOMNode || findDOMNodePolyfill;
    
    if (ReactDOM.default) {
      ReactDOM.default.findDOMNode = ReactDOM.default.findDOMNode || findDOMNodePolyfill;
    }
  } catch (error) {
    console.warn('Could not apply findDOMNode polyfill:', error);
  }
} else {
  // Server-side polyfill
  try {
    const ReactDOM = require('react-dom');
    ReactDOM.findDOMNode = ReactDOM.findDOMNode || (() => null);
    
    if (ReactDOM.default) {
      ReactDOM.default.findDOMNode = ReactDOM.default.findDOMNode || (() => null);
    }
  } catch (error) {
    // Ignore server-side errors
  }
}
