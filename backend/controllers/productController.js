const Product = require('../models/productModel');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .sort({
                type: 1, // Ordina prima per tipologia (es. anello prima di orologio)
                name: 1  // All'interno della stessa tipologia, ordina per nome (A-Z)
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
        barcode: req.body.barcode,
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        oldPrice: req.body.oldPrice,
        newPrice: req.body.newPrice
    });

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
        const barcode = await Product.findOne({barcode: req.body.barcode});
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

        // 1. Troviamo il prodotto attuale per "ricordarci" qual era il suo prezzo prima della modifica
        const prodottoEsistente = await Product.findOne({ barcode: barcode });

        if (!prodottoEsistente) {
            return res.status(404).json({ success: false, message: "Nessun prodotto trovato." });
        }

        // 2. Facciamo lo scambio: il 'newPrice' di prima diventa 'oldPrice', e inseriamo il nuovo prezzo
        const prodottoAggiornato = await Product.findOneAndUpdate(
            { barcode: barcode },
            {
                oldPrice: prodottoEsistente.newPrice, // Salviamo lo storico!
                newPrice: newPrice
            },
            { returnDocument: 'after' }
        );

        res.status(200).json({
            success: true,
            data: prodottoAggiornato,
            message: "Prezzo aggiornato con successo!"
        });

    } catch (error) {
        console.error("Errore nell'aggiornamento del prezzo:", error);
        res.status(500).json({ success: false, message: "Errore del server.", error: error.message });
    }
};

