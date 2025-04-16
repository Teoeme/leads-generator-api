import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import useSWR from 'swr'
import { setAccounts } from '../Redux/Slices/accountsSlice'
import { useSelector } from '../Redux/hooks'
import { RootState } from '../Redux/store'
import { getCookie } from './useCookies'
import { AccountFormData } from '../Components/SocialMediaAccounts/AccountForm'
import { addToast } from '@heroui/toast'

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


const {data,mutate}=useSWR('/api/accounts',fetchAccounts)
  
useEffect(() => {
    dispatch(setAccounts(data?.accounts))
}, [data])



const createAccount=async(account:AccountFormData)=>{
  try {
    const response=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/social-media/accounts`,{
      method:'POST',
      headers:{
      'Content-Type':'application/json',
      'Authorization':`Bearer ${token}`
    },
    body:JSON.stringify(account)
  })
if(!response.ok){
  addToast({
    title:'Error',
    description:response.statusText ||'Error al crear la cuenta',
    color:'danger'
  })
  return
}
  const data=await response.json()
  addToast({
    title:data?.ok?'Crear cuenta':'Error al crear cuenta',
    description:data?.message,
    color:data?.ok?'success':'danger'
  })
  mutate()
  return data
  } catch (error) {
    console.error('Error al crear la cuenta:', error);
  }
}

  const updateAccount=async(account:AccountFormData)=>{
    try {
      const response=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/social-media/accounts/${account.id}`,{
        method:'PUT',
        headers:{
          'Content-Type':'application/json',
          'Authorization':`Bearer ${token}`
        },
        body:JSON.stringify(account)
      });
      let data
      if (!response.ok) {
        addToast({
          title:'Error',
          description:response.statusText ||'Error al actualizar la cuenta',
          color:'danger'
        })
        return
      }else{
        data=await response.json()
      }

      addToast({
        title:data?.ok?'Editar cuenta':'Error al editar cuenta',
        description:data?.message,
        color:data?.ok?'success':'danger'
      })
      mutate()
      return data;
    } catch (error) {
      console.error('Error al actualizar la cuenta:', error);
    }
  }

  const deleteAccount=async(id:string)=>{
    try {
      const response=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/social-media/accounts/${id}`,{
        method:'DELETE',
        headers:{
          'Content-Type':'application/json',
          'Authorization':`Bearer ${token}`
        }
      })
      if(!response.ok){
        addToast({
          title:'Error',
          description:response.statusText ||'Error al eliminar la cuenta',
          color:'danger'
        })
        return
      }
      const data=await response.json()
      addToast({
        title:data?.ok?'Eliminar cuenta':'Error al eliminar cuenta',
        description:data?.message,
        color:data?.ok?'success':'danger'
      })
      mutate()
      return data
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);
    }
  }
return {
    accounts,
    createAccount,
    updateAccount,
    deleteAccount
  }
}

export default useAccount