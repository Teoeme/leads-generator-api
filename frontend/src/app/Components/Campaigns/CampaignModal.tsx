import ModalTamplate from '../Templates/ModalTamplate';
import CampaignForm from './CampaignForm';
const CampaignModal = () => {


  return (
    <ModalTamplate uid='campaign-modal' size='5xl'>
        {(data,uid,title,type)=>{
            return (
                <CampaignForm type={type as 'add' | 'edit'} />
            )
        }}

    </ModalTamplate>
)
}

export default CampaignModal