
<script lang="ts">
    import { browser } from "$app/environment";

    // Yoink the user's token and redirect to the login page.
    function logout() {
        localStorage.removeItem("token");
        window.location.href = "/login";
    }

    if (browser) {
        logout();
    }
</script>

<p>You should be redirected any second now...</p>
