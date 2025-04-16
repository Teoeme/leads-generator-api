import { FaTwitter, FaInstagram, FaFacebook, FaTiktok, FaLinkedin } from "react-icons/fa"

export enum LastLoginStatus {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    PENDING = 'PENDING'
}

export enum AccountRole {
    SCRAPPING = 'SCRAPPING',     // Cuenta para recolectar información y leads
    ENGAGEMENT = 'ENGAGEMENT',   // Cuenta para interactuar con usuarios
    MESSAGING = 'MESSAGING'      // Cuenta para enviar mensajes directos
}

export interface ProxyAssignment {
    proxyId: string;    // ID del proxy
    enabled: boolean;   // Si el proxy está activado o no para esta cuenta
}

export interface Account {
    id?: string;
    _id?: string;
    username: string;
    createdAt?: string;
    updatedAt?: string;
    type: string;
    password: string;
    lastLogin?: string; //Ultimo inicio de sesion
    lastLoginStatus?: keyof typeof LastLoginStatus; // Ultimo estado de inicio de sesion
    proxy?: ProxyAssignment | null;
    roles?: AccountRole[];
}

export type AccountType = { label: string, value: string, icon?: React.ReactNode, bgStyles?: string }

export const AccountsTypeList = {
    TWITTER: {
        value: 'TWITTER',
        label: 'Twitter',
        icon: FaTwitter,
        bgStyles: 'text-white bg-gradient-to-r from-blue-500 to-purple-500'
    },
    INSTAGRAM: {
        value: 'INSTAGRAM',
        label: 'Instagram',
        icon: FaInstagram,
        bgStyles: 'text-white bg-gradient-to-r from-pink-500 to-orange-500'
    },
    FACEBOOK: {
        value: 'FACEBOOK',
        label: 'Facebook',
        icon: FaFacebook,
        bgStyles: 'text-white bg-gradient-to-r from-blue-500 to-purple-500'
    },
    TIKTOK: {
        value: 'TIKTOK',
        label: 'TikTok',
        icon: FaTiktok,
        bgStyles: 'text-white bg-gradient-to-r from-red-500 to-orange-500'
    },
    LINKEDIN: {
        value: 'LINKEDIN',
        label: 'LinkedIn',
        icon: FaLinkedin,
        bgStyles: 'text-white bg-gradient-to-r from-blue-500 to-purple-500'
    }
} 