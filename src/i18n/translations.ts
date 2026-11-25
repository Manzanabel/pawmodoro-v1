// All user-facing text lives here. Add a language by adding a dictionary
// with the same shape as `en` and registering it in LANGUAGES / DICTIONARIES.

const en = {
  appHint: 'space to start / pause',
  timer: {
    aria: 'Pomodoro timer',
    modes: { focus: 'Focus', short: 'Break', long: 'Long break' },
    start: 'Start',
    pause: 'Pause',
    reset: 'Reset',
    skip: 'Skip phase',
    cycle: 'Cycle until the long break',
    today: 'Today:',
    pomodoros: (n: number) => (n === 1 ? 'pomodoro' : 'pomodoros'),
  },
  sounds: {
    master: 'Master volume',
    names: {
      music: 'Celtic music',
      chimes: 'Wind chimes',
      fire: 'Fireplace',
      kettle: 'Water heating',
      wind: 'Gentle wind',
      leaves: 'Autumn leaves',
    },
    turnOn: (name: string) => `Turn on ${name}`,
    turnOff: (name: string) => `Turn off ${name}`,
    volumeOf: (name: string) => `${name} volume`,
  },
  drinks: {
    label: 'Choose your drink',
    names: {
      coffee: 'Coffee',
      greenTea: 'Green tea',
      chocolate: 'Hot chocolate',
      lavender: 'Lavender potion',
      moonTea: 'Moon tea',
    },
  },
  menu: {
    open: 'Open menu',
    close: 'Close menu',
    title: 'Grimoire',
    tabs: { drinks: 'Drinks', sounds: 'Sounds', timer: 'Timer', settings: 'Settings' },
  },
  mute: { mute: 'Mute', unmute: 'Unmute' },
  timerSettings: {
    focus: 'Focus',
    short: 'Short break',
    long: 'Long break',
    minutes: 'min',
    longEvery: 'Long break every',
    sessions: 'pomodoros',
    autoStart: 'Start the next phase automatically',
    restore: 'Restore defaults',
    decrease: 'Decrease',
    increase: 'Increase',
  },
  settings: {
    language: 'Language',
    calmMode: 'Hide the interface while I read',
    calmModeHint: 'While the timer runs, the interface fades away. Move the mouse to bring it back.',
    showHint: 'Show the keyboard shortcut',
  },
}

export type Dictionary = typeof en

const es: Dictionary = {
  appHint: 'espacio para comenzar / pausar',
  timer: {
    aria: 'Temporizador pomodoro',
    modes: { focus: 'Enfoque', short: 'Descanso', long: 'Descanso largo' },
    start: 'Comenzar',
    pause: 'Pausar',
    reset: 'Reiniciar',
    skip: 'Saltar fase',
    cycle: 'Ciclo hasta el descanso largo',
    today: 'Hoy:',
    pomodoros: (n) => (n === 1 ? 'pomodoro' : 'pomodoros'),
  },
  sounds: {
    master: 'Volumen general',
    names: {
      music: 'Música celta',
      chimes: 'Campanillas de viento',
      fire: 'Chimenea',
      kettle: 'Agua calentando',
      wind: 'Viento suave',
      leaves: 'Hojas de otoño',
    },
    turnOn: (name) => `Encender ${name}`,
    turnOff: (name) => `Apagar ${name}`,
    volumeOf: (name) => `Volumen de ${name}`,
  },
  drinks: {
    label: 'Elige tu bebida',
    names: {
      coffee: 'Café',
      greenTea: 'Té verde',
      chocolate: 'Chocolate caliente',
      lavender: 'Poción de lavanda',
      moonTea: 'Té de luna',
    },
  },
  menu: {
    open: 'Abrir menú',
    close: 'Cerrar menú',
    title: 'Grimorio',
    tabs: { drinks: 'Bebidas', sounds: 'Sonidos', timer: 'Temporizador', settings: 'Ajustes' },
  },
  mute: { mute: 'Silenciar', unmute: 'Activar sonido' },
  timerSettings: {
    focus: 'Enfoque',
    short: 'Descanso corto',
    long: 'Descanso largo',
    minutes: 'min',
    longEvery: 'Descanso largo cada',
    sessions: 'pomodoros',
    autoStart: 'Iniciar la siguiente fase automáticamente',
    restore: 'Restaurar valores',
    decrease: 'Disminuir',
    increase: 'Aumentar',
  },
  settings: {
    language: 'Idioma',
    calmMode: 'Ocultar la interfaz mientras leo',
    calmModeHint: 'Mientras corre el temporizador, la interfaz se desvanece. Mueve el mouse para que vuelva.',
    showHint: 'Mostrar el atajo de teclado',
  },
}

const fr: Dictionary = {
  appHint: 'espace pour commencer / mettre en pause',
  timer: {
    aria: 'Minuteur pomodoro',
    modes: { focus: 'Concentration', short: 'Pause', long: 'Longue pause' },
    start: 'Commencer',
    pause: 'Pause',
    reset: 'Réinitialiser',
    skip: 'Passer la phase',
    cycle: "Cycle jusqu'à la longue pause",
    today: "Aujourd'hui :", // French typography: non-breaking space before ':'
    pomodoros: (n) => (n === 1 ? 'pomodoro' : 'pomodoros'),
  },
  sounds: {
    master: 'Volume général',
    names: {
      music: 'Musique celtique',
      chimes: 'Carillon à vent',
      fire: 'Cheminée',
      kettle: "Eau qui chauffe",
      wind: 'Vent doux',
      leaves: "Feuilles d'automne",
    },
    turnOn: (name) => `Activer : ${name}`,
    turnOff: (name) => `Désactiver : ${name}`,
    volumeOf: (name) => `Volume : ${name}`,
  },
  drinks: {
    label: 'Choisis ta boisson',
    names: {
      coffee: 'Café',
      greenTea: 'Thé vert',
      chocolate: 'Chocolat chaud',
      lavender: 'Potion de lavande',
      moonTea: 'Thé de lune',
    },
  },
  menu: {
    open: 'Ouvrir le menu',
    close: 'Fermer le menu',
    title: 'Grimoire',
    tabs: { drinks: 'Boissons', sounds: 'Sons', timer: 'Minuteur', settings: 'Réglages' },
  },
  mute: { mute: 'Couper le son', unmute: 'Réactiver le son' },
  timerSettings: {
    focus: 'Concentration',
    short: 'Pause courte',
    long: 'Longue pause',
    minutes: 'min',
    longEvery: 'Longue pause tous les',
    sessions: 'pomodoros',
    autoStart: 'Lancer la phase suivante automatiquement',
    restore: 'Valeurs par défaut',
    decrease: 'Diminuer',
    increase: 'Augmenter',
  },
  settings: {
    language: 'Langue',
    calmMode: "Masquer l'interface pendant que je lis",
    calmModeHint: "Pendant le minuteur, l'interface s'efface. Bouge la souris pour la faire revenir.",
    showHint: 'Afficher le raccourci clavier',
  },
}

export const LANGUAGES = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
} as const

export type Lang = keyof typeof LANGUAGES

export const DICTIONARIES: Record<Lang, Dictionary> = { es, en, fr }
