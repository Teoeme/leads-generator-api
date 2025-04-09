'use client'
import { Action } from '@/app/entities/ActionTypes'
import { Intervention, LeadCriteria } from '@/app/entities/Intervention'
import { Accordion, AccordionItem, Button, DatePicker, Divider, Input, NumberInput, Switch, Textarea } from '@heroui/react'
import { getLocalTimeZone, now, parseAbsoluteToLocal } from '@internationalized/date'
import React from 'react'
import MultipleInput from '../../Templates/MultipleInput'
import ActionList from './ActionList'

const InterventionForm = ({data,type,handleChange,onSubmit}: {data: Intervention,type: 'add' | 'edit',handleChange: (e: {target: {name: string, value: any }}) => void,onSubmit: (data: Intervention,type: 'add' | 'edit') => void}) => {

   
    const handleSubmit = () => {
        onSubmit(data,type)
    }



  


    const leadCriteriaFields = [
        {
            label: 'Min Followers',
            name: 'minFollowers',
            type: 'number',
            value: data?.leadCriteria?.minFollowers || 0,
            className: 'col-span-1 col-start-1',
        },
        {
            label: 'Max Followers',
            name: 'maxFollowers',
            type: 'number',
            value: data?.leadCriteria?.maxFollowers || 0,
            className: 'col-span-1 col-start-1',
        },
        {
            label: 'Min Posts',
            name: 'minPosts',
            type: 'number',
            value: data?.leadCriteria?.minPosts || 0,
            className: 'col-span-1 col-start-1 ',
        },
        {
            label: 'Comment AI Criteria',
            name: 'commentAICriteria',
            type: 'textarea',
            value: data?.leadCriteria?.commentAICriteria || '',
            className: 'col-span-1 row-span-3 col-start-2 row-start-1 ',
        },
        {
            label: 'Keywords',
            name: 'keywords',
            type: 'text',
            value: data?.leadCriteria?.keywords || [],
            multiple: true,
            className: 'col-span-2',
        },
        {
            label: 'Reference Profiles',
            name: 'referenceProfiles',
            type: 'text',
            value: data?.leadCriteria?.referenceProfiles || '',
            multiple: true,
            className: 'col-span-2',
        },
        {
            label: 'Comment Keywords',
            name: 'commentKeywords',
            type: 'text',
            value: data?.leadCriteria?.commentKeywords || '',
            multiple: true,
            className: 'col-span-2',
        },
      
    ]

    const handleChangeLeadCriteria = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | {target: {name: string, value: any}})=>{
        const leadCriteria={...data?.leadCriteria}
        leadCriteria[e.target.name as keyof LeadCriteria]=e.target.value
        handleChange({target:{name:'leadCriteria',value:leadCriteria}})
    }

    const handleChangeLeadCriteriaNumber = (e: {target: {name: string, value: number}})=>{
        const leadCriteria = {...data?.leadCriteria} as LeadCriteria
        (leadCriteria as any)[e.target.name] = e.target.value
        handleChange({target:{name:'leadCriteria',value:leadCriteria}})
    }

  return (
    <div>
      <div  className='grid grid-cols-6 gap-2'>
        <Textarea name='description' label='Description'  className='col-span-4 row-span-2' rows={2} value={data?.description} onChange={handleChange}/>
     

        <Switch name='autoStart' isSelected={data.autoStart} onChange={handleChange} className='col-span-1 col-start-5 row-start-1' isDisabled={true}>Auto Start</Switch>
         <DatePicker
         className='col-span-2 col-start-5 row-start-2'
         hideTimeZone
         showMonthAndYearPickers
         minValue={now(getLocalTimeZone()).add({minutes:5})}
         isRequired={true}
        value={
            data?.startDate 
                ? parseAbsoluteToLocal(
                    typeof data.startDate === 'string' 
                      ? data.startDate 
                      : new Date(data.startDate).toISOString()
                  ) 
                : undefined
        }
        granularity='minute'
        onChange={(value)=>{
            if (value) {
                const dateString = value.toDate().toISOString();
                handleChange({target:{name:'startDate',value: dateString}})
            }
        }}
         label="Fecha de inicio"
         variant="bordered"
       />
    
            
            <div className=' col-span-6'>

        <Accordion variant='splitted'  >
            <AccordionItem title='Criterios de leads'  >
                <div className='grid grid-cols-2 gap-2'>


            {leadCriteriaFields.map((field)=>{
                switch(field.type){
                    case 'number':
                        return <NumberInput className={field.className} key={field.name} minValue={0} name={field.name} label={field.label}  value={field.value as number} onValueChange={(value)=>handleChangeLeadCriteriaNumber({target:{name:field.name,value}})} />
                    case 'textarea':
                        return <Textarea className={field.className} key={field.name} name={field.name} label={field.label} value={field.value as string} onChange={handleChangeLeadCriteria} />
                    case 'text':
                        if(field.multiple){
                            return <MultipleInput className={field.className} key={field.name} name={field.name} label={field.label} type={field.type} value={field.value as string[]} onChange={handleChangeLeadCriteria} />
                        }else{
                            return <Input className={field.className} key={field.name} name={field.name} label={field.label} value={field.value as string} onChange={handleChangeLeadCriteria} />
                        }
                    default:
                        return null
                    }
                })}
                </div>

            </AccordionItem>

        </Accordion>
        </div>
        <div className='col-span-6 '>
                <Divider className='my-4' />
        <ActionList items={(data?.actions || []) as Action[]} handleChange={handleChange} />
        </div>
        <div className='col-span-6 flex justify-end'>
            
        <Button type='button' onPress={handleSubmit} color='success' variant='flat'>{type==='add' ? 'Agregar' : 'Editar'}</Button>
        </div>
      </div>
    </div>
  )
}

export default InterventionForm