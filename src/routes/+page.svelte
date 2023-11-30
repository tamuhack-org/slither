
<script lang="ts">
    import { Html5QrcodeScanner, Html5QrcodeScanType, type Html5QrcodeResult } from "html5-qrcode";
    import type { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";

    function onScanSuccess(decodedText: string, decodedResult: Html5QrcodeResult) {
        console.log(decodedText);
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
        const html5QrcodeScanner = new Html5QrcodeScanner("reader", config, /* verbose= */ false);
        html5QrcodeScanner.render(onScanSuccess, onScanError);
    }

    let scannerOpen = false;
</script>

<div>
    <h1>Slither</h1>
    
    {#if !scannerOpen}
        <button on:click={() => {scannerOpen = true; makeScanner();}}>Start</button>
    {/if}
    
    <div id="reader" class="w-full max-w-lg"></div>
</div>

