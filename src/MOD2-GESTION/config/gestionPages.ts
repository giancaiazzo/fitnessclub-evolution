export type GestionPageAction = {
  title: string;
  path: string;
  icon: string;
};

export type GestionSection = {
  title: string;
  icon: string;
  actions: GestionPageAction[];
};

export const gestionSections: GestionSection[] = [
  {
    title: "Clientes",
    icon: "ri-user-settings-line",
    actions: [
      {
        title: "Ingresar cliente",
        path: "/gestion/clientes/ingresar",
        icon: "ri-user-add-line",
      },
      {
        title: "Listado de clientes",
        path: "/gestion/clientes/listado",
        icon: "ri-group-line",
      },
    ],
  },
  {
    title: "Planes",
    icon: "ri-clipboard-line",
    actions: [
      {
        title: "Ingresar plan",
        path: "/gestion/planes/ingresar",
        icon: "ri-file-add-line",
      },
      {
        title: "Listado de planes",
        path: "/gestion/planes/listado",
        icon: "ri-file-list-3-line",
      },
    ],
  },
  {
    title: "Rutinas",
    icon: "ri-list-check-3",
    actions: [
      {
        title: "Ingresar rutina",
        path: "/gestion/rutinas/ingresar",
        icon: "ri-add-box-line",
      },
      {
        title: "Listado de rutinas",
        path: "/gestion/rutinas/listado",
        icon: "ri-list-check-3",
      },
    ],
  },
  {
    title: "Servicios",
    icon: "ri-service-line",
    actions: [
      {
        title: "Ingresar servicio",
        path: "/gestion/servicios/ingresar",
        icon: "ri-add-circle-line",
      },
      {
        title: "Listado de servicios",
        path: "/gestion/servicios/listado",
        icon: "ri-list-unordered",
      },
    ],
  },
  {
    title: "Pagos",
    icon: "ri-money-dollar-circle-line",
    actions: [
      {
        title: "Registro de pagos",
        path: "/gestion/pagos/registrar",
        icon: "ri-hand-coin-line",
      },
    ],
  },
];
