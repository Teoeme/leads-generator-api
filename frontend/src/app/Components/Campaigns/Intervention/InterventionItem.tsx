import { Intervention, InterventionStatus } from '@/app/entities/Intervention'
import { addToast, Button, Card, CardBody, Chip, Spinner } from '@heroui/react'
import dayjs from 'dayjs'
import 'dayjs/locale/es-mx'
import { FaCalendar } from 'react-icons/fa'
import { MdDelete, MdEdit } from 'react-icons/md'
import { VscGithubAction } from "react-icons/vsc"
dayjs.locale('es-mx')

const interventionStatusOptions = {
  [InterventionStatus.PENDING]: {label: 'Pendiente', color: 'warning'},
  [InterventionStatus.RUNNING]: {label: 'En ejecución', color: 'primary'},
  [InterventionStatus.COMPLETED]: {label: 'Completada', color: 'success'},
  [InterventionStatus.FAILED]: {label: 'Fallada', color: 'danger'},
}

const InterventionItem = ({intervention,handleEdit,handleDelete}: {intervention: Intervention,handleEdit:(intervention:Intervention)=>void,handleDelete:(intervention:Intervention)=>void}) => {
  
  const handleCopyId=()=>{
    if(intervention.id){
      navigator.clipboard.writeText(intervention.id)
      addToast({
        color: 'primary',
        variant: 'bordered',
        title: 'ID copiado al portapapeles',
        timeout:1000
      })
    }
  }
  return (
    <Card key={intervention.id} className='min-h-[100px]'>
        <CardBody>
<div>

<div className='flex justify-between gap-2'>
  <div className='flex gap-2 items-baseline flex-1'>

    <div className='flex flex-col gap-1 flex-1 '>
      <div className='flex gap-2'>
    
<Chip variant='dot' color={interventionStatusOptions[intervention.status].color as any} startContent={intervention.status==='RUNNING' && <Spinner size='sm' />} >
  <div className='flex gap-2 items-center'>
    <p>{interventionStatusOptions[intervention.status].label}</p>
  </div>
</Chip>

    <Chip variant='faded' color='success' >
      <div className='flex gap-2 items-center'>
        <FaCalendar />
        {dayjs(intervention.startDate).format('ddd DD, MMM/YY HH:mm')}
      </div>
    </Chip>
      
    <Chip  variant='faded' color='success'>
      <div className='flex gap-2 items-center'>

    <VscGithubAction size={20} />
        <p>{intervention.actions.length}</p>
      </div>
    </Chip>

      </div>
    

    <p className=' w-full italic font-light text-xs'>{intervention.description}</p>
    </div>

  </div>

<div className='flex flex-col gap-1 w-max items-end justify-between h-full'>
  
  <div className='flex gap-2'>
        <Button isDisabled={intervention.isBlocked} onPress={()=>handleEdit(intervention)} startContent={<MdEdit />} color='warning' variant='flat' isIconOnly></Button>
        <Button isDisabled={intervention.isBlocked} onPress={()=>handleDelete(intervention)} startContent={<MdDelete />} color='danger' variant='flat' isIconOnly></Button>
  </div>

  <h3 className='text-xs opacity-40' onClick={handleCopyId}>{intervention.id}</h3>
 
</div>

</div>

</div>
        </CardBody>
    </Card>
  )
}

export default InterventionItem