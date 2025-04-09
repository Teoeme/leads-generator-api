import useSWR from "swr";
import { getCookie } from "./useCookies";
import { useState, useEffect } from "react";
export const useSimulatorSet = () => {
const token=getCookie('token');
const [simulators,setSimulators]=useState([]);

    const getSimulators = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/simulatorsset/list`,{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(response.ok){
            return data;
        }else{
            throw new Error(data.error);
        }
    }


    const {data}=useSWR('/api/simulatorsset/list',getSimulators);

    useEffect(() => {
        if(data){
            setSimulators(data);
        }
    }, [data]);

    const addSimulator = async (simulator:{accountId:string,profileType?:string}) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/simulatorsset/add`,{
            method: 'POST',
            body: JSON.stringify(simulator),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if(response.ok){
            return data;
        }else{
            throw new Error(data.error);
        }
    }

    const login = async (simulatorId:string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/simulatorsset/login`,{
            method: 'POST',
            body: JSON.stringify({simulatorId}),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if(response.ok){
            return data;
        }else{
            throw new Error(data.error);
        }
    }
    return { simulators, addSimulator, login };
}