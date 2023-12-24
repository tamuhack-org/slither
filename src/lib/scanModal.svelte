
<script lang="ts">
    import type { Participant } from "./slitherTypes";
    import { XIcon } from "svelte-feather-icons";

	export let modalOpen: boolean;
    export let participant: Participant | null;
    export let selectedScanningForOption: string;

</script>

<div class="z-10 animate-fadeIn fixed left-0 top-0 w-full h-full overflow-auto bg-[#00000088] {modalOpen ? "block" : "hidden"}">
    <div class="animate-popIn bg-white rounded-xl fixed left-auto right-auto top-auto bottom-0 m-4 p-4 w-11/12 shadow-md">
        <button class="ml-auto block mb-3" on:click={() => modalOpen = false}><XIcon size="36" /></button>

        <div>
            {#if participant === null}
                <div class="text-center text-2xl">
                    <p>Not a valid Ouroboros QR code!</p>
                    <p>¯\_(ツ)_/¯</p>
                </div>
            {:else}
                <p class="text-2xl font-semibold">{participant.firstName}</p>
                <p class="text-2xl font-semibold">{participant.lastName}</p>
                <p>{participant.email}</p>
            {/if}
        </div>
    </div>
</div>
