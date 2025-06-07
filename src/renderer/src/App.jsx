import { useEffect, useState } from 'react'
import electronLogo from './assets/electron.svg'

function formatCurrency(number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number)
}

function PartnerCard({ partner }) {
  return (
    <div className="partner-card">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ marginBottom: '5px' }}>
            <span>{partner.partner_type} | </span>
            <span>"{partner.partner_name}"</span>
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>
            Юридический адрес: {partner.partner_legal_address}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>
            +{partner.partner_phone}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>
            Рейтинг: {partner.partner_rating}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
            {formatCurrency(partner.total_cost)}
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [partners, setPartners] = useState([])

  useEffect(() => {
    // Здесь будет запрос к базе данных через IPC
    window.api.getPartners().then(data => {
      setPartners(data)
    }).catch(err => {
      console.error('Error fetching partners:', err)
    })
  }, [])

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {partners.map(partner => (
        <PartnerCard key={partner.partner_id} partner={partner} />
      ))}
    </div>
  )
}

export default App

