import { RouteRecordRaw } from "vue-router";
import { requireAuth } from "../../utils/requireAuth";
import defaultLayout from "../../layout/default.vue";
import masterPendidikan from "./master-pendidikan.vue";
import masterObat from "../../components/master/master-obat.vue";
import masterPasien from "../../components/master/master-pasien.vue";
import detailPasien from "../../components/master/detail-pasien.vue";
import tambahDiagnosa from "../../components/master/tambah-diagnosa.vue";
import tambahObat from "../../components/master/tambah-obat.vue";
import MasterProduk from "../../components/master/master-produk.vue";

const masterPath: Array<RouteRecordRaw> = [
  {
    path: "/master",
    component: defaultLayout,
    children: [
      {
        path: "produk",
        name: "Master Produk",
        component: MasterProduk,
      },
      {
        path: "pendidikan",
        name: "Master Pendidikan",
        component: masterPendidikan,
      },
      {
        path: "obat",
        name: "Master Obat",
        component: masterObat,
      },
      {
        path: "pasien",
        name: "master-pasien",
        component: masterPasien,
      },
      {
        path: "pasien/:id",
        name: "detail-pasien",
        component: detailPasien,
      },
      {
        path: "pasien/:id/diagnosa",
        name: "tambah-diagnosa",
        component: tambahDiagnosa,
      },
      {
        path: "pasien/:id/obat",
        name: "tambah-obat",
        component: tambahObat,
      },
    ],
    beforeEnter: requireAuth,
  },
];

export default masterPath;
