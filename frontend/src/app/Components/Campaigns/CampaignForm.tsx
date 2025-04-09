import { CampainStatus } from '@/app/entities/Campaign';
import { Intervention } from '@/app/entities/Intervention';
import useCampaign from '@/app/hooks/useCampaign';
import { useStateForm } from '@/app/hooks/useStateForm';
import { Button, Chip, Form, Input, Select, SelectItem } from '@heroui/react';
import dayjs from 'dayjs';
import React from 'react';

interface CampaignFormProps {
    type: 'add' | 'edit' | 'view';
}

export interface CampaignFormState {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
}

const campaignStatusOptions = [
    {textValue: 'En curso', key: 'RUNNING',color:'primary'},
    {textValue: 'Completado', key: 'COMPLETED',color:'success'},
    {textValue: 'Pausado', key: 'PAUSED',color:'default'},
]

const CampaignForm = ({type}: CampaignFormProps) => {

    const { formState, handleChange } = useStateForm({
        formId: 'campaign-form',
        initialState: {
            name: '',
            description: '',
            startDate: '',
            endDate: '',
        },
    });
    const {createCampaign,updateCampaign}=useCampaign()
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(type==='add'){
            createCampaign({
                name: formState.name as string,
                description: formState.description as string,   
                startDate: new Date(formState.startDate as string),
                endDate: new Date(formState.endDate as string),
                platform: formState.platform as string,
                interventions: formState.interventions as Intervention[],
                status: formState.status as CampainStatus
            });
        }else if(type==='edit'){
            updateCampaign({
                id: formState.id as string,
                name: formState.name as string,
                description: formState.description as string,
                startDate: new Date(formState.startDate as string),
                endDate: new Date(formState.endDate as string),
                platform: formState.platform as string,
                interventions: formState.interventions as Intervention[],
                status: formState.status as CampainStatus
            });
        }
    }
    
  return (
    <Form onSubmit={handleSubmit} className='grid grid-cols-6 gap-4'>
        <Select name='status' label='Status' selectedKeys={[formState.status]} onChange={handleChange} className='col-span-2'
        renderValue={(value)=>{
            const status = campaignStatusOptions.find((option)=>option.key===value?.[0]?.key)
            return <Chip color={status?.color as any} variant='dot'>{status?.textValue}</Chip>  
        }}
        >
           {campaignStatusOptions.map((option)=>(
            <SelectItem key={option.key} textValue={option.textValue}><Chip color={option.color as any} variant='dot'>{option.textValue}</Chip></SelectItem>
           ))}
        </Select>
        <Input name='name' label='Name' value={formState.name as string} onChange={handleChange} className='col-span-2' />
        <Input name='description' label='Description' value={formState.description as string} onChange={handleChange} className='col-span-4' />
        <Select name='platform' label='Platform' selectedKeys={[formState.platform]} onChange={handleChange} className='col-span-2' >
            <SelectItem key='FACEBOOK'>Facebook</SelectItem>
            <SelectItem key='INSTAGRAM'>Instagram</SelectItem>
            <SelectItem key='LINKEDIN'>Linkedin</SelectItem>
        </Select>
        <Input name='startDate' label='Start Date' value={dayjs(formState.startDate).format('YYYY-MM-DD')} onChange={handleChange} type='date' className='col-span-2' />
        <Input name='endDate' label='End Date' value={dayjs(formState.endDate).format('YYYY-MM-DD')} onChange={handleChange} type='date' className='col-span-2' />


        <div className='flex justify-end w-full col-span-6'>
        <Button type='submit' color='success' variant='flat'>{type === 'add' ? 'Crear' : 'Guardar'}</Button>
        </div>
    </Form>
)
}

export default CampaignForm