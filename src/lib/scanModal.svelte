
<script lang="ts">
    import { getMealCode, type Participant, type ScanningForType } from "./slitherTypes";
    import { LoaderIcon, LogInIcon, XIcon } from "svelte-feather-icons";
    import { formatDistanceToNow } from "date-fns";
    import { suspiciousLastScanWindows } from "./slitherConfig";
    import { getAuthHeader } from "./slitherAuth";

	export let modalOpen: boolean;
    export let scannedParticipant: Participant | null;
    export let selectedScanningForOption: string;
    export let selectedScanningForType: ScanningForType;

    let postFetching = false;
    let scanDone = false;
    let lastScannedParticipantEmail: string | null = null;
    let lastSelectedScanningForOption: string | null = null;
    $: {
        if (scannedParticipant !== null && (scannedParticipant.email !== lastScannedParticipantEmail || selectedScanningForOption !== lastSelectedScanningForOption)) {
            lastScannedParticipantEmail = scannedParticipant.email;
            scanDone = false;
        }
    }

    async function checkIn() {
        if (scannedParticipant === null || postFetching || scanDone) {
            return;
        }

        postFetching = true;
        const urlParams = new URLSearchParams({ email: scannedParticipant.email });
        const participantEmail = scannedParticipant.email;
        try {
            const response = await fetch("/api/participant/checkin?" + urlParams.toString(), {
                method: "POST",
                headers: {
                    "Authorization": getAuthHeader()
                }
            });
            const responseData = await response.json();

            if (participantEmail === scannedParticipant.email) {  // in case the fetch took so long that the user scanned another QR code
                scannedParticipant.checkinStatus = responseData.checkinStatus;
                scanDone = true;
            }
        } catch (error) {
            console.error(error);
            scannedParticipant.failedToFetch = true;
        }

        postFetching = false;
    }

    async function scanMeal() {
        if (scannedParticipant === null || postFetching || scanDone) {
            return;
        }

        postFetching = true;
        const urlParams = new URLSearchParams({ email: scannedParticipant.email, mealCode: getMealCode(selectedScanningForOption) });
        const participantEmail = scannedParticipant.email;
        try {
            const response = await fetch("/api/participant/meal?" + urlParams.toString(), {
                method: "POST",
                headers: {
                    "Authorization": getAuthHeader()
                }
            });

            if (participantEmail === scannedParticipant.email) {  // in case the fetch took so long that the user scanned another QR code
                scanDone = true;
            }
        } catch (error) {
            console.error(error);
            scannedParticipant.failedToFetch = true;
        }

        postFetching = false;
    }

    async function scanWorkshop() {
        if (scannedParticipant === null || postFetching || scanDone) {
            return;
        }

        postFetching = true;
        const urlParams = new URLSearchParams({ email: scannedParticipant.email });
        const participantEmail = scannedParticipant.email;
        try {
            const response = await fetch("/api/participant/workshop?" + urlParams.toString(), {
                method: "POST",
                headers: {
                    "Authorization": getAuthHeader()
                }
            });

            if (participantEmail === scannedParticipant.email) {  // in case the fetch took so long that the user scanned another QR code
                scanDone = true;
            }
        } catch (error) {
            console.error(error);
            scannedParticipant.failedToFetch = true;
        }

        postFetching = false;
    }

    function workshopScanIsSuspiciouslyRecent() {
        if (scannedParticipant === null || scannedParticipant.lastWorkshopScan === null) {
            return false;
        }

        return Date.now() - scannedParticipant.lastWorkshopScan.getTime() < suspiciousLastScanWindows.Workshop;
    }

</script>

