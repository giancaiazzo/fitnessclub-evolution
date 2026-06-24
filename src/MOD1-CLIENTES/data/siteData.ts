export const siteData = {
  name: "FitnessClubEvolution",
  tagline: "Transformamos tu vida",
  description: "Fitness y bienestar en un solo lugar",
  address: "Salto, Uruguay",
  phone: "+598 99 123 456",
  email: "contacto@fitnessclubevolution.com",
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    youtube: "https://youtube.com",
  },
};

export const socialLinks = [
  { name: "facebook", icon: "ri-facebook-fill", label: "Facebook" },
  { name: "instagram", icon: "ri-instagram-fill", label: "Instagram" },
  { name: "twitter", icon: "ri-twitter-x-fill", label: "Twitter" },
  { name: "youtube", icon: "ri-youtube-fill", label: "YouTube" },
];

export const contactInfo = [
  {
    icon: "ri-map-pin-line",
    title: "Dirección",
    content: siteData.address,
    link: null,
  },
  {
    icon: "ri-phone-line",
    title: "Teléfono",
    content: siteData.phone,
    link: `tel:${siteData.phone}`,
  },
  {
    icon: "ri-mail-line",
    title: "Correo electrónico",
    content: siteData.email,
    link: `mailto:${siteData.email}`,
  },
  {
    icon: "ri-time-line",
    title: "Horarios",
    content: [
      "Abierto de lunes a sábado con horarios amplios",
      "Consultá por disponibilidad de clases y servicios",
    ],
    link: null,
  },
];

export const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Nosotros", href: "/about" },
  { name: "Clases", href: "/classes" },
  { name: "IMC", href: "/calc-imc" },
  { name: "Planes", href: "/pricing" },
  { name: "Contacto", href: "/contact" },
  { name: "Tour virtual", href: "/tour-virtual" },
  { name: "Iniciar sesión", href: "/signin" },
];

export const features = [
  {
    title: "Atención personalizada",
    description: "Acompañamiento cercano para que entrenes según tus objetivos y necesidades",
    icon: "ri-user-heart-line",
  },
  {
    title: "Entrenadores especializados",
    description: "Equipo preparado para guiarte en cada etapa de tu proceso físico",
    icon: "ri-user-star-line",
  },
  {
    title: "Equipamiento completo",
    description: "Máquinas, pesos libres y espacios preparados para diferentes tipos de entrenamiento",
    icon: "ri-settings-3-line",
  },
  {
    title: "Clases grupales",
    description: "Propuestas dinámicas para entrenar en grupo y mantener la motivación",
    icon: "ri-group-line",
  },
  {
    title: "Planes adaptados",
    description: "Opciones pensadas para distintos objetivos, niveles y ritmos de entrenamiento",
    icon: "ri-file-list-3-line",
  },
  {
    title: "Comunidad fitness",
    description: "Un ambiente cercano, motivador y pensado para que te sientas parte",
    icon: "ri-community-line",
  },
];

