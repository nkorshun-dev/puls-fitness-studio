export interface Trainer {
  slug: string
  name: string
  experience: number
  directions: string[]
  certificates: string[]
  bio: string
  photo: string
}

const p = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=750&q=70`

export const trainers: Trainer[] = [
  { slug: 'anna-k', name: 'Анна К.', experience: 9, directions: ['pilates', 'back'], certificates: ['Polestar Pilates, мат-программа', 'Курс «Реабилитация позвоночника», БГУФК'], bio: 'Пришла в пилатес после травмы спины. Объясняет движение так, чтобы вы чувствовали нужную мышцу, а не просто повторяли позу.', photo: p('1494790108377-be9c29b29330') },
  { slug: 'dmitry-s', name: 'Дмитрий С.', experience: 11, directions: ['functional', 'trx'], certificates: ['TRX Suspension Training Course', 'ACE Group Fitness Instructor'], bio: 'Мастер спорта по лёгкой атлетике. На занятиях держит темп и следит, чтобы никто не жертвовал техникой ради скорости.', photo: p('1500648767791-00dcc994a43e') },
  { slug: 'elena-v', name: 'Елена В.', experience: 7, directions: ['yoga', 'stretching'], certificates: ['Yoga Alliance RYT-200', 'Курс «Анатомия растяжки»'], bio: 'Практикует йогу с 2014 года. Показывает несколько вариантов каждой позы и не торопит тех, кто пока не достаёт до пола.', photo: p('1438761681033-6461ffad8d80') },
  { slug: 'maxim-p', name: 'Максим П.', experience: 5, directions: ['cycle', 'functional'], certificates: ['Stages Cycling Instructor', 'Курс тренировок по пульсу, Polar'], bio: 'Любит интервалы и хорошие плейлисты. Перед первым занятием настраивает сайкл под рост и объясняет, как читать пульсовую зону.', photo: p('1507003211169-0a1dd7228f2d') },
  { slug: 'olga-m', name: 'Ольга М.', experience: 6, directions: ['zumba', 'stretching'], certificates: ['Zumba Basic 1–2', 'Тренер групповых программ, ФК «Динамо»'], bio: 'Преподавала танцы детям и взрослым. На зумбе повторяет шаги медленно, пока не получится у всех.', photo: p('1544005313-94ddf0286df2') },
  { slug: 'ivan-t', name: 'Иван Т.', experience: 3, directions: ['trx', 'functional', 'back'], certificates: ['Инструктор ЛФК, Минский медколледж', 'TRX Group Trainer'], bio: 'Работал с людьми после операций, поэтому внимателен к плечам, коленям и пояснице. Занятия строит от простого к сложному.', photo: p('1472099645785-5658abf4ff4e') },
  { slug: 'marina-l', name: 'Марина Л.', experience: 2, directions: ['yoga', 'pilates', 'zumba'], certificates: ['Yoga Alliance RYT-200', 'Мат-пилатес, базовый курс'], bio: 'Самый молодой тренер студии. Ведёт утренние группы и умеет разбудить даже тех, кто пришёл в 7:00 с закрытыми глазами.', photo: p('1531746020798-e6953c6e8e04') },
]
export const trainerBySlug = (slug: string) => trainers.find((t) => t.slug === slug)
