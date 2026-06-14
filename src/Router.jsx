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

  let cleanPath = path;
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  if (cleanPath === '/' || cleanPath === '') {
    currentView = 'home';
  } else if (cleanPath === '/debug') {
    currentView = 'debug';
  } else if (cleanPath.startsWith('/products/') || cleanPath === '/products') {
    currentView = 'product';
    let handle = cleanPath.substring('/products/'.length) || '';
    routeParams.handle = handle;
    if (!handle) {
      currentView = 'home';
    }
  } else if (cleanPath === '/collections' || cleanPath === '/collections/all' || cleanPath.startsWith('/collections/')) {
    currentView = 'collections';
    let handle = 'all';
    if (cleanPath.startsWith('/collections/')) {
      handle = cleanPath.substring('/collections/'.length) || 'all';
    }
    routeParams.handle = handle;
  } else if (cleanPath === '/landing/tumbler') {
    currentView = 'landing';
  } else if (cleanPath.startsWith('/policies/') || cleanPath === '/policies') {
    currentView = 'policy';
    routeParams.policyType = cleanPath.substring('/policies/'.length) || 'privacy';
  } else if (cleanPath === '/pages/contact') {
    currentView = 'policy';
    routeParams.policyType = 'contact';
  } else if (cleanPath === '/pages/about' || cleanPath === '/pages/about-us') {
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