export const classes = [
  {
    name: "Entrenamiento funcional",
    description: "Ejercicios dinámicos para mejorar fuerza, resistencia y movilidad",
    detailedDescription:
      "Una clase pensada para trabajar el cuerpo de forma integral mediante movimientos funcionales, circuitos y ejercicios variados. Ideal para mejorar el rendimiento físico general, ganar resistencia y fortalecer distintos grupos musculares.",
    duration: "45 min",
    difficulty: "Intermedio",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&q=80",
    benefits: [
      "Mejora la resistencia",
      "Aumenta la fuerza funcional",
      "Trabaja todo el cuerpo",
      "Entrenamiento dinámico y entretenido",
    ],
    trainer: "Rodrigo Guerrero",
    whatToExpect: "Circuitos variados, ejercicios intensos y acompañamiento del entrenador",
  },
  {
    name: "Musculación",
    description: "Entrenamiento orientado al desarrollo de fuerza y masa muscular",
    detailedDescription:
      "Programa de entrenamiento enfocado en el trabajo con máquinas, pesos libres y ejercicios guiados. Ideal para quienes buscan ganar fuerza, mejorar la técnica y desarrollar masa muscular de forma progresiva.",
    duration: "60 min",
    difficulty: "Todos los niveles",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&q=80",
    benefits: [
      "Aumenta la fuerza",
      "Desarrolla masa muscular",
      "Mejora la postura",
      "Permite progresar de forma controlada",
    ],
    trainer: "Gabriel Guerrero",
    whatToExpect: "Ejercicios guiados, corrección técnica y planificación progresiva",
  },
  {
    name: "CrossFit",
    description: "Entrenamientos funcionales de alta intensidad",
    detailedDescription:
      "Clase orientada al trabajo de fuerza, resistencia y coordinación mediante ejercicios variados de alta intensidad. Cada entrenamiento propone un desafío diferente, combinando movimientos funcionales, trabajo cardiovascular y fuerza.",
    duration: "60 min",
    difficulty: "Avanzado",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&q=80",
    benefits: [
      "Mejora el rendimiento físico",
      "Aumenta la resistencia",
      "Desarrolla fuerza funcional",
      "Entrenamiento desafiante y motivador",
    ],
    trainer: "Rodrigo Guerrero",
    whatToExpect: "Alta intensidad, ejercicios variados y trabajo en comunidad",
  },
  {
    name: "Taekwondo",
    description: "Disciplina marcial para mejorar técnica, coordinación y condición física",
    detailedDescription:
      "Actividad enfocada en el aprendizaje técnico, la disciplina y el desarrollo físico. El taekwondo permite mejorar la coordinación, la flexibilidad, la concentración y la confianza personal.",
    duration: "60 min",
    difficulty: "Todos los niveles",
    image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=600&fit=crop&q=80",
    benefits: [
      "Mejora la coordinación",
      "Aumenta la flexibilidad",
      "Fortalece la disciplina",
      "Desarrolla confianza y concentración",
    ],
    trainer: "Benjamin Guerrero",
    whatToExpect: "Técnica, práctica guiada, disciplina y trabajo físico",
  },
  {
    name: "Rehabilitación y salud",
    description: "Ejercicios adaptados para mejorar movilidad y bienestar general",
    detailedDescription:
      "Espacio orientado a personas que buscan mejorar su movilidad, recuperarse de molestias o entrenar con un enfoque más cuidadoso. Se trabaja de forma progresiva, respetando las posibilidades de cada persona.",
    duration: "50 min",
    difficulty: "Todos los niveles",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&q=80",
    benefits: [
      "Mejora la movilidad",
      "Ayuda a prevenir lesiones",
      "Fortalece de forma progresiva",
      "Favorece el bienestar general",
    ],
    trainer: "Paola Muse",
    whatToExpect: "Ejercicios controlados, acompañamiento personalizado y trabajo progresivo",
  },
];

export const pricingPlans = [
  {
    name: "Básico",
    price: "$",
    period: "/mes",
    features: [
      "Acceso a las instalaciones del gimnasio",
      "Uso de equipamiento general",
      "Asesoramiento inicial",
      "Acceso a vestuarios",
    ],
    popular: false,
  },
  {
    name: "Completo",
    price: "$",
    period: "/mes",
    features: [
      "Todo lo incluido en el plan Básico",
      "Acceso a clases grupales",
      "Seguimiento personalizado",
      "Orientación de entrenamiento",
      "Mayor disponibilidad horaria",
    ],
    popular: true,
  },
  {
    name: "Personalizado",
    price: "$",
    period: "/mes",
    features: [
      "Todo lo incluido en el plan Completo",
      "Entrenamiento personalizado",
      "Rutina adaptada a objetivos",
      "Seguimiento más cercano",
      "Prioridad en consultas y planificación",
    ],
    popular: false,
  },
];

export const testimonials = [
  {
    name: "Cliente del gimnasio",
    role: "Cliente activo",
    content:
      "FitnessClubEvolution me ayudó a mejorar mi constancia y sentirme acompañado durante todo el proceso.",
    rating: 5,
  },
  {
    name: "Cliente del gimnasio",
    role: "Cliente activo",
    content:
      "El ambiente es muy bueno, los entrenadores están presentes y siempre hay buena disposición para ayudar.",
    rating: 5,
  },
  {
    name: "Cliente del gimnasio",
    role: "Cliente activo",
    content:
      "Me gusta la variedad de actividades y la forma en que se adaptan a distintos objetivos.",
    rating: 5,
  },
];

