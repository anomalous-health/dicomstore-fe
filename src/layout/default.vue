<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './composables/Sidebar.vue';
import Navbar from './composables/Navbar.vue';

let initialSidebar = true;
try {
    const stored = localStorage.getItem('sidebar-open');
    if (stored !== null) initialSidebar = stored === 'true';
} catch (e) {
    // ignore (e.g., SSR or blocked localStorage)
}
const isSidebarOpen = ref(initialSidebar);
const route = useRoute(); // Ambil data route

// Gunakan computed untuk reaktif data meta
const hideNavbar = computed(() => route.meta.hideNavbar);
const hideSidebar = computed(() => route.meta.hideSidebar);

function handleSidebarToggle(status) {
    isSidebarOpen.value = status;
    try {
        localStorage.setItem('sidebar-open', status ? 'true' : 'false');
    } catch (e) {
        // ignore
    }
}
</script>

<template>
    <div id="app">
        <Navbar v-if="!hideNavbar" />
        <Sidebar v-if="!hideSidebar" :isSidebarOpen="isSidebarOpen" @update:isSidebarOpen="handleSidebarToggle" />
        <!-- Konten utama -->
        <!-- <router-view /> -->
    </div>
</template>

<style scoped>
#app {
    min-height: 100vh;
    background: var(--surface-ground, #f9fafb);
}
</style>
