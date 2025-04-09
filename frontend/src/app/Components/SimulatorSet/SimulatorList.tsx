import { AccountsTypeList } from '@/app/entities/Account';
import { Simulator } from '@/app/entities/Simulator';
import { useSimulatorSet } from '@/app/hooks/useSimulatorSet';
import { Button, Card, Chip, Input, Popover, PopoverContent, PopoverTrigger, Spinner } from '@heroui/react';
import { createElement } from 'react';
import { FaRegStopCircle } from 'react-icons/fa';
import { FiPlusCircle } from 'react-icons/fi';
import { MdKeyOff, MdOutlineKey } from "react-icons/md";

const SimulatorList = () => {
    const { simulators, addSimulator, login } = useSimulatorSet();
  return (
    <div className='flex flex-col gap-4 p-4'>
        <div className='flex justify-between w-full items-center'>

            <h3 className='text-2xl font-bold  from-blue-300 to-blue-600  text-transparent bg-clip-text bg-gradient-to-r'>Simuladores</h3>
            <Popover>
                <PopoverTrigger>
            <Button color='primary' variant='bordered' startContent={<FiPlusCircle size={18} />} >Add Simulator</Button>
                </PopoverTrigger>
                <PopoverContent>
                    <div className='flex flex-col gap-4'>
                <Input type='text' placeholder='AccountId' id='accountId' />
                <Button onPress={() => {
                    const input = document.getElementById('accountId') as HTMLInputElement;
                    if (input) {
                        addSimulator({accountId: input.value});
                    }
                }}>Add Simulator</Button>
                    </div>
                </PopoverContent>
            </Popover>
            </div>


                <div className='flex gap-4 justify-between text-xs text-left px-4 items-baseline'>
                <p className='w-1/12'>Id</p>
                <p className='w-1/12'>Type</p>
                <p className='w-2/12'>Username</p>
                <p className='w-1/12'>Current Usage Percentage</p>
                <p className='w-1/12'>Is Running</p>
                <p className='w-1/12'>Is Logged In</p>
                <p className='w-1/12'>Login</p>
            </div>
        <div className='flex flex-col gap-2 p-2'>
            {simulators.map((simulator:Simulator) => (
                <Card key={simulator?.id} className='p-2'>
                <div className='flex w-full gap-4 justify-between items-center'>
                <p className='w-1/12 text-xs'>{simulator?.id}</p>
                <div className='w-1/12'>
                <Chip className={`text-xs flex  items-center ${AccountsTypeList[simulator?.account.type].bgStyles}`} ><div className='flex gap-1 items-center'>{createElement(AccountsTypeList[simulator?.account.type].icon,{size:16})}{AccountsTypeList[simulator?.account.type].label}</div></Chip>
                </div>
                <div className='w-2/12 flex justify-start items-center'>
                <Chip className='text-xs' color='default' variant='faded'>{simulator?.account?.username}</Chip>
                </div>
                <p className='w-1/12 '>{simulator?.currentUsagePercentage} <span className='text-xs'>%</span></p>
                <span className='w-1/12 flex justify-start items-center'>
                {simulator?.isRunning ? <Spinner variant='simple' color='success' /> : <FaRegStopCircle size={30} />
                }
                </span>
                <span className='w-1/12 flex justify-start items-center'>
                <Button  color={simulator?.isLoggedIn ? 'success' : 'danger'} variant='flat' isIconOnly>
                {simulator?.isLoggedIn ?<MdOutlineKey size={20} color='white' />
:                    <MdKeyOff size={20} color='white' />}
                </Button>
                </span>
                <span className='w-1/12 '>
                <Button onPress={() => login(simulator?.id)} color='success' size='sm' variant='flat' disabled={simulator?.isLoggedIn}>Login</Button>
                </span>
                </div>
                </Card>
            ))}
        </div>
    </div>
  )
}

export default SimulatorList