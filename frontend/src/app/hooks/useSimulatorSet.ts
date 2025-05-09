import useSWR from "swr";
import { getCookie } from "./useCookies";
import { useState, useEffect } from "react";
import { addToast } from "@heroui/toast";
import { Simulator } from "../entities/Simulator";
export const useSimulatorSet = () => {
const token=getCookie('token');
const [simulators,setSimulators]=useState<Simulator[]>([]);

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


    const {data,mutate}=useSWR('/api/simulatorsset/list',getSimulators);

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
            mutate();
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

    const removeSimulator = async (simulatorId:string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/simulatorsset/remove`,{
            method: 'POST',
            body: JSON.stringify({simulatorId}),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(res=>res.json())
    
        if(response){
            addToast({
                title: 'Eliminar simulador',
                description: response?.message,
                color: response?.ok ? 'success' : 'danger',
            })
            mutate();
        }
        return response;
    }


    return { simulators, addSimulator, login, removeSimulator };
}