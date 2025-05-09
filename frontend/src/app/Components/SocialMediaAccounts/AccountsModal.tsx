import { AccountsTypeList } from '@/app/entities/Account'
import useAccount from '@/app/hooks/useAccount'
import { useModal } from '@/app/hooks/useModal'
import ModalTamplate from '../Templates/ModalTamplate'
import AccountForm, { AccountFormData } from './AccountForm'

const AccountsModal = () => {
    const {closeAndCleanModal,type}=useModal({uid:'accounts-modal'})
    const {createAccount,updateAccount}=useAccount()


    const handleSubmit=async(data:AccountFormData)=>{
        const accountData:AccountFormData={
            type:data.type as keyof typeof AccountsTypeList,
            username:data.username as string,
            password:data.password as string,
            id:data?.id,
            proxy:data?.proxy,
            roles:data?.roles,
            currentPassword:data?.currentPassword,
            newPassword:data?.newPassword,
        }
        let res
        if(type==="add"){
res=            await createAccount(accountData)
        }else{
    res=        await updateAccount(accountData)
        }
        if(res?.ok){
            closeAndCleanModal()
        }
    }
  return (
    <ModalTamplate uid={'accounts-modal'} onClose={()=>{
        closeAndCleanModal()
    }} >
        {(formState:any,modalData:unknown,uid:string,title:string,type:'add' | 'edit'|'view',handleChange?:any)=>(
            <>
<div className='flex justify-between items-center'>
           
</div>
            <AccountForm type={type} formState={formState as AccountFormData} handleChange={handleChange} onSubmit={handleSubmit} onCancel={()=>{
                closeAndCleanModal()
            }} />
            </>
        )}
    </ModalTamplate>
  )
}

export default AccountsModal