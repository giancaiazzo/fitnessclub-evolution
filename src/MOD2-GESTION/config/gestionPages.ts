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
    title: "Ejercicios",
    icon: "ri-boxing-line",
    actions: [
      {
        title: "Ingresar ejercicio",
        path: "/gestion/ejercicios/ingresar",
        icon: "ri-add-box-line",
      },
      {
        title: "Listado de ejercicios",
        path: "/gestion/ejercicios/listado",
        icon: "ri-list-check-3",
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
