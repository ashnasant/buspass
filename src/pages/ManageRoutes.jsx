import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ManageRoutes = () => {
    const [routes, setRoutes] = useState([]);
    const [newRoute, setNewRoute] = useState({ id: '', name: '', stops: '', fare: '', distance: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        const { data, error } = await supabase.from('routes').select('*');
        if (error) {
            console.error('Fetch routes error:', error);
            return;
        }
        setRoutes(data);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const { error } = await supabase
                    .from('routes')
                    .update({ 
                        name: newRoute.name, 
                        stops: newRoute.stops, 
                        fare: newRoute.fare, 
                        distance: newRoute.distance 
                    })
                    .eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('routes').insert([newRoute]);
                if (error) throw error;
            }
            
            fetchRoutes();
            resetForm();
        } catch (err) {
            console.error('Submit error:', err);
            alert(`Failed to ${isEditing ? 'update' : 'add'} route`);
        }
    };

    const handleEdit = (route) => {
        setNewRoute({
            id: route.id,
            name: route.name,
            stops: route.stops,
            fare: route.fare,
            distance: route.distance
        });
        setEditingId(route.id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setNewRoute({ id: '', name: '', stops: '', fare: '', distance: '' });
        setIsEditing(false);
        setEditingId(null);
    };

    const handleDelete = async (route) => {
        if(window.confirm(`Are you sure you want to delete route ${route.name}?`)) {
            try {
                const { error } = await supabase.from('routes').delete().eq('id', route.id);
                if (error) throw error;
                fetchRoutes();
            } catch (err) {
                console.error('Delete error:', err);
                alert('Failed to delete route. It might be in use by applications/passes.');
            }
        }
    };

    return (
        <div className="page">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 className="card-title">{isEditing ? 'Edit Route Details' : 'Bus Route Management'}</h3>
                        <p className="card-sub">{isEditing ? `Modifying details for Route ${editingId}` : 'Create and manage routes, stops, and fare details.'}</p>
                    </div>
                    {isEditing && (
                        <button className="btn btn-secondary" onClick={resetForm}>Cancel Edit</button>
                    )}
                </div>
                
                <form className="mt-4 mb-4" onSubmit={handleFormSubmit}>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Route ID</label>
                            <input 
                                type="text" 
                                placeholder="e.g. R06" 
                                className="form-input" 
                                value={newRoute.id} 
                                onChange={e => setNewRoute({...newRoute, id: e.target.value})} 
                                required 
                                disabled={isEditing}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Route Name</label>
                            <input type="text" placeholder="e.g. Downtown Express" className="form-input" value={newRoute.name} onChange={e => setNewRoute({...newRoute, name: e.target.value})} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Stops (Comma separated)</label>
                        <input type="text" placeholder="Stop A, Stop B, Stop C" className="form-input" value={newRoute.stops} onChange={e => setNewRoute({...newRoute, stops: e.target.value})} required />
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Fare (₹)</label>
                            <input type="number" placeholder="50" className="form-input" value={newRoute.fare} onChange={e => setNewRoute({...newRoute, fare: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Total Distance</label>
                            <input type="text" placeholder="15 KM" className="form-input" value={newRoute.distance} onChange={e => setNewRoute({...newRoute, distance: e.target.value})} required />
                        </div>
                    </div>
                    <button type="submit" className={`btn ${isEditing ? 'btn-success' : 'btn-primary'} w-full`}>
                        {isEditing ? 'Update Route Details' : 'Add New Route'}
                    </button>
                </form>

                <div className="separator"></div>

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Stops</th>
                                <th>Fare</th>
                                <th>Distance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {routes.map(route => (
                                <tr key={route.id}>
                                    <td><div style={{ fontWeight: 600 }}>{route.id}</div></td>
                                    <td>{route.name}</td>
                                    <td><div style={{ fontSize: '12px', color: '#666' }}>{route.stops}</div></td>
                                    <td><div className="badge badge-success" style={{ backgroundColor: '#e7f1ff', color: '#0056b3' }}>₹{route.fare}</div></td>
                                    <td>{route.distance}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                className="btn btn-secondary" 
                                                style={{ padding: '6px 12px', fontSize: '12px', color: '#0056b3', border: '1px solid #cce5ff' }}
                                                onClick={() => handleEdit(route)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="btn btn-secondary" 
                                                style={{ padding: '6px 12px', fontSize: '12px', color: '#dc3545', border: '1px solid #ffccd1' }}
                                                onClick={() => handleDelete(route)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageRoutes;
