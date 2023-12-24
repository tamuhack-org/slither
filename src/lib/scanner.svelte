
<script lang="ts">
    import { Html5QrcodeScanner, Html5QrcodeScanType, type Html5QrcodeResult } from "html5-qrcode";
    import type { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";
    import type { ObosQRCode } from "./slitherTypes";

    const SCANNER_HTML_ID = "slither-scanner-reader";

    export let onScanGood: (obosQRCode: ObosQRCode) => void;
    export let onScanBad: () => void;

    let scannerOpen = false;

    function getObosQRCode(decodedText: string): ObosQRCode | null {
        try {
            const decoded = JSON.parse(decodedText);
            if (decoded.first_name && decoded.last_name && decoded.email && decoded.university) {
                return decoded;
            }
        } catch (e) {
            return null;
        }
        return null;
    }

    function onScanSuccess(decodedText: string, decodedResult: Html5QrcodeResult) {
        const obosQRCode = getObosQRCode(decodedText);
        if (obosQRCode) {
            onScanGood(obosQRCode);
        } else {
            onScanBad();
        }
    }

    function onScanError(errorMessage: string) {
        // Called literally every frame that no QR code is found lol
        // console.log(errorMessage);
    }

    let config: Html5QrcodeScannerConfig = {
        fps: 10,
        qrbox: {width: 300, height: 300},
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    };

    function makeScanner() {
        const html5QrcodeScanner = new Html5QrcodeScanner(SCANNER_HTML_ID, config, /* verbose= */ false);
        html5QrcodeScanner.render(onScanSuccess, onScanError);
    }

</script>

<div>

    {#if !scannerOpen}
        <button class="text-4xl border-4 border-black rounded-xl p-2 mx-auto block" on:click={() => {scannerOpen = true; makeScanner();}}>Start Scanning</button>
    {/if}
    
    <div id={SCANNER_HTML_ID} class="w-full max-w-2xl mx-auto"></div>
    
</div>
