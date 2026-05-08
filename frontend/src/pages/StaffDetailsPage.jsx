import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const StaffDetailsPage = () => {
    const [staffList, setStaffList] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        assigned_service: '',
        phone: '',
        address: '',
        status: 'Active'
    });

    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchData();
    }, [userInfo?.token, navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [staffRes, servicesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/staff`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                }),
                axios.get(`${API_BASE_URL}/api/services`)
            ]);
            setStaffList(staffRes.data);
            setServices(servicesRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({ name: '', assigned_service: '', phone: '', address: '', status: 'Active' });
        setShowModal(true);
    };

    const openEditModal = (staff) => {
        setIsEditing(true);
        setCurrentId(staff.id);
        setFormData({
            name: staff.name,
            assigned_service: staff.assigned_service || '',
            phone: staff.phone || '',
            address: staff.address || '',
            status: staff.status || 'Active'
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`${API_BASE_URL}/api/staff/${currentId}`, formData, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
            } else {
                await axios.post(`${API_BASE_URL}/api/staff`, formData, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert('Error saving staff record');
        }
    };

    const handleToggleStatus = async (staff) => {
        const newStatus = staff.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await axios.put(`${API_BASE_URL}/api/staff/${staff.id}`, {
                ...staff,
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            fetchData();
        } catch (error) {
            alert('Error updating staff status');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this staff member?')) {
            try {
                await axios.delete(`${API_BASE_URL}/api/staff/${id}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                fetchData();
            } catch (error) {
                alert('Error deleting staff record');
            }
        }
    };

    return (
        <>
            <Navbar />
            <div className="container staff-mgmt">
                <div className="header-flex">
                    <h1 className="heading-primary">Staff Management</h1>
                    <button className="btn-gold" onClick={openAddModal}>+ Add New Staff</button>
                </div>

                {loading ? (
                    <div className="loader-container">Loading staff records...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="staff-table">
                            <thead>
                                <tr>
                                    <th>Staff Name</th>
                                    <th>Assigned Service</th>
                                    <th>Phone Number</th>
                                    <th>Address</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffList.map((staff) => (
                                    <tr key={staff.id}>
                                        <td data-label="Staff Name" className="font-serif">{staff.name}</td>
                                        <td data-label="Assigned Service"><span className="service-badge">{staff.assigned_service}</span></td>
                                        <td data-label="Phone Number">{staff.phone}</td>
                                        <td data-label="Address" className="address-col">{staff.address}</td>
                                        <td data-label="Status">
                                            <div className="status-toggle-container">
                                                <span className={`status-dot ${staff.status === 'Active' ? 'active' : 'inactive'}`}></span>
                                                <button 
                                                    className={`status-toggle-btn ${staff.status === 'Active' ? 'active' : 'inactive'}`}
                                                    onClick={() => handleToggleStatus(staff)}
                                                >
                                                    {staff.status}
                                                </button>
                                            </div>
                                        </td>
                                        <td data-label="Actions">
                                            <div className="action-btns">
                                                <button className="edit-btn" onClick={() => openEditModal(staff)}>Edit</button>
                                                <button className="remove-btn" onClick={() => handleDelete(staff.id)}>Remove</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button className="btn-gold" style={{ margin: '0 auto', minWidth: '220px', color: 'black', fontWeight: 'bold' }} onClick={() => navigate('/')}>
                        Go Back to Dashboard
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input name="name" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Assigned Service</label>
                                <select name="assigned_service" value={formData.assigned_service} onChange={handleInputChange}>
                                    <option value="">Select a service</option>
                                    {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input name="phone" value={formData.phone} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea name="address" value={formData.address} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" value={formData.status} onChange={handleInputChange}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-gold">{isEditing ? 'Save Changes' : 'Add Staff'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .staff-mgmt { padding-top: 100px; padding-bottom: 50px; min-height: 100vh; }
                .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .staff-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
                .staff-table th { text-align: left; padding: 1rem; color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
                .staff-table td { padding: 1.5rem 1rem; background: rgba(40, 38, 36, 0.6); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
                .staff-table td:first-child { border-left: 1px solid var(--border-color); border-radius: 8px 0 0 8px; font-weight: bold; }
                .staff-table td:last-child { border-right: 1px solid var(--border-color); border-radius: 0 8px 8px 0; }
                .font-serif { font-family: var(--font-serif); }
                .service-badge { background: #fbd45d; border: 1px solid #d4af37; color: black; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
                .address-col { max-width: 250px; font-size: 0.9rem; color: var(--text-muted); }
                .status-dot { height: 8px; width: 8px; border-radius: 50%; display: inline-block; margin-right: 8px; }
                .status-dot.active { background-color: #4caf50; box-shadow: 0 0 5px #4caf50; }
                .status-dot.inactive { background-color: #f44336; }
                .status-toggle-container { display: flex; align-items: center; gap: 8px; }
                .status-toggle-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-light); padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; cursor: pointer; transition: all 0.3s; min-width: 75px; text-align: center; }
                .status-toggle-btn.active { border-color: #4caf50; color: #4caf50; }
                .status-toggle-btn.inactive { border-color: #f44336; color: #f44336; }
                .status-toggle-btn:hover { background: rgba(255,255,255,0.1); }
                .action-btns { display: flex; gap: 0.75rem; }
                .edit-btn, .remove-btn { background: none; border: none; cursor: pointer; font-size: 0.85rem; padding: 0.25rem 0.5rem; transition: color 0.3s; }
                .edit-btn { color: #d4af37; }
                .edit-btn:hover { color: #fbd45d; text-decoration: underline; }
                .remove-btn { color: #f44336; }
                .remove-btn:hover { color: #ff5252; text-decoration: underline; }
                
                /* Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .modal-content { background: #1e1c1b; border: 1px solid var(--primary); padding: 2.5rem; border-radius: 12px; width: 90%; max-width: 500px; box-shadow: 0 0 30px rgba(255,163,150,0.2); }
                .modal-content h2 { font-family: var(--font-serif); color: var(--primary); margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-light); }
                .form-group input, .form-group select, .form-group textarea { width: 100%; border: 1px solid var(--border-color); background: rgba(255,255,255,0.05); color: #fff; padding: 0.75rem; border-radius: 4px; }
                .form-group select { background: #2a2826; }
                .form-group select option { color: black; background: white; }
                .form-group textarea { height: 80px; resize: none; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
                .loader-container { text-align: center; padding: 4rem; font-family: var(--font-serif); font-size: 1.2rem; }
                
                @media (max-width: 992px) {
                    .staff-table thead { display: none; }
                    .staff-table td { display: block; border: none; padding: 0.5rem 1rem; text-align: right; }
                    .staff-table td:before { content: attr(data-label); float: left; font-weight: bold; color: var(--text-muted); }
                    .staff-table tr { margin-bottom: 1.5rem; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; display: block; }
                    .staff-table td:first-child { border: none; border-radius: 0; text-align: center; background: rgba(255,163,150,0.1); margin-bottom: 0.5rem; font-size: 1.2rem; }
                }
            `}</style>
        </>
    );
};

export default StaffDetailsPage;
