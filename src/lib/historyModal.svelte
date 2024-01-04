
<script lang="ts">
    import { XIcon } from "svelte-feather-icons";
    import type { Participant } from "./slitherTypes";

	export let modalOpen: boolean;
    export let scannedParticipantHistory: Participant[];
    export let onHistoricalScan: (participant: Participant) => void;

</script>

<div class="z-10 animate-fadeIn fixed left-0 top-0 w-full h-full overflow-auto bg-[#00000088] {modalOpen ? "block" : "hidden"}">
    <div class="animate-popIn bg-white rounded-xl fixed left-auto right-auto top-auto bottom-0 m-4 p-4 w-11/12 shadow-md">
        <button class="ml-auto block mb-3" on:click={() => modalOpen = false}><XIcon size="36" /></button>

        <div>
                <div class="text-center text-2xl">
                    <p>History:</p>
                </div>
                <div>
                    {#each scannedParticipantHistory as historicalScan}
                        <div class="border-2">
                            <p>{historicalScan.email}</p>
                            <button on:click={() => {onHistoricalScan(historicalScan);}}>Open</button>
                        </div>
                    {/each}
                </div>
        </div>
    </div>
</div>
