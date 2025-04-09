
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import useSWR from 'swr'
import { setCampaigns } from '../Redux/Slices/campaignSlice'
import { useSelector } from '../Redux/hooks'
import { RootState } from '../Redux/store'
import { getCookie } from './useCookies'
import { Campaign } from '../entities/Campaign'
import { Intervention } from '../entities/Intervention'

const useCampaign = () => {
const dispatch=useDispatch()
const { campaigns } = useSelector((state: RootState) => state.campaigns);

const token=getCookie('token')

const fetchCampaigns=async()=>{
  const response=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns`,{
    method:'GET',
    headers:{
      'Content-Type':'application/json',
      'Authorization':`Bearer ${token}`
    }
  })
  const data=await response.json()
  return data
}


const {data,mutate}=useSWR('/api/campaigns',fetchCampaigns)
  
useEffect(() => {
      dispatch(setCampaigns(data?.data))
}, [data])



const createCampaign=async(campaign:Campaign)=>{
  const response=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns`,{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':`Bearer ${token}`
    },
    body:JSON.stringify(campaign)
  })

  const data=await response.json()
  return data
  }

  const updateCampaign=async(campaign:Partial<Campaign>)=>{
    const response=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${campaign.id}`,{
      method:'PUT',
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${token}`
      },
      body:JSON.stringify(campaign)
    })

    const data=await response.json()
if(response.ok){
    mutate()
}

    return data
  }

  const addIntervention=async(campaignId:string,intervention:Intervention)=>{
const campaignData=[...(campaigns || [])].find((campaign:Campaign)=>campaign.id===campaignId)
const newInterventions=[...(campaignData?.interventions || [])]
if(campaignData){
  newInterventions.push(intervention)
return  await updateCampaign({id:campaignId,interventions:newInterventions})
}
  }

const updateIntervention=async(campaignId:string,intervention:Intervention)=>{
  const campaignData=[...(campaigns || [])].find((campaign:Campaign)=>campaign.id===campaignId)

  if(campaignData){
    const interventionIndex=campaignData.interventions?.findIndex((i:Intervention)=>i.id===intervention.id) as number
    const newInterventions=[...(campaignData.interventions || [])]
    if(interventionIndex!==-1){
      newInterventions[interventionIndex]=intervention 
      return  await updateCampaign({id:campaignId,interventions:newInterventions})
    }
  }
}


return {
    campaigns,
    createCampaign,
    updateCampaign,
    addIntervention,
    updateIntervention,
  }
}

export default useCampaign