<div class="z-10 animate-fadeIn fixed left-0 top-0 w-full h-full overflow-auto bg-[#00000088] {modalOpen ? "block" : "hidden"}">
    <div class="animate-popIn bg-white rounded-xl fixed left-auto right-auto top-auto bottom-0 m-4 p-4 w-11/12 shadow-md max-w-2xl">
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
                <p>{scannedParticipant.email}</p>
                {#if scannedParticipant.infoFetched}
                    <!-- <p>{scannedParticipant.wares} Hacker</p> -->
                {/if}
                <hr class="my-4 border-2 rounded-xl" />

                {#if scannedParticipant.mealGroup === "Judge/Mentor"}
                    <p class="font-bold text-2xl text-green-700 text-center mt-4">This person is a Judge/Mentor</p>
                {:else}
                
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
                    {:else if scannedParticipant.checkinStatus === "Rejected"}
                        {#if selectedScanningForType === "Check-in"}
                            <p class="font-bold text-3xl text-red-700">Rejected ⛔️</p>
                        {:else}
                            <p class="font-bold text-3xl text-red-700">Not checked in ❌⚠</p>
                        {/if}
                    {:else if scannedParticipant.checkinStatus === "Waitlisted"}
                        {#if selectedScanningForType === "Check-in"}
                            <p class="font-bold text-3xl text-orange-500">Waitlisted 📋</p>
                        {:else}
                            <p class="font-bold text-3xl text-red-700">Not checked in ❌⚠</p>
                        {/if}
                    {:else}
                        console.log(scannedParticipant);
                        <p>Wacky checkin status... how did this person get a QR code???</p>
                        <p>Checkin status: {scannedParticipant.checkinStatus}</p>
                    {/if}

                    {#if selectedScanningForType === "Check-in" && scannedParticipant.checkinStatus !== "Checked In"}
                        <button on:click={checkIn} class="block w-full py-2 mt-6 rounded-md bg-blue-400 text-white font-bold text-2xl">
                            {#if postFetching}
                                <LoaderIcon class="animate-spin mx-auto" size="32" />
                            {:else}
                                Check In
                            {/if}
                        </button>
                        {:else if selectedScanningForType === "Meal"}
                            {#if scannedParticipant.mealScans.includes(getMealCode(selectedScanningForOption))}
                                <p class="font-bold text-xl text-red-700 mt-4">Participant has already scanned for this meal ⚠</p>
                            {:else}
                                <p class="mt-4">No scan for this meal yet</p>
                            {/if}
                            {#if scannedParticipant.dietaryRestrictions === "[]"}
                                <p class="mt-4">No dietary restrictions</p>
                            {:else}
                                <p class="mt-4">Dietary restrictions: <span class="font-bold">{scannedParticipant.dietaryRestrictions}</span></p>
                            {/if}
                            <p class="mt-4">Meal group: <span class="font-bold">{scannedParticipant.mealGroup}</span></p>
                            <button on:click={scanMeal} class="block w-full py-2 mt-6 rounded-md text-white font-bold text-2xl {scanDone ? "bg-green-600" : "bg-blue-400"}">
                                {#if postFetching}
                                    <LoaderIcon class="animate-spin mx-auto" size="32" />
                                {:else if scanDone}
                                    Log Successful!
                                {:else}
                                    Log Meal
                                {/if}
                            </button>
                    {:else if selectedScanningForType === "Workshop"}
                        <p>Last workshop scan:
                            {#if scannedParticipant.lastWorkshopScan === null}
                                never
                            {:else if workshopScanIsSuspiciouslyRecent()}
                                <span class="font-bold text-red-700">{formatDistanceToNow(scannedParticipant.lastWorkshopScan, { addSuffix: true })} ⚠</span>
                            {:else}
                                {formatDistanceToNow(scannedParticipant.lastWorkshopScan, { addSuffix: true })}
                            {/if}
                        </p>
                        <button on:click={scanWorkshop} class="block w-full py-2 mt-6 rounded-md text-white font-bold text-2xl {scanDone ? "bg-green-600" : "bg-blue-400"}">
                            {#if postFetching}
                                <LoaderIcon class="animate-spin mx-auto" size="32" />
                            {:else if scanDone}
                                Log Successful!
                            {:else}
                                Log Workshop
                            {/if}
                        </button>
                    {/if}
                {:else}
                    <p class="animate-pulse">Fetching participant info...</p>
                    <LoaderIcon class="animate-spin" />
                {/if}
            {/if}

            {/if}

        </div>
    </div>
</div>
