'use client'
import AccountsList from './AccountsList'
import React from 'react'
import AccountsModal from './AccountsModal'
import SimulatorList from '../SimulatorSet/SimulatorList'
const AccountsMain = () => {


  return (
    <div>
      <div className='p-4 '>
    <AccountsList/>
      </div>
    <SimulatorList/>
    <AccountsModal/>
    </div>
  )
}

export default AccountsMain