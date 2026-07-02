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
