import { Button, Card, Chip, Input } from '@heroui/react';
import React, { useState } from 'react';
import { AiOutlineEnter } from 'react-icons/ai';

interface MultipleInputProps {
  label: string;
  name: string;
  type: string;
  value: string[];
  className?: string;
  allowDuplicates?: boolean;
  onChange: (e: { target: { name: string, value: string[] } }) => void;
}

const MultipleInput: React.FC<MultipleInputProps> = ({label, name, type, value, onChange, allowDuplicates=false, className}) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.currentTarget.value);
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault(); // Prevenir el comportamiento por defecto del Enter   
      handleAddChip()
    }
  }

  const handleRemoveChip = (indexToRemove: number) => {
    onChange({
      target: {
        name,
        value: value.filter((_, index) => index !== indexToRemove)
      }
    });
  }

  const handleAddChip = () => {
    if(!allowDuplicates){
        if(value.includes(inputValue.trim())){
          return;
        }
      }
      //Evitar agregar un valor vacio
      if(inputValue.trim() === ''){
        return;
      }
      onChange({
        target: {
          name,
          value: [...value, inputValue.trim()]
        }
      });
      setInputValue('');
  }
  return (
    <Card className={`relative p-2 ${className}`}>
        <p className='text-xs mb-2'>{label}</p>
      <div className="flex flex-wrap gap-1 gap-y-2 mb-2">
        {value?.map((item, index) => (
          <Chip 
            key={index} 
            onClose={() => handleRemoveChip(index)}
          >
            {item}
          </Chip>
        ))}
      </div>
      <Input 
        key={name}
        name={name} 
        type={type} 
        value={inputValue} 
        onKeyUp={handleKeyUp} 
        onChange={handleChange} 
        endContent={<Button isIconOnly variant='light' onPress={handleAddChip} startContent={<AiOutlineEnter />}></Button>}
      />
    </Card>
  )
}

export default MultipleInput