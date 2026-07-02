import { createRouter, createWebHistory } from "vue-router";
import masterPath from "../views/master/master-path";
import { requireAuth } from "../utils/requireAuth";
import authLayout from "../layout/auth.vue";
import defaultLayout from "../layout/default.vue";
import dashboard from "../views/dashboard.vue";
import logDicomPath from "../views/logdicom/log-dicom-path";

const routes = [
  {
    path: "/",
    name: "dashboard",
    component: defaultLayout,
    children: [
      {
        path: "/home",
        name: "Home",
        component: dashboard,
      },
      {
        path: "/auth/users",
        name: "AuthUsers",
        component: () => import("../views/auth/AuthUsers.vue"),
      },
      {
        path: "/auth/change-password",
        name: "ChangePassword",
        component: () => import("../views/auth/ChangePassword.vue"),
      },
      {
        path: "/satusehat/config",
        name: "SatuSehatConfig",
        component: () => import("../views/satusehat/SatuSehatConfig.vue"),
      },
      {
        path: "/testing",
        name: "Testing",
        component: () => import("../components/grafik/total-kirim.vue"),
      }
      // {
      //   path: "/posyandu/dashboard",
      //   name: "PosyanduDashboard",
      //   component: () => import("../views/posyandu/PosyanduDashboard.vue"),
      // },
      // {
      //   path: "/posyandu/pendaftaran",
      //   name: "PosyanduPendaftaran",
      //   component: () => import("../views/posyandu/PosyanduPendaftaran.vue"),
      // },
      // {
      //   path: "/posyandu/master",
      //   name: "PosyanduMaster",
      //   component: () => import("../views/posyandu/PosyanduMaster.vue"),
      // },
      // {
      //   path: "/posyandu/jadwal",
      //   name: "PosyanduJadwal",
      //   component: () => import("../views/posyandu/PosyanduJadwal.vue"),
      // },
      // {
      //   path: "/posyandu/kunjungan",
      //   name: "PosyanduKunjungan",
      //   component: () => import("../views/posyandu/PosyanduKunjungan.vue"),
      // },
      // {
      //   path: "/posyandu/imunisasi",
      //   name: "PosyanduImunisasi",
      //   component: () => import("../views/posyandu/PosyanduImunisasi.vue"),
      // },
      // {
      //   path: "/auth/users",
      //   name: "AuthUsers",
      //   component: () => import("../views/auth/AuthUsers.vue"),
      // },
      // {
      //   path: "/auth/change-password",
      //   name: "ChangePassword",
      //   component: () => import("../views/auth/ChangePassword.vue"),
      // },
      // {
      //   path: "/satusehat/config",
      //   name: "SatuSehatConfig",
      //   component: () => import("../views/satusehat/SatuSehatConfig.vue"),
      // },
    ],
    beforeEnter: requireAuth,
  },
  {
    path: "/anggota",
    name: "anggota",
    component: () => import("../views/anggota/anggota.vue"),
    beforeEnter: requireAuth,
  },
  {
    path: "/login",
    name: "login",
    component: authLayout,
    meta: {
      // hideNavbar: true,
      // hideSidebar: true,
    },
  },

  ...masterPath,
  ...logDicomPath,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
