<template>
    <div>
        <router-view />
        <loginPage />
    </div>
</template>

<script setup>
import loginPage from "../views/auth/login/login.vue"
import { ref } from 'vue';


</script>
