
<script lang="ts">
    import { browser } from "$app/environment";
    import { getAuthHeader } from "$lib/slitherAuth";

    let email = "";
    let password = "";
    let wrongCredentials = false;
    let fetching = false;

    // If the user is already logged in, redirect them to the home page
    async function checkAlreadyLoggedIn() {
        if (localStorage.getItem("token") === null) {
            return;
        }

        const response = await fetch("/api/auth/verify", {
            "method": "POST",
            "headers": {
                "Authorization": getAuthHeader()
            }
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
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({
                "email": email,
                "password": password
            })
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
        }
    }

</script>

<h1 class="text-8xl text-center font-bold">Slither</h1>
<h2 class="text-3xl text-center font-semibold mb-28">QR Code Scanner</h2>

<div class="mx-auto max-w-3xl">
    <label for="email" class="text-lg text-gray-700">Email</label>
    <input bind:value={email} type="email" id="email" name="email" class="px-1 mt-1 mb-5 border-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />

    <label for="password" class="text-lg text-gray-700">Password</label>
    <input bind:value={password} type="password" id="password" name="password" class="px-1 mt-1 border-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" on:keydown={handleKeyDown} />

    <button on:click={login} type="submit" class="mt-5 border-2 border-black px-2 rounded-lg {fetching ? "cursor-wait" : ""}">Login</button>
    {#if wrongCredentials}
        <p class="text-red-500 mt-1">Incorrect email or password</p>
    {/if}
</div>

