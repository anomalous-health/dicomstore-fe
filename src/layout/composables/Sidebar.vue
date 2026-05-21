<template>
    <div>
        <div class="card flex justify-content-center">
    <div :class="['custom-sidebar', open ? 'sidebar-open' : 'sidebar-close']">
            <div class="flex flex-column h-full">
                        <div class="flex align-items-center justify-content-between px-4 pt-3 flex-shrink-0 header-area">
                            <span :class="['inline-flex align-items-center gap-2', { 'header-collapsed': !open }]">
                                <!-- <img class="sidebar-logo" src="../../assets/jmt.png" width="60" height="60" alt="Logo" /> -->
                                <!-- <span v-if="open" class="font-semibold text-2xl text-primary">DICOMSTORE</span> -->
                            </span>
                            <!-- <span>
                                <Button v-if="open" type="button" @click="toggleSidebar" icon="pi pi-times" rounded outlined
                                    class="h-2rem w-2rem"></Button>
                            </span> -->
                        </div>
                        <div class="overflow-y-auto">
                            <ul class="list-none p-3 m-0">
                                <li>
                                    <!-- <div v-ripple v-styleclass="{
                                        selector: '@next',
                                        enterClass: 'hidden',
                                        enterActiveClass: 'slidedown',
                                        leaveToClass: 'hidden',
                                        leaveActiveClass: 'slideup'
                                    }"
                                        class="p-3 flex align-items-center justify-content-between text-600 cursor-pointer p-ripple">
                                        <span class="font-medium">FAVORITES</span>
                                        <i class="pi pi-chevron-down"></i>
                                    </div> -->
                                    <ul class="list-none p-0 m-0 overflow-hidden">
                                        <li>
                                            <a v-ripple href="/home"
                                               :class="[{ 'active': isActive('/home') }, 'flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple']">
                                                <i class="pi pi-home mr-2"></i>
                                                <span v-if="open" class="font-medium">Dashboard</span>
                                            </a>
                                        </li>
                                       
                                        <li>
                                            <a v-ripple v-styleclass="{
                                                selector: '@next',
                                                enterClass: 'hidden',
                                                enterActiveClass: 'slidedown',
                                                leaveToClass: 'hidden',
                                                leaveActiveClass: 'slideup'
                                            }"
                                                :class="['flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple', { 'active': isActive('/posyandu') }]">
                                                <i class="pi pi-heart-fill mr-2"></i>
                                                <span v-if="open" class="font-medium">Dicomstore</span>
                                                <i class="pi pi-chevron-down ml-auto"></i>
                                            </a>
                                            <ul
                                                class="list-none py-0 pl-3 pr-0 m-0 overflow-y-hidden transition-all transition-duration-400 transition-ease-in-out">
                                                <li>
                                                    <a v-ripple href="/posyandu/dashboard" :class="[{ 'active': isActive('/posyandu/dashboard') }, 'flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple']">
                                                        <i class="pi pi-chart-bar mr-2"></i>
                                                        <span v-if="open" class="font-medium">Dashboard</span>
                                                    </a>
                                                </li>
                                           
                                               
                                                <!-- <li>
                                                    <a v-ripple href="/posyandu/jadwal" :class="[{ 'active': isActive('/posyandu/jadwal') }, 'flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple']">
                                                        <i class="pi pi-calendar mr-2"></i>
                                                        <span v-if="open" class="font-medium">Jadwal</span>
                                                    </a>
                                                </li> -->
                                                <!-- <li>
                                                    <a v-ripple href="/posyandu/kunjungan" :class="[{ 'active': isActive('/posyandu/kunjungan') }, 'flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple']">
                                                        <i class="pi pi-clipboard mr-2"></i>
                                                        <span v-if="open" class="font-medium">Kunjungan</span>
                                                    </a>
                                                </li> -->
                                           
                                            </ul>
                                        </li>
                                    
                                       
                                        <li>
                                            <a v-ripple
                                               href="/master/pasien"
                                               :class="[{ 'active': isActive('/master/pasien') }, 'flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple']">
                                                <i class="pi pi-users mr-2"></i>
                                                <span v-if="open" class="font-medium">Menu</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a v-ripple
                                               href="/log/log-upload"
                                               :class="[{ 'active': isActive('/logdicom/upload-log') }, 'flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple']">
                                                <i class="pi pi-users mr-2"></i>
                                                <span v-if="open" class="font-medium">Log Upload Dicom</span>
                                            </a>
                                        </li>

                                        <li>
                                            <a v-ripple v-styleclass="{
                                                selector: '@next',
                                                enterClass: 'hidden',
                                                enterActiveClass: 'slidedown',
                                                leaveToClass: 'hidden',
                                                leaveActiveClass: 'slideup'
                                            }"
                                                :class="['flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple', { 'active': isActive('/master') }]">
                                                <i class="pi pi-database mr-2"></i>
                                                <span v-if="open" class="font-medium">Master Data</span>
                                                <i class="pi pi-chevron-down ml-auto"></i>
                                            </a>
                                            <ul
                                                class="list-none py-0 pl-3 pr-0 m-0 hidden overflow-y-hidden transition-all transition-duration-400 transition-ease-in-out">

                                              
                                               
                                                 <li>
                                                    <a v-ripple href="/posyandu/master" :class="[{ 'active': isActive('/posyandu/master') }, 'flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple']">
                                                        <i class="pi pi-building mr-2"></i>
                                                        <span v-if="open" class="font-medium">Data</span>
                                                    </a>
                                                </li>

                                                <li>
                                                    <a v-ripple href="/auth/users"
                                                    :class="[{ 'active': isActive('/auth/users') }, 'flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple']">
                                                        <i class="pi pi-user-edit mr-2"></i>
                                                        <span v-if="open" class="font-medium">Pengguna</span>
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
            </div>
        </div>
            <Button 
                v-if="!route.meta?.hideSidebar" 
                class="hamburger-button" 
                icon="pi pi-bars" 
                @click="toggleSidebar"
                rounded
                text
                severity="primary"
                aria-label="Toggle Sidebar"
            />
            <!-- Konten Utama -->
            <div :class="['content-with-sidebar', { 'content-full': !route.meta?.hideSidebar, 'collapsed': !open }]">
                <div class="main-content">

                    <div>
                        <router-view :isSidebarOpen="isSidebarOpen" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, defineEmits, computed } from "vue";
