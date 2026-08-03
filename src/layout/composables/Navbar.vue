<template>
    <nav class="topbar">
        <!-- Brand -->
        <div class="topbar-brand">
            <img src="../../assets/dicom.png" class="topbar-logo" alt="Logo" />
            <span class="topbar-title">MedicVerse DICOM</span>
        </div>

        <!-- Actions -->
        <div class="topbar-actions">
            <!-- Dark mode -->
            <button class="topbar-icon-btn" @click="toggleDarkMode" :title="checked ? 'Light Mode' : 'Dark Mode'">
                <i :class="checked ? 'pi pi-moon' : 'pi pi-sun'" />
            </button>

            <!-- Divider -->
            <div class="topbar-divider" />

            <!-- Role badge -->
            <div class="topbar-role" v-if="userRole">
                <i class="pi pi-user" />
                <span>{{ userRole }}</span>
            </div>

            <!-- Settings -->
            <SplitButton class="topbar-settings" label="" icon="pi pi-cog" :model="menuSetting" />
        </div>
    </nav>
</template>

<script setup>
import { ref, watch } from "vue";
import { onMounted } from 'vue'
import { useRouter } from "vue-router";
import dashboard from "../../views/dashboard.vue";
// import spongebobImg from "../../assets/spongebob.png";
import apiClient from "../../services/apiService";

const router = useRouter();
const userRole = ref('');

const role = "director";
const isDropdownVisible = ref(false);
// Define a light/dark pair to toggle between using PrimeVue themes
const LIGHT_THEME = 'saga-blue'
const DARK_THEME = 'arya-blue'
const themes = [
    LIGHT_THEME,
    DARK_THEME,
    'saga-blue',
    'vela-blue',
    'arya-blue'
]
const selectedTheme = ref(localStorage.getItem('pv-theme') || LIGHT_THEME)
// checked reflects whether the current selected theme is the dark variant
const checked = ref(selectedTheme.value === DARK_THEME)

const fetchUserRole = async () => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        const response = await apiClient.get("/auth/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        userRole.value = response.data.role || '';
    } catch (error) {
        console.error("Gagal mengambil role:", error.response?.data);
    }
};

fetchUserRole();


function toggleDropdown() {
    isDropdownVisible.value = !isDropdownVisible.value;
}

function handleAction(action) {
    if (action === "auth" || action === "profile" || action === "settings") {
        router.push({ name: action });
    } else {
        console.error(`Route "${action}" tidak ditemukan!`);
    }
    isDropdownVisible.value = false;
}


// Terapkan tema awal
function switchTheme(theme) {
    // Replace or create the theme <link id="theme-link"> so PrimeVue theme can be switched at runtime
    let themeLink = document.getElementById('theme-link')
    if (!themeLink) {
        themeLink = document.createElement('link')
        themeLink.id = 'theme-link'
        themeLink.rel = 'stylesheet'
        document.head.appendChild(themeLink)
    }
    themeLink.href = `/themes/${theme}/theme.css`
    localStorage.setItem('pv-theme', theme)
}


function onThemeChange() {
    switchTheme(selectedTheme.value)
    // update checked flag when user picks a theme manually
    checked.value = selectedTheme.value === DARK_THEME
}

function toggleDarkMode() {
    // Toggle between our chosen light/dark PrimeVue themes
    checked.value = !checked.value
    const newTheme = checked.value ? DARK_THEME : LIGHT_THEME
    selectedTheme.value = newTheme
    switchTheme(newTheme)
}

onMounted(() => {
    // Apply saved PrimeVue theme on component mount (in case main didn't run early enough)
    try {
        switchTheme(selectedTheme.value)
    } catch (e) {
        // noop
    }
})


// Removed body class toggling; theme switching is handled by PrimeVue theme CSS



function getImage() {
    if (role === "director") {
        return spongebobImg;
    }
}

const items = ref([
    {
        label: "Home",
        icon: "pi pi-home",
        route: '/dashboard',
    },
    // {
    //     label: "About Us",
    //     icon: "pi pi-flag",
    // },
    // {
    //     label: "Organization Structure",
    //     icon: "pi pi-users",
    //     items: [
    //         {
    //             label: "Core",
    //             icon: "pi pi-bolt",
    //             shortcut: "⌘+S",
    //         },
    //         {
    //             label: "Blocks",
    //             icon: "pi pi-server",
    //             shortcut: "⌘+B",
    //         },
    //         {
    //             label: "UI Kit",
    //             icon: "pi pi-pencil",
    //             shortcut: "⌘+U",
    //         },
    //         {
    //             separator: true,
    //         },
    //         {
    //             label: "Templates",
    //             icon: "pi pi-palette",
    //             items: [
    //                 {
    //                     label: "Apollo",
    //                     icon: "pi pi-palette",
    //                     badge: 2,
    //                 },
    //                 {
    //                     label: "Ultima",
    //                     icon: "pi pi-palette",
    //                     badge: 3,
    //                 },
    //             ],
    //         },
    //     ],
    // },
    // {
    //     label: "Contact Us",
    //     icon: "pi pi-envelope",
    //     badge: 3,
    // },

]);

const logout = async () => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            console.error("AccessToken tidak tersedia");
            return;
        }

        const response = await apiClient.post("/auth/logout", {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        router.push({ name: "login" });
    } catch (error) {
        console.error("Error during logout:", error.response?.status);
        console.error("Error detail:", error.response?.data);
    }

};

const menuSetting = [
    {
        label: "Aplication Setting",
        icon: "pi pi-cog",
        command: () => {
            window.location.href = "/setting";
        },
    },
    {
        label: "Change Password",
        icon: "pi pi-key",
        command: () => {
            router.push({ name: "ChangePassword" });
        },
    },
    {
        separator: true,
    },
    {
        label: "Home",
        icon: "pi pi-home",
    },
    {
        label: "Logout",
        icon: "pi pi-sign-out",
        command: logout,
    },
];


</script>

<style scoped>
/* ── Topbar ──────────────────────────────────────────────────────────────── */
.topbar {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 1000;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem 0 4.5rem; /* left offset clears hamburger */
    background: var(--surface-card, #ffffff);
    border-bottom: 1px solid var(--surface-border, #e5e7eb);
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
}

/* Brand */
.topbar-brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
}

.topbar-logo {
    width: 32px;
    height: 32px;
    object-fit: contain;
    border-radius: 6px;
}

.topbar-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-color, #111827);
    letter-spacing: -0.01em;
}

/* Actions */
.topbar-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.topbar-divider {
    width: 1px;
    height: 20px;
    background: var(--surface-border, #e5e7eb);
    margin: 0 0.25rem;
}

/* Dark mode icon button */
.topbar-icon-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid var(--surface-border, #e5e7eb);
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color-secondary, #6b7280);
    transition: background 0.15s, color 0.15s;

    &:hover {
        background: var(--surface-hover, #f3f4f6);
        color: #10b981;
    }

    i { font-size: 0.95rem; }
}

/* Role badge */
.topbar-role {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.75rem;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #047857;
    text-transform: capitalize;

    i { font-size: 0.75rem; }
}

/* Settings splitbutton — strip default PrimeVue styles */
.topbar-settings :deep(.p-splitbutton-defaultbutton) {
    display: none; /* hide the label button, show only dropdown arrow */
}

.topbar-settings :deep(.p-splitbutton-menubutton) {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid var(--surface-border, #e5e7eb);
    background: transparent;
    color: var(--text-color-secondary, #6b7280);

    &:hover {
        background: var(--surface-hover, #f3f4f6);
        color: #10b981;
    }
}
</style>
