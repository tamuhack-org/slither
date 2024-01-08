
<script lang="ts">
    import { Html5QrcodeScanner, Html5QrcodeScanType, type Html5QrcodeResult } from "html5-qrcode";
    import type { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";

    const SCANNER_HTML_ID = "slither-scanner-reader";

    export let onScan: (email: string) => void;

    let scannerOpen = false;

    function onScanSuccess(decodedText: string, decodedResult: Html5QrcodeResult) {
        let email = "";
        try {
            // Original Ouroboros QR code
            const decoded = JSON.parse(decodedText);
            if (decoded.email && typeof decoded.email === "string") {
                email = decoded.email;
            }
        }
        catch (e) {
            // Simplified Apple Wallet QR code
            email = decodedText;
        }

        onScan(email);
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
        <button class="text-4xl bg-thpink hover:bg-pink-400 text-white rounded-lg py-2 px-[21px] mx-auto block" on:click={() => {scannerOpen = true; makeScanner();}}>Start Scanning</button>
    {/if}
    
    <div id={SCANNER_HTML_ID} class="w-full max-w-2xl mx-auto"></div>
    
</div>
