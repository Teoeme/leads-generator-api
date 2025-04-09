import { FaInstagram,FaFacebook,FaLinkedin} from 'react-icons/fa'

export enum LastLoginStatus {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    PENDING = 'PENDING'
}

export interface Account {
    id?: string;
    username: string;
    createdAt?: string;
    updatedAt?: string;
    type: keyof typeof AccountsTypeList;
    password?:string;
    lastLogin?:string; //Ultimo inicio de sesion
    lastLoginStatus?:keyof typeof LastLoginStatus; // Ultimo estado de inicio de sesion
}




export type AccountType = {label:string,value:string,icon?:React.ReactNode,bgStyles?:string}
        
export const AccountsTypeList = {
    INSTAGRAM : {label:'Instagram',value:'INSTAGRAM',icon: FaInstagram,bgStyles:'bg-gradient-to-r from-purple-700 to-yellow-600 '},
    FACEBOOK :{label:'Facebook',value:'FACEBOOK',icon: FaFacebook,bgStyles:'bg-gradient-to-b from-blue-300 to-blue-600 '},
    LINKEDIN : {label:'Linkedin',value:'LINKEDIN',icon: FaLinkedin,bgStyles:'bg-gradient-to-r from-blue-500 to-gray-500 '}
} 