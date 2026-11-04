export interface Hall {
  id: string
  name: string
  capacity: number
  area: number
  description: string
  image: string
}

export const halls: Hall[] = [
  { id: 'main', name: 'Большой зал', capacity: 20, area: 110, description: 'Деревянный пол, зеркала, вентиляция с притоком свежего воздуха.', image: 'https://images.unsplash.com/photo-1517130038641-a774d04afb3c?auto=format&fit=crop&w=800&h=600&q=70' },
  { id: 'small', name: 'Малый зал', capacity: 14, area: 64, description: 'Тёплый свет и мягкое покрытие: для йоги, пилатеса и стретчинга.', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&h=600&q=70' },
  { id: 'cycle', name: 'Сайкл-студия', capacity: 8, area: 36, description: '8 велотренажёров, световое шоу и мощная акустика.', image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&h=600&q=70' },
]
export const hallById = (id: string) => halls.find((h) => h.id === id)
