import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import useSWR from 'swr'
import { setAccounts } from '../Redux/Slices/accountsSlice'
import { useSelector } from '../Redux/hooks'
import { RootState } from '../Redux/store'
import { getCookie } from './useCookies'
import { Account } from '../entities/Account'

const useAccount = () => {
const dispatch=useDispatch()
const { accounts } = useSelector((state: RootState) => state.accounts);

const token=getCookie('token')

const fetchAccounts=async()=>{
  const response=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/social-media/accounts`,{
    method:'GET',
    headers:{
      'Content-Type':'application/json',
      'Authorization':`Bearer ${token}`
    }
  })
  const data=await response.json()
  return data
}


const {data}=useSWR('/api/accounts',fetchAccounts)
  
useEffect(() => {
    dispatch(setAccounts(data?.accounts))
}, [data])



const createAccount=async(account:Account)=>{
  const response=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/social-media/accounts`,{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':`Bearer ${token}`
    },
    body:JSON.stringify(account)
  })

  const data=await response.json()
  return data
  }

  const updateAccount=async(account:Account)=>{
    const response=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/social-media/accounts/${account.id}`,{
      method:'PUT',
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${token}`
      },
      body:JSON.stringify(account)
    })

  const data=await response.json()
  return data
  }

return {
    accounts,
    createAccount,
    updateAccount
  }
}

export default useAccount