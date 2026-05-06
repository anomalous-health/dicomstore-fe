<template>
    <h1>Test Anggota</h1>
    <DataTable ref="dt" :value="data" v-model:selection="selectedProducts" dataKey="id" :paginator="true" :rows="10"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products">
        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="nama" header="Nama" sortable style="min-width: 12rem"></Column>
        <Column field="email" header="Email" sortable style="min-width: 16rem"></Column>
        <Column field="alamat" header="Alamat" sortable style="min-width: 8rem"></Column>
        <Column field="chapter" header="Chapter" sortable style="min-width: 8rem"></Column>
    </DataTable>
    <!-- <pre>{{ data }}</pre> -->

</template>

<script setup>
import { ref, onMounted } from 'vue';
import xriApi from '../../services/index.ts';



// Lifecycle hook
onMounted(() => {
    fetchData(); // Memanggil fetchData saat komponen dimuat
});
const data = ref([]);
const fetchData = async () => {
    try {
        const response = await xriApi.get('/api/anggota');
        data.value = response.data.data.data;
        console.log(data.value);
    } catch (error) {
        console.log('Error Fetch Data', error);
    }
};
</script>
