<script lang="ts">
    import Scanner from "$lib/scanner.svelte";
    import { getUnfetchedParticipant, type Participant, type WorkshopScan } from "$lib/slitherTypes";
    import { historySize, scanningForOptions } from "$lib/slitherConfig";
    import { LogOutIcon } from "svelte-feather-icons";
    import ScanModal from "$lib/scanModal.svelte";
    import { getAuthHeader } from "$lib/slitherAuth";
    import { browser } from "$app/environment";
    import HistoryModal from "$lib/historyModal.svelte";
  
    let authorized = false;
    let fetchingLoggedIn = true;
    let scans: WorkshopScan[] = [];
    let timeWindowStartString: string = "";
    let timeWindowEndString: string = "";
    let timeWindowStart: Date | null = null;
    let timeWindowEnd: Date | null = null;
    let winner: WorkshopScan | null = null;

    $: {
        if (timeWindowStartString !== "") {
            timeWindowStart = new Date(timeWindowStartString);
        }
        if (timeWindowEndString !== "") {
            timeWindowEnd = new Date(timeWindowEndString);
        }
    }
  
    async function fetchLoggedIn() {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          Authorization: getAuthHeader(),
        },
      });
      if (response.status === 403) {
        authorized = false;
      } else if (response.status === 200) {
        authorized = true;
      } else {
        window.location.href = "/login";
      }
      fetchingLoggedIn = false;
    }
  
    if (browser) {
      fetchLoggedIn();
      fetchScans();

        timeWindowStart = new Date();
        timeWindowEnd = new Date();

    }

    async function fetchScans() {
      const response = await fetch("/api/raffle", {
        method: "GET",
        headers: {
          Authorization: getAuthHeader(),
        },
      });
      const responseData = await response.json();
      scans = responseData.scans;
      for (let i = 0; i < scans.length; i++) {
        scans[i].timestamp = new Date(scans[i].timestamp);
        scans[i].selected = false;
      }
      // sort by timestamp
        scans.sort((a, b) => {
            return a.timestamp.getTime() - b.timestamp.getTime();
        });
    }

    $: {
        for (let i = 0; i < scans.length; i++) {
            if (scans[i].timestamp >= timeWindowStart && scans[i].timestamp <= timeWindowEnd) {
                scans[i].selected = true;
            } else {
                scans[i].selected = false;
            }
        }
    }

    function pickWinner() {
        let potentialWinners: WorkshopScan[] = [];
        for (let i = 0; i < scans.length; i++) {
            if (scans[i].selected) {
                potentialWinners.push(scans[i]);
            }
        }

        if (potentialWinners.length > 0) {
            winner = potentialWinners[Math.floor(Math.random() * potentialWinners.length)];
        }
    }
  
  </script>
  
  <div>
    <div class="grid grid-cols-3 bg-thpink mb-5 py-1">
      <span />
      <h1 class="text-3xl text-center font-medium font-roboto text-white">
        Slither
      </h1>
      <button class="ml-auto mr-1">
        <a href="/logout" class="w-fit text-white"
          ><LogOutIcon size="28" strokeWidth={2.5} /></a
        >
      </button>
    </div>
  
    {#if !authorized}
      {#if fetchingLoggedIn}
        <p class="text-2xl text-center">Loading...</p>
      {:else}
        <p class="text-lg text-center">You are not authorized to scan yet :(</p>
        <p class="text-lg text-center mt-2">
          Ask a dev team member to give you Staff status
        </p>
        <p class="text-lg text-center mt-6">
          Your email: {localStorage.getItem("email")}
        </p>
      {/if}
    {:else}
      <h1 class="text-3xl">SliTHer rAfflE WinNer PicKEr!!!!!!!!!!</h1>

      <p>Slelect timframe!!</p>
        <div class="flex flex-row gap-4">
            <input type="datetime-local" bind:value={timeWindowStartString} />
            <input type="datetime-local" bind:value={timeWindowEndString} />
        </div>
        <p class="my-4">Timeframe: {timeWindowStart?.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            })} - {timeWindowEnd?.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            })}</p>

        <button on:click={pickWinner} class="border-8 text-7xl active:bg-pink-500">PICK WINNNNER</button>
        <div class="border-8 border-blue-500">
            <p>Winner: </p>
            <p>{winner?.first_name}</p>
            <p>{winner?.last_name}</p>
            <p>{winner?.email}</p>
        </div>


        <div class="flex flex-col">
            {#each scans as scan}
            <div class="flex flex-row gap-4 {scan.selected ? "text-blue-600 font-bold" : ""}">
                <p class="mr-2">{scan.first_name}</p>
                <p class="mr-2">{scan.last_name}</p>
                <p class="mr-2">{scan.email}</p>
                <p class="mr-2">
                    {scan.timestamp.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    })}
                </p>
            </div>
            {/each}
        </div>
    {/if}
  </div>
  