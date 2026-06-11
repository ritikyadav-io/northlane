import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const RouterContext = createContext();

export function RouterProvider({ children }) {
  const [path, setPath] = useState(window.location.pathname);
  const historyStack = useRef([]);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to) => {
    if (window.location.pathname !== to) {
      // Push current path onto history stack before navigation
      historyStack.current.push(window.location.pathname);
      window.history.pushState(null, '', to);
      setPath(to);
      window.scrollTo(0, 0); // Scroll to top on navigation
    }
  };

  const goBack = () => {
    if (historyStack.current.length > 0) {
      const previous = historyStack.current.pop();
      window.history.pushState(null, '', previous);
      setPath(previous);
    } else {
      // Fallback to default back behavior
      window.history.back();
    }
  };

  // Extract params from pathname
  let routeParams = {};
  let currentView = 'home'; // 'home', 'product', 'collections', 'landing'

  if (path === '/' || path === '') {
    currentView = 'home';
  } else if (path === '/debug') {
    currentView = 'debug';
  } else if (path.startsWith('/products/')) {
    currentView = 'product';
    routeParams.handle = path.substring('/products/'.length);
  } else if (path === '/collections/all' || path.startsWith('/collections/')) {
    currentView = 'collections';
    routeParams.handle = path.substring('/collections/'.length) || 'all';
  } else if (path === '/landing/tumbler') {
    currentView = 'landing';
  } else if (path.startsWith('/policies/')) {
    currentView = 'policy';
    routeParams.policyType = path.substring('/policies/'.length);
  } else if (path === '/pages/contact') {
    currentView = 'policy';
    routeParams.policyType = 'contact';
  } else if (path === '/pages/about' || path === '/pages/about-us') {
    currentView = 'about';
  } else {
    // Fallback to home
    currentView = 'home';
  }

  return (
    <RouterContext.Provider value={{ path, currentView, routeParams, navigate, goBack }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

export function Link({ to, children, className, ...props }) {
  const { navigate, goBack } = useRouter();

  const handleClick = (e) => {
    // Keep standard modifiers working (CMD/Ctrl click to open in new tab)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}
