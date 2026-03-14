import { useState, useEffect, useRef } from 'react';

const useBarcodeScanner = (isActive = false) => {
    const [scannedCode, setScannedCode] = useState('');
    const barcodeBuffer = useRef('');
    const timerLettura = useRef(null);

    useEffect(() => {
        if (!isActive) return;

        const ascoltaScanner = (e) => {
            // 1. IL KILLER DEL BUG: Blocca Ctrl+J (Line Feed) o Ctrl+H
            if (e.ctrlKey && (e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'h')) {
                e.preventDefault();
                e.stopPropagation(); // Ferma la propagazione ad altri elementi
                console.log("Bloccato segnale LF (Ctrl+J) dello scanner!");
                return;
            }

            // 2. Ignora i tasti modificatori "puri" (quando lo scanner preme fisicamente 'Control')
            if (e.key === 'Control' || e.key === 'Shift' || e.key === 'Alt') return;

            // 3. Gestione dell'Invio (Carriage Return)
            if (e.key === 'Enter') {
                e.preventDefault(); // Evita che l'Invio invii form a caso
                if (barcodeBuffer.current.length > 0) {
                    setScannedCode(barcodeBuffer.current);
                    barcodeBuffer.current = '';
                }
            } else {
                // 4. Salva i numeri, assicurandoti che non ci sia il Ctrl premuto
                if (!e.ctrlKey && !e.metaKey && e.key.length === 1) {
                    barcodeBuffer.current += e.key;

                    clearTimeout(timerLettura.current);
                    timerLettura.current = setTimeout(() => {
                        barcodeBuffer.current = '';
                    }, 300); // 300ms sono perfetti
                }
            }
        };



        // L'opzione { capture: true } è FONDAMENTALE qui:
        // intercetta l'evento PRIMA che il browser possa aprire i download
        window.addEventListener('keydown', ascoltaScanner, { capture: true });

        return () => window.removeEventListener('keydown', ascoltaScanner, { capture: true });
    }, [isActive]);

    return scannedCode;
};

export default useBarcodeScanner;
