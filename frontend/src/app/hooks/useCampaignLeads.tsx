import { Lead } from "../entities/Lead";
import { useSelector } from "../Redux/hooks";
import { RootState } from "../Redux/store";
import { useEffect, useState } from "react";
import { getCookie } from "./useCookies";

const useCampaignLeads = (campaignId:string) => {
const [campaignLeads, setCampaignLeads] = useState<Lead[]>([]);
const token = getCookie('token')

    const globalStateLeads = useSelector((state: RootState) => state.leads.list)
    
    const getCampaignLeads = async () => {
       const campaignLeads = globalStateLeads?.filter((lead: Lead) => lead.campaignId === campaignId) || []
        if(campaignLeads.length>0){
       setCampaignLeads(campaignLeads)
    }else{
        const response = await fetchCampaignLeads()
            setCampaignLeads(response || [])
    }
    
}

const fetchCampaignLeads = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/campaigns/${campaignId}`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    )
    .then((res) => res.json())
    .catch((err) => {
        console.log(err)
    })
    if(response.ok){
        return response.data as Lead[]
    }
    return []
}

useEffect(() => {
    getCampaignLeads()
}, [campaignId,globalStateLeads])

    

  return {
    campaignLeads,
    getCampaignLeads
  }
}

export default useCampaignLeads