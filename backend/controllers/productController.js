const Product = require('../models/productModel');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .sort({
                type: 1, // Order by type
                name: 1  // order by A to Z in every type
            })
            .collation({locale: 'it', strength: 2});

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Errore nel recupero dei prodotti",
            error: error.message
        });
    }
};

exports.insertProduct = async (req, res) => {
    const newProduct = new Product({
        listPrice: req.body.listPrice,
        brand: req.body.brand,
        gender: req.body.gender,
        barcode: req.body.barcode,
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        oldPrice: req.body.oldPrice,
        newPrice: req.body.newPrice
    });

    console.log(newProduct);

    try{
        const savedProduct = await newProduct.save();
        res.status(200).json({
            success: true,
            data: savedProduct,
            message: "Prodotto inserito con successo"
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Errore nell'inserimento dei prodotti",
            error: error.message
        })
    }
}

exports.getProductByBarcode = async (req, res) => {
    try{
        const barcode = await Product.find({barcode: req.body.barcode});
        res.status(200).json({
            success: true,
            data: barcode,
            message: "Prodotto trovato"
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Errore nel recupero dei prodotti",
            error: error.message
        })
    }
}

// Aggiungi questo in fondo al tuo productController.js

exports.deleteProductByBarcode = async (req, res) => {
    try {
        // Ora recuperiamo il barcode dal BODY, esattamente come facevi nel POST
        const barcodeDaEliminare = req.body.barcode;

        // Piccolo controllo di sicurezza: se il frontend non manda il barcode, fermiamo tutto
        if (!barcodeDaEliminare) {
            return res.status(400).json({
                success: false,
                message: "Per favore, fornisci un barcode nel body della richiesta."
            });
        }

        // findOneAndDelete cerca il documento con quel barcode e lo rimuove
        const prodottoEliminato = await Product.findOneAndDelete({ barcode: barcodeDaEliminare });

        // Se il prodotto non esiste nel DB
        if (!prodottoEliminato) {
            return res.status(404).json({
                success: false,
                message: "Nessun prodotto trovato con questo codice a barre."
            });
        }

        // Se l'eliminazione va a buon fine
        res.status(200).json({
            success: true,
            data: prodottoEliminato,
            message: "Prodotto eliminato con successo! 🗑️"
        });

    } catch (error) {
        console.error("Errore nell'eliminazione:", error);
        res.status(500).json({
            success: false,
            message: "Errore del server durante l'eliminazione del prodotto.",
            error: error.message
        });
    }
};

exports.updatePriceByBarcode = async (req, res) => {
    try {
        const { barcode, newPrice } = req.body;

        if (!barcode || newPrice === undefined) {
            return res.status(400).json({ success: false, message: "Barcode e nuovo prezzo sono obbligatori." });
        }

        // 1. Troviamo UN prodotto come "campione" per ricordarci qual era il suo prezzo attuale
        // (presumiamo che tutti i prodotti con lo stesso barcode abbiano lo stesso prezzo di partenza)
        const prodottoEsistente = await Product.findOne({ barcode: barcode });

        if (!prodottoEsistente) {
            return res.status(404).json({ success: false, message: "Nessun prodotto trovato." });
        }

        const prezzoDaSalvare = prodottoEsistente.newPrice;

        // 2. Usiamo updateMany per aggiornare TUTTI i prodotti che hanno questo barcode in un colpo solo!
        const risultatoAggiornamento = await Product.updateMany(
            { barcode: barcode },
            {
                oldPrice: prezzoDaSalvare, // Salviamo lo storico per tutti
                newPrice: newPrice
            }
        );

        // 3. Siccome updateMany non restituisce il documento intero, impacchettiamo noi
        // i dati che servono al frontend per aggiornare la grafica in tempo reale
        const datiPerFrontend = {
            barcode: barcode,
            oldPrice: prezzoDaSalvare,
            newPrice: newPrice,
            quantitaModificata: risultatoAggiornamento.modifiedCount // Info comoda da avere!
        };

        res.status(200).json({
            success: true,
            data: datiPerFrontend,
            // Mandiamo un messaggio dinamico che ci dice quanti ne ha aggiornati
            message: `Prezzo aggiornato con successo su ${risultatoAggiornamento.modifiedCount} prodotti identici!`
        });

    } catch (error) {
        console.error("Errore nell'aggiornamento del prezzo:", error);
        res.status(500).json({ success: false, message: "Errore del server.", error: error.message });
    }
};

// Aggiungi questo nel tuo file dei controller (es. productController.js)
exports.deleteSingleProduct = async (req, res) => {
    try {
        const { id } = req.body; // <-- Riceviamo l'ID!

        if (!id) {
            return res.status(400).json({ success: false, message: "ID mancante." });
        }

        // Eliminiamo lo specifico pezzo fisico usando il suo _id univoco
        const prodottoEliminato = await Product.findByIdAndDelete(id);

        if (!prodottoEliminato) {
            return res.status(404).json({ success: false, message: "Prodotto non trovato." });
        }

        res.status(200).json({ success: true, data: prodottoEliminato, message: "Scaricato con successo!" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Errore server.", error: error.message });
    }
};

// Aggiungi questo nel tuo controller backend
exports.updatePriceById = async (req, res) => {
    try {
        const { id, newPrice } = req.body;

        if (!id || newPrice === undefined) {
            return res.status(400).json({ success: false, message: "ID e nuovo prezzo sono obbligatori." });
        }

        const prodottoEsistente = await Product.findById(id);

        if (!prodottoEsistente) {
            return res.status(404).json({ success: false, message: "Nessun prodotto trovato." });
        }

        // Aggiorniamo SOLO questo specifico pezzo fisico
        const prodottoAggiornato = await Product.findByIdAndUpdate(
            id,
            {
                oldPrice: prodottoEsistente.newPrice,
                newPrice: newPrice
            },
            { new: true } // Restituisce il documento aggiornato
        );

        res.status(200).json({
            success: true,
            data: prodottoAggiornato,
            message: "Prezzo del singolo pezzo aggiornato con successo!"
        });

    } catch (error) {
        console.error("Errore:", error);
        res.status(500).json({ success: false, message: "Errore del server.", error: error.message });
    }
};

exports.updatePriceByGroup = async (req, res) => {
    try {
        const { barcode, brand, gender, newPrice } = req.body;

        if (!barcode || !brand || !gender || newPrice === undefined) {
            return res.status(400).json({ success: false, message: "Barcode, Marca, Sesso e Nuovo Prezzo sono obbligatori." });
        }

        // 1. Troviamo UN prodotto come "campione" per ricordarci il prezzo attuale
        const prodottoCampione = await Product.findOne({
            barcode: barcode,
            brand: brand,
            gender: gender
        });

        if (!prodottoCampione) {
            return res.status(404).json({ success: false, message: "Nessun prodotto trovato." });
        }

        const vecchioPrezzo = prodottoCampione.newPrice;

        // 2. Usiamo updateMany per aggiornare TUTTI i prodotti che corrispondono a quel gruppo
        const risultatoAggiornamento = await Product.updateMany(
            {
                barcode: barcode,
                brand: brand,
                gender: gender
            },
            {
                oldPrice: vecchioPrezzo, // Salviamo lo storico
                newPrice: newPrice
            }
        );

        res.status(200).json({
            success: true,
            // Restituiamo il numero di oggetti modificati per sicurezza
            message: `Prezzo aggiornato con successo su ${risultatoAggiornamento.modifiedCount} pezzi!`
        });

    } catch (error) {
        console.error("Errore:", error);
        res.status(500).json({ success: false, message: "Errore del server.", error: error.message });
    }
};
