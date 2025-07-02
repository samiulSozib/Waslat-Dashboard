// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';
// import { useSelector } from 'react-redux';

// const withAuth = (WrappedComponent: React.ComponentType) => {
//   const AuthComponent = (props: any) => {
//     const router = useRouter();
//     const {isAuthenticated} = useSelector((state: any) => state.authReducer);

//     useEffect(() => {
//       const token = localStorage.getItem('api_token'); // Replace with your actual auth check

//       if (!token || !isAuthenticated) {
//         router.replace('/auth/login'); // Redirect to login if not authenticated
//       }
//     }, [router, isAuthenticated]);

//     return <WrappedComponent {...props} />;
//   };

//   return AuthComponent;
// };

// export default withAuth;


import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const withAuth = (WrappedComponent: React.ComponentType) => {
  const AuthComponent = (props: any) => {
    const router = useRouter();
    const isAuthenticated = useSelector((state: any) => state.authReducer.isAuthenticated);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Loading state

    useEffect(() => {
      const token = localStorage.getItem('api_token');

      if (token) {
        setIsCheckingAuth(false); // Authentication valid হলে লোডিং বন্ধ
      } else {
        router.replace('/auth/login'); // Redirect only if no token & not authenticated
      }
    }, [router]);

    if (isCheckingAuth) {
      return <div>Loading...</div>; // Prevent unnecessary logout during initial load
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
