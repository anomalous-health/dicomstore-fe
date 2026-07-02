<template>
    <div class="card container">
        <Menubar :model="items" class="custom-menubar">

            <template #start>
                <div class="flex align-items-center justify-content-between pt-3 flex-shrink-0">
                    <span class="inline-flex align-items-center gap-2" style="margin-bottom: 10px;">
                        <img src="../../assets/jmt.png" width="40" height="40" alt="Logo" />
                    </span>
                </div>
            </template>
            <template #end>
                <div class="flex align-items-center gap-2">
                    <!-- <div style="display:flex; align-items:center; gap:0.5rem">
                        <label>Pilih Tema:</label>
                        <select v-model="selectedTheme" @change="onThemeChange">
                            <option v-for="t in themes" :key="t" :value="t">{{ t }}</option>
                        </select>
                        <div class="card flex justify-content-center">
                            <Dropdown v-model="selectedTheme" :options="themes" optionLabel="name" placeholder="Pilih Tema" class="w-full md:w-14rem" />
                        </div>
                        
                    </div> -->

                    <div class="toggle-container" @click="toggleDarkMode">
                        <label> Mode </label>
                        <Button class="toggle-button">
                            <i :class="checked ? 'pi pi-moon' : 'pi pi-sun'"
                                :style="{ color: checked ? 'yellow' : 'blue' }"></i>
                        </Button>
                    </div>
                    <label class="blinking">{{ "| " + userRole + " |" }}</label>

                    <!--                    <InputText placeholder="Search" type="text" class="w-8rem sm:w-auto" />-->
                    <div style="display: flex; align-items: center">

                        <!-- <Button icon="pi pi-file-pdf" severity="success" class="mr-2 bs" /> -->

                        <SplitButton class="bs" label="" icon="pi pi-cog" :model="menuSetting" severity="">
                        </SplitButton>
                    </div>
                </div>
            </template>
        </Menubar>

    </div>
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
    themeLink.href = `/node_modules/primevue/resources/themes/${theme}/theme.css`
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
/* Geser keseluruhan Menubar ke kanan */
.custom-menubar {
    padding-left: 4rem;
    height: 60px;
    justify-content: center;
    /* Geser seluruh menu ke kanan */
}

/* Atur padding untuk item spesifik (Home, Features, Projects) */
.p-menubar .p-menuitem:first-child .p-menuitem-text {
    padding-left: 1rem;
    /* Home */
}

.p-menubar .p-menuitem:nth-child(2) .p-menuitem-text {
    padding-left: 1.5rem;
    /* Features */
}

.p-menubar .p-menuitem:nth-child(3) .p-menuitem-text {
    padding-left: 1.5rem;
    /* Projects */
}

/* Pastikan dropdown tetap terposisi dengan baik */
.dropdown-container {
    position: relative;
}

.custom-split-button {
    padding: 0px;
    border-radius: 50%;
    margin: 10px;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.button-image {
    width: 30px;
    height: auto;
    border-radius: 50%;
}

.dropdown-container {
    position: relative;
    display: inline-block;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    width: 150px;
    left: -80px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.dropdown-menu ul {
    list-style: none;
    margin: 0;
    padding: 0;
}

.dropdown-menu li {
    padding: 8px 16px;
    cursor: pointer;
    color: black;
    font-weight: bold;
}

.dropdown-menu li:hover {
    background-color: #f0f0f0;
}

.toggle-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.toggle-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
}
</style>

<style>
.blinking {
    animation: blink-animation 1.5s linear infinite;
    color: rgb(197, 230, 50);
    /* Bisa disesuaikan */
    font-weight: bold;
}

@keyframes blink-animation {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }
}
</style>
