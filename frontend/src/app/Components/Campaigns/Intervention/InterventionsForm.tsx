'use client'
import { Intervention, InterventionStatus } from '@/app/entities/Intervention'
import { useModal } from '@/app/hooks/useModal'
import { useStateForm } from '@/app/hooks/useStateForm'
import { Button, Divider, Switch } from '@heroui/react'
import { MdAddCircleOutline } from 'react-icons/md'
import { v4 as uuidv4 } from 'uuid'
import InterventionItem from './InterventionItem'
import { useState } from 'react'
const InterventionsForm = ({ interventions, campaignId }: { interventions: Intervention[], campaignId: string }) => {

  const { open } = useModal({ uid: 'intervention-modal' })
  const { setForm } = useStateForm({ formId: 'intervention-form' })
  const [showCompleted, setShowCompleted] = useState(false)

  const handleAddIntervention = () => {
    open({ title: 'Nueva Intervención', type: 'add', data: { campaignId } })
    setForm({
      id: uuidv4(), 
      actions: [],
       leadCriteria: {
        minFollowers: 0,
        maxFollowers: 0,
        minPosts: 0,
        keywords: [],
        referenceProfiles: [],
        commentAICriteria: '',
        commentKeywords: [],
      },
      status: InterventionStatus.PENDING,
      autoStart: true,
      startDate: new Date().toISOString(),
      campaignId
    })
  }

  const handleEditIntervention = (intervention: Intervention) => {
    open({ title: 'Editar Intervención', type: 'edit' })
    setForm({...intervention,campaignId})
  }

  const handleDeleteIntervention = (intervention: Intervention) => {
    console.log(intervention, ' delete')
  }
  

  return (
    <div className='flex flex-col gap-2'>
      <Divider className='my-2' />
      <div className='flex justify-between mb-2'>
        <h3 className='text-lg font-bold'>Intervenciones</h3>
        <span className='flex gap-2'>
        <Switch size='sm' color='success' isSelected={showCompleted} onChange={()=>{
          setShowCompleted(!showCompleted)
        }}>Ver completadas</Switch>
        <Button variant='faded' size='sm' color='primary' onPress={handleAddIntervention} startContent={<MdAddCircleOutline size={20} />} className='w-max '>Intervención</Button>
        </span>
      </div>

      <div className='flex flex-col gap-3 min-h-[40vh] max-h-[55vh] overflow-auto'>
        {[...interventions].filter((intervention)=>!showCompleted ? intervention.status !== InterventionStatus.COMPLETED : true).sort((a,b)=>new Date(a.startDate).getTime()-new Date(b.startDate).getTime()).map((intervention: Intervention) => (
          <InterventionItem campaignId={campaignId} intervention={intervention} key={intervention.id} handleEdit={handleEditIntervention} handleDelete={handleDeleteIntervention} />
        ))}
      </div>
    </div>

  )
}

export default InterventionsForm