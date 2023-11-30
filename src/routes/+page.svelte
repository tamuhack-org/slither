
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
    <div class="relative h-96">
        <h1 class="absolute left-[-20px] top-0 text-[250px] font-black text-pink-200 animate-wiggle0">Slither</h1>
        <h1 class="absolute left-[-20px] top-1 text-[250px] font-black text-pink-300 animate-wiggle1">Slither</h1>
        <h1 class="absolute left-[-20px] top-2 text-[250px] font-black text-pink-400 animate-wiggle2">Slither</h1>
        <h1 class="absolute left-[-20px] top-3 text-[250px] font-black text-pink-500 animate-wiggle3">Slither</h1>
        <h1 class="absolute left-[-20px] top-4 text-[250px] font-black text-pink-600 animate-wiggle4">Slither</h1>
        <h1 class="absolute left-[-20px] top-5 text-[250px] font-black text-blue-600 animate-wiggle5">Slither</h1>
        <h1 class="absolute left-[-20px] top-6 text-[250px] font-black text-blue-500 animate-wiggle6">Slither</h1>
        <h1 class="absolute left-[-20px] top-7 text-[250px] font-black text-blue-400 animate-wiggle7">Slither</h1>
        <h1 class="absolute left-[-20px] top-8 text-[250px] font-black text-blue-300 animate-wiggle8">Slither</h1>
        <h1 class="absolute left-[-20px] top-9 text-[250px] font-black text-blue-200 animate-wiggle9">Slither</h1>     
    </div>
    
    {#if !scannerOpen}
        <button class="text-9xl border-8 border-black rounded-lg p-2" on:click={() => {scannerOpen = true; makeScanner();}}>Start</button>
    {/if}
    
    <div id="reader" class="w-full max-w-lg"></div>
</div>
