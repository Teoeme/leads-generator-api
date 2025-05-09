'use client'
import useSWR from 'swr'
import { getCookie } from './useCookies'
import { useDispatch, useSelector } from '../Redux/hooks'
import { setLeads } from '../Redux/Slices/leadSlice'
import { RootState } from '../Redux/store'
import { useEffect } from 'react'
export const useLead = () => {

const leads= useSelector((state: RootState) => state.leads.list)
const dispatch= useDispatch()
const token= getCookie('token')

const getLeads = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    )
    const data = await response.json()
    return data
}
    
    const {data, isLoading} = useSWR('/leads', getLeads)
    
    useEffect(() => {
        if (data) {
            dispatch(setLeads(data.data))
        }
    }, [data]);
    
    return {
        leads,
        isLoading
    }
}

export default useLead
