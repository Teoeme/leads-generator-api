import { AccountsTypeList } from '@/app/entities/Account';
import { Simulator } from '@/app/entities/Simulator';
import { useSimulatorSet } from '@/app/hooks/useSimulatorSet';
import { Button, Card, Chip, Spinner } from '@heroui/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { createElement, useState } from 'react';
import { FaRegStopCircle } from 'react-icons/fa';
import { FiTrash } from 'react-icons/fi';
import { MdHistory, MdKeyOff, MdOutlineKey } from "react-icons/md";
dayjs.extend(relativeTime);

const SimulatorList = () => {
    const { simulators, login, removeSimulator } = useSimulatorSet();
    const [showLogs, setShowLogs] = useState<{ [key: string]: boolean }>({});

  return (
    <div className='flex flex-col gap-4 p-4 mt-4'>
        <div className='flex justify-between w-full items-center'>
            <h3 className='text-2xl font-bold  from-blue-300 to-blue-600  text-transparent bg-clip-text bg-gradient-to-r'>Simuladores</h3>
        </div>


                <div className='flex gap-4  text-xs text-left px-4 items-baseline'>
                <p className='w-40'>Id</p>
                <p className='w-28'>Type</p>
                <p className='w-60'>Username</p>
                <p className='w-24'>Current Usage Percentage</p>
                <p className='w-24'>Is Running</p>
                <p className='w-24'>Is Logged In</p>
                <p className='w-24'>Need Attention</p>
                <p className='flex-1 text-right'>Acciones</p>
            </div>
        <div className='flex flex-col gap-2 p-2 max-h-[40vh] overflow-auto transition-all duration-300 '>
            {simulators.map((simulator:Simulator) => (
                <Card key={simulator?.id} className='p-2 min-h-max'>
                <div className='flex w-full gap-4 items-center'>
                <p className='w-40 text-[10px]'>{simulator?.id}</p>
                <div className='w-28'>
                <Chip className={`text-xs flex  items-center ${AccountsTypeList[simulator?.account.type as keyof typeof AccountsTypeList].bgStyles}`} ><div className='flex gap-1 items-center'>{createElement(AccountsTypeList[simulator?.account.type as keyof typeof AccountsTypeList].icon,{size:16})}{AccountsTypeList[simulator?.account.type as keyof typeof AccountsTypeList].label}</div></Chip>
                </div>
                <div className='w-60 flex justify-start items-center'>
                <Chip className='text-xs' color='default' variant='faded'>{simulator?.account?.username}</Chip>
                </div>
                <p className='w-24 '>{simulator?.currentUsagePercentage} <span className='text-xs'>%</span></p>
                <span className='w-24 flex justify-start items-center'>
                {simulator?.isRunning ? <Spinner variant='simple' color='success' /> : <FaRegStopCircle size={30} className='opacity-20' />
                }
                </span>
                <span className='w-24 flex justify-start items-center'>
                <Button  color={simulator?.isLoggedIn ? 'success' : 'danger'} variant='flat' isIconOnly>
                {simulator?.isLoggedIn ?<MdOutlineKey size={20} color='white' />
:                    <MdKeyOff size={20} color='white' />}
                </Button>
                </span>
                <span className='w-24 flex justify-start items-center'>
                <Chip color={simulator?.needAttention ? 'danger' : 'success'} variant='flat'>{simulator?.needAttention ? 'Yes' : 'No'}</Chip>
                </span>
                <span className='flex-1 flex justify-end items-center gap-2'>
                <Button onPress={() => login(simulator?.id)} color='success' size='sm' variant='flat' disabled={simulator?.isLoggedIn}>Login</Button>
                <Button onPress={() => removeSimulator(simulator?.id)} color='danger' size='sm' variant='flat' isIconOnly startContent={<FiTrash size={18}/>}></Button>
                <Button onPress={() => setShowLogs({...showLogs, [simulator?.id]: !showLogs[simulator?.id]})} color='default' size='sm'  isIconOnly startContent={<MdHistory size={18}/>}></Button>

                </span>
                </div>
                <div className=' w-full bg-zinc-950 rounded-md p-2 mt-1 relative flex flex-col gap-2'
                style={{
                    maxHeight:showLogs[simulator?.id] ? `calc(${simulator?.logs?.length} * 30px)` : '30px',
                    overflow:'hidden',
                    transition:'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out',

                }}
                >
                    {simulator?.logs?.map((log)=>(
                        <div key={log.timestamp} className='flex gap-2'>
                            <p className='text-xs opacity-50' >{dayjs(log.timestamp).fromNow()}</p>
                            <p className='text-xs text-wrap'>{log.message}</p>
                        </div>
                    ))}
                </div>
                </Card>
            ))}
        </div>
    </div>
  )
}

export default SimulatorList