'use client'
import { deleteCookie, getCookie, setCookie } from "./useCookies";
import useSWR from 'swr'
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from '../Redux/hooks';
import { setUser, setIsAuthenticated } from '../Redux/Slices/userSlice';
import { RootState } from '../Redux/store'
;

const useAuth = () => {

const dispatch= useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Error al iniciar sesión');
      }

      const data = await response.json();
      if (data?.token) {
        setCookie('token', data.token, {
          httpsOnly: true,
          secure: true,
          sameSite: 'strict',
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          domain: process.env.NEXT_PUBLIC_DOMAIN,
        });
        
        dispatch(setUser(data?.user));
        dispatch(setIsAuthenticated(true));
        return true;
      } else {
        throw new Error('Error al iniciar sesión');
      }
    } catch (error: unknown) {
      console.log('login error', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      //   method: 'POST',
      // });
      deleteCookie('token');
      dispatch(setUser(null));
      dispatch(setIsAuthenticated(false));
    } catch (error: unknown) {
      console.log('logout error', error);
    }
  };

  const checkAuth = async () => {
    const token = getCookie('token');
    if (!token) {
      return false;
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const data = await response.json();
      if (data?.user) {
        dispatch(setUser(data?.user));
        dispatch(setIsAuthenticated(true));
        return true;
      } else {
        clearSession();
      }

    } else {
      console.log('checkAuth error', response);
      clearSession();
    }
    return false;
  };

  useSWR('/api/auth/check', checkAuth, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const clearSession = () => {
    dispatch(setUser(null));
    dispatch(setIsAuthenticated(false));
    deleteCookie('token');
    router.push('/login');
  }


  return { user, isLoading, error, login, logout, checkAuth, clearSession, isAuthenticated };
};

export default useAuth;