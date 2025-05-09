'use client'
import { useLead } from '@/app/hooks/useLead'
import { Lead } from '@/app/entities/Lead'
import React from 'react'

const LeadsList = () => {
    const {leads} = useLead()
  return (
    <div>
        {(leads)?.map((lead:Lead) => (
            <LeadsListItem key={lead.id} lead={lead} />
        ))}
    </div>
  )
}

export default LeadsList

const LeadsListItem = ({lead}: {lead: Lead}) => {
    return (
        <div>
            {lead.username}
        </div>
    )
}