export const facilities = [
  {
    title: "Zona de musculación",
    description: "Espacio equipado con máquinas, pesos libres y elementos de entrenamiento",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&q=80",
  },
  {
    title: "Zona funcional",
    description: "Área preparada para circuitos, movilidad y ejercicios dinámicos",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&q=80",
  },
  {
    title: "Espacio de clases grupales",
    description: "Sector destinado a actividades como funcional, crossfit y otras propuestas",
    image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=600&fit=crop&q=80",
  },
  {
    title: "Vestuarios",
    description: "Instalaciones cómodas para el uso diario de los clientes",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&q=80",
  },
  {
    title: "Equipamiento de entrenamiento",
    description: "Elementos para fuerza, resistencia, movilidad y acondicionamiento físico",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&q=80",
  },
  {
    title: "Área de movilidad",
    description: "Espacio para entrada en calor, estiramientos y recuperación",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80",
  },
];

export const faqs = [
  {
    question: "¿Necesito estar en forma para empezar?",
    answer:
      "No. El gimnasio recibe personas con distintos niveles de experiencia. Los entrenadores pueden orientarte para comenzar de forma progresiva y segura.",
  },
  {
    question: "¿Qué tengo que llevar al gimnasio?",
    answer:
      "Te recomendamos llevar ropa cómoda, botella de agua y toalla. El equipamiento necesario se encuentra disponible en las instalaciones.",
  },
  {
    question: "¿Puedo consultar antes de inscribirme?",
    answer:
      "Sí. Podés comunicarte con el gimnasio para recibir información sobre planes, horarios, actividades y servicios disponibles.",
  },
  {
    question: "¿Las rutinas son personalizadas?",
    answer:
      "Las rutinas pueden adaptarse según los objetivos, nivel de experiencia y necesidades de cada cliente.",
  },
  {
    question: "¿Qué actividades ofrece el gimnasio?",
    answer:
      "FitnessClubEvolution ofrece musculación, entrenamiento funcional, crossfit, taekwondo, rehabilitación, salud general y otras propuestas vinculadas al bienestar físico.",
  },
  {
    question: "¿El gimnasio está ubicado en Uruguay?",
    answer:
      "Sí. FitnessClubEvolution se encuentra en Salto, Uruguay.",
  },
];

export const classSchedule = [
  { time: "06:00", class: "Entrenamiento funcional", trainer: "Rodrigo Guerrero" },
  { time: "07:00", class: "Musculación", trainer: "Gabriel Guerrero" },
  { time: "08:00", class: "Rehabilitación y salud", trainer: "Paola Muse" },
  { time: "09:00", class: "CrossFit", trainer: "Rodrigo Guerrero" },
  { time: "12:00", class: "Musculación", trainer: "Gabriel Guerrero" },
  { time: "17:00", class: "Entrenamiento funcional", trainer: "Rodrigo Guerrero" },
  { time: "18:00", class: "CrossFit", trainer: "Rodrigo Guerrero" },
  { time: "19:00", class: "Taekwondo", trainer: "Benjamin Guerrero" },
];

export const successStories = [
  {
    name: "Cliente del gimnasio",
    age: 32,
    duration: "8 meses",
    result: "Mejoró su condición física",
    story:
      "Con constancia, acompañamiento y una rutina adaptada, logró mejorar su rendimiento y sentirse mejor en su día a día.",
    beforeImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&q=80",
    afterImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=600&fit=crop&q=80",
  },
  {
    name: "Cliente del gimnasio",
    age: 28,
    duration: "6 meses",
    result: "Aumentó fuerza y masa muscular",
    story:
      "El entrenamiento de fuerza y el seguimiento progresivo le permitieron avanzar de forma ordenada hacia sus objetivos.",
    beforeImage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=600&fit=crop&q=80",
    afterImage: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=600&fit=crop&q=80",
  },
  {
    name: "Cliente del gimnasio",
    age: 35,
    duration: "1 año",
    result: "Mejoró hábitos y constancia",
    story:
      "A través de clases, entrenamiento guiado y apoyo del equipo, logró incorporar el ejercicio como parte de su rutina.",
    beforeImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=600&fit=crop&q=80",
    afterImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&q=80",
  },
];

export const statistics = [
  { number: "200+", label: "Clientes activos", icon: "ri-user-line" },
  { number: "4", label: "Entrenadores", icon: "ri-user-star-line" },
  { number: "10+", label: "Actividades disponibles", icon: "ri-calendar-check-line" },
  { number: "2012", label: "Año de fundación", icon: "ri-award-line" },
  { number: "98%", label: "Compromiso con el cliente", icon: "ri-heart-line" },
  { number: "Salto", label: "Uruguay", icon: "ri-map-pin-line" },
];

