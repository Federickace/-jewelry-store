import React, { useState } from 'react';

const ProductCard = ({ prodotto }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Stati del prezzo a livello di GRUPPO
    const [nuovoPrezzo, setNuovoPrezzo] = useState(prodotto.newPrice);
    const [prezzoAttuale, setPrezzoAttuale] = useState(prodotto.newPrice);
    const [prezzoVecchio, setPrezzoVecchio] = useState(prodotto.oldPrice);

    const [loading, setLoading] = useState(false);
    const [messaggio, setMessaggio] = useState({ testo: '', tipo: '' });

    if (!prodotto) return null;

    // Aggiorna tutti i pezzi di questo gruppo in un colpo solo
    const handleAggiornaPrezzoGruppo = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessaggio({ testo: '', tipo: '' });

        try {
            // Chiamiamo una rotta che aggiornerà il gruppo in base a barcode, brand e gender
            const response = await fetch('http://localhost:3000/apiProduct/updatePriceByGroup', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    barcode: prodotto.barcode,
                    brand: prodotto.brand,
                    gender: prodotto.gender,
                    newPrice: Number(nuovoPrezzo)
                })
            });

            const risultato = await response.json();

            if (response.ok && risultato.success) {
                setMessaggio({ testo: `✅ Prezzo aggiornato su tutti i ${prodotto.quantita} pezzi!`, tipo: 'success' });
                // Il vecchio prezzo "attuale" diventa il "prezzo vecchio" sbarrato
                setPrezzoVecchio(prezzoAttuale);
                setPrezzoAttuale(Number(nuovoPrezzo));
            } else {
                setMessaggio({ testo: `❌ Errore: ${risultato.message}`, tipo: 'error' });
            }
        } catch (error) {
            setMessaggio({ testo: '❌ Errore di rete', tipo: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                <p style={{ margin: 0 }}><strong>Codice a Barre:</strong> {prodotto.barcode}</p>
                <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold', fontSize: '14px', border: '1px solid #c8e6c9' }}>
                    📦 Disp: {prodotto.quantita || 1}
                </div>
            </div>

            <p><strong>Marca:</strong> {prodotto.brand}</p>
            <p><strong>Sesso:</strong> {prodotto.gender}</p>

            {/* PREZZI ATTUALI */}
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff', borderRadius: '8px' }}>
                <p style={{ fontSize: '22px', margin: '0' }}>
                    <strong>Prezzo:</strong> €{prezzoAttuale}
                    {prezzoVecchio > 0 && prezzoVecchio !== prezzoAttuale && (
                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '16px', marginLeft: '10px' }}>
                            €{prezzoVecchio}
                        </span>
                    )}
                </p>
            </div>

            {/* SEZIONE ESPANSA */}
            {isExpanded ? (
                <div style={{ marginTop: '20px' }}>

                    {/* 1. MODIFICA PREZZO GLOBALE (Per tutto il gruppo) */}
                    <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px', border: '1px solid #bbdefb', marginBottom: '20px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>✏️ Aggiorna il prezzo di tutti i {prodotto.quantita} pezzi</h4>
                        <form onSubmit={handleAggiornaPrezzoGruppo} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="number" value={nuovoPrezzo} onChange={(e) => setNuovoPrezzo(e.target.value)}
                                min="0" step="0.01" required
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '120px' }}
                            />
                            <button
                                type="submit" disabled={loading || Number(nuovoPrezzo) === Number(prezzoAttuale)}
                                style={{
                                    padding: '8px 15px', backgroundColor: '#2196F3', color: 'white', border: 'none',
                                    borderRadius: '4px', cursor: (loading || Number(nuovoPrezzo) === Number(prezzoAttuale)) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? '...' : 'Aggiorna Tutti'}
                            </button>
                        </form>
                        {messaggio.testo && (
                            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: messaggio.tipo === 'success' ? '#2e7d32' : '#c62828', fontWeight: 'bold' }}>
                                {messaggio.testo}
                            </p>
                        )}
                    </div>

                    {/* 2. LISTA DELLE DESCRIZIONI DEI SINGOLI PEZZI */}
                    <div style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>📄 Dettagli dei singoli pezzi in magazzino</h4>

                        {prodotto.prodottiIndividuali && prodotto.prodottiIndividuali.map((pezzoSingolo, index) => (
                            <div key={pezzoSingolo._id} style={{ padding: '10px', borderBottom: index === prodotto.prodottiIndividuali.length - 1 ? 'none' : '1px solid #eee' }}>
                                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#1565c0' }}>Pezzo #{index + 1}</p>
                                <p style={{ margin: 0, fontSize: '14px', color: '#555', wordBreak: 'break-word' }}>
                                    {pezzoSingolo.description}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            ) : (
                <p style={{ color: '#666', marginTop: '15px' }}><em>Clicca per vedere le descrizioni e modificare il prezzo...</em></p>
            )}
        </div>
    );
};

export default ProductCard;
