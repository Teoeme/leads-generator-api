import { Intervention, InterventionStatus } from '@/app/entities/Intervention'
import useCampaign from '@/app/hooks/useCampaign'
import { addToast, Button, Card, CardBody, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Popover, PopoverContent, PopoverTrigger, Spinner } from '@heroui/react'
import dayjs from 'dayjs'
import 'dayjs/locale/es-mx'
import { FaCalendar } from 'react-icons/fa'
import { MdDelete, MdEdit } from 'react-icons/md'
import { TbHistory } from 'react-icons/tb'
import { VscGithubAction } from "react-icons/vsc"
dayjs.locale('es-mx')

const interventionStatusOptions = {
  [InterventionStatus.PENDING]: {label: 'Pendiente', color: 'warning',allowChange:true, options:[InterventionStatus.PLANNING]},
  [InterventionStatus.RUNNING]: {label: 'En ejecución', color: 'primary',allowChange:false, options:[]},
  [InterventionStatus.COMPLETED]: {label: 'Completada', color: 'success',allowChange:false, options:[InterventionStatus.PLANNING,InterventionStatus.PENDING]},
  [InterventionStatus.FAILED]: {label: 'Fallada', color: 'danger',allowChange:true,options:[InterventionStatus.PENDING,InterventionStatus.PLANNING]},
  [InterventionStatus.PLANNING]: {label: 'En planificación', color:'secondary',allowChange:true, options:[InterventionStatus.PENDING]},
}

const InterventionItem = ({campaignId,intervention,handleEdit,handleDelete}: {campaignId:string,intervention: Intervention,handleEdit:(intervention:Intervention)=>void,handleDelete:(intervention:Intervention)=>void}) => {
  const {updateIntervention}=useCampaign()

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

  const handleChangeStatus= async(status:InterventionStatus)=>{
    const interventionData={...intervention,status}
    if(!interventionData.id){
      addToast({
        color: 'danger',
        variant: 'bordered',
        title: 'ID no encontrado',
        timeout:1000
      })
      return
    }
    if(interventionStatusOptions[status].allowChange){
      await updateIntervention(campaignId,interventionData)
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
    

    <Dropdown>
      <DropdownTrigger  disabled={!interventionStatusOptions[intervention.status].allowChange}>

<Chip variant='dot' color={interventionStatusOptions[intervention.status].color as any} startContent={intervention.status==='RUNNING' && <Spinner size='sm' />} >
  <div className='flex gap-2 items-center'>
    <p>{interventionStatusOptions[intervention.status].label}</p>
  </div>
</Chip>
      </DropdownTrigger>
      <DropdownMenu>
        {interventionStatusOptions[intervention.status].options.map((status)=>(
          <DropdownItem key={status} onPress={()=>handleChangeStatus(status as InterventionStatus)}>
            {interventionStatusOptions[status as keyof typeof interventionStatusOptions].label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>

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

    {intervention?.logs?.length>0 && <Popover placement='bottom-start'>
      <PopoverTrigger>
        <Chip variant='faded' color='success' className=' min-w-[400px] max-w-[400px] text-ellipsis overflow-hidden cursor-pointer' startContent={<TbHistory size={18} />}>
          <p className='text-xs'>{intervention?.logs?.[0]?.message}</p>
        </Chip>
      </PopoverTrigger>
      <PopoverContent className=' max-w-[400px] min-w-[400px]'>
        <div className='flex flex-col gap-2 text-xs w-full'>

        {intervention?.logs?.slice(0,10).map((log,i)=>(
          <div key={log.timestamp} className={`flex gap-2 ${i===0 && ' text-primary-500'}`}>
            <p className=' text-xs opacity-30'>{dayjs(log.timestamp).fromNow()}</p>
            <p className=' text-xs opacity-90'>{log.message}</p>
          </div>
        ))}
        </div>
        </PopoverContent>
    </Popover>}

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