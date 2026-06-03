import { RouteRecordRaw } from "vue-router";
import { requireAuth } from "../../utils/requireAuth";
import defaultLayout from "../../layout/default.vue";
import detailPasien from "../../components/master/detail-pasien.vue";
import tambahDiagnosa from "../../components/master/tambah-diagnosa.vue";
import tambahObat from "../../components/master/tambah-obat.vue";
import uploadLog from "../../components/logdicom/upload-log.vue";
import MonitoringView from "../../components/logdicom/MonitoringView.vue";
import MiniMonitoringView from "../../components/logdicom/MiniMonitoringView.vue";

const masterPath: Array<RouteRecordRaw> = [
  {
    path: "/log",
    component: defaultLayout,
    children: [
    
    
      {
        path: "log-upload",
        name: "Log Upload",
        component: uploadLog
      },
      {
        path: "monitoring",
        name: "Monitoring PM2",
        component: MonitoringView
      },
      {
        path: "mini-monitoring",
        name: "Mini Monitoring PM2",
        component: MiniMonitoringView
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
