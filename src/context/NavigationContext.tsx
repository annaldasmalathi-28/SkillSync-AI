import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppRoute =
  | '/'
  | '/login'
  | '/signup'
  | '/dashboard'
  | '/profile'
  | '/skills'
  | '/verification'
  | '/skill-gap'
  | '/career'
  | '/roadmap'
  | '/projects'
  | '/internships'
  | '/internships/:id'
  | '/saved'
  | '/applications'
  | '/resume'
  | '/assistant'
  | '/progress'
  | '/admin/login'
  | '/admin/dashboard'
  | '/admin/students'
  | '/admin/students/:id'
  | '/admin/internships'
  | '/admin/applications'
  | '/admin/analytics'
  | '/admin/reports';

interface NavigationContextType {
  currentPath: string;
  currentRoute: AppRoute;
  params: Record<string, string>;
  navigate: (to: string, params?: Record<string, string>) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash ? window.location.hash.replace('#', '') : '';
    return hash && hash !== '/' ? hash : '/login';
  });
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/login';
      parseAndSetRoute(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const parseAndSetRoute = (pathWithQuery: string, customParams?: Record<string, string>) => {
    const cleanPath = pathWithQuery.split('?')[0] || '/';
    setCurrentPath(cleanPath);

    // Extract dynamic params like /internships/int-1 or /admin/students/stud-1
    const newParams: Record<string, string> = { ...customParams };

    if (cleanPath.startsWith('/internships/') && cleanPath !== '/internships') {
      const id = cleanPath.replace('/internships/', '');
      newParams.id = id;
    } else if (cleanPath.startsWith('/admin/students/') && cleanPath !== '/admin/students') {
      const id = cleanPath.replace('/admin/students/', '');
      newParams.id = id;
    }

    setParams(newParams);
  };

  const navigate = (to: string, routeParams?: Record<string, string>) => {
    window.location.hash = to;
    parseAndSetRoute(to, routeParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    window.history.back();
  };

  // Derive standardized route pattern
  let currentRoute: AppRoute = '/';
  if (currentPath === '/' || currentPath === '') currentRoute = '/';
  else if (currentPath === '/login') currentRoute = '/login';
  else if (currentPath === '/signup') currentRoute = '/signup';
  else if (currentPath === '/dashboard') currentRoute = '/dashboard';
  else if (currentPath === '/profile') currentRoute = '/profile';
  else if (currentPath === '/skills') currentRoute = '/skills';
  else if (currentPath === '/verification') currentRoute = '/verification';
  else if (currentPath === '/skill-gap') currentRoute = '/skill-gap';
  else if (currentPath === '/career') currentRoute = '/career';
  else if (currentPath === '/roadmap') currentRoute = '/roadmap';
  else if (currentPath === '/projects') currentRoute = '/projects';
  else if (currentPath === '/internships') currentRoute = '/internships';
  else if (currentPath.startsWith('/internships/')) currentRoute = '/internships/:id';
  else if (currentPath === '/saved') currentRoute = '/saved';
  else if (currentPath === '/applications') currentRoute = '/applications';
  else if (currentPath === '/resume') currentRoute = '/resume';
  else if (currentPath === '/assistant') currentRoute = '/assistant';
  else if (currentPath === '/progress') currentRoute = '/progress';
  else if (currentPath === '/admin/login') currentRoute = '/admin/login';
  else if (currentPath === '/admin/dashboard') currentRoute = '/admin/dashboard';
  else if (currentPath === '/admin/students') currentRoute = '/admin/students';
  else if (currentPath.startsWith('/admin/students/')) currentRoute = '/admin/students/:id';
  else if (currentPath === '/admin/internships') currentRoute = '/admin/internships';
  else if (currentPath === '/admin/applications') currentRoute = '/admin/applications';
  else if (currentPath === '/admin/analytics') currentRoute = '/admin/analytics';
  else if (currentPath === '/admin/reports') currentRoute = '/admin/reports';
  else currentRoute = '/dashboard';

  return (
    <NavigationContext.Provider
      value={{
        currentPath,
        currentRoute,
        params,
        navigate,
        goBack,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
