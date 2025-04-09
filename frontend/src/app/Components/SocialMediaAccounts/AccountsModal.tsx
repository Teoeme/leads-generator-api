import { useStateForm } from '@/app/hooks/useStateForm'
import ModalTamplate from '../Templates/ModalTamplate'
import AccountForm, { AccountFormData } from './AccountForm'
import { useModal } from '@/app/hooks/useModal'
import useAccount from '@/app/hooks/useAccount'
import { Account, AccountsTypeList } from '@/app/entities/Account'

const AccountsModal = () => {
    const {formState,handleChange,resetForm} = useStateForm({formId:'accountForm',initialState:{
        type: '',
        username: '',
        password: ''
    }})
    const {closeAndCleanModal,type}=useModal({uid:'accounts-modal'})
    const {createAccount,updateAccount}=useAccount()


    const handleSubmit=async(data:AccountFormData)=>{
        const accountData:Account={
            type:data.type as keyof typeof AccountsTypeList,
            username:data.username as string,
            password:data.password as string,
            id:data?.id
        }
        if(type==="add"){
            const account=await createAccount(accountData)
            console.log(account)
        }else{
            const account=await updateAccount(accountData)
            console.log(account)
        }
    }
  return (
    <ModalTamplate uid={'accounts-modal'} onClose={()=>{
        resetForm()
        closeAndCleanModal()
    }} >
        {(modalData:unknown,uid:string,title:string,type?:string)=>(
            <>
<div className='flex justify-between items-center'>

            <div className='flex items-center gap-2'>
                <p>Tipo:</p>
                <p className=' font-bold'>{type}</p>
            </div>
</div>
            <AccountForm formState={formState as AccountFormData} handleChange={handleChange} onSubmit={handleSubmit} onCancel={()=>{
                resetForm()
                closeAndCleanModal()
            }} />
            </>
        )}
    </ModalTamplate>
  )
}

export default AccountsModal