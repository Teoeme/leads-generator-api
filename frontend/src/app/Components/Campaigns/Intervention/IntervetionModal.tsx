import React from 'react'
import ModalTamplate from '../../Templates/ModalTamplate'
import InterventionForm from './InterventionForm'
import { Intervention } from '@/app/entities/Intervention'
import { useStateForm } from '@/app/hooks/useStateForm'
import useCampaign from '@/app/hooks/useCampaign'
import { addToast } from '@heroui/toast'
import { useModal } from '@/app/hooks/useModal'

const IntervetionModal = () => {
  
  const {addIntervention,updateIntervention}=useCampaign()
  const {closeAndCleanModal}=useModal({uid:'intervention-modal'})
// const {handleChange:handleChangeCampaign,formState:campaignForm}=useStateForm({formId:'campaign-form'})

const {formState:interventionForm,handleChange}=useStateForm({
  formId: 'intervention-form',
  initialState:{
    actions:[],
    target:{},
    leadCriteria:{
      minFollowers:0,
      maxFollowers:0,
      minPosts:0,
      keywords:[],
      referenceProfiles:[],
      commentAICriteria:'',
      commentKeywords:[],
    },
    description:'',
    status:'',
    autoStart:false,
  }
})
const onSubmit=async(data:Intervention,type: 'add' | 'edit')=>{
  let res
  console.log(type,'type')
  if(type==='add'){
    res=await addIntervention(interventionForm.campaignId,data)
  }else if(type==='edit'){
    res=await updateIntervention(interventionForm.campaignId,data)
  }
  console.log(res,'res')
  if(res?.ok){
    addToast({
      title:res?.message || 'Intervención creada',
      color:'success',
    })
    closeAndCleanModal()
  }
}

  return (
    <ModalTamplate uid='intervention-modal' size='5xl'>
        {(formState,data,uid,title,type)=>{
            return (
                <InterventionForm data={interventionForm as Intervention} type={type as 'add' | 'edit'} handleChange={handleChange} onSubmit={onSubmit} />
            )
        }}
    </ModalTamplate>
  )
}

export default IntervetionModal