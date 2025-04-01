<script lang="ts">
  import { browser } from "$app/environment";
  import { getAuthHeader } from "$lib/slitherAuth";

  let email = $state("");
  let password = $state("");
  let wrongCredentials = $state(false);
  let fetching = $state(false);

  // If the user is already logged in, redirect them to the home page
  async function checkAlreadyLoggedIn() {
    if (localStorage.getItem("token") === null) {
      return;
    }

    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
      },
    });
    if (response.status !== 401) {
      window.location.href = "/";
    }
  }

  if (browser) {
    checkAlreadyLoggedIn();
  }

  async function login() {
    if (fetching || email === "" || password === "") {
      return;
    }
    fetching = true;

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (response.status === 200) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      window.location.href = "/";
    } else {
      wrongCredentials = true;
    }

    fetching = false;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      login();
    } else {
      wrongCredentials = false;
    }
  }
</script>

<h1 class="text-5xl text-center font-medium font-roboto mt-24">Slither</h1>
<h2 class="text-2xl text-center font-base mb-16 font-sans">QR Code Scanner</h2>

<div class="mx-auto max-w-md px-4">
  <input
    bind:value={email}
    type="email"
    id="email"
    name="email"
    placeholder="Email"
    class="px-1 mt-1 mb-5 border-2 block w-full text-lg border-gray-300 rounded-md py-2 font-sans"
  />

  <input
    bind:value={password}
    type="password"
    id="password"
    name="password"
    placeholder="Password"
    class="px-1 mt-1 border-2 block w-full text-lg border-gray-300 rounded-md py-2 font-sans"
    onkeydown={handleKeyDown}
  />

  <button
    onclick={login}
    type="submit"
    class="mt-16 mx-auto block text-xl bg-thpink hover:bg-pink-400 text-white font-semibold w-full py-2 rounded-lg {fetching
      ? 'cursor-wait'
      : ''}">Login</button
  >
  {#if wrongCredentials}
    <p class="text-red-500 mt-1">Incorrect email or password</p>
  {/if}
</div>
