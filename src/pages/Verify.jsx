import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Html5Qrcode } from "html5-qrcode";

const Verify = () => {
    const [passId, setPassId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanningError, setScanningError] = useState(null);
    const scannerRef = useRef(null);

    useEffect(() => {
        // Initialize the scanner instance on mount
        scannerRef.current = new Html5Qrcode("reader");

        return () => {
            // Ensure scanner is stopped and cleared on unmount
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current.clear();
                }).catch(err => console.error("Error stopping scanner on unmount", err));
            }
        };
    }, []);

    const startScanning = async () => {
        if (!scannerRef.current) return;
        
        setScanningError(null);
        setResult(null);
        
        try {
            setIsScanning(true);
            await scannerRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    stopScanning();
                    handleVerify(decodedText);
                },
                (errorMessage) => {
                    // Silence constant scanning errors
                }
            );
        } catch (err) {
            console.error("Failed to start scanner", err);
            setScanningError("Could not access camera. Please ensure permissions are granted.");
            setIsScanning(false);
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
                setIsScanning(false);
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
        }
    };

    const handleVerify = async (scannedId = null) => {
        const targetId = scannedId || passId;
        if (!targetId) return;

        setLoading(true);
        setResult(null);
        try {
            const { data: pass, error } = await supabase
                .from('passes')
                .select('*')
                .eq('id', targetId)
                .single();

            if (error || !pass) {
                setResult({ success: false, message: 'Pass not found or invalid ID.' });
                
                // Log failure
                await supabase.from('verify_logs').insert([{
                    pass_id: targetId,
                    result: 'fail',
                    scanned_by: 'Staff'
                }]);
            } else {
                // Check if active and not expired
                const isExpired = new Date(pass.valid_to) < new Date();
                
                if (pass.status !== 'active' || isExpired) {
                    const msg = isExpired ? 'Pass has expired.' : 'Pass is inactive.';
                    setResult({ success: false, message: msg });
                    
                    await supabase.from('verify_logs').insert([{
                        pass_id: targetId,
                        result: 'fail',
                        scanned_by: 'Staff'
                    }]);
                } else {
                    setResult({ success: true, data: pass, message: 'VERIFIED SUCCESSFULLY' });
                    
                    // Log success
                    await supabase.from('verify_logs').insert([{
                        pass_id: targetId,
                        result: 'pass',
                        scanned_by: 'Staff'
                    }]);
                }
            }
        } catch (err) {
            console.error('Verify error:', err);
            setResult({ success: false, message: 'Verification process failed.' });
        }
        setLoading(false);
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3 className="card-title text-center">QR Pass Scanner</h3>
            <p className="card-sub text-center">Place the student QR code in front of the camera</p>
            
            <div className="scanner-outer" style={{ 
                width: '100%', 
                minHeight: '200px',
                background: '#f8f9fa',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '20px',
                border: '2px dashed #dee2e6',
                position: 'relative'
            }}>
                {/* 
                    DEDICATED SCANNER DIV 
                    This div is ALWAYS in the DOM and is NEVER touched by React.
                    Its visibility is toggled via CSS to avoid DOM mounting/unmounting conflicts.
                */}
                <div 
                    id="reader" 
                    style={{ 
                        width: '100%', 
                        display: isScanning ? 'block' : 'none',
                        background: '#000'
                    }}
                ></div>

                {/* React-managed UI Layer */}
                {!isScanning && !scanningError && (
                    <div className="text-center py-5">
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📱</div>
                        <button className="btn btn-primary" onClick={startScanning}>
                            Start Scanning
                        </button>
                    </div>
                )}
                
                {scanningError && (
                    <div className="text-center p-4">
                        <div style={{ color: '#dc3545', marginBottom: '15px', fontWeight: 'bold' }}>{scanningError}</div>
                        <button className="btn btn-outline-primary" onClick={startScanning}>
                            Try Again
                        </button>
                    </div>
                )}

                {isScanning && (
                    <div style={{ 
                        position: 'absolute', 
                        bottom: '15px', 
                        left: '0', 
                        right: '0', 
                        textAlign: 'center', 
                        zIndex: 10 
                    }}>
                        <button className="btn btn-sm btn-danger" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} onClick={stopScanning}>
                            Stop Scanning
                        </button>
                    </div>
                )}
            </div>

            <div className="separator" style={{ margin: '20px 0', opacity: 0.6 }}>OR</div>
            <div className="text-center text-muted mb-3" style={{ fontSize: '14px' }}>Manual Entry</div>

            <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter Pass ID" 
                    value={passId}
                    onChange={e => setPassId(e.target.value.toUpperCase())}
                />
                <button className="btn btn-secondary" onClick={() => handleVerify()} disabled={loading || isScanning}>
                    Verify
                </button>
            </div>

            {result && (
                <div className={`mt-4 alert ${result.success ? 'alert-success' : 'alert-danger'}`} style={{ border: '2px solid', borderRadius: '15px' }}>
                    {result.success ? (
                        <div className="text-center">
                            <h2 style={{ fontSize: '40px', marginBottom: '10px' }}>✅</h2>
                            <h3 style={{ margin: 0, color: '#155724' }}>{result.message}</h3>
                            <div className="info-box mt-3" style={{ background: 'rgba(255,255,255,0.5)', padding: '15px', borderRadius: '10px' }}>
                                <div style={{ fontSize: '20px', fontWeight: '800' }}>{result.data.student_name}</div>
                                <div className="text-muted">{result.data.roll_no}</div>
                                <div style={{ marginTop: '10px', fontWeight: 'bold', color: '#0056b3' }}>
                                    Trips Remaining: {result.data.trips_left}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <h2 style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</h2>
                            <h3 style={{ margin: 0 }}>INVALID PASS</h3>
                            <p style={{ marginTop: '10px' }}>{result.message}</p>
                        </div>
                    )}
                    <button className="btn btn-outline-primary w-full mt-3" onClick={() => {
                        setResult(null);
                        setPassId('');
                    }}>
                        Clear Result
                    </button>
                </div>
            )}
        </div>
    );
};

export default Verify;
