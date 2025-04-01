
<script lang="ts">
    import { XIcon, InfoIcon } from "svelte-feather-icons";
    import type { Participant } from "./slitherTypes";

    interface Props {
        modalOpen: boolean;
        scannedParticipantHistory: Participant[];
        onHistoricalScan: (participant: Participant) => void;
    }

    let { modalOpen = $bindable(), scannedParticipantHistory, onHistoricalScan }: Props = $props();

</script>

<div class="z-10 animate-fadeIn fixed left-0 top-0 w-full h-full overflow-auto bg-[#00000088] {modalOpen ? "block" : "hidden"}">
    <div class="animate-popIn bg-white rounded-xl fixed left-auto right-auto top-auto bottom-0 m-4 p-4 w-11/12 shadow-md max-w-2xl">
        <button class="ml-auto block" onclick={() => modalOpen = false}><XIcon size="36" /></button>

        <div>
            <p class="text-2xl mb-3">Scan History:</p>
            <div class="grid grid-cols-1 gap-1 overflow-auto max-h-[50vh]">
                {#each scannedParticipantHistory as historicalScan}
                    <div class="flex flex-row justify-between border-2 border-zinc-300 rounded-xl p-1">
                        <div>
                            <p class="font-semibold">{historicalScan.firstName} {historicalScan.lastName}</p>
                            <p class="text-sm">{historicalScan.email}</p>
                        </div>
                        <button onclick={() => {onHistoricalScan(historicalScan);}} class="p-1"><InfoIcon /></button>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
