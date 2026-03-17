import React, { useState, useEffect } from 'react';
import HomeNavbar from "../components/Navbar.jsx";
import ProductCard from '../components/ProductCard.jsx';

// Elenco delle categorie
const categorieGioielli = [
    'anello', 'collana', 'orecchino', 'bracciale',
    'orologio', 'ciondolo', 'spilla', 'gemelli',
    'fermacravatta', 'charm', 'cornice', 'altro'
];

const GetPage = () => {
    // Stati per i dati
    const [prodotti, setProdotti] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errore, setErrore] = useState('');

    // Stati per la ricerca
    const [termineRicerca, setTermineRicerca] = useState('');
    const [attributoRicerca, setAttributoRicerca] = useState('name');
    const [filtroGenere, setFiltroGenere] = useState('');

    // Stati per la paginazione
    const [paginaCorrente, setPaginaCorrente] = useState(1);
    const prodottiPerPagina = 10;

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

    // Se l'utente fa una nuova ricerca, cambia attributo o filtro sesso, riportiamolo alla Pagina 1
    useEffect(() => {
        setPaginaCorrente(1);
    }, [termineRicerca, attributoRicerca, filtroGenere]);


    // ==========================================
    // NUOVA LOGICA: PRIMA RAGGRUPPA, POI FILTRA!
    // ==========================================

    // 1. RAGGRUPPIAMO TUTTO IL MAGAZZINO (Barcode + Brand + Gender)
    const magazzinoRaggruppato = Object.values(prodotti.reduce((acc, prodotto) => {
        const chiaveGruppo = `${prodotto.barcode}-${prodotto.brand}-${prodotto.gender}`;

        if (!acc[chiaveGruppo]) {
            acc[chiaveGruppo] = {
                ...prodotto,
                quantita: 1,
                prodottiIndividuali: [prodotto]
            };
        } else {
            acc[chiaveGruppo].quantita += 1;
            acc[chiaveGruppo].prodottiIndividuali.push(prodotto);
        }
        return acc;
    }, {}));

    // 2. FILTRIAMO I GRUPPI GIA' FORMATI
    const gruppiFiltrati = magazzinoRaggruppato.filter(gruppo => {
        // Controlla la ricerca testuale
        let corrispondeRicerca = true;
        if (termineRicerca) {
            const valoreAttributo = gruppo[attributoRicerca] ? String(gruppo[attributoRicerca]).toLowerCase() : '';
            const termineMinuscolo = termineRicerca.toLowerCase();
            corrispondeRicerca = valoreAttributo.includes(termineMinuscolo);
        }

        // Controlla il sesso (solo se cerchiamo per marca)
        let corrispondeGenere = true;
        if (attributoRicerca === 'brand' && filtroGenere !== '') {
            corrispondeGenere = gruppo.gender === filtroGenere;
        }

        return corrispondeRicerca && corrispondeGenere;
    });

    // 3. MATEMATICA DELLA PAGINAZIONE SUI PRODOTTI FILTRATI
    const indiceUltimoProdotto = paginaCorrente * prodottiPerPagina;
    const indicePrimoProdotto = indiceUltimoProdotto - prodottiPerPagina;

    // Attenzione: ora usiamo 'gruppiFiltrati'
    const prodottiAttuali = gruppiFiltrati.slice(indicePrimoProdotto, indiceUltimoProdotto);
    const numeroTotalePagine = Math.ceil(gruppiFiltrati.length / prodottiPerPagina);


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

                {/* MENU ATTRIBUTO DI RICERCA */}
                <select
                    value={attributoRicerca}
                    onChange={(e) => {
                        setAttributoRicerca(e.target.value);
                        setFiltroGenere('');
                        setTermineRicerca('');
                    }}
                    style={inputStyle}
                >
                    <option value="name">Cerca per Nome</option>
                    <option value="barcode">Cerca per Barcode</option>
                    <option value="type">Cerca per Categoria</option>
                    <option value="description">Cerca in Descrizione</option>
                    <option value="brand">Cerca per Marca</option>
                </select>

                {/* FILTRO GENERE */}
                {attributoRicerca === 'brand' && (
                    <select
                        value={filtroGenere}
                        onChange={(e) => setFiltroGenere(e.target.value)}
                        style={{ ...inputStyle, backgroundColor: '#e3f2fd', borderColor: '#2196F3' }}
                    >
                        <option value="">Tutti i generi</option>
                        <option value="uomo">Uomo</option>
                        <option value="donna">Donna</option>
                        <option value="unisex">Unisex</option>
                    </select>
                )}

                {/* INPUT DI RICERCA */}
                {attributoRicerca === 'type' ? (
                    <select
                        value={termineRicerca}
                        onChange={(e) => setTermineRicerca(e.target.value)}
                        style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
                    >
                        <option value="">Tutte le categorie</option>
                        {categorieGioielli.map(cat => (
                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        placeholder={`Scrivi ${attributoRicerca === 'brand' ? 'la marca' : 'il ' + attributoRicerca}...`}
                        value={termineRicerca}
                        onChange={(e) => setTermineRicerca(e.target.value)}
                        style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
                    />
                )}
            </div>

            {/* FEEDBACK CARICAMENTO/ERRORE */}
            {loading && <p style={{ textAlign: 'center', fontSize: '18px' }}>Caricamento gioielli in corso... ⏳</p>}
            {errore && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>{errore}</div>}

            {/* LISTA PRODOTTI E PAGINAZIONE */}
            {!loading && !errore && (
                <div>
                    {/* Aggiornato il contatore con gruppiFiltrati.length */}
                    <p style={{ textAlign: 'right', color: '#666', fontSize: '14px' }}>
                        Trovati: {gruppiFiltrati.length} modelli di gioielli (Pagina {paginaCorrente} di {numeroTotalePagine || 1})
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {prodottiAttuali.length > 0 ? (
                            prodottiAttuali.map(prodotto => (
                                <ProductCard key={prodotto._id} prodotto={prodotto} />
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>Nessun gioiello trovato con questi criteri. 🕵️‍♂️</p>
                        )}
                    </div>

                    {numeroTotalePagine > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '30px', gap: '10px', flexWrap: 'wrap' }}>

                            <button
                                onClick={() => setPaginaCorrente(paginaCorrente - 1)}
                                disabled={paginaCorrente === 1}
                                style={{ ...btnPaginaStyle, opacity: paginaCorrente === 1 ? 0.5 : 1, cursor: paginaCorrente === 1 ? 'not-allowed' : 'pointer' }}
                            >
                                ⬅️ Precedente
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
