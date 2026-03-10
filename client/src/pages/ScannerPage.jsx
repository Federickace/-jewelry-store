import React, { useState, useEffect } from 'react';
import useBarcodeScanner from '../hooks/useBarcodeScanner.js';
import ProductCard from '../components/ProductCard.jsx';
import HomeNavbar from "../components/Navbar.jsx";

const ScannerPage = () => {
    // 1. Nuovo stato per accendere/spegnere lo scanner
    const [isScanning, setIsScanning] = useState(false);

    // 2. Passiamo lo stato al nostro hook
    const scannedCode = useBarcodeScanner(isScanning);

    const [prodotto, setProdotto] = useState(null);
    const [errore, setErrore] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (scannedCode) {
            cercaProdotto(scannedCode);
            // Opzionale: spegni lo scanner dopo aver letto un codice
            // setIsScanning(false);
        }
    }, [scannedCode]);

    const cercaProdotto = async (barcode) => {
        setErrore('');
        setProdotto(null);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/apiProduct/getProductByBarcode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barcode: barcode })
            });

            const risultato = await response.json();

            if (response.ok && risultato.success && risultato.data) {
                setProdotto(risultato.data);
            } else {
                setErrore(`Nessun prodotto trovato con il codice: ${barcode}`);
            }
        } catch (error) {
            console.error(error);
            setErrore('Errore di connessione al server backend.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <div className="header">
                <HomeNavbar/>
            </div>
            <h1 style={{ textAlign: 'center', color: '#333' }}>💎 Ricerca Gioielli</h1>
            <p style={{ textAlign: 'center', color: '#666' }}>
                Clicca su "Inserisci Barcode" e usa lo scanner per leggere il codice.
            </p>

            {/* 3. Il bottone per attivare lo scanner */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                    onClick={() => setIsScanning(!isScanning)}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        backgroundColor: isScanning ? '#e0e0e0' : '#4CAF50',
                        color: isScanning ? '#333' : 'white',
                        border: 'none',
                        borderRadius: '5px'
                    }}
                >
                    {isScanning ? 'Scanner in ascolto... (Clicca per fermare)' : 'Inserisci Barcode'}
                </button>
            </div>

            {scannedCode && (
                <div style={{ textAlign: 'center', marginBottom: '20px', color: '#888' }}>
                    Ultimo codice letto: <strong>{scannedCode}</strong>
                </div>
            )}

            {loading && <p style={{ textAlign: 'center' }}>Ricerca in corso...</p>}

            {errore && (
                <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    {errore}
                </div>
            )}

            <ProductCard prodotto={prodotto} />
        </div>
    );
};

export default ScannerPage;