import { useRoute } from 'vue-router';

const route = useRoute();
const isAuthPage = computed(() => route.path === '/auth');

const props = defineProps({ isSidebarOpen: { type: Boolean, default: true } });
const emit = defineEmits(["update:isSidebarOpen"]); // Untuk mengirimkan event ke parent

// computed that reflects prop and emits update when set
const open = computed({
    get: () => props.isSidebarOpen,
    set: (v) => emit('update:isSidebarOpen', v)
});

function toggleSidebar() {
    open.value = !open.value; // will emit to parent
}

function isActive(path) {
    try {
        // treat root-like matches as prefix matches for sections
    return route.path === path || route.path.startsWith(path);
    } catch (e) {
        return false;
    }
}

</script>

<style>
/* Styling tambahan untuk menu sidebar */
/* Sidebar Styling */
/* Sidebar */

.custom-sidebar {
    position: fixed;
    top: 90px;
    left: 10px;
    border-radius: 2%;
    height: calc(100vh - 100px); /* agar tidak melebihi viewport, 100px = top + margin bawah jika ada */
    width: 15%;
    background-color: rgba(255, 255, 255, 0);
    z-index: 999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.content-with-sidebar {
    margin-left: 15%;
    /* Sama dengan lebar sidebar */
    width: 85%;
    transition: margin-left 0.9s ease;
}

.custom-sidebar.sidebar-open {
    left: 10px;
    /* Posisi terbuka */
}

.main-content {
    padding: 2px;
}

/* Animasi slide Konten utama */
.content-full {
    width: 100%;
    transition: margin-left 0.9s ease;
}


/* Pastikan area menu juga scrollable jika menu sangat panjang */
.custom-sidebar .overflow-y-auto {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
}

/* Styling Hamburger Button */
.hamburger-button {
    position: fixed;
    top: 18px;
    left: 18px;
    z-index: 1001;
    padding: 0.5rem !important;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
}

.hamburger-button:hover {
    background-color: var(--primary-50);
    color: var(--primary-color);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.hamburger-button i {
    font-size: 1.25rem;
}

ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

/* jarak antar icon item */
li {
    margin: 5px 0;
}

a {
    text-decoration: none;
    color: inherit;
}

/* Collapsed state: show icon-only and narrower sidebar */
.custom-sidebar.sidebar-close {
    width: 100px; /* only icons */
    overflow: visible;
}

.custom-sidebar.sidebar-close {
    background-color: var(--surface-card);
    color: var(--text-color);
    padding-top: 0.75rem;
    left: 10px;
}

.custom-sidebar.sidebar-close img {
    width: 40px;
    height: 40px;
}

.header-area .sidebar-logo {
    transition: width 0.15s ease, height 0.15s ease, margin 0.15s ease;
}

.custom-sidebar.sidebar-close .header-area .sidebar-logo {
    width: 36px !important;
    height: 36px !important;
    margin-right: 0 !important;
}

.custom-sidebar.sidebar-close .overflow-y-auto {
    padding-top: 0.5rem;
}

.header-area .header-collapsed {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.custom-sidebar.sidebar-close .header-area .header-collapsed {
    justify-content: center;
}

.custom-sidebar.sidebar-close .font-medium {
    display: none; /* hide labels */
}

/* Adjust content when sidebar collapsed */
.content-with-sidebar {
    transition: margin-left 1.25s ease;
}

.content-with-sidebar.collapsed {
    /* push content by collapsed sidebar width + left offset (10px) */
    margin-left: calc(100px + 10px);
    width: calc(100% - 110px);
}

/* Active menu item */
.custom-sidebar a.active {
    /* Use theme-aware highlight for background while keeping primary as accent */
    background-color: var(--highlight-bg, var(--primary-50));
    color: var(--primary-color);
    /* box-shadow: inset 3px 0 0 var(--primary-color); */
}

.custom-sidebar a.active, .custom-sidebar a.active i {
    color: var(--primary-color);
}

/* Make icon margin smaller when collapsed */
.custom-sidebar.sidebar-close .mr-2 {
    margin-right: 0;
}

/* When collapsed: center icons, keep anchors full-width and clickable */
.custom-sidebar.sidebar-close ul li a {
    justify-content: center !important;
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
}

/* lebar si icon menu nya */
.custom-sidebar.sidebar-close ul li a {
    display: flex !important;
    width: 100% !important;
}

.custom-sidebar.sidebar-close ul li a .font-medium {
    display: none !important; /* hide labels */
}

/* hide submenu chevrons and trailing icons when collapsed */
.custom-sidebar.sidebar-close .pi-chevron-down,
.custom-sidebar.sidebar-close .ml-auto {
    display: none !important;
}

/* ensure icon size and center inside anchor */
.custom-sidebar.sidebar-close ul li a i {
    font-size: 1.15rem;
    display: block;
}
</style>