export const fullSchedule = {
  monday: [
    { time: "06:00", class: "Entrenamiento funcional", trainer: "Rodrigo Guerrero" },
    { time: "07:00", class: "Musculación", trainer: "Gabriel Guerrero" },
    { time: "08:00", class: "Rehabilitación y salud", trainer: "Paola Muse" },
    { time: "09:00", class: "CrossFit", trainer: "Rodrigo Guerrero" },
    { time: "12:00", class: "Musculación", trainer: "Gabriel Guerrero" },
    { time: "17:00", class: "Entrenamiento funcional", trainer: "Rodrigo Guerrero" },
    { time: "18:00", class: "CrossFit", trainer: "Rodrigo Guerrero" },
    { time: "19:00", class: "Taekwondo", trainer: "Benjamin Guerrero" },
  ],
  tuesday: [
    { time: "06:00", class: "Musculación", trainer: "Gabriel Guerrero" },
    { time: "07:00", class: "Entrenamiento funcional", trainer: "Rodrigo Guerrero" },
    { time: "08:00", class: "Rehabilitación y salud", trainer: "Paola Muse" },
    { time: "09:00", class: "CrossFit", trainer: "Rodrigo Guerrero" },
    { time: "12:00", class: "Musculación", trainer: "Gabriel Guerrero" },
    { time: "17:00", class: "CrossFit", trainer: "Rodrigo Guerrero" },
    { time: "18:00", class: "Entrenamiento funcional", trainer: "Rodrigo Guerrero" },
    { time: "19:00", class: "Taekwondo", trainer: "Benjamin Guerrero" },
  ],
  wednesday: [
    { time: "06:00", class: "Entrenamiento funcional", trainer: "Rodrigo Guerrero" },
    { time: "07:00", class: "Musculación", trainer: "Gabriel Guerrero" },
    { time: "08:00", class: "Rehabilitación y salud", trainer: "Paola Muse" },
    { time: "09:00", class: "CrossFit", trainer: "Rodrigo Guerrero" },
    { time: "12:00", class: "Musculación", trainer: "Gabriel Guerrero" },
    { time: "17:00", class: "Entrenamiento funcional", trainer: "Rodrigo Guerrero" },
    { time: "18:00", class: "CrossFit", trainer: "Rodrigo Guerrero" },
    { time: "19:00", class: "Taekwondo", trainer: "Benjamin Guerrero" },
  ],
  thursday: [
    { time: "06:00", class: "Musculación", trainer: "Gabriel Guerrero" },
    { time: "07:00", class: "Entrenamiento funcional", trainer: "Rodrigo Guerrero" },
    { time: "08:00", class: "Rehabilitación y salud", trainer: "Paola Muse" },
    { time: "09:00", class: "CrossFit", trainer: "Rodrigo Guerrero" },
    { time: "12:00", class: "Musculación", trainer: "Gabriel Guerrero" },
    { time: "17:00", class: "CrossFit", trainer: "Rodrigo Guerrero" },
    { time: "18:00", class: "Entrenamiento funcional", trainer: "Rodrigo Guerrero" },
    { time: "19:00", class: "Taekwondo", trainer: "Benjamin Guerrero" },
  ],
  friday: [
    { time: "06:00", class: "Entrenamiento funcional", trainer: "Rodrigo Guerrero" },
    { time: "07:00", class: "Musculación", trainer: "Gabriel Guerrero" },
    { time: "08:00", class: "Rehabilitación y salud", trainer: "Paola Muse" },
    { time: "09:00", class: "CrossFit", trainer: "Rodrigo Guerrero" },
    { time: "12:00", class: "Musculación", trainer: "Gabriel Guerrero" },
    { time: "17:00", class: "Entrenamiento funcional", trainer: "Rodrigo Guerrero" },
    { time: "18:00", class: "CrossFit", trainer: "Rodrigo Guerrero" },
    { time: "19:00", class: "Taekwondo", trainer: "Benjamin Guerrero" },
  ],
  saturday: [
    { time: "08:00", class: "Entrenamiento funcional", trainer: "Rodrigo Guerrero" },
    { time: "09:00", class: "Musculación", trainer: "Gabriel Guerrero" },
    { time: "10:00", class: "Rehabilitación y salud", trainer: "Paola Muse" },
    { time: "11:00", class: "Taekwondo", trainer: "Benjamin Guerrero" },
  ],
  sunday: [
    { time: "09:00", class: "Rehabilitación y salud", trainer: "Paola Muse" },
    { time: "10:00", class: "Musculación", trainer: "Gabriel Guerrero" },
    { time: "11:00", class: "Entrenamiento funcional", trainer: "Rodrigo Guerrero" },
  ],
};

