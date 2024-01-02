
<script lang="ts">
    import Scanner from "$lib/scanner.svelte";
    import { getUnfetchedParticipant, type ObosQRCode, type Participant } from "$lib/slitherTypes";
    import { scanningForOptions } from "$lib/slitherConfig";
    import { LogOutIcon } from "svelte-feather-icons";
    import ScanModal from "$lib/scanModal.svelte";
    import { getAuthHeader } from "$lib/slitherAuth";
    import { browser } from "$app/environment";
    
    let authorized = false;
    let fetchingLoggedIn = true;
    let selectedScanningForOption = Object.keys(scanningForOptions)[0];
    $: selectedScanningForType = scanningForOptions[selectedScanningForOption];
    let modalOpen = false;
    let scannedParticipant: Participant | null = null;

    async function fetchLoggedIn() {
        const response = await fetch("/api/auth/verify", {
            "method": "POST",
            "headers": {
                "Authorization": getAuthHeader()
            }
        });
        if (response.status === 403)
        {
            authorized = false;
        }
        else if (response.status === 200)
        {
            authorized = true;
        }
        else
        {
            window.location.href = "/login";
        }
        fetchingLoggedIn = false;
    }

    if (browser) {
        fetchLoggedIn();
    }

    async function fetchCheckin() {
        if (scannedParticipant === null) {
            return;
        }

        const urlParams = new URLSearchParams({ email: scannedParticipant.email });
        const participantEmail = scannedParticipant.email;

        const response = await fetch("/api/participant/checkin?" + urlParams.toString(), {
            headers: {
                "Authorization": getAuthHeader()
            }
        });
        const responseData = await response.json();

        if (participantEmail === scannedParticipant.email) {  // in case the fetch took so long that the user scanned another QR code
            scannedParticipant.checkinStatus = responseData.checkinStatus;
            scannedParticipant.wares = responseData.wares;
        }
    }

    async function fetchMeal() {
        if (scannedParticipant === null) {
            return;
        }

        const urlParams = new URLSearchParams({ email: scannedParticipant.email });
        const participantEmail = scannedParticipant.email;

        const response = await fetch("/api/participant/meal?" + urlParams.toString(), {
            headers: {
                "Authorization": getAuthHeader()
            }
        });
        const responseData = await response.json();

        if (participantEmail === scannedParticipant.email) {  // in case the fetch took so long that the user scanned another QR code
            scannedParticipant.mealScans = responseData.mealScans;
            scannedParticipant.dietaryRestrictions = responseData.dietaryRestrictions;
        }
    }

    async function fetchWorkshop() {
        if (scannedParticipant === null) {
            return;
        }

        const urlParams = new URLSearchParams({ email: scannedParticipant.email });
        const participantEmail = scannedParticipant.email;

        const response = await fetch("/api/participant/workshop?" + urlParams.toString(), {
            headers: {
                "Authorization": getAuthHeader()
            }
        });
        const responseData = await response.json();

        if (participantEmail === scannedParticipant.email) {  // in case the fetch took so long that the user scanned another QR code
            scannedParticipant.lastWorkshopScan = responseData.lastWorkshopScan ? new Date(responseData.lastWorkshopScan) : null;
        }
    }

    async function fetchScannedParticipantInfo() {
        if (scannedParticipant === null) {
            return;
        }

        scannedParticipant.infoFetched = false;
        
        try {
            if (selectedScanningForType === "Check-in") {
                await fetchCheckin();
            } else if (selectedScanningForType === "Meal") {
                await Promise.all([fetchCheckin(), fetchMeal()]);
            } else if (selectedScanningForType === "Workshop") {
                await Promise.all([fetchCheckin(), fetchWorkshop()]);
            }
            scannedParticipant.infoFetched = true;
        } catch (error) {
            console.error(error);
            scannedParticipant.failedToFetch = true;
        }
    }

    function onScanGood(obosQRCode: ObosQRCode) {
        if (modalOpen) {
            return;
        }

        scannedParticipant = getUnfetchedParticipant(obosQRCode);
        modalOpen = true;
        fetchScannedParticipantInfo();
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
    <div class="grid grid-cols-3">
        <span></span>
        <h1 class="text-4xl text-center font-bold">Slither</h1>
        <button class="ml-auto mr-1">
            <a href="/logout" class="w-fit"><LogOutIcon size="36" /></a>
        </button>
    </div>
    <hr class="border border-zinc-300 mb-5" />

    {#if !authorized}
        {#if fetchingLoggedIn}
            <p class="text-2xl text-center">Loading...</p>
        {:else}
            <p class="text-lg text-center">You are not authorized to scan yet :(</p>
            <p class="text-lg text-center mt-2">Ask a dev team member to give you Staff status</p>
            <p class="text-lg text-center mt-6">Your email: {localStorage.getItem("email")}</p>
        {/if}
    {:else}
        <div class="mb-10">
            <h3 class="text-2xl text-center mb-2"><label for="scanningfor-select">Scanning for...</label></h3>
            <select bind:value={selectedScanningForOption} class="text-2xl px-1 mx-auto rounded-md border-2 border-zinc-700 block" id="scanningfor-select">
                {#each Object.keys(scanningForOptions) as option}
                    <option value={option}>{option}</option>
                {/each}
            </select>
        </div>
        
        <Scanner {onScanGood} {onScanBad} />
    
        <button on:click={() => {modalOpen = true; fetchScannedParticipantInfo();}} class="block mx-auto border-2 border-black p-1 text-xl rounded-md mt-5">Re-open Last Scan</button>
        <button on:click={() => {alert("todo :)")}} class="block mx-auto border-2 border-black p-1 text-xl rounded-md mt-5">History</button>
    {/if}

</div>

<ScanModal bind:modalOpen {scannedParticipant} {selectedScanningForOption} {selectedScanningForType} />
