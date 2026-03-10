import React, { useState, useEffect } from 'react';
import HomeNavbar from "../components/Navbar.jsx";
import useBarcodeScanner from "../hooks/useBarcodeScanner.js";

const DeletePage = () => {
    const [isScanning, setIsScanning] = useState(false);
    const scannedBarcode = useBarcodeScanner(isScanning);

    const [prodotti, setProdotti] = useState([]);
    const [termineRicerca, setTermineRicerca] = useState('');
    const [attributoRicerca, setAttributoRicerca] = useState('barcode');

    const [loading, setLoading] = useState(true);
    const [messaggio, setMessaggio] = useState({ testo: '', tipo: '' });

    // STATI PER LA PAGINAZIONE
    const [paginaCorrente, setPaginaCorrente] = useState(1);
    const prodottiPerPagina = 10;

    useEffect(() => {
        fetchProdotti();
    }, []);

    const fetchProdotti = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/apiProduct/');
            const risultato = await response.json();
            if (response.ok && risultato.success) {
                setProdotti(risultato.data);
            } else {
                setMessaggio({ testo: 'Impossibile caricare i prodotti.', tipo: 'error' });
            }
        } catch (error) {
            console.error(error);
            setMessaggio({ testo: 'Errore di connessione al server backend.', tipo: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Se lo scanner legge un codice
    useEffect(() => {
        if (scannedBarcode) {
            setAttributoRicerca('barcode');
            setTermineRicerca(scannedBarcode);
            setIsScanning(false);
            setMessaggio({ testo: `Codice ${scannedBarcode} trovato! Clicca su Elimina per confermare.`, tipo: 'info' });
        }
    }, [scannedBarcode]);

    // Riporta a pagina 1 se cambi la ricerca
    useEffect(() => {
        setPaginaCorrente(1);
    }, [termineRicerca, attributoRicerca]);

    const handleDelete = async (prodotto) => {
        const conferma = window.confirm(`⚠️ ATTENZIONE ⚠️\nSei sicuro di voler eliminare definitivamente:\n${prodotto.name} (Barcode: ${prodotto.barcode})?`);
        if (!conferma) return;

        setMessaggio({ testo: '', tipo: '' });

        try {
            const response = await fetch('http://localhost:3000/apiProduct/deleteProductByBarcode', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barcode: prodotto.barcode })
            });

            const risultato = await response.json();

            if (response.ok && risultato.success) {
                setMessaggio({ testo: `✅ Prodotto eliminato con successo: ${prodotto.name}`, tipo: 'success' });
                setProdotti(prodotti.filter(p => p.barcode !== prodotto.barcode));
                setTermineRicerca(''); // Svuota la ricerca dopo aver cancellato
            } else {
                setMessaggio({ testo: `Errore: ${risultato.message || 'Impossibile eliminare'}`, tipo: 'error' });
            }
        } catch (error) {
            console.error(error);
            setMessaggio({ testo: 'Errore di connessione al server.', tipo: 'error' });
        }
    };

    // 1. Filtriamo i prodotti (ricorda: se la ricerca è vuota, restituisce false)
    const prodottiFiltrati = prodotti.filter(prodotto => {
        if (!termineRicerca) return false;
        const valoreAttributo = prodotto[attributoRicerca] ? String(prodotto[attributoRicerca]).toLowerCase() : '';
        const termineMinuscolo = termineRicerca.toLowerCase();
        return valoreAttributo.includes(termineMinuscolo);
    });

    // 2. Matematica della Paginazione
    const indiceUltimoProdotto = paginaCorrente * prodottiPerPagina;
    const indicePrimoProdotto = indiceUltimoProdotto - prodottiPerPagina;
    const prodottiAttuali = prodottiFiltrati.slice(indicePrimoProdotto, indiceUltimoProdotto);
    const numeroTotalePagine = Math.ceil(prodottiFiltrati.length / prodottiPerPagina);

    // Stili
    const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' };
    const btnPaginaStyle = {
        padding: '8px 12px', margin: '0 5px', border: '1px solid #d32f2f', borderRadius: '4px',
        backgroundColor: '#fff', color: '#d32f2f', cursor: 'pointer', fontWeight: 'bold'
    };
    const btnAttivoStyle = { ...btnPaginaStyle, backgroundColor: '#d32f2f', color: 'white' };

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <div className="header">
                <HomeNavbar/>
            </div>

            <h1 style={{ textAlign: 'center', color: '#d32f2f' }}>🗑️ Trova ed Elimina Gioiello</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                Cerca il prodotto che vuoi rimuovere dal database usando i filtri qui sotto o lo scanner.
            </p>

            <div style={{ backgroundColor: '#fff5f5', padding: '20px', borderRadius: '8px', border: '1px solid #ffcdd2', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                    <select value={attributoRicerca} onChange={(e) => setAttributoRicerca(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: '150px' }}>
                        <option value="barcode">Cerca per Barcode</option>
                        <option value="name">Cerca per Nome</option>
                        <option value="type">Cerca per Categoria</option>
                        <option value="description">Cerca per Descrizione</option>
                    </select>

                    <input
                        type="text"
                        placeholder={`Scrivi il ${attributoRicerca} da cercare...`}
                        value={termineRicerca}
                        onChange={(e) => setTermineRicerca(e.target.value)}
                        style={{ ...inputStyle, flex: 2, minWidth: '200px' }}
                    />
                </div>

                <button
                    type="button"
                    onClick={() => setIsScanning(!isScanning)}
                    style={{
                        padding: '10px 20px', fontSize: '16px', cursor: 'pointer',
                        backgroundColor: isScanning ? '#e0e0e0' : '#2196F3',
                        color: isScanning ? '#333' : 'white', border: 'none', borderRadius: '5px', width: '100%'
                    }}
                >
                    {isScanning ? 'Scanner in ascolto... (Clicca per fermare)' : '📸 Usa Scanner per Barcode'}
                </button>
            </div>

            {messaggio.testo && (
                <div style={{
                    padding: '15px', marginBottom: '20px', borderRadius: '5px', textAlign: 'center', fontWeight: 'bold',
                    backgroundColor: messaggio.tipo === 'error' ? '#ffebee' : (messaggio.tipo === 'success' ? '#e8f5e9' : '#e3f2fd'),
                    color: messaggio.tipo === 'error' ? '#c62828' : (messaggio.tipo === 'success' ? '#2e7d32' : '#1565c0')
                }}>
                    {messaggio.testo}
                </div>
            )}

            {loading && <p style={{ textAlign: 'center' }}>Caricamento database in corso... ⏳</p>}

            {/* SE C'E' UNA RICERCA IN CORSO E NON E' VUOTA */}
            {!loading && termineRicerca && (
                <div>
                    {prodottiAttuali.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#888' }}>Nessun prodotto trovato con questa ricerca. 🕵️‍♂️</p>
                    ) : (
                        <>
                            <p style={{ textAlign: 'right', color: '#666', fontSize: '14px' }}>
                                Trovati: {prodottiFiltrati.length} (Pagina {paginaCorrente} di {numeroTotalePagine})
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {prodottiAttuali.map(prodotto => (
                                    <div key={prodotto._id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{prodotto.name}</h3>
                                            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                                                <strong>Cat:</strong> <span style={{ textTransform: 'uppercase' }}>{prodotto.type}</span> | <strong>Barcode:</strong> {prodotto.barcode} <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                                <strong>Descrizione:</strong> {prodotto.description}
                                            </p>
                                            </p>
                                            <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#2196F3' }}>
                                                Prezzo: €{prodotto.newPrice}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(prodotto)}
                                            style={{
                                                padding: '10px 15px', backgroundColor: '#d32f2f', color: 'white',
                                                border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold',
                                                minWidth: '100px'
                                            }}
                                        >
                                            🗑️ Elimina
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Paginazione */}
                            {numeroTotalePagine > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '10px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => setPaginaCorrente(paginaCorrente - 1)}
                                        disabled={paginaCorrente === 1}
                                        style={{ ...btnPaginaStyle, opacity: paginaCorrente === 1 ? 0.5 : 1, cursor: paginaCorrente === 1 ? 'not-allowed' : 'pointer' }}
                                    >
                                        ⬅️
                                    </button>

                                    {[...Array(numeroTotalePagine)].map((_, index) => {
                                        const numeroPag = index + 1;
                                        return (
                                            <button
                                                key={numeroPag}
                                                onClick={() => setPaginaCorrente(numeroPag)}
                                                style={paginaCorrente === numeroPag ? btnAttivoStyle : btnPaginaStyle}
                                            >
                                                {numeroPag}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setPaginaCorrente(paginaCorrente + 1)}
                                        disabled={paginaCorrente === numeroTotalePagine}
                                        style={{ ...btnPaginaStyle, opacity: paginaCorrente === numeroTotalePagine ? 0.5 : 1, cursor: paginaCorrente === numeroTotalePagine ? 'not-allowed' : 'pointer' }}
                                    >
                                        ➡️
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default DeletePage;
