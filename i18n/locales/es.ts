export default {
  account: {
    description: 'Administra la información y preferencias de tu cuenta',
    errors: {
      bio: {
        max: 'Tu biografía no puede exceder los 500 caracteres.',
        min: 'Tu biografía debe tener al menos 10 caracteres.',
      },
      name: {
        max: 'Tu nombre no puede exceder los 255 caracteres.',
        min: 'Tu nombre debe tener al menos 2 caracteres.',
      },
      website: {
        invalid: 'Por favor, ingresa una URL válida.',
        max: 'La URL de tu sitio web no puede exceder los 255 caracteres.',
      },
    },
    help: {
      bio: 'Una breve biografía sobre ti.',
      language: 'Selecciona tu idioma preferido.',
      theme: 'Selecciona tu tema de color preferido.',
      website: 'La URL de tu sitio web personal o empresarial.',
    },
    labels: {
      bio: 'Biografía',
      language: 'Idioma',
      name: 'Nombre',
      save: 'Guardar cambios',
      theme: 'Tema de color',
      website: 'Sitio web',
    },
    placeholders: {
      bio: 'Cuéntanos sobre ti',
      language: 'Selecciona un idioma',
      name: 'Ingresa tu nombre',
      theme: 'Selecciona un tema',
      website: 'Ingresa la URL de tu sitio web',
    },
    tabs: {
      preferences: 'Preferencias',
      profile: 'Perfil',
    },
    themes: {
      dark: 'Oscuro',
      light: 'Claro',
      system: 'Sistema',
    },
    title: 'Configuración de la cuenta',
    toast: {
      profile: {
        error: 'No podemos actualizar tu perfil en este momento.',
        success: 'Tu perfil ha sido actualizado.',
      },
    },
  },
  article: {
    call: 'Call',
    contactInfo: 'Datos de Contacto',
    directions: 'Direcciones',
    email: 'Correo Electrónico',
    free: 'Gratis',
    limited: 'Acceso Limitado',
    listedProducts: 'Productos Listados',
    locked: 'Premium',
    lockedDescription:
      'Esta publicación está detrás de un muro de pago o suscripción',
    manufacturerWebsite: 'Sitio Web del Fabricante',
    moreInfo: 'Más Información',
    online: 'En línea',
    readMore: 'Lea Más',
    related: 'Contenido Relacionado',
    share: {
      facebook: 'Compartir en Facebook',
      mail: 'Compartir por correo electrónico',
      pinterest: 'Compartir en Pinterest',
      reddit: 'Compartir en Reddit',
      telegram: 'Compartir en Telegram',
      twitter: 'Compartir en Twitter',
      whatsapp: 'Compartir en WhatsApp',
    },
    title: 'That Covid Life - {title}',
    updated: 'Actualizado',
    watchVideo: 'Ver Video',
    website: 'Ir al Sitio Web',
  },
  comingSoon: 'Muy pronto...',
  contribute: {
    back: 'Ir a la página de inicio',
    description:
      'Puede usar este formulario para enviar una noticia, sugerir un producto para revisar o compartir un consejo de lo directorio.',
    errors: {
      category: {
        required: 'Porfavor seleccione una categoría.',
      },
      description: {
        required: 'Por favor introduzca una descripción.',
        min: 'La descripción debe tener al menos 20 caracteres.',
      },
      email: {
        required: 'Por favor introduzca una dirección de correo eléctronico.',
        invalid:
          'Por favor, introduce una dirección de correo electrónico válida.',
      },
      from_name: {
        required: 'Introduce un nombre.',
        min: 'El nombre debe tener al menos 3 caracteres.',
      },
      link: {
        invalid: 'Introduce un enlace válido.',
      },
    },
    help: {
      description:
        'Proporcione una breve descripción de lo que le gustaría contribuir, junto con un enlace si corresponde.',
      email: 'Solo usaremos esto para informarle sobre su contribución.',
    },
    labels: {
      category: 'Categoría',
      description: 'Descripción',
      email: 'Correo Electrónico',
      link: 'Enlace',
      name: 'Nombre',
      submit: 'Entregar',
    },
    pageTitle: 'That Covid Life - Contribuir',
    placeholders: {
      category: 'Seleccione una categoría',
      description: 'Introduzca una descripción',
      email: 'Introduzca su dirección de correo electrónico',
      link: 'Introduzca un enlace',
      name: 'Introduzca su nombre',
    },
    sent: 'Tu contribución ha sido enviada. Lo revisaremos y nos comunicaremos con usted en breve a la dirección de correo electrónico que proporcionó.',
    title: 'Contribuir',
    toast: {
      error: {
        title: 'Algo salió mal.',
        message: 'Por favor, inténtelo de nuevo más tarde.',
      },
      success: {
        title: '¡Enviado!',
        message: 'Recibimos su envío y lo revisaremos pronto.',
      },
    },
  },
  covidnet: {
    blog: {
      featured: 'Publicación(es) Destacada(s)',
      link: 'Ver el Sitio Web',
    },
    twitter: {
      link: 'Ver Perfil de X/Twitter',
    },
    types: {
      blog: 'Blog / Sitio Web',
      twitter: 'Twitter',
      youtube: 'YouTube',
    },
    videos: {
      channel: 'Ver Canal',
      latest: 'Últimos Vídeos',
    },
  },
  directory: {
    instructions:
      'Seleccione una categoría o un país para comenzar a buscar en el directorio',
    results: '{totalItems} esultado(s) encontrado(s).',
  },
  disclaimer: {
    links: 'RENUNCIA DE ENLACES EXTERNOS',
    professional: 'RENUNCIA PROFESIONAL',
    testimonials: 'RENUNCIA DE RESPONSABILIDAD DE TESTIMONIOS',
    website: 'EXENCIÓN DE RESPONSABILIDAD DEL SITIO WEB',
    updated: 'Última actualización',
  },
  home: {
    description:
      'That Covid Life - Una plataforma para el asesoramiento de Covid',
    pageTitle: 'Últimas Publicaciones',
    title: 'That Covid Life - Últimas Publicaciones',
    events: 'Próximos eventos',
    latestNews: 'Últimas noticias',
    library: 'Biblioteca científica',
    phw: 'Public Health Watch',
    seeAllEvents: 'Ver todos los eventos próximos y pasados',
    seeAllLibrary: 'Ver todos los artículos científicos',
    seeAllNews: 'Ver todas las últimas noticias',
    seeAllPhw: 'Ver todas las noticias de salud pública',
    seeAllVideos: 'Ver todos los videos',
    videos: 'Videos',
  },
  layout: {
    about: 'Sobre Nosotros',
    blog: 'Blog',
    bluesky: 'Síguenos en Bluesky',
    brand: 'Marcas',
    contents: 'Contenido',
    covidnet: 'Covidnet',
    description:
      'Esta aplicación es una herramienta educativa que reúne enlaces a noticias, investigaciones y otros recursos relacionados con el COVID-19. No ofrecemos asesoramiento médico o sanitario ni vendemos productos.',
    directory: 'Directorio',
    disclaimer: 'Descargo de responsabilidad',
    event: 'Próximos Eventos',
    events: 'Próximos Eventos',
    footerLegal: '© 2023 - {year} Reservados todos los derechos.',
    health: 'Vigilancia de la Salud Pública',
    here: 'aquí',
    home: 'Página Principal',
    community: 'Comunidad',
    contactInfo: 'Información de contacto',
    contactUs: 'Contacta con Nosotros',
    education: 'Educación',
    empty: {
      blog: 'Aún no hay entradas en el blog.',
      community: 'Aún no hay enlaces de la comunidad.',
      directory: 'Aún no hay listados en el directorio.',
      education: 'Aún no hay contenido educativo.',
      events: 'No hay eventos próximos.',
      forum: 'Aún no hay publicaciones en el foro.',
      health: 'Aún no hay artículos sobre la salud pública.',
      library: 'Aún no hay artículos científicos.',
      news: 'Aún no hay noticias.',
      product: 'Aún no hay reseñas de EPI.',
      resources: 'Aún no hay recursos.',
      videos: 'Aún no hay vídeos.',
    },
    forum: 'Foro',
    forumGuidelines: 'Directrices Del Foro',
    language: 'Idioma',
    legal: 'Información Legal',
    link: 'Noticias',
    mobile: 'Aplicación Movil',
    more: {
      articles: 'Más Artículos',
      label: 'Más...',
      news: 'Mas Noticias',
      posts: 'Más Publicaciones',
      resources: 'Más recursos',
      videos: 'Más vídeos',
    },
    news: 'Noticias',
    privacyPolicy: 'Política de Privacidad',
    product: 'EPI',
    'public-health': 'Vigilancia de la Salud Pública',
    resource: 'Recursos',
    rights: 'Reservados todos los derechos',
    rss: 'RSS Feed',
    'scientific-library': 'Biblioteca',
    search: 'Buscar',
    social: 'Redes Sociales',
    submitContent: 'Contribuir',
    support: 'Soporte',
    switch: {
      darkMode: 'Cambiar al modo oscuro',
      lightMode: 'Cambiar al modo de luz',
    },
    tcl: 'That Covid Life',
    terms: 'Términos y Condiciones',
    theme: 'Tema de Color',
    themeOptions: {
      dark: 'Oscuro',
      light: 'Claro',
      system: 'Sistema',
    },
    toggleContactMenu: 'Menú de contacto',
    toggleLanguage: 'Alternar idioma',
    toggleNavMenu: 'Alternar menú de navegación',
    toggleTheme: 'Alternar tema',
    toggleUserMenu: 'Alternar menú de usuario',
    twitter: 'Síganos en Twitter',
    user: {
      account: 'Mi cuenta',
      bookmarks: 'Marcadores',
      area: 'Área de Usuario',
      createAccount: 'Crea una Cuenta',
      resetPassword: 'Restablecer la contraseña',
      settings: 'Configuración de la cuenta',
      signIn: 'Iniciar sesión',
      signUp: 'Registrate',
      signOut: 'Cerrar sesión',
      updatePassword: 'Actualiza Contraseña',
    },
    userAccount: 'Cuenta de Usuario',
    video: 'Vídeos',
    warningSupport:
      'Para ponerse en contacto con el servicio de asistencia, haga clic aquí.',
    warning:
      'That Covid Life pronto introducirá el requisito de inicio de sesión de cuenta gratuito para acceder a áreas específicas del sitio web. Este cambio tiene como objetivo proteger a la comunidad anti-COVID de la hostilidad, proteger a las empresas que figuran en el directorio y promover un espacio seguro y solidario. El equipo proporcionará actualizaciones sobre la transición e invitará a los usuarios a hacer preguntas o comentarios.',
  },
  list: {
    categoryTitle: 'That Covid Life - {type} - {category}',
    description:
      'That Covid Life - Una plataforma para el asesoramiento de Covid',
    filters: {
      reset: 'Restablecer Filtros',
      selectCategory: 'Seleccione una categoría...',
      selectCity: 'Selecciona una ciudad...',
      selectContentType: 'Seleccione un tipo de contenido...',
      selectCountry: 'Seleccione un país...',
      selectLanguage: 'Selecciona un idioma...',
      selectSource: 'Seleccione una fuente...',
    },
    typeTitle: 'That Covid Life - {type}',
  },
  needLogin: {
    cta: {
      login: 'Iniciar sesión',
      signup: 'Crear una cuenta',
    },
    description:
      'Hemos creado esta plataforma sin coste alguno para usted, con el fin de promover la educación sobre la salud pública y la ciencia, sin recibir ningún retorno económico. Apóyenos creando una cuenta gratuita. Muchas gracias.',
    title: 'Debe estar registrado para acceder a este contenido',
  },
  notFound: {
    title: 'No Encontrado',
    description: "Aún no hay publicaciones para '{category}'.",
  },
  reviews: {
    add: 'Calificación Promedio',
    average: 'Average Rating',
    edit: {
      already: 'Ya revisaste este producto.',
      click: 'Haga clic aquí para editar su reseña.',
    },
    edited: 'editado',
    list: {
      description:
        'Estás viendo reseñas desde el {start} hasta el {end} de {total}.',
    },
    notLoggedIn: 'Debes iniciar sesión para publicar una reseña del producto.',
    noReviews: 'Aún no hay reseñas para este producto.',
    placeholder: 'Escriba su reseña aquí...',
    rate: 'Calificar este producto',
    signIn: 'Iniciar sesión ahora',
    submit: 'Envía tu reseña',
    title: 'Reseñas',
    toast: {
      error: {
        message: 'No podemos publicar su reseña en este momento.',
        title: 'Algo salió mal',
      },
      success: {
        message: 'Tu reseña ha sido publicada.',
        title: '¡Reseña agregada!',
      },
      update: {
        message: 'Tu reseña ha sido actualizada.',
        title: '¡Revisión actualizada!',
      },
    },
    update: 'Actualiza tu reseña',
  },
  search: {
    description:
      'That Covid Life - Una plataforma para el asesoramiento de Covid',
    pageTitle: '{totalItems} Resultado(s) de la búsqueda de "{searchTerm}"',
    title: 'That Covid Life - Búsqueda "{searchTerm}"',
  },
  tags: {
    description:
      'That Covid Life - Una plataforma para el asesoramiento de Covid',
    pageTitle: '{totalItems} resultado(s) para "{tagName}"',
    title: 'That Covid Life - "{tagName}"',
  },
  forum: {
    account: {
      back: 'Atras',
      title: 'Mi Cuenta',
      labels: {
        about: 'Acerca de mí',
        avatar: 'Puedes crear o actualizar tu avatar en',
        email: 'Dirección de correo electrónico',
        fullName: 'Nombre completo',
        update: 'Actualizar',
        username: 'Nombre de usuario',
        website: 'Sitio web',
      },
      signIn: 'Iniciar Sesión Para Publicar',
    },
    auth: {
      description:
        'Ingrese su dirección de correo electrónico para recibir un enlace de inicio de sesión',
      label: 'Introduzca su dirección de correo electrónico...',
      submit: '¡Envíame un enlace de inicio de sesión!',
      toast: {
        error: {
          message: 'Por favor inténtalo de nuevo más tarde.',
          title: 'Algo salió mal',
        },
        success: {
          message:
            'Revise su correo electrónico para el enlace de inicio de sesión.',
          title: '¡Enlace enviado!',
        },
        update: {
          message: 'Tus preferencias han sido guardadas.',
          title: '¡Información de cuenta actualizada!',
        },
      },
    },
    comments: {
      box: {
        button: 'Publicar comentario',
        loggedIn: 'Debe iniciar sesión para publicar comentarios.',
        placeholder: 'Escriba su comentario aquí...',
        title: 'Agregar un comentario',
      },
      cancel: 'Cancelar',
      delete: 'Suprimir',
      deletion: {
        title: 'Confirmar la eliminación del comentario',
        description:
          'Estás a punto de eliminar tu comentario. Esto no se puede deshacer.',
      },
      description:
        'Estás viendo los comentarios desde el {start} hasta el {end} de {total}.',
      noComments: 'Todavía no hay comentarios en esta publicación.',
      toast: {
        deletion: {
          error: {
            message: 'No podemos eliminar su comentario en este momento.',
            title: 'Algo salió mal',
          },
          success: {
            message: 'Tu comentario ha sido eliminado.',
            title: '¡Comentario Borrado!',
          },
        },
        error: {
          message: 'No podemos publicar su comentario en este momento.',
          title: 'Algo salió mal',
        },
        success: {
          message: 'Tu comentario ha sido publicado.',
          title: '¡Comentario añadido!',
        },
      },
    },
    create: {
      categories: {
        introduction: 'Introducción',
        lifestyle: 'Estilo de Vida',
        'long-covid': 'Largo Covid',
        misc: 'Varios',
        products: 'EPI',
        recovery: 'Recuperación',
        relationships: 'Relaciones',
        'self-care': 'Autocuidado',
      },
      errors: {
        category: {
          required: 'Debes elegir una categoría',
        },
        contents: {
          empty: 'El contenido no puede estar vacío',
          required: 'Algún contenido es requerido',
        },
        title: {
          required: 'Se requiere un título',
          tooLong: 'El título es demasiado largo',
        },
      },
      labels: {
        category: 'Categoría',
        contents: 'Contenido',
        submit: 'Enviar',
        title: 'Titulo',
      },
      modal: {
        title: 'Confirmar publicación',
        description:
          'Estás a punto de publicar esta publicación. No se puede editar más tarde.',
        confirmation:
          'Verifique que todo esté bien y haga clic en "publicar" si está listo, o "cancelar" si necesita editar esta publicación.',
        buttons: {
          cancel: 'Cancelar',
          confirm: 'Publicar',
        },
      },
      placeholders: {
        category: 'Elija una categoría',
        contents: 'Ingrese algún contenido',
        title: 'Ingrese un título',
      },
      title: 'Crear publicación',
      toast: {
        error: {
          message: 'No podemos publicar su publicación en este momento.',
          title: 'Algo salió mal',
        },
        success: {
          message: '"{title}" ha sido publicado.',
          title: '¡Publicación añadida!',
        },
      },
    },
    disabled: {
      message: {
        comment:
          'Necesitas configurar un nombre de usuario antes de poder comentar.',
        post: 'Necesitas configurar un nombre de usuario antes de poder publicar.',
      },
      redirect: 'Ve a tu cuenta para configurar una ahora.',
    },
    nav: {
      create: 'Crear publicación',
      latest: 'Últimas publicaciones',
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      my: {
        account: 'Mi cuenta',
        posts: 'Mis publicaciones',
      },
      search: 'Buscar',
    },
    latest: {
      title: 'Últimas publicaciones',
    },
    list: {
      description:
        'Estás viendo la(s) publicación(es) desde el {start} hasta el {end} de {total}.',
    },
    post: {
      comments: 'Comentarios',
      translate: 'Traducir',
      translation: 'Traducción',
    },
    posts: {
      buttonLabel: 'Eliminar {amount} publicación(es)',
      description: 'Selecciona las publicaciones que deseas eliminar.',
      modal: {
        title: 'Confirmar eliminación',
        description:
          'Estás a punto de eliminar {amount} publicación(es). Esto no se puede deshacer.',
        confirmation: '¿Está seguro de que desea continuar?',
        buttons: {
          cancel: 'Cancelar',
          confirm: 'Eliminación',
        },
      },
      noPosts: 'Aún no has publicado nada.',
      table: {
        published: 'Fecha de publicación',
        title: 'Título de la publicación',
        topic: 'Tema',
      },
      title: 'Mis publicaciones',
      toast: {
        error: {
          message: 'No podemos eliminar tu(s) publicación(es) en este momento.',
          title: 'Algo salió mal',
        },
        success: {
          message: 'Su selección ha sido eliminada permanentemente.',
          title: '¡Publicación(es) eliminada(s)!',
        },
      },
    },
    search: {
      description:
        'Busca publicaciones ingresando un término de búsqueda a continuación.',
      label: 'Escriba un término de búsqueda...',
      title: 'Buscar',
    },
  },
  support: {
    pageTitle: 'Soporte',
    description:
      'Rellene este formulario para informarnos sobre cualquier defecto o sugerencia de mejora del producto que pueda tener.',
  },
  login: {
    buttons: {
      resetPassword: 'Restablecer la contraseña',
      signin: 'Iniciar sesión',
      signup: 'Registrarse',
      updatePassword: 'Actualiza Contraseña',
    },
    labels: {
      email: 'Correo Electrónico',
      password: 'Contraseña',
    },
    placeholders: {
      email: 'Ingrese su dirección de correo electrónico',
      newPassword: 'Ingrese su nueva contraseña',
      password: 'Ingrese su contraseña',
    },
    toast: {
      error: {
        title: 'Algo salió mal',
        message: 'Por favor, inténtelo de nuevo más tarde.',
      },
      reset: {
        title: '¡Solicitud exitosa!',
        message:
          'Revise su correo electrónico para ver si hay un enlace de reinicio.',
      },
      signup: {
        title: '¡Regístrese exitosamente!',
        message:
          'Revise su correo electrónico para obtener un enlace de confirmación.',
      },
      update: {
        title: '¡Actualización exitosa!',
        message: 'Ahora puedes iniciar sesión con tu nueva contraseña.',
      },
    },
  },
  mobile: {
    availableSoonIOS: '* Pronto disponible para iOS',
    details: {
      archive: {
        title: 'Acceda a todo nuestro archivo',
        description:
          'Puedes acceder a toda nuestra colección de noticias, documentos científicos, recursos, videos, EPI y próximos eventos en todos los idiomas compatibles.',
      },
      contribute: {
        title: 'Contribuya a nuestra plataforma',
        description:
          'Puedes enviarnos enlaces, información sobre EPI e incluso contenidos originales a través de nuestro formulario de contribución.',
      },
      informed: {
        title: 'Manténgase informado en cualquier lugar',
        description:
          'Con nuestra aplicación, puedes mantenerte informado sobre las últimas actualizaciones y avances científicos en torno a la pandemia de COVID-19.',
      },
    },
    header: 'Toda la información sobre el COVID-19 que necesitas.',
    subheader: 'En un solo lugar.',
  },
  topNav: {
    blog: {
      title: 'Blog',
    },
    forum: {
      title: 'Foro',
    },
    latest: {
      children: {
        events: {
          description: 'Próximos y pasados ​​eventos en torno a la COVID-19.',
          title: 'Eventos',
        },
        library: {
          description:
            'Las últimas investigaciones y artículos científicos sobre la COVID-19.',
          title: 'Biblioteca científica',
        },
        news: {
          description: 'Las últimas noticias sobre la COVID-19.',
          title: 'Noticias',
        },
        phw: {
          description:
            'Las últimas noticias sobre pandemias emergentes, como Mpox y H5N1.',
          title: 'Public Health Watch',
        },
        videos: {
          description: 'Los últimos videos sobre la COVID-19.',
          title: 'Videos',
        },
      },
      display: {
        description:
          'Una lista seleccionada de noticias, artículos científicos y eventos.',
        title: 'Últimas publicaciones',
      },
      title: 'Últimas noticias',
    },
    other: {
      children: {
        covidnet: {
          description:
            'Una lista seleccionada de blogs y canales de YouTube sobre la COVID-19.',
          title: 'Covidnet',
        },
        directory: {
          description:
            'Un directorio de empresas y proveedores de atención médica conscientes de la COVID-19.',
          title: 'Directorio',
        },
        products: {
          description:
            'Una lista de equipos de protección personal, como mascarillas, purificadores de aire, etc.',
          title: 'EPP',
        },
        resources: {
          description: 'Una lista de recursos útiles sobre la COVID-19.',
          title: 'Recursos',
        },
      },
      title: 'Otros',
    },
  },
  footer: {
    legal: {
      disclaimer: 'Descargo de responsabilidad',
      forum: 'Pautas del foro',
      privacy: 'Política de privacidad',
      terms: 'Términos y condiciones',
      title: 'Información legal',
    },
    social: {
      title: 'Redes sociales',
    },
    tcl: {
      about: 'Sobre Nosotros',
      contact: 'Contáctenos',
      contribute: 'Contáctenos',
      mobile: 'Aplicación móvil',
      rss: 'Feed RSS',
      support: 'Soporte',
      title: 'That Covid Life',
    },
  },
  description: {
    blog: 'Las últimas novedades de la redacción.',
    forum:
      'Un foro de usuarios para intercambiar consejos, experiencias y testimonios.',
    covidnet:
      'Una lista seleccionada de blogs y canales de YouTube sobre la COVID-19.',
    directory:
      'Un directorio de empresas y proveedores de atención médica conscientes de la COVID-19.',
    event: 'Próximos y pasados ​​eventos en torno a la COVID-19.',
    'scientific-library':
      'Las últimas investigaciones y artículos científicos sobre la COVID-19.',
    news: 'Las últimas noticias sobre la COVID-19.',
    product:
      'Una lista de equipos de protección personal, como mascarillas, purificadores de aire, etc.',
    'public-health':
      'Las últimas noticias sobre pandemias emergentes, como Mpox y H5N1.',
    resource: 'Una lista de recursos útiles sobre la COVID-19.',
    search: 'Busca en nuestros archivos noticias, artículos científicos y más.',
    video: 'Los últimos videos sobre la COVID-19.',
  },

  filters: {
    apply: 'Aplicar filtros',
    close: 'Cerrar',
    description: 'Usa estos filtros para refinar tu búsqueda.',
    label: {
      tags: 'Etiquetas',
    },
    noResults: 'No se encontró nada.',
    placeholder: {
      tags: 'Seleccionar etiqueta...',
    },
    reset: 'Restablecer filtros',
    title: 'Filtros',
  },

  bookmarks: {
    tooltip: 'Añadir a marcadores',
  },

  share: {
    action: 'Compartir en {name}',
    send: 'Enviar por correo electrónico',
    tooltip: 'Compartir',
  },

  searchbox: {
    placeholder: 'Buscar noticias, videos y más...',
    results: {
      noResults: 'No se encontraron resultados para "{query}"',
      total: '{amount} resultados',
    },
    viewAll: 'Ver todos los resultados',
  },
}