export const trainers = [
  {
    name: "Rodrigo Guerrero",
    role: "Entrenador principal",
    specialization: "Entrenamiento funcional, fuerza y acondicionamiento físico",
    experience: "Amplia experiencia",
    bio:
      "Rodrigo forma parte del equipo principal de FitnessClubEvolution y acompaña a los clientes en entrenamientos orientados a fuerza, rendimiento y mejora física general.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&q=80",
    certifications: ["Entrenamiento funcional", "Musculación", "Acondicionamiento físico"],
  },
  {
    name: "Paola Muse",
    role: "Entrenadora",
    specialization: "Salud, bienestar y acompañamiento personalizado",
    experience: "Amplia experiencia",
    bio:
      "Paola acompaña a los clientes en procesos de entrenamiento, bienestar y mejora de hábitos, brindando una atención cercana y adaptada a cada persona.",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=400&fit=crop&q=80",
    certifications: ["Bienestar físico", "Acompañamiento personalizado", "Salud general"],
  },
  {
    name: "Gabriel Guerrero",
    role: "Entrenador",
    specialization: "Musculación, fuerza y entrenamiento guiado",
    experience: "Amplia experiencia",
    bio:
      "Gabriel trabaja en el área de musculación y entrenamiento guiado, ayudando a los clientes a mejorar su técnica, fuerza y constancia.",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=400&fit=crop&q=80",
    certifications: ["Musculación", "Entrenamiento de fuerza", "Técnica de ejercicios"],
  },
  {
    name: "Benjamin Guerrero",
    role: "Entrenador",
    specialization: "Taekwondo, disciplina y preparación física",
    experience: "Amplia experiencia",
    bio:
      "Benjamin integra el equipo de entrenadores de FitnessClubEvolution, aportando trabajo técnico, disciplina y preparación física en las actividades del gimnasio.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80",
    certifications: ["Taekwondo", "Preparación física", "Disciplina deportiva"],
  },
];

export const history = [
  {
    year: "2012",
    title: "Fundación",
    description:
      "FitnessClubEvolution nace en Salto, Uruguay, con el objetivo de ofrecer un espacio de entrenamiento cercano, completo y orientado al bienestar.",
  },
  {
    year: "2015",
    title: "Crecimiento del gimnasio",
    description:
      "El gimnasio fortalece su propuesta incorporando más actividades, equipamiento y opciones de entrenamiento para sus clientes.",
  },
  {
    year: "2018",
    title: "Consolidación de la comunidad",
    description:
      "FitnessClubEvolution continúa creciendo como comunidad fitness, acompañando a personas con distintos objetivos y niveles de experiencia.",
  },
  {
    year: "2020",
    title: "Adaptación y continuidad",
    description:
      "El gimnasio mantiene su compromiso con los clientes, adaptándose a nuevas necesidades y formas de comunicación.",
  },
  {
    year: "2024",
    title: "Más servicios y acompañamiento",
    description:
      "Se fortalece el trabajo personalizado, la atención a clientes y la organización de servicios vinculados al entrenamiento y la salud.",
  },
  {
    year: "2026",
    title: "Nueva etapa digital",
    description:
      "FitnessClubEvolution proyecta una nueva etapa con portal web, sistema de gestión y herramientas digitales para mejorar la atención.",
  },
];

export const paymentOptions = {
  methods: [
    "Efectivo",
    "Transferencia bancaria",
    "Tarjeta de débito",
    "Tarjeta de crédito",
    "Otros medios de pago disponibles",
  ],
  plans: [
    {
      type: "Mensual",
      description: "Pago mes a mes, ideal para quienes buscan flexibilidad",
    },
    {
      type: "Trimestral",
      description: "Opción pensada para quienes desean mayor continuidad",
    },
    {
      type: "Plan familiar",
      description: "Consultá por opciones especiales para familias o grupos",
    },
  ],
  guarantee: "Consultá las condiciones de cada plan directamente con el gimnasio",
  trial: "Consultá por clases de prueba o información para nuevos clientes",
};