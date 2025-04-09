import Cookies from 'js-cookie';

    const setCookie = (name: string, value: string, options?:Cookies.CookieAttributes ) => {
        Cookies.set(name, value, options);
    };

    const getCookie = (name: string) => {
        return Cookies.get(name);
    };

    const deleteCookie = (name: string) => {
        Cookies.remove(name);
    };

    export { setCookie, getCookie, deleteCookie };

