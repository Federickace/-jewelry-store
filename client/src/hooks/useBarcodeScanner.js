import { useState, useEffect, useRef } from 'react';

const useBarcodeScanner = (isActive = false) => {
    const [scannedCode, setScannedCode] = useState('');
    const barcodeBuffer = useRef('');
    const timerLettura = useRef(null);

    useEffect(() => {
        if (!isActive) return;
        const ascoltaScanner = (e) => {
            // Ignoriamo i tasti speciali (Shift, Control, ecc.)
            if (e.key.length > 1 && e.key !== 'Enter') return;

            if (e.key === 'Enter') {
                if (barcodeBuffer.current.length > 0) {
                    setScannedCode(barcodeBuffer.current); // Aggiorna lo stato con il codice completo
                    barcodeBuffer.current = ''; // Svuota il buffer per la prossima lettura
                }
            } else {
                barcodeBuffer.current += e.key;
                console.log("Letto tasto:", e.key, "| Memoria attuale:", barcodeBuffer.current); // Ti aiuta a capire!

                clearTimeout(timerLettura.current);
                timerLettura.current = setTimeout(() => {
                    barcodeBuffer.current = '';
                    console.log("Tempo scaduto: Memoria azzerata");
                }, 1000); // Ora hai 1 secondo tra un tasto e l'altro!
            }
        };

        window.addEventListener('keydown', ascoltaScanner);
        return () => window.removeEventListener('keydown', ascoltaScanner);
    }, [isActive]);

    return scannedCode;
};

export default useBarcodeScanner;
