import React, { useState, useEffect } from 'react';
import HomeNavbar from "../components/Navbar.jsx";
import useBarcodeScanner from "../hooks/useBarcodeScanner.js";

// Copiamo le categorie dal backend per usarle nel menu a tendina
const categorieGioielli = [
    'anello', 'collana', 'orecchino', 'bracciale',
    'orologio', 'ciondolo', 'spilla', 'gemelli',
    'fermacravatta', 'charm', 'cornice', 'altro'
];

const gender = ['uomo', 'donna', 'unisex'];

const CreatePage = () => {
    const [isScanning, setIsScanning] = useState(false);
    const scannedBarcode = useBarcodeScanner(isScanning); // Passiamo isScanning all'hook

    // Stato unico per raccogliere tutti i dati del form
    const [formData, setFormData] = useState({
        listPrice: '',
        brand: '',
        gender: gender[0],
        barcode: '',
        type: categorieGioielli[0], // Impostiamo il primo valore di default
        name: '',
        description: '',
        oldPrice: '',
        newPrice: ''
    });

    const [loading, setLoading] = useState(false);
    const [messaggio, setMessaggio] = useState({ testo: '', tipo: '' }); // Per gestire successi ed errori

    // Quando lo scanner legge un codice, lo inseriamo nel formData
    useEffect(() => {
        if (scannedBarcode) {
            setFormData(prev => ({ ...prev, barcode: scannedBarcode }));
            setIsScanning(false); // Spegniamo lo scanner in automatico dopo la lettura
            setMessaggio({ testo: `Codice ${scannedBarcode} acquisito!`, tipo: 'success' });
        }
    }, [scannedBarcode]);

    // Gestore universale per i cambiamenti nei campi di input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Funzione per inviare i dati al backend
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita il ricaricamento della pagina
        setLoading(true);
        setMessaggio({ testo: '', tipo: '' });
        console.log(formData);

        try {
            // Nota: Controlla che la porta sia quella corretta del tuo backend (es. 3000 o 3001)
            const response = await fetch('http://localhost:3000/apiProduct/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData) // Inviamo tutto l'oggetto formData
            });

            const risultato = await response.json();

            if (response.ok) {
                setMessaggio({ testo: 'Gioiello inserito con successo! 🎉', tipo: 'success' });
                // Svuotiamo il form dopo l'inserimento
                setFormData({
                    listPrice: '',
                    brand: '',
                    gender: gender[0],
                    barcode: '',
                    type: categorieGioielli[0],
                    name: '',
                    description: '',
                    oldPrice: '',
                    newPrice: ''
                });
            } else {
                setMessaggio({ testo: `Errore: ${risultato.message || 'Inserimento fallito'}`, tipo: 'error' });
            }
        } catch (error) {
            console.error(error);
            setMessaggio({ testo: 'Errore di connessione al server.', tipo: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Stili riutilizzabili per il form
    const inputStyle = { width: '100%', padding: '10px', margin: '5px 0 15px 0', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <div className="header">
                <HomeNavbar/>
            </div>

            <h1 style={{ textAlign: 'center', color: '#333' }}>💎 Inserisci Gioiello</h1>

            {/* Pulsante per attivare lo scanner */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                    type="button"
                    onClick={() => setIsScanning(!isScanning)}
                    style={{
                        padding: '10px 20px', fontSize: '16px', cursor: 'pointer',
                        backgroundColor: isScanning ? '#e0e0e0' : '#4CAF50',
                        color: isScanning ? '#333' : 'white',
                        border: 'none', borderRadius: '5px', width: '100%'
                    }}
                >
                    {isScanning ? 'Scanner in ascolto... (Clicca per fermare)' : '📸 Usa Scanner per Barcode'}
                </button>
            </div>

            {/* Messaggi di feedback (Errore o Successo) */}
            {messaggio.testo && (
                <div style={{
                    padding: '10px', marginBottom: '15px', borderRadius: '5px', textAlign: 'center',
                    backgroundColor: messaggio.tipo === 'error' ? '#ffebee' : '#e8f5e9',
                    color: messaggio.tipo === 'error' ? '#c62828' : '#2e7d32'
                }}>
                    {messaggio.testo}
                </div>
            )}

            {/* Form per i dati del gioiello */}
            <form onSubmit={handleSubmit} style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>

                <label>Codice a Barre *</label>
                <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} style={inputStyle} required placeholder="Scansiona o digita il codice..." />

                <label>Tipo di Gioiello *</label>
                <select name="type" value={formData.type} onChange={handleChange} style={inputStyle} required>
                    {categorieGioielli.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                </select>

                <label>Marca </label>
                <input type="text" name="brand" value={formData.brand} onChange={handleChange} style={inputStyle}  placeholder="Es. Morellato" />

                <label>Sesso *</label>
                <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle} >
                    {gender.map(gender => (
                        <option key={gender} value={gender}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</option>
                    ))}
                </select>


                <label>Nome Gioiello *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} required placeholder="Es. Collana con diamante" />

                <div style={{ flex: 1 }}>
                    <label>Prezzo di listino (€) *</label>
                    <input type="number" name="listPrice" value={formData.listPrice} onChange={handleChange} style={inputStyle} required min="0" step="0.01" />
                </div>

                <label>Descrizione *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} style={{...inputStyle, minHeight: '80px'}} required placeholder="Breve descrizione del prodotto..."></textarea>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label>Vecchio Prezzo (€) *</label>
                        <input type="number" name="oldPrice" value={formData.oldPrice} onChange={handleChange} style={inputStyle} required min="0" step="0.01" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Nuovo Prezzo (€) *</label>
                        <input type="number" name="newPrice" value={formData.newPrice} onChange={handleChange} style={inputStyle} required min="0" step="0.01" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '12px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
                        backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', width: '100%', marginTop: '10px'
                    }}
                >
                    {loading ? 'Salvataggio in corso...' : '💾 Salva Gioiello'}
                </button>
            </form>
        </div>
    );
};

export default CreatePage;
