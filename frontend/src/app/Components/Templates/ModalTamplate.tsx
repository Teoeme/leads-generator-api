import { useModal } from '@/app/hooks/useModal'
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react'
import React from 'react'
export interface ModalTamplateProps {
    uid: string
    children: React.ReactNode | ((formState:any,data:unknown,uid:string,title:string,type:'add' | 'edit'|'view',handleChange?:any)=>React.ReactNode),
    cleanOnClose?: boolean,
    backDropType?:"transparent" | "blur" | "opaque",
    onClose?: ()=>void,
    size?:'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'
}

const ModalTamplate = ({ uid, children, cleanOnClose=true, backDropType='opaque',onClose,size='md' }: ModalTamplateProps) => {

    const { isOpen, closeAndCleanModal, close,data,type,title,formState,handleChange } = useModal({ uid })

    const handleClose=()=>{
        if(cleanOnClose){
            closeAndCleanModal()
        }else{
            close()
        }
        onClose?.()
    }

    return (
        <Modal 
          isOpen={isOpen}
           onClose={handleClose} 
           backdrop={backDropType}
             size={size}
              scrollBehavior='outside'
               >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader>{title}
                        </ModalHeader>

                        <ModalBody>
                            {typeof children === 'function' ? children(formState,data,uid,title as string,type as 'add' | 'edit' | 'view',handleChange) : children}
                        </ModalBody>


                    </>
                )}
            </ModalContent>

        </Modal>
    )
}

export default ModalTamplate