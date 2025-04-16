import { Button, Card, CardBody, CardFooter, CardHeader, Input } from '@heroui/react';
import React, { useState } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  content: string | React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: 'default' | 'danger' | 'primary' | 'secondary' | 'success' | 'warning';
  cancelButtonColor?: 'default' | 'danger' | 'primary' | 'secondary' | 'success' | 'warning';
  confirmationText?:string
  
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  content,
  onConfirm,
  onCancel,
  confirmButtonText,
  cancelButtonText,
  confirmButtonColor,
  cancelButtonColor,
  confirmationText
}) => {
  const [inputText, setInputText] = useState('');
  if (!isOpen) return null;

  const handleConfirm=()=>{
    if(inputText.toLowerCase() === confirmationText?.toLowerCase()){
      onConfirm()
    }
  }
  return (
<Card>
  <CardHeader>
    <p>{title}</p>
  </CardHeader>
  <CardBody>
    {typeof content === 'string' ? <p>{content}</p> : content}
  </CardBody>
  <CardFooter className='flex justify-end gap-2'>
    {confirmationText && <Input type='text'  label={`Escribe "${confirmationText}"`} value={inputText} onChange={(e)=>setInputText(e.target.value)} />}
    <Button variant='flat' onPress={onCancel} color={cancelButtonColor || 'danger'}>{cancelButtonText || 'Cancelar'}</Button>
    <Button variant='flat' onPress={confirmationText ? handleConfirm : onConfirm} color={confirmButtonColor || 'success'} isDisabled={confirmationText ? inputText.toLowerCase() !== confirmationText.toLowerCase() : false}>{confirmButtonText || 'Confirmar'}  </Button>
  </CardFooter>
</Card>
  );
};

export default ConfirmDialog;
