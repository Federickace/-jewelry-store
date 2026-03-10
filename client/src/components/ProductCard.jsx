import React, { useState } from 'react';

const ProductCard = ({ prodotto }) => {
    // Stati per gestire l'espansione e la modifica
    // ... all'inizio del componente ...
    const [isExpanded, setIsExpanded] = useState(false);
    const [nuovoPrezzo, setNuovoPrezzo] = useState(prodotto ? prodotto.newPrice : '');

    // STATI CHE CONTROLLANO LA GRAFICA DEI PREZZI
    const [prezzoAttuale, setPrezzoAttuale] = useState(prodotto ? prodotto.newPrice : '');
    const [prezzoVecchio, setPrezzoVecchio] = useState(prodotto ? prodotto.oldPrice : '');
    const [loading, setLoading] = useState(false);
    const [messaggio, setMessaggio] = useState({ testo: '', tipo: '' });

    if (!prodotto) return null;

    // Funzione per inviare il nuovo prezzo al backend
    const handleAggiornaPrezzo = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessaggio({ testo: '', tipo: '' });

        try {
            // Chiamata PUT per aggiornare il dato
            const response = await fetch('http://localhost:3000/apiProduct/updatePrice', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    barcode: prodotto.barcode,
                    newPrice: Number(nuovoPrezzo)
                })
            });

            const risultato = await response.json();

            if (response.ok && risultato.success) {
                setMessaggio({ testo: 'Prezzo aggiornato! ✅', tipo: 'success' });

                // INVECE DI USARE IL DATO LOCALE, USIAMO QUELLI CHE CI MANDA IL DATABASE!
                setPrezzoAttuale(risultato.data.newPrice);
                setPrezzoVecchio(risultato.data.oldPrice);
                setNuovoPrezzo(''); // Svuotiamo l'input per comodità
            } else {
                setMessaggio({ testo: `Errore: ${risultato.message}`, tipo: 'error' });
            }
        } catch (error) {
            console.error(error);
            setMessaggio({ testo: 'Errore di connessione.', tipo: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            // Cliccando sulla card si espande (ma solo se non è già espansa)
            onClick={() => !isExpanded && setIsExpanded(true)}
            style={{
                border: isExpanded ? '2px solid #2196F3' : '2px solid #d4af37',
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: isExpanded ? '#f0f8ff' : '#fffcf2',
                boxShadow: isExpanded ? '0 8px 16px rgba(0,0,0,0.2)' : '0 4px 8px rgba(0,0,0,0.1)',
                marginTop: '20px',
                cursor: isExpanded ? 'default' : 'pointer',
                transition: 'all 0.3s ease'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#333', textTransform: 'capitalize' }}>
                    {prodotto.name}
                </h2>
                {/* Bottone per chiudere la card se è espansa */}
                {isExpanded && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(false); setMessaggio({testo:'', tipo:''}); }}
                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}
                    >
                        ❌
                    </button>
                )}
            </div>

            <span style={{ display: 'inline-block', backgroundColor: '#d4af37', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', marginBottom: '15px', textTransform: 'uppercase' }}>
                {prodotto.type}
            </span>

            <p><strong>Codice a Barre:</strong> {prodotto.barcode}</p>

            {/* Mostra la descrizione completa solo se la card è espansa */}
            {isExpanded ? (
                <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    <strong>Descrizione:</strong> {prodotto.description}
                </p>
            ) : (
                <p style={{ color: '#666' }}><em>Clicca per vedere i dettagli e modificare il prezzo...</em></p>
            )}

            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff', borderRadius: '8px' }}>
                <p style={{ fontSize: '22px', margin: '0' }}>
                    <strong>Prezzo:</strong> €{prezzoAttuale}

                    {/* MODIFICA QUI: controlliamo che sia > 0 ! */}
                    {prezzoVecchio > 0 && prezzoVecchio !== prezzoAttuale && (
                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '16px', marginLeft: '10px' }}>
                            €{prezzoVecchio}
                        </span>
                    )}
                </p>
            </div>

            {/* SEZIONE DI MODIFICA PREZZO (Visibile solo se espansa) */}
            {isExpanded && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px', border: '1px solid #bbdefb' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>✏️ Modifica Prezzo</h4>

                    <form onSubmit={handleAggiornaPrezzo} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="number"
                            value={nuovoPrezzo}
                            onChange={(e) => setNuovoPrezzo(e.target.value)}
                            min="0" step="0.01" required
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '120px' }}
                        />
                        <button
                            type="submit"
                            disabled={loading || Number(nuovoPrezzo) === Number(prezzoAttuale)}
                            style={{
                                padding: '8px 15px', backgroundColor: '#2196F3', color: 'white', border: 'none',
                                borderRadius: '4px', cursor: (loading || Number(nuovoPrezzo) === Number(prezzoAttuale)) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? '...' : 'Aggiorna'}
                        </button>
                    </form>

                    {messaggio.testo && (
                        <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: messaggio.tipo === 'success' ? '#2e7d32' : '#c62828', fontWeight: 'bold' }}>
                            {messaggio.testo}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductCard;
