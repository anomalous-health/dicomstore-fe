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
                            <ul class="nav-root">

                                <!-- Section label -->
                                <li v-if="open" class="nav-section-label">NAVIGASI</li>

                                <!-- Dashboard -->
                                <li>
                                    <a v-ripple href="/home"
                                       :class="[{ 'active': isActive('/home') }, 'nav-link']">
                                        <i class="pi pi-home"></i>
                                        <span v-if="open" class="nav-label">Dashboard</span>
                                    </a>
                                </li>

                                <!-- Dicomstore -->
                                <li>
                                    <a v-ripple v-styleclass="{
                                            selector: '@next',
                                            enterClass: 'hidden',
                                            enterActiveClass: 'slidedown',
                                            leaveToClass: 'hidden',
                                            leaveActiveClass: 'slideup'
                                        }"
                                        :class="[{ 'active': isActive('/log') }, 'nav-link nav-link--parent']">
                                        <i class="pi pi-heart-fill"></i>
                                        <span v-if="open" class="nav-label">Dicomstore</span>
                                        <i v-if="open" class="pi pi-chevron-down nav-chevron"></i>
                                    </a>

                                    <ul class="tree-branch hidden">
                                        <li>
                                            <a v-ripple href="/log/upload"
                                               :class="[{ 'active': isActive('/log/upload') }, 'nav-link']">
                                                <i class="pi pi-upload"></i>
                                                <span v-if="open" class="nav-label">Log Upload Dicom</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a v-ripple href="/log/monitoring"
                                               :class="[{ 'active': isActive('/log/monitoring') }, 'nav-link']">
                                                <i class="pi pi-desktop"></i>
                                                <span v-if="open" class="nav-label">Monitoring Router</span>
                                            </a>
                                        </li>

                                        <!-- Master Data -->
                                        <li>
                                            <a v-ripple v-styleclass="{
                                                    selector: '@next',
                                                    enterClass: 'hidden',
                                                    enterActiveClass: 'slidedown',
                                                    leaveToClass: 'hidden',
                                                    leaveActiveClass: 'slideup'
                                                }"
                                                :class="[{ 'active': isActive('/auth') }, 'nav-link nav-link--parent']">
                                                <i class="pi pi-database"></i>
                                                <span v-if="open" class="nav-label">Master Data</span>
                                                <i v-if="open" class="pi pi-chevron-down nav-chevron"></i>
                                            </a>

                                            <ul class="tree-branch hidden">
                                                <li>
                                                    <a v-ripple href="/auth/users"
                                                       :class="[{ 'active': isActive('/auth/users') }, 'nav-link']">
                                                        <i class="pi pi-user-edit"></i>
                                                        <span v-if="open" class="nav-label">Pengguna</span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a v-ripple href="/satusehat/config"
                                                       :class="[{ 'active': isActive('/satusehat/config') }, 'nav-link']">
                                                        <i class="pi pi-cog"></i>
                                                        <span v-if="open" class="nav-label">SATUSEHAT Config</span>
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
/* ── Sidebar ─────────────────────────────────────────────────────────────── */
.custom-sidebar {
    position: fixed;
    top: 60px; /* flush under topbar */
    left: 0;
    height: calc(100vh - 60px);
    width: 220px;
    background: var(--surface-card, #ffffff);
    border-right: 1px solid var(--surface-border, #e5e7eb);
    z-index: 999;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    transition: width 0.25s ease;
}

/* Sidebar open */
.custom-sidebar.sidebar-open {
    width: 220px;
}

/* Sidebar collapsed */
.custom-sidebar.sidebar-close {
    width: 64px;
}

/* ── Nav root ────────────────────────────────────────────────────────────── */
.nav-root {
    list-style: none;
    padding: 0.75rem 0.5rem;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

/* Section label */
.nav-section-label {
    padding: 0.5rem 0.75rem 0.25rem;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-color-secondary, #9ca3af);
    user-select: none;
}

/* ── Nav link ────────────────────────────────────────────────────────────── */
.nav-link {
    text-decoration: none;
    color: var(--text-color, #374151);
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.55rem 0.75rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
    overflow: hidden;
    cursor: pointer;
}

.nav-link i {
    font-size: 0.95rem;
    flex-shrink: 0;
    width: 16px;
    text-align: center;
}

.nav-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }

.nav-chevron {
    font-size: 0.7rem !important;
    width: auto !important;
    color: var(--text-color-secondary, #9ca3af);
    transition: transform 0.2s;
}

.nav-link:hover {
    background: #f0fdf4;
    color: #047857;
}

.nav-link.active {
    background: #ecfdf5;
    color: #047857;
    font-weight: 600;
    box-shadow: inset 3px 0 0 #10b981;
}

.nav-link.active i { color: #10b981; }

/* ── Tree branch (submenu with lines) ───────────────────────────────────── */
.tree-branch {
    list-style: none;
    margin: 2px 0 2px 1.4rem;   /* indent from parent icon center */
    padding: 0;
    position: relative;
    border-left: 2px solid #a7f3d0; /* vertical line — emerald-200 */
    overflow: hidden;               /* keeps hidden/slidedown working */
}

/* Horizontal connector from vertical line → link */
.tree-branch > li {
    position: relative;
    margin: 2px 0;
}

.tree-branch > li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 1.15rem;          /* align with link center (padding 0.55rem + icon ~0.5rem /2) */
    width: 0.6rem;
    height: 2px;
    background: #a7f3d0;   /* same emerald-200 */
}

/* Last item: cover vertical line below connector */
.tree-branch > li:last-child::after {
    content: '';
    position: absolute;
    left: -2px;
    top: 1.15rem;
    bottom: 0;
    width: 2px;
    background: var(--surface-card, #ffffff);
}

/* Nested tree-branch (level 2) — slightly deeper color */
.tree-branch .tree-branch {
    margin-left: 1.2rem;
    border-left-color: #6ee7b7; /* emerald-300 */
}

.tree-branch .tree-branch > li::before {
    background: #6ee7b7;
}

/* Scrollable area */
.custom-sidebar .overflow-y-auto {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding-top: 0.5rem;
}

/* ── Content area ────────────────────────────────────────────────────────── */
.content-with-sidebar {
    margin-left: 220px;
    margin-top: 60px;
    width: calc(100% - 220px);
    transition: margin-left 0.25s ease, width 0.25s ease;
}

.content-with-sidebar.collapsed {
    margin-left: 64px;
    width: calc(100% - 64px);
}

.main-content {
    padding: 1rem;
}

/* ── Hamburger button ────────────────────────────────────────────────────── */
.hamburger-button {
    position: fixed;
    top: 13px;
    left: 14px;
    z-index: 1001;
    width: 34px !important;
    height: 34px !important;
    border-radius: 8px !important;
    background: transparent !important;
    border: none !important;
    color: var(--text-color-secondary, #6b7280) !important;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;
}

.hamburger-button:hover {
    background: #f0fdf4 !important;
    color: #10b981 !important;
}

.hamburger-button i {
    font-size: 1.1rem;
}

/* ── Collapsed state overrides ───────────────────────────────────────────── */
.custom-sidebar.sidebar-close .nav-link {
    justify-content: center;
    padding: 0.6rem;
    gap: 0;
}

.custom-sidebar.sidebar-close .nav-label,
.custom-sidebar.sidebar-close .nav-chevron,
.custom-sidebar.sidebar-close .nav-section-label {
    display: none !important;
}

.custom-sidebar.sidebar-close .nav-link i {
    font-size: 1.05rem;
    width: auto;
}

/* Hide tree branches when collapsed — only icons visible */
.custom-sidebar.sidebar-close .tree-branch {
    display: none !important;
}

/* header area */
.header-area {
    min-height: 0;
}

/* submenus */
.custom-sidebar ul ul {
    padding-left: 0.5rem;
}
</style>
