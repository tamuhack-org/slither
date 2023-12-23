
<script lang="ts">
    import { Html5QrcodeScanner, Html5QrcodeScanType, type Html5QrcodeResult } from "html5-qrcode";
    import type { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";

    type ObosQRCode = {
        first_name: string;
        last_name: string;
        email: string;
        university: string;
    };

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
        console.log(decodedText);
        const obosQRCode = getObosQRCode(decodedText);
        if (obosQRCode)
        {
            alert(`Welcome ${obosQRCode.first_name} ${obosQRCode.last_name} from ${obosQRCode.university}!`);
        }
        else
        {
            alert("Invalid QR Code");
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
        const html5QrcodeScanner = new Html5QrcodeScanner("reader", config, /* verbose= */ false);
        html5QrcodeScanner.render(onScanSuccess, onScanError);
    }

    let scannerOpen = false;
</script>

<div>
    <h1 class="text-8xl text-center font-bold">Slither</h1>
    <h2 class="text-3xl text-center font-semibold mb-28">QR Code Scanner</h2>
    
    {#if !scannerOpen}
        <button class="text-4xl border-4 border-black rounded-xl p-2 mx-auto block" on:click={() => {scannerOpen = true; makeScanner();}}>Start Scanning</button>
    {/if}
    
    <div id="reader" class="w-full max-w-2xl mx-auto"></div>
</div>
