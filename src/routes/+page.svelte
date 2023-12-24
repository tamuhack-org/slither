
<script lang="ts">
    import Scanner from "$lib/scanner.svelte";
    import type { ObosQRCode } from "$lib/slitherTypes";
    import { scanningForOptions } from "$lib/slitherConfig";
    import { LogOutIcon } from "svelte-feather-icons";
    
    let temp_loggedIn = true;
    let selectedScanningForOption = Object.keys(scanningForOptions)[0];

    function onScanGood(obosQRCode: ObosQRCode) {
        console.log(obosQRCode);
    }

    function onScanBad() {
        console.log("bad");
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
        <select bind:value={selectedScanningForOption} class="text-2xl mx-auto rounded-md border-2 border-zinc-700 block" id="scanningfor-select">
            {#each Object.keys(scanningForOptions) as option}
                <option value={option}>{option}</option>
            {/each}
        </select>
    </div>
    
    <Scanner {onScanGood} {onScanBad} />
</div>
