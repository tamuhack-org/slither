<script lang="ts">
  import Scanner from "$lib/scanner.svelte";
  import { getUnfetchedParticipant, type Participant } from "$lib/slitherTypes";
  import { AUTHORIZED_STAFF } from "$lib/authorizedStaff";
  import { historySize, scanningForOptions } from "$lib/slitherConfig";
  import { LogOutIcon, GiftIcon } from "svelte-feather-icons";
  import ScanModal from "$lib/scanModal.svelte";
  import { getAuthHeader } from "$lib/slitherAuth";
  import { browser } from "$app/environment";
  import HistoryModal from "$lib/historyModal.svelte";

  let authorized = false;
  let fetchingLoggedIn = true;
  let selectedScanningForOption = Object.keys(scanningForOptions)[0];
  $: selectedScanningForType = scanningForOptions[selectedScanningForOption];
  let scanModalOpen = false;
  let historyModalOpen = false;
  let scannedParticipant: Participant | null = null;
  let scannedParticipantHistory: Participant[] = [];

function getAuthorizedStaff(email: string): Participant | null {
    return AUTHORIZED_STAFF.find(staff => staff.email.toLowerCase() === email.toLowerCase()) || null;
}

async function fetchJudgeMentorInfo(email: string): Promise<Participant | null> {
    try {
        const urlParams = new URLSearchParams({ email });
        const response = await fetch(
            "/api/judge-mentor/lookup?" + urlParams.toString(),
            {
                headers: {
                    Authorization: getAuthHeader(),
                },
            }
        );
        
        if (response.status !== 200) {
            return null;
        }
        
        const data = await response.json();
        
        if (data.isJudgeMentor) {
            return {
                firstName: data.firstName,
                lastName: data.lastName,
                email: email,
                infoFetched: false,  
                failedToFetch: false,
                checkinStatus: "Under Review",  // will be updated by fetchScannedParticipantInfo
                wares: "Software",
                lastWorkshopScan: null,
                mealScans: [],
                dietaryRestrictions: "[]",
                mealGroup: "Judge/Mentor",
                isJudgeMentor: true,
                role: data.role,
                track: data.track
            };
        }
        
        return null;
    } catch (error) {
        console.error("Error fetching judge/mentor info:", error);
        return null;
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
  }

  async function fetchCheckin() {
    if (scannedParticipant === null) {
      return;
    }

    const urlParams = new URLSearchParams({ email: scannedParticipant.email });
    const participantEmail = scannedParticipant.email;

    const response = await fetch(
      "/api/participant/checkin?" + urlParams.toString(),
      {
        headers: {
          Authorization: getAuthHeader(),
        },
      }
    );
    const responseData = await response.json();

    if (participantEmail === scannedParticipant.email) {
      // in case the fetch took so long that the user scanned another QR code
      scannedParticipant.checkinStatus = responseData.checkinStatus;
      scannedParticipant.wares = responseData.wares;
      scannedParticipant.firstName = responseData.firstName;
      scannedParticipant.lastName = responseData.lastName;

      scannedParticipantHistory.push(scannedParticipant);
      if (scannedParticipantHistory.length > historySize) {
        scannedParticipantHistory.shift();
      }
      scannedParticipantHistory = scannedParticipantHistory;
    }
  }

  async function fetchMeal() {
    if (scannedParticipant === null) {
      return;
    }

    const urlParams = new URLSearchParams({ email: scannedParticipant.email });
    const participantEmail = scannedParticipant.email;

    const response = await fetch(
      "/api/participant/meal?" + urlParams.toString(),
      {
        headers: {
          Authorization: getAuthHeader(),
        },
      }
    );
    const responseData = await response.json();

    if (participantEmail === scannedParticipant.email) {
      // in case the fetch took so long that the user scanned another QR code
      scannedParticipant.mealScans = responseData.mealScans;
      scannedParticipant.dietaryRestrictions = responseData.dietaryRestrictions;
      scannedParticipant.mealGroup = responseData.mealGroup;
    }
  }

  async function fetchWorkshop() {
    if (scannedParticipant === null) {
      return;
    }

    const urlParams = new URLSearchParams({ email: scannedParticipant.email });
    const participantEmail = scannedParticipant.email;

    const response = await fetch(
      "/api/participant/workshop?" + urlParams.toString(),
      {
        headers: {
          Authorization: getAuthHeader(),
        },
      }
    );
    const responseData = await response.json();

    if (participantEmail === scannedParticipant.email) {
      // in case the fetch took so long that the user scanned another QR code
      scannedParticipant.lastWorkshopScan = responseData.lastWorkshopScan
        ? new Date(responseData.lastWorkshopScan)
        : null;
    }
  }

  async function fetchScannedParticipantInfo() {
    if (scannedParticipant === null) {
      return;
    }

    scannedParticipant.infoFetched = false;
    const participantEmail = scannedParticipant.email;

    try {
      if (selectedScanningForType === "Check-in") {
        await fetchCheckin();
      } else if (selectedScanningForType === "Meal") {
        await Promise.all([fetchCheckin(), fetchMeal()]);
      } else if (selectedScanningForType === "Workshop") {
        await Promise.all([fetchCheckin(), fetchWorkshop()]);
      }

      if (participantEmail === scannedParticipant.email) {
        // in case the fetch took so long that the user scanned another QR code
        scannedParticipant.infoFetched = true;
      }
    } catch (error) {
      console.error(error);
      if (participantEmail === scannedParticipant.email) {
        // in case the fetch took so long that the user scanned another QR code
        scannedParticipant.failedToFetch = true;
      }
    }
  }

  async function onScan(email: string) {
    if (scanModalOpen || historyModalOpen) {
      return;
    }

    // First check hardcoded authorized staff (for backwards compatibility) - will get rid of this in future
    const authorizedPerson = getAuthorizedStaff(email);
    if (authorizedPerson) {
        scannedParticipant = authorizedPerson;
        scannedParticipantHistory.push(authorizedPerson);
        if (scannedParticipantHistory.length > historySize) {
            scannedParticipantHistory.shift();
        }
        scannedParticipantHistory = scannedParticipantHistory;
        scanModalOpen = true;
        return;  // Skip the Obos fetch
    }

    // Check dynamic judge/mentor from Ouroboros
    const judgeMentorInfo = await fetchJudgeMentorInfo(email);
    if (judgeMentorInfo) {
        scannedParticipant = judgeMentorInfo;
        scanModalOpen = true;
        fetchScannedParticipantInfo(); 
        return;
    }

    // Regular participant processing
    scannedParticipant = getUnfetchedParticipant(email);
    scanModalOpen = true;
    fetchScannedParticipantInfo();
  }

  function onHistoricalScan(participant: Participant) {
    scannedParticipant = participant;
    historyModalOpen = false;
    scanModalOpen = true;
    fetchScannedParticipantInfo();
  }
</script>

<div>
  <div class="grid grid-cols-3 bg-thpink mb-5 py-1">
    <button class="ml-1 mr-auto">
      <a href="/raffle" class="w-fit text-white"
        ><GiftIcon size="28" strokeWidth={2.5} /></a
      >
    </button>
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
    <div class="mb-10">
      <h3 class="text-2xl text-center mb-2">
        <label for="scanningfor-select">Scanning for...</label>
      </h3>
      <select
        bind:value={selectedScanningForOption}
        class="text-2xl px-1 mx-auto rounded-md border-2 border-zinc-700 hover:bg-zinc-300 bg-zinc-200 block"
        id="scanningfor-select"
      >
        {#each Object.keys(scanningForOptions) as option}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </div>

    <Scanner {onScan} />

    <div class="flex flex-row justify-center gap-2 mb-4">
      <button
        on:click={() => {
          scanModalOpen = true;
          fetchScannedParticipantInfo();
        }}
        class="block border-[3px] border-thpink hover:border-pink-400 px-2 py-1 text-xl rounded-lg mt-5"
        >Re-open Last Scan</button
      >
      <button
        on:click={() => {
          historyModalOpen = true;
        }}
        class="block border-[3px] border-thpink hover:border-pink-400 px-2 py-1 text-xl rounded-lg mt-5"
        >History</button
      >

      </div>
  {/if}
</div>

<ScanModal
  bind:modalOpen={scanModalOpen}
  {scannedParticipant}
  {selectedScanningForOption}
  {selectedScanningForType}
/>
<HistoryModal
  bind:modalOpen={historyModalOpen}
  {scannedParticipantHistory}
  {onHistoricalScan}
/>
