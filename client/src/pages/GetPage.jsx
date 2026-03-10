import React, { useState, useEffect } from 'react';
import HomeNavbar from "../components/Navbar.jsx";
import ProductCard from '../components/ProductCard.jsx';

const GetPage = () => {
    // Stati per i dati
    const [prodotti, setProdotti] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errore, setErrore] = useState('');

    // Stati per la ricerca
    const [termineRicerca, setTermineRicerca] = useState('');
    const [attributoRicerca, setAttributoRicerca] = useState('name');

    // NUOVI STATI PER LA PAGINAZIONE
    const [paginaCorrente, setPaginaCorrente] = useState(1);
    const prodottiPerPagina = 10; // Quanti gioielli vuoi vedere per ogni pagina? (Cambialo se vuoi!)

    // Recupero dati iniziale
    useEffect(() => {
        const fetchTuttiIProdotti = async () => {
            try {
                const response = await fetch('http://localhost:3000/apiProduct/');
                const risultato = await response.json();

                if (response.ok && risultato.success) {
                    const prodottiOrdinati = risultato.data.sort((a, b) => b.newPrice - a.newPrice);
                    setProdotti(prodottiOrdinati);
                } else {
                    setErrore('Impossibile caricare i prodotti.');
                }
            } catch (error) {
                console.error(error);
                setErrore('Errore di connessione al server backend.');
            } finally {
                setLoading(false);
            }
        };

        fetchTuttiIProdotti();
    }, []);

    // Se l'utente fa una nuova ricerca, riportiamolo alla Pagina 1
    useEffect(() => {
        setPaginaCorrente(1);
    }, [termineRicerca, attributoRicerca]);

    // 1. Prima filtriamo tutti i prodotti in base alla ricerca
    const prodottiFiltrati = prodotti.filter(prodotto => {
        if (!termineRicerca) return true;
        const valoreAttributo = prodotto[attributoRicerca] ? String(prodotto[attributoRicerca]).toLowerCase() : '';
        const termineMinuscolo = termineRicerca.toLowerCase();
        return valoreAttributo.includes(termineMinuscolo);
    });

    // 2. MATEMATICA DELLA PAGINAZIONE
    const indiceUltimoProdotto = paginaCorrente * prodottiPerPagina;
    const indicePrimoProdotto = indiceUltimoProdotto - prodottiPerPagina;

    // Questi sono i prodotti ESATTI che vedremo in questa pagina
    const prodottiAttuali = prodottiFiltrati.slice(indicePrimoProdotto, indiceUltimoProdotto);

    // Calcoliamo quante pagine ci servono in totale
    const numeroTotalePagine = Math.ceil(prodottiFiltrati.length / prodottiPerPagina);

    // Stili
    const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' };
    const btnPaginaStyle = {
        padding: '8px 12px', margin: '0 5px', border: '1px solid #2196F3', borderRadius: '4px',
        backgroundColor: '#fff', color: '#2196F3', cursor: 'pointer', fontWeight: 'bold'
    };
    const btnAttivoStyle = { ...btnPaginaStyle, backgroundColor: '#2196F3', color: 'white' };

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <div className="header">
                <HomeNavbar/>
            </div>

            <h1 style={{ textAlign: 'center', color: '#333' }}>💎 Esplora e Cerca Gioielli</h1>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <select value={attributoRicerca} onChange={(e) => setAttributoRicerca(e.target.value)} style={inputStyle}>
                    <option value="name">Cerca per Nome</option>
                    <option value="barcode">Cerca per Barcode</option>
                    <option value="type">Cerca per Categoria (es. anello)</option>
                    <option value="description">Cerca in Descrizione</option>
                </select>
                <input type="text" placeholder={`Scrivi il ${attributoRicerca}...`} value={termineRicerca} onChange={(e) => setTermineRicerca(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: '200px' }} />
            </div>

            {loading && <p style={{ textAlign: 'center', fontSize: '18px' }}>Caricamento gioielli in corso... ⏳</p>}
            {errore && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>{errore}</div>}

            {!loading && !errore && (
                <div>
                    <p style={{ textAlign: 'right', color: '#666', fontSize: '14px' }}>
                        Trovati: {prodottiFiltrati.length} gioielli (Pagina {paginaCorrente} di {numeroTotalePagine || 1})
                    </p>

                    {/* LISTA DEI PRODOTTI (Solo quelli della pagina corrente!) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {prodottiAttuali.length > 0 ? (
                            prodottiAttuali.map(prodotto => (
                                <ProductCard key={prodotto._id} prodotto={prodotto} />
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>Nessun gioiello trovato con questi criteri. 🕵️‍♂️</p>
                        )}
                    </div>

                    {/* I BOTTONCINI DELLA PAGINAZIONE */}
                    {numeroTotalePagine > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '30px', gap: '10px', flexWrap: 'wrap' }}>

                            <button
                                onClick={() => setPaginaCorrente(paginaCorrente - 1)}
                                disabled={paginaCorrente === 1}
                                style={{ ...btnPaginaStyle, opacity: paginaCorrente === 1 ? 0.5 : 1, cursor: paginaCorrente === 1 ? 'not-allowed' : 'pointer' }}
                            >
                                ⬅️ Precedente
                            </button>

                            {/* Genera i bottoncini numerati in automatico! [1] [2] [3]... */}
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
                                Successiva ➡️
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GetPage;
