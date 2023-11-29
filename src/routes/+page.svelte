
<script lang="ts">
    import { Html5QrcodeScanner, Html5Qrcode, Html5QrcodeScanType } from "html5-qrcode";

    function onScanSuccess(decodedText, decodedResult) {
    // handle the scanned code as you like, for example:
    console.log(`Code matched = ${decodedText}`, decodedResult);
    }

    function onScanError(errorMessage) {
    // handle scan error, usually better to ignore and keep scanning.
    console.log(`Error = ${errorMessage}`);
    }

    let config = {
    fps: 10,
    qrbox: {width: 100, height: 100},
    rememberLastUsedCamera: true,
    // Only support camera scan type.
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    };

    function makeScanner() {
        let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", config, /* verbose= */ false);
    html5QrcodeScanner.render(onScanSuccess, onScanError);
    console.log("Scanner created");
    }
</script>


<h1>Slither</h1>

<button on:click={makeScanner}>Start</button>

<div id="reader"></div>



