'use client'
import React from 'react'
import CampaignList from './CampaignList'
import CampaignModal from './CampaignModal'
import IntervetionModal from './Intervention/IntervetionModal'
const CampaignsMain = () => {
  return (
    <div>
        <CampaignList />
        <CampaignModal />
        <IntervetionModal />
    </div>
  )
}

export default CampaignsMain