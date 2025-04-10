'use client'
import { useProxy } from '@/app/hooks/useProxy'
import { useModal } from '@/app/hooks/useModal'
import { useStateForm } from '@/app/hooks/useStateForm'
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react'
import { ProxyFormData, ProxyProtocol } from '@/app/entities/Proxy'
import ProxyForm from './ProxyForm'

interface ProxyFormDataWithId extends ProxyFormData {
  id?: string;
}

const ProxyModal = () => {
  const { createProxy, updateProxy } = useProxy()
  const { isOpen, close, type, title } = useModal({ uid: 'proxy-modal' })
  const { formState, handleChange, resetForm } = useStateForm({
    formId: 'proxyForm',
    initialState: {
      name: '',
      server: '',
      username: '',
      password: '',
      protocol: ProxyProtocol.HTTP,
      country: '',
      notes: ''
    }
  })

  const handleSubmit = async (data: ProxyFormDataWithId) => {
    if (type === 'edit' && data.id) {
      await updateProxy(data.id, data)
    } else {
      await createProxy(data)
    }
    close()
    resetForm()
  }

  const handleCancel = () => {
    close()
    resetForm()
  }

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <ModalContent>
        <ModalHeader>{title || 'Proxy'}</ModalHeader>
        <ModalBody>
          <ProxyForm
            formState={formState as ProxyFormData}
            handleChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ProxyModal 