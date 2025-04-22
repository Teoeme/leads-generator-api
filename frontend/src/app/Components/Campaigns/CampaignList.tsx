'use client'
import { AccountsTypeList } from '@/app/entities/Account';
import { Campaign, CampainStatus } from '@/app/entities/Campaign';
import useCampaign from '@/app/hooks/useCampaign';
import { useModal } from '@/app/hooks/useModal';
import { useStateForm } from '@/app/hooks/useStateForm';
import { Button, Card, CardBody, CardFooter, CardHeader, Chip } from '@heroui/react';
import dayjs from 'dayjs';
import 'dayjs/locale/es-mx';
import { createElement, useState } from 'react';
import { FiCalendar, FiEdit, FiPlusCircle, FiTrash2 } from 'react-icons/fi';
import { MdExpandMore } from 'react-icons/md';
import InterventionsForm from './Intervention/InterventionsForm';
import CampaignLeadsList from './Leads/CampaignLeadsList';
dayjs.locale('es-mx');

const CampaignList = () => {
    const [selectedTab, setSelectedTab] = useState<'leads' | 'interventions'>('interventions');
    const { campaigns } = useCampaign();
    const { open } = useModal({ uid: 'campaign-modal' });
    const { setForm } = useStateForm({ formId: 'campaign-form' });
    const [showInterventions, setShowInterventions] = useState<Record<string,boolean>>({});
    const handleEdit = (campaign: Campaign) => {
     open({
        title:'Editar Campaña',
        type:'edit',
     })
        setForm(campaign);
    }

    const toggleInterventions = (campaignId: string) => {
        const newShowInterventions = {...showInterventions};
        if(newShowInterventions[campaignId]){
            delete newShowInterventions[campaignId];
        }else{
            newShowInterventions[campaignId] = true;
        }
        setShowInterventions(newShowInterventions);
    }
    
const handleAddCampaign=()=>{
    open({
        title:'Crear Campaña',
        type:'add',
    })
    setForm({
        name:'',
        description:'',
        startDate:new Date().toISOString(),
        endDate:new Date().toISOString(),
        platform:'',
        interventions:[],
        status:CampainStatus.RUNNING,
    })
}
    
    return (
    <div className='flex flex-col gap-4'>

        <div className='p-4'>

        <div className='flex justify-between items-center py-4'>
        <h3 className='text-2xl font-bold'>Campañas</h3>
        <Button startContent={<FiPlusCircle size={18}/>} color='success' variant='faded' onPress={handleAddCampaign}>Crear Campaña</Button>
        </div>

        <div className='flex flex-col gap-4'>
        {campaigns?.map((campaign) => {
            
            return(
            <Card key={campaign.id}>
                <CardHeader className='flex justify-between items-start'>
                    <div className='flex flex-col  gap-1 items-start'>
                        <div className='flex flex-row gap-2 items-center'>

                    <Chip className={`${AccountsTypeList[campaign.platform as keyof typeof AccountsTypeList]?.bgStyles} p-0 aspect-square flex justify-center rounded-lg`}>
                        <span className='flex items-center gap-2'>
                            {campaign.platform && createElement(AccountsTypeList[campaign.platform as keyof typeof AccountsTypeList]?.icon,{size:18})}
                        </span>
                    </Chip>
                    <h2 className='text-lg font-bold'>
                    {campaign.name}
                    </h2>
                    </div>
                    <p className='text-xs font-light'>
                        {campaign.id}
                    </p>
                        </div>

                    <div className='flex gap-2'>
                        <Button color='success' variant='flat' startContent={<FiEdit size={18}/>} onPress={()=>handleEdit(campaign)}></Button>
                        <Button color='danger' variant='flat' startContent={<FiTrash2 size={18}/>} isIconOnly></Button>
                    </div>
                </CardHeader>
                <CardBody className='flex gap-2 justify-between flex-row '>  
                    <p className='w-3/4 text-xs  font-extralight'>{campaign.description}</p>
                    <div className='flex flex-col gap-1 w-1/4 items-start '>
                    <p className='text-sm font-semibold flex items-center gap-2'>  <span className='font-light w-28'>Fecha de inicio:</span> <FiCalendar size={18}/> {dayjs(campaign?.startDate).format('ddd DD [de] MMM')}</p>
                    <p className='text-sm font-semibold flex items-center gap-2'> <span className='font-light w-28'>Fecha de fin:</span> <FiCalendar size={18}/> {dayjs(campaign?.endDate).format('ddd DD [de] MMM')}</p>
                    </div>
                </CardBody>
                <CardFooter className=' overflow-visible flex flex-col' style={{
                    maxHeight: showInterventions[campaign.id || ''] ? '1000px' : '0px',
                    transition: 'max-height 0.3s ease-in-out',
                }}>
                <div className='flex w-full justify-end -mt-8 z-50'>
            <Button startContent={<MdExpandMore style={{
                transform: showInterventions[campaign.id || ''] ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s linear',
                
                }}/>} isIconOnly variant='light'  onPress={()=>toggleInterventions(campaign.id || '')} />
                </div>
               
                <div className='w-full mt-2'>
                    <div className='flex gap-2'>
                        <Button color={selectedTab === 'interventions' ? 'success' : 'default'} onPress={()=>setSelectedTab('interventions')}>Intervenciones</Button>
                        <Button color={selectedTab === 'leads' ? 'success' : 'default'} onPress={()=>setSelectedTab('leads')}>Leads</Button>
                    </div>
               {selectedTab === 'interventions' && <InterventionsForm interventions={campaign.interventions || []} campaignId={campaign.id || ''} />}
               {selectedTab === 'leads' && <CampaignLeadsList campaignId={campaign.id || ''} />}
                </div>
                </CardFooter>
            </Card>
            )
        })}

        </div>

        </div>
    </div>
  )
}

export default CampaignList