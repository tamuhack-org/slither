
<script lang="ts">
    import { scanningForOptions } from "./slitherConfig";
    import type { Participant, ScanningForType } from "./slitherTypes";
    import { LoaderIcon, XIcon } from "svelte-feather-icons";

	export let modalOpen: boolean;
    export let scannedParticipant: Participant | null;
    export let selectedScanningForType: ScanningForType;

    let checkinFetching = false;

    // if scanning for checkin, show checkin status
    // if scanning for meal, show last meal scan (highlighting if recent) AND dietary restrictions
    // if scanning for workshop, show last workshop scan (highlighting if recent)

    async function checkIn() {
        if (scannedParticipant === null || checkinFetching) {
            return;
        }

        checkinFetching = true;
        const urlParams = new URLSearchParams({ email: scannedParticipant.email });
        const participantEmail = scannedParticipant.email;
        try {
            const response = await fetch("/api/participant/checkin?" + urlParams.toString(),
                { method: "POST" }
            );
            const responseData = await response.json();

            if (participantEmail === scannedParticipant.email) {  // in case the fetch took so long that the user scanned another QR code
                scannedParticipant.checkinStatus = responseData.checkinStatus;
                scannedParticipant.infoFetched = true;
            }
        } catch (error) {
            console.error(error);
            scannedParticipant.failedToFetch = true;
        }

        checkinFetching = false;
    }

</script>

<div class="z-10 animate-fadeIn fixed left-0 top-0 w-full h-full overflow-auto bg-[#00000088] {modalOpen ? "block" : "hidden"}">
    <div class="animate-popIn bg-white rounded-xl fixed left-auto right-auto top-auto bottom-0 m-4 p-4 w-11/12 shadow-md">
        <button class="ml-auto block mb-3" on:click={() => modalOpen = false}><XIcon size="36" /></button>

        <div>
            {#if scannedParticipant === null}
                <div class="text-center text-2xl">
                    <p>Not a valid Ouroboros QR code!</p>
                    <p>¯\_(ツ)_/¯</p>
                </div>
            {:else}
                <p class="text-2xl font-semibold">{scannedParticipant.firstName}</p>
                <p class="text-2xl font-semibold">{scannedParticipant.lastName}</p>
                <p class="mb">{scannedParticipant.email}</p>
                <hr class="my-4 border-2 rounded-xl" />
                
                {#if scannedParticipant.failedToFetch}
                    <p class="text-red-700 font-bold text-xl">Failed to fetch participant info!</p>
                {/if}

                {#if scannedParticipant.infoFetched}
                    {#if scannedParticipant.checkinStatus === "Checked In"}
                        <p class="font-bold text-xl text-green-700">Checked in ✔</p>
                    {:else if scannedParticipant.checkinStatus === "Confirmed"}
                        {#if selectedScanningForType === "Check-in"}
                            <p class="font-bold text-xl">Ready for check-in 👍</p>
                        {:else}
                            <p class="font-bold text-3xl text-red-700">Not checked in ❌⚠</p>
                        {/if}
                    {:else if scannedParticipant.checkinStatus === "Rejected/Waitlisted"}
                        {#if selectedScanningForType === "Check-in"}
                            <p class="font-bold text-3xl text-orange-500">Rejected/Waitlisted 📋</p>
                        {:else}
                            <p class="font-bold text-3xl text-red-700">Not checked in ❌⚠</p>
                        {/if}
                    {:else}
                        <p>Wacky checkin status... how did this person get a QR code???</p>
                        <p>Checkin status: {scannedParticipant.checkinStatus}</p>
                    {/if}

                    {#if selectedScanningForType === "Check-in" && scannedParticipant.checkinStatus !== "Checked In"}
                        <button on:click={checkIn} class="block w-full py-2 mt-6 rounded-md bg-blue-400 text-white font-bold text-2xl">
                            {#if checkinFetching}
                                <LoaderIcon class="animate-spin mx-auto" size="32" />
                            {:else}
                                Check In
                            {/if}
                        </button>
                    {:else if selectedScanningForType === "Meal"}
                        <p>Last meal scan: {scannedParticipant.lastMealScan}</p>
                        <p>Dietary restrictions: {scannedParticipant.dietaryRestrictions}</p>
                    {:else if selectedScanningForType === "Workshop"}
                        <p>Last workshop scan: {scannedParticipant.lastWorkshopScan}</p>
                    {/if}
                {:else}
                    <p class="animate-pulse">Fetching participant info...</p>
                    <LoaderIcon class="animate-spin" />
                {/if}
            {/if}

        </div>
    </div>
</div>
