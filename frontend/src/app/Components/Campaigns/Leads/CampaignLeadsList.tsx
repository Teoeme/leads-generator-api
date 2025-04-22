import useCampaignLeads from '@/app/hooks/useCampaignLeads'
import { Button, Chip } from '@heroui/react'
import dayjs from 'dayjs'
import 'dayjs/locale/es-mx'
import relativeTime from 'dayjs/plugin/relativeTime'
import { FiTrash2 } from 'react-icons/fi'
dayjs.locale('es-mx')
dayjs.extend(relativeTime)

const CampaignLeadsList = ({campaignId}: {campaignId: string}) => {
    const {campaignLeads} = useCampaignLeads(campaignId)
    console.log(campaignLeads,'campaignLeads')
    return (
    <div>
        {campaignLeads.map((lead) => (
            <div key={lead.id} className='flex justify-between  w-full h-full'>
            <div className="flex flex-col gap-2 p-4 flex-1">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{lead.fullName || lead.username}</h3>
                            {lead.isVerified && (
                                <span className="text-blue-500 text-sm">✓</span>
                            )}
                        </div>
                        <a href={`https://www.instagram.com/${lead.username}`} target='_blank' className="text-sm text-gray-500">@{lead.username}</a>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                        <div className="text-center">
                            <p className="font-semibold">{lead.followersCount || 0}</p>
                            <p className="text-xs">Seguidores</p>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold">{lead.followingCount || 0}</p>
                            <p className="text-xs">Seguidos</p>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold">{lead.postsCount || 0}</p>
                            <p className="text-xs">Posts</p>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold">{dayjs(lead.createdAt).fromNow()}</p>
                            <p className="text-xs">Fecha de creación</p>
                        </div>
                    </div>
                </div>
                {lead.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">{lead.bio}</p>
                )}
                <div className="flex gap-2 text-xs text-gray-500">
                    {lead.location && (
                        <span>📍 {lead.location}</span>
                    )}
                    {lead.businessCategory && (
                        <span>💼 {lead.businessCategory}</span>
                    )}
                </div>
            </div>

            <div className='flex gap-2 items-center'>

                <div className='flex flex-col gap-2'>
                    <div>
                        <Chip variant='dot'>{lead.status}</Chip>
                    </div>

                    <div className='flex gap-2'>

                <Button color='danger' variant='light' isIconOnly startContent={<FiTrash2 size={12}/>} ></Button>
                    </div>
            </div>
            
            </div>
            </div>
        ))}    
    </div>
  )
}

export default CampaignLeadsList