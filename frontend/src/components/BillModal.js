import React from 'react';

const BillModal = ({ isOpen, onClose, bill }) => {
  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal-content bill-modal" style={{ maxWidth: '600px', backgroundColor: '#fff', color: '#333', padding: '40px' }}>
        <button className="close-btn" onClick={onClose} style={{ color: '#333' }}>&times;</button>
        
        <div id="bill-print-area">
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: '#d4af37', fontSize: '2rem', margin: '0 0 5px 0' }}>StaySync Salon</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Premium Beauty & Wellness Services</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#999' }}>Hindwadi opposite to Lokmanya Society Belagavi, Karnataka | +91 8456379156</p>
          </div>

          <div style={{ borderTop: '2px solid #f1f1f1', borderBottom: '2px solid #f1f1f1', padding: '15px 0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem' }}><strong>Bill To:</strong> {bill.user_name || bill.customer_name}</p>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem' }}><strong>Phone:</strong> {bill.phone || bill.customer_phone}</p>
              <p style={{ margin: 0, fontSize: '0.85rem' }}><strong>Email:</strong> {bill.email || 'N/A'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem' }}><strong>Bill No:</strong> {bill.bill_number}</p>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem' }}><strong>Date:</strong> {new Date(bill.appointment_date || bill.date).toLocaleDateString()}</p>
              <p style={{ margin: 0, fontSize: '0.85rem' }}><strong>Status:</strong> <span style={{ color: bill.payment_status === 'Paid' ? '#2ecc71' : '#f39c12', fontWeight: 'bold' }}>{bill.payment_status}</span></p>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <th style={{ textAlign: 'left', padding: '10px 0', fontSize: '0.9rem' }}>Service</th>
                <th style={{ textAlign: 'right', padding: '10px 0', fontSize: '0.9rem' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {bill.services && bill.services.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #fafafa' }}>
                  <td style={{ padding: '10px 0', fontSize: '0.9rem' }}>
                    {s.name}
                    {s.assigned_staff && <div style={{ fontSize: '0.75rem', color: '#999' }}>Staff: {s.assigned_staff}</div>}
                  </td>
                  <td style={{ textAlign: 'right', padding: '10px 0', fontSize: '0.9rem' }}>₹{Number(s.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Subtotal:</span>
                <span>₹{Number(bill.total_amount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #333', paddingTop: '10px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                <span>Total:</span>
                <span>₹{Number(bill.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '0.85rem', color: '#999' }}>
            <p>Thank you for choosing StaySync Salon!</p>
            <p>Please visit us again soon.</p>
          </div>
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center' }} className="no-print">
          <button className="btn-primary" onClick={handlePrint} style={{ backgroundColor: '#333', borderColor: '#333', color: '#fff', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Print Bill</button>
          <button className="btn-outline" onClick={onClose} style={{ borderColor: '#333', color: '#333', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', background: 'transparent' }}>Close</button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
        }

        .bill-modal {
          position: relative;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: modalFadeIn 0.3s ease-out;
          border-radius: 8px;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .close-btn {
          position: absolute;
          right: 20px;
          top: 20px;
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          line-height: 1;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #bill-print-area, #bill-print-area * {
            visibility: visible;
          }
          #bill-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .modal-overlay {
            background: none !important;
          }
          .modal-content {
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BillModal;
