import { Action, ActionType, ActionTypesProps, Target, TimeDistribution } from '@/app/entities/ActionTypes'
import { DndContext } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button, Card, CardBody, CardHeader, Input, NumberInput, Select, SelectItem, Tooltip } from '@heroui/react'
import React from 'react'
import { FaTrash } from 'react-icons/fa'
import { MdAddCircleOutline, MdDragIndicator, MdInfo } from 'react-icons/md'
import { v4 as uuidv4 } from 'uuid'
const ActionList = ({items,handleChange}: {items: Action[],handleChange: (e: {target: {name: string, value: Action[]}}) => void}) => {

    const handleAddAction = () => {
        handleChange({target: {name: 'actions', value: [...items, {id: uuidv4(), action: ActionType.VIEW_POST, timePattern: {distribution: TimeDistribution.UNIFORM, parameters: {min: 1, max: 10}}}] }})
    }

    const handleDeleteAction = (actionId: string)=>{
        handleChange({target:{name:'actions',value:items.filter(item=>item.id !== actionId)}})
    }

    const handleChangeInAction = (e: React.ChangeEvent<HTMLSelectElement>, actionId: string) => {
        const foundAction = items.find(item => item.id === actionId);
        if (foundAction) {
            const updatedAction:Action = { ...foundAction };
            updatedAction[e.target.name as keyof Action] = e.target.value as never;
            
            const newItems = items.map(item => item.id === actionId ? updatedAction : item);
            handleChange({target: {name: 'actions', value: newItems}});
        }
    }

    const handleSortEnd = (event: any) => {
        const {active, over} = event;
        if (active.id !== over?.id) {
            const copyItems = [...items]
              const oldIndex = copyItems.findIndex(item => item.id === active.id);
              const newIndex = copyItems.findIndex(item => item.id === over.id);
              const newItems = arrayMove(copyItems, oldIndex, newIndex);
              
              handleChange({target: {name: 'actions', value: newItems}})
        }
    }
    
    return (
    <div className=' mt-2'>
        <div className='flex flex-row justify-between items-center'>
            <h2 className='text-xl font-bold'>Plan de acción</h2>
            <Button startContent={<MdAddCircleOutline size={16}/>} color='primary' variant='light'  onPress={handleAddAction} >Acción</Button>
        </div>

        <DndContext onDragEnd={handleSortEnd} >

        <div className='flex flex-col gap-2 py-4'>
    <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}  >
            {
                items?.map((item:Action) => <ActionItem key={item.id} item={item} handleChange={handleChangeInAction} handleDeleteAction={handleDeleteAction} />)
            }

    </SortableContext>
            </div>
            </DndContext>

    </div>
  )
}

export default ActionList


const ActionItem = ({item,handleChange,handleDeleteAction}: {item: Action,handleChange: (e: React.ChangeEvent<HTMLSelectElement> | any,actionId: string) => void,handleDeleteAction: (actionId: string) => void}) => {
    const {listeners, setNodeRef, transition, transform, } = useSortable({id: item.id})

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    }

    const handleChangeTarget = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>{
        handleChange({target:{name:'target',value:{[e.target.name]:e.target.value}}},item.id)
    }


    const handleChangeParameter = (e: {target: {name: string, value: string | number}})=>{
        const updatedParameters = {...(item.parameters || {})}
        updatedParameters[e.target.name as keyof typeof item.parameters] = e.target.value as never
        handleChange({target:{name:'parameters',value:updatedParameters}},item.id)
    }

   

const actionProps = ActionTypesProps[item.action as ActionType]

    return(
    <Card key={item.id || uuidv4()} ref={setNodeRef} style={style}  >
        <CardHeader className='flex flex-row justify-between items-center'>
            <div className='flex flex-row gap-2 w-11/12'>

            <Select label='Action' name='action' onChange={(e)=>handleChange(e,item.id)} className='w-1/2' selectedKeys={[item.action]}
            renderValue={(value)=>{
                return(
                    <div className='flex flex-row gap-2 w-full  items-center'>
                        <p>
                            {ActionTypesProps[value[0].key as ActionType]?.label}
                        </p>
                        <Tooltip content={ActionTypesProps[value[0].key as ActionType]?.description} color='primary'><MdInfo size={20} color='primary'/></Tooltip>
                    </div>
                )
            }}
            >
                {Object.values(ActionType).map((action)=>(
                    <SelectItem key={action}>
                                {ActionTypesProps[action]?.label}
                    </SelectItem>
                ))}
            </Select>

                {actionProps?.limit && <NumberInput minValue={0} className=' w-20' name='limit' label='Limit' value={item.limit} onValueChange={(value)=>handleChange({target:{name:'limit',value:value}},item.id)}/>}
                {actionProps?.parameters &&
                Object.keys(actionProps.parameters).map((parameter:string)=>{
                const parameterName = parameter as string
                const parameterValue = actionProps.parameters?.[parameterName as keyof typeof item.parameters]
                    if(typeof parameterValue === 'string' ){
                     return <Input key={parameter} name={parameter} label={parameter} value={item.parameters?.[parameter as keyof typeof item.parameters]}  onValueChange={(value)=>handleChangeParameter({target:{name:parameter,value:value}})}/>
                    }else{
                        return <NumberInput className='w-36' key={parameter} name={parameter} label={parameter} value={item.parameters?.[parameter as keyof typeof item.parameters]} minValue={0} onValueChange={(value)=>handleChangeParameter({target:{name:parameter,value:value}})}/>
                    }
                })
                }
                </div>
                <div>
                    <Button isIconOnly startContent={<MdDragIndicator />} variant='light' {...listeners} className=' cursor-grab active:cursor-grabbing' />
                    <Button isIconOnly startContent={<FaTrash size={16} />} color='danger' variant='light' onPress={()=>handleDeleteAction(item.id)} />
                </div>
        </CardHeader>
        <CardBody className='gap-1'>
            {item?.timePattern && <p>Distribución: {item?.timePattern?.distribution}</p>}

        {actionProps?.target &&
        <Input className='w-64' name={actionProps.target} label={actionProps.target} onChange={handleChangeTarget} value={item.target?.[actionProps.target as keyof Target]} />
        }

        </CardBody>
    </Card>
)
}