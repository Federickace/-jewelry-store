import React, { useState, useEffect } from 'react';
import useBarcodeScanner from '../hooks/useBarcodeScanner.js';
import ProductCard from '../components/ProductCard.jsx';
import HomeNavbar from "../components/Navbar.jsx";

const ScannerPage = () => {
    const [isScanning, setIsScanning] = useState(false);
    const scannedCode = useBarcodeScanner(isScanning);

    const [prodotto, setProdotto] = useState(null);
    const [errore, setErrore] = useState('');
    const [successo, setSuccesso] = useState('');
    const [loading, setLoading] = useState(false);

    const [mostraConferma, setMostraConferma] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (scannedCode) {
            cercaProdotto(scannedCode);
            setIsScanning(false);
        }
    }, [scannedCode]);

    const cercaProdotto = async (barcode) => {
        setErrore('');
        setSuccesso('');
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

                // 1. Assicuriamoci che i dati in arrivo siano un array
                const datiArray = Array.isArray(risultato.data) ? risultato.data : [risultato.data];

                if (datiArray.length === 0) {
                    setErrore(`Nessun prodotto in magazzino per il codice: ${barcode}`);
                    return;
                }

                // 2. RAGGRUPPIAMO I PRODOTTI (Stessa logica esatta della GetPage)
                const prodottiRaggruppati = Object.values(datiArray.reduce((acc, p) => {
                    const chiaveGruppo = `${p.barcode}-${p.brand}-${p.gender}`;

                    if (!acc[chiaveGruppo]) {
                        acc[chiaveGruppo] = {
                            ...p,
                            quantita: 1,
                            prodottiIndividuali: [p] // Serve alla ProductCard!
                        };
                    } else {
                        acc[chiaveGruppo].quantita += 1;
                        acc[chiaveGruppo].prodottiIndividuali.push(p);
                    }
                    return acc;
                }, {}));

                // 3. Prendiamo il primo gruppo trovato e apriamo il pop-up
                // (Se per assurdo ci fossero 2 marche diverse con lo stesso barcode, prenderà la prima)
                setProdotto(prodottiRaggruppati[0]);
                setMostraConferma(true);

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

    const handleConfermaVendita = async () => {
        setIsDeleting(true);
        setErrore('');

        try {
            // SICUREZZA: Invece di mandare il barcode generico, mandiamo l'ID univoco
            // del primo pezzo fisico disponibile in quell'array!
            const idDaEliminare = prodotto.prodottiIndividuali[0]._id;

            const response = await fetch('http://localhost:3000/apiProduct/deleteSingleProduct', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: idDaEliminare }) // <-- CAMBIATO DA barcode a id!
            });

            const risultato = await response.json();

            if (response.ok && risultato.success) {
                setSuccesso('✅ Prodotto scaricato dal magazzino con successo!');
                setMostraConferma(false);
                setProdotto(null);
            } else {
                setErrore(`Errore durante lo scarico: ${risultato.message}`);
            }
        } catch (error) {
            console.error(error);
            setErrore("Errore di connessione durante l'eliminazione.");
        } finally {
            setIsDeleting(false);
        }
    };

    const modalStyle = {
        backgroundColor: '#fff', border: '2px solid #2196F3', borderRadius: '10px',
        padding: '20px', margin: '20px auto', maxWidth: '400px', textAlign: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    };
    const btnStyle = { padding: '10px 20px', margin: '0 10px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold' };

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <div className="header">
                <HomeNavbar/>
            </div>
            <h1 style={{ textAlign: 'center', color: '#333' }}>💎 Vendita Veloce</h1>
            <p style={{ textAlign: 'center', color: '#666' }}>
                Scansiona un gioiello per scaricarlo immediatamente dal magazzino.
            </p>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                    onClick={() => setIsScanning(!isScanning)}
                    disabled={mostraConferma}
                    style={{
                        padding: '10px 20px', fontSize: '16px', cursor: mostraConferma ? 'not-allowed' : 'pointer',
                        backgroundColor: isScanning ? '#e0e0e0' : (mostraConferma ? '#ccc' : '#4CAF50'),
                        color: isScanning ? '#333' : 'white', border: 'none', borderRadius: '5px'
                    }}
                >
                    {isScanning ? 'Scanner in ascolto... (Clicca per fermare)' : '📸 Inserisci Barcode'}
                </button>
            </div>

            {loading && <p style={{ textAlign: 'center' }}>Ricerca in corso... ⏳</p>}

            {errore && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '15px' }}>{errore}</div>}
            {successo && <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>{successo}</div>}

            {mostraConferma && prodotto && (
                <div style={modalStyle}>
                    <h2 style={{ margin: '0 0 15px 0', color: '#333' }}>Conferma Scarico</h2>
                    <p style={{ fontSize: '18px' }}>Vuoi rimuovere una unità di:</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1565c0' }}>{prodotto.name} ({prodotto.brand})</p>
                    <strong>{prodotto.barcode}</strong>
                    <p>Disponibilità attuale: <strong>{prodotto.quantita}</strong></p>

                    {prodotto.quantita === 1 && (
                        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '5px', margin: '15px 0', border: '1px solid #ffeeba' }}>
                            ⚠️ <strong>Attenzione:</strong> Questo è l'ultimo pezzo disponibile in magazzino!
                        </div>
                    )}

                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={handleConfermaVendita}
                            disabled={isDeleting}
                            style={{ ...btnStyle, backgroundColor: '#f44336', color: 'white' }}
                        >
                            {isDeleting ? 'Eliminazione...' : '🗑️ Conferma Scarico'}
                        </button>
                        <button
                            onClick={() => { setMostraConferma(false); setProdotto(null); }}
                            disabled={isDeleting}
                            style={{ ...btnStyle, backgroundColor: '#e0e0e0', color: '#333' }}
                        >
                            Annulla
                        </button>
                    </div>
                </div>
            )}

            {prodotto && !mostraConferma && (
                <ProductCard prodotto={prodotto} />
            )}
        </div>
    );
};

export default ScannerPage;
