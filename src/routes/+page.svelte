
<script lang="ts">
    import Scanner from "$lib/scanner.svelte";
    import { getUnfetchedParticipant, type ObosQRCode, type Participant } from "$lib/slitherTypes";
    import { scanningForOptions } from "$lib/slitherConfig";
    import { LogOutIcon } from "svelte-feather-icons";
    import ScanModal from "$lib/scanModal.svelte";
    
    let temp_loggedIn = true;
    let selectedScanningForOption = Object.keys(scanningForOptions)[0];
    $: selectedScanningForType = scanningForOptions[selectedScanningForOption];
    let modalOpen = false;
    let scannedParticipant: Participant | null = null;

    async function onScanGood(obosQRCode: ObosQRCode) {
        if (modalOpen) {
            return;
        }

        scannedParticipant = getUnfetchedParticipant(obosQRCode);
        modalOpen = true;
        const urlParams = new URLSearchParams({ email: obosQRCode.email });
        try {
            if (selectedScanningForType === "Check-in") {
                const response = await fetch("/api/participant/checkin?" + urlParams.toString());
                const responseData = await response.json();

                if (obosQRCode.email === scannedParticipant.email) {  // in case the fetch took so long that the user scanned another QR code
                    scannedParticipant.checkinStatus = responseData.checkinStatus;
                    scannedParticipant.infoFetched = true;
                }
            } else if (selectedScanningForType === "Meal") {
                // TODO
            } else if (selectedScanningForType === "Workshop") {
                // TODO
            }
        } catch (error) {
            console.error(error);
            scannedParticipant.failedToFetch = true;
        }
    }

    function onScanBad() {
        if (modalOpen) {
            return;
        }

        scannedParticipant = null;
        modalOpen = true;
    }
    
</script>

<div>
    {#if !temp_loggedIn}
        <h1 class="text-8xl text-center font-bold">Slither</h1>
        <h2 class="text-3xl text-center font-semibold mb-28">QR Code Scanner</h2>
    {:else}
        <div class="grid grid-cols-3">
            <span></span>
            <h1 class="text-4xl text-center font-bold">Slither</h1>
            <button class="ml-auto mr-1">
                <LogOutIcon size="36" />
            </button>
        </div>
        <hr class="border border-zinc-300 mb-5" />
    {/if}

    <div class="mb-10">
        <h3 class="text-2xl text-center mb-2"><label for="scanningfor-select">Scanning for...</label></h3>
        <select bind:value={selectedScanningForOption} class="text-2xl px-1 mx-auto rounded-md border-2 border-zinc-700 block" id="scanningfor-select">
            {#each Object.keys(scanningForOptions) as option}
                <option value={option}>{option}</option>
            {/each}
        </select>
    </div>
    
    <Scanner {onScanGood} {onScanBad} />

    <button on:click={() => {modalOpen = true;}} class="block mx-auto border-2 border-black p-1 text-xl rounded-md mt-5">Re-open Last Scan</button>
    <button on:click={() => {alert("todo :)")}} class="block mx-auto border-2 border-black p-1 text-xl rounded-md mt-5">History</button>
</div>

<ScanModal bind:modalOpen {scannedParticipant} {selectedScanningForType} />
