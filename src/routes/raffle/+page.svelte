<script lang="ts">
    import Scanner from "$lib/scanner.svelte";
    import { getUnfetchedParticipant, type Participant, type WorkshopScan } from "$lib/slitherTypes";
    import { historySize, scanningForOptions } from "$lib/slitherConfig";
    import { HomeIcon, LogOutIcon } from "svelte-feather-icons";
    import ScanModal from "$lib/scanModal.svelte";
    import { getAuthHeader } from "$lib/slitherAuth";
    import { browser } from "$app/environment";
    import HistoryModal from "$lib/historyModal.svelte";
    import confetti from 'canvas-confetti';
  

    let showModal = false;
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
        for (let i = 0; i < scans.length; i++) 
        {
          if (scans[i].selected) 
          {
            potentialWinners.push(scans[i]);
          }
        }

        if (potentialWinners.length > 0) 
        {
          winner = potentialWinners[Math.floor(Math.random() * potentialWinners.length)];
          runConfetti();
        }
    }
    function runConfetti() {
      confetti({
        zIndex: 1000,
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
  }
  </script>
  
  <div>
    <div class="grid grid-cols-3 bg-thpink mb-5 py-1">
      <button class="ml-1 mr-auto home-icon">
        <a href="/" class="w-fit text-white"
          ><HomeIcon size="28" strokeWidth={2.5} /></a
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

        <div class="table-container">
          <div class="container">
        
            <div class="input-container">
              <h1 class="text-3xl">Slither Raffle Picker!</h1>
              <label for="first-time">Start Time:</label>
              <input type="datetime-local" id="first-time" bind:value={timeWindowStartString} />
              <label for="second-time">End Time:</label>
              <input type="datetime-local" id="second-time" bind:value={timeWindowEndString} />
              <div class="button-container">
                <button class="winner-button" on:click={pickWinner}>Pick A Winner</button>
              </div>
            </div>
            <div class="winner-container">
              <div class="winner-label">Winner:</div>
              {#if winner}
                <p class="winner-text">{winner?.first_name} {winner?.last_name}</p>
                <p class="winner-text">{winner?.email}</p>
              {/if}
            </div>
          </div>

          <div class="table-header">
            <div class="table-cell">First Name</div>
            <div class="table-cell">Last Name</div>
            <div class="table-cell">Email</div>
            <div class="table-cell">Date Scanned</div>
          </div>
          {#each scans as scan}
          <div class="table-row {scan.selected ? 'selected' : ''}">
              <p class="table-cell">{scan.first_name}</p>
              <p class="table-cell">{scan.last_name}</p>
              <p class="table-cell">{scan.email}</p>
              <p class="table-cell">
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

        <style>
          .table-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            margin-top: 700px;
            max-width: 800px;
            margin: 0 auto;
            font-family: sans-serif;
          }
        
          .table-header {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            background-color: #ddd;
            padding: 10px;
            font-weight: bold;
          }
        
          .table-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            padding: 10px;
            border-bottom: 1px solid #ccc;
          }
        
          .table-row:nth-child(even) {
            background-color: #f8f8f8;
          }
        
          .table-row.selected {
            color: #3B82F6;
            font-weight: bold;
          }
        
          .table-cell {
            margin-right: 10px; 
          }

          .container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 20px;
        }

        .home-icon {
          background-color: blue;
        }

        .input-container {
          display: flex;
          flex-direction: column;
          margin-right: 20px;
        }

        input[type="datetime-local"] {
          margin-bottom: 10px;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .button-container {
          margin-bottom: 10px;
        }

        .winner-button {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          background-color: black;
          color: white;
          cursor: pointer;
          font-size: 16px; 
          transition: background-color 0.3s ease;
        }

        button {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          background-color: red;
          color: white;
          cursor: pointer;
          font-size: 16px; 
          transition: background-color 0.3s ease;
        }

        button:hover {
          background-color: #555;
        }

        .winner-container {
          border: 2px solid black;
          border-radius: 10px;
          padding: 20px;
          width: 500px;
          height: 300px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }

        .winner-label {
          font-weight: bold;
          font-size: 50px; 
          margin-bottom: 10px;
        }

        .winner-text {
          font-size: 30px; 
          margin-bottom: 10px;
        }

        </style>        
    {/if}
  </div>
  