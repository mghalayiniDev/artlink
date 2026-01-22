import { 
    ShieldCheck, 
    DoorOpen, 
    Thermometer, 
    Maximize, 
    Layers, 
    Droplets, 
    Wind, 
    Umbrella, 
    Sparkles, 
    Palette ,
    Lock, 
    Construction, 
    Eye,
    Zap,
    Hammer
} from 'lucide-react'

export const categories = [
    {
        id: 1,
        name: {
            en: 'External',
            ar: 'الأبواب الخارجية'
        },
        description: {
            en: 'Pivot, hinged, fence, and service doors designed for durability and style.',
            ar: 'أبواب محورية مفصلية، أبواب الأسوار، وأبواب الخدمات، مصممة لتجمع بين المتانة والأناقة.'
        },
        features: [
        {
            icon: ShieldCheck,
            en: 'Fire-resistant cladding materials',
            ar: 'مواد تغليف مقاومة للحريق'
        },
        {
            icon: Thermometer,
            en: 'Thermal insulation using ROCKWOOL',
            ar: 'عزل حراري باستخدام مادة الصوف الصخري'
        },
        {
            icon: Maximize,
            en: 'Ideal for wide opening entrances',
            ar: 'مثالية للمداخل ذات المساحات الواسعة'
        }
        ],
        image: 'https://images.unsplash.com/photo-1711959327007-0e545589e5bd?q=80&w=665&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
        id: 2,
        name: {
            en: 'Interior',
            ar: 'الأبواب الداخلية'
        },
        description: {
            en: 'Hidden (flash) and WPC doors offering seamless and durable indoor solutions.',
            ar: 'أبواب مخفية (فلاش) وأبواب WPC توفر حلولاً داخلية سلسة وعالية التحمل.'
        },
        features: [
        {
            icon: Layers,
            en: 'Seamless modern design (Hidden Doors)',
            ar: 'تصميم عصري مخفي وانسيابي'
        },
        {
            icon: Droplets,
            en: 'Water and moisture resistant (WPC)',
            ar: 'مقاومة للماء والرطوبة (WPC)'
        },
        {
            icon: DoorOpen,
            en: 'High durability for frequent use',
            ar: 'متانة عالية للاستخدام المتكرر'
        }
        ],
        image: 'https://images.unsplash.com/photo-1603673298820-40d77252226d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
        id: 3,
        name: {
            en: 'Handrails',
            ar: 'الدرابزينات'
        },
        description: {
            en: 'Wrought iron, aluminum cast, and glass options combining safety with aesthetics.',
            ar: 'خيارات من الحديد المشغول، الألمنيوم المصبوب والزجاج، تجمع بين الأمان والجمال.'
        },
        features: [
        {
            icon: ShieldCheck,
            en: 'High safety standards',
            ar: 'معايير أمان عالية'
        },
        {
            icon: Sparkles,
            en: 'Premium aesthetic finishes',
            ar: 'تشطيبات جمالية فاخرة'
        },
        {
            icon: Palette,
            en: 'Versatile materials (Iron, Aluminum, Glass)',
            ar: 'مواد متنوعة (حديد، ألمنيوم، زجاج)'
        }
        ],
        image: 'https://images.unsplash.com/photo-1727224455279-44446d9577b3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
        id: 4,
        name: {
            en: 'Pergolas',
            ar: 'البرغولا'
        },
        description: {
            en: 'Custom outdoor structures made from wood, WPC, or aluminum, blending function with visual appeal.',
            ar: 'هياكل خارجية مخصصة مصنوعة من الخشب أو WPC أو الألمنيوم، تجمع بين الوظيفة والجاذبية البصرية.'
        },
        features: [
        {
            icon: Umbrella,
            en: 'Customized outdoor weather protection',
            ar: 'حماية مخصصة من الظروف الجوية الخارجية'
        },
        {
            icon: Wind,
            en: 'Durable structures (WPC, Aluminum)',
            ar: 'هياكل متينة (ألمنيوم و WPC)'
        },
        {
            icon: Sparkles,
            en: 'Modern architectural appeal',
            ar: 'جاذبية معمارية عصرية'
        }
        ],
        image: 'https://images.unsplash.com/photo-1558725177-79763c6e9014?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
]

export const products = [
    {
      id: 'P01',
      categoryId: 1,
      price: 12500,
      name: { en: 'Luxury Pivot Door', ar: 'باب محوري فاخر' },
      description: { en: 'Grand entrance pivot door with high-security aluminum core.', ar: 'باب مدخل محوري ضخم بهيكل ألمنيوم عالي الأمان.' },
      features: [{ icon: ShieldCheck, en: 'Fire-resistant', ar: 'مقاوم للحريق' }],
      images: [
        'https://images.unsplash.com/photo-1700221458834-e0ba7b3849a2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        'https://images.unsplash.com/photo-1633564285917-491371115135?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      ]
    },
    {
      id: 'H01',
      categoryId: 1,
      price: 6800,
      name: { en: 'Modern Hinged Door', ar: 'باب مفصلي عصري' },
      description: { en: 'Heavy-duty hinged door for main villa entrances.', ar: 'باب مفصلي شديد التحمل لمداخل الفلل الرئيسية.' },
      features: [{ icon: Lock, en: 'Multi-point locking', ar: 'قفل متعدد النقاط' }],
      images: ['https://images.unsplash.com/photo-1680650619471-54db5c37edc6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']
    },
    {
      id: 'F01',
      categoryId: 1,
      price: 4500,
      name: { en: 'Villa Fence Door', ar: 'باب سور فيلا' },
      description: { en: 'External fence door with weather-resistant laser-cut design.', ar: 'باب سور خارجي بتصميم قص ليزر مقاوم.' },
      features: [{ icon: Wind, en: 'Weatherproof', ar: 'مقاوم للجو' }],
      images: ['https://images.unsplash.com/photo-1689516099434-e095034840bc?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']
    },
    {
      id: 'S01',
      categoryId: 1,
      price: 2800,
      name: { en: 'Technical Service Door', ar: 'باب خدمات تقني' },
      description: { en: 'Reinforced steel door for maintenance and technical rooms.', ar: 'باب فولاذي مقوى لغرف الصيانة والتقنية.' },
      features: [{ icon: ShieldCheck, en: 'Reinforced frame', ar: 'إطار مقوى' }],
      images: ['https://images.unsplash.com/photo-1628714957408-2508bc287942?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']
    },

    // --- CATEGORY 2: INTERIOR DOORS (4 Products) ---
    {
      id: 'HF01',
      categoryId: 2,
      price: 5200,
      name: { en: 'Hidden Flash Door', ar: 'باب مخفي فلاش' },
      description: { en: 'Sleek interior door that merges perfectly with the wall.', ar: 'باب داخلي أنيق يندمج تماماً مع الجدران.' },
      features: [{ icon: Layers, en: 'Flush integration', ar: 'تكامل مسطح' }],
      images: ['https://images.unsplash.com/photo-1764600882074-df063c09cc8e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']
    },
    {
      id: 'W01',
      categoryId: 2,
      price: 1850,
      name: { en: 'Classic WPC Door', ar: 'باب WPC كلاسيك' },
      description: { en: 'Waterproof composite door ideal for bathrooms.', ar: 'باب مركب مقاوم للماء مثالي للحمامات.' },
      features: [{ icon: Droplets, en: 'Waterproof', ar: 'مقاوم للماء' }],
      images: ['https://images.unsplash.com/photo-1711959327007-0e545589e5bd?q=80&w=665&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']
    },
    {
      id: 'W02',
      categoryId: 2,
      price: 2100,
      name: { en: 'Textured WPC Door', ar: 'باب WPC بنقشة خشبية' },
      description: { en: 'WPC door with natural wood grain texture.', ar: 'باب WPC بملمس خشب طبيعي.' },
      features: [{ icon: Hammer, en: 'Impact resistant', ar: 'مقاوم للصدمات',  }],
      images: ['https://images.unsplash.com/photo-1591187883094-9862ad89e3f4?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']
    },
    {
      id: 'HF02',
      categoryId: 2,
      price: 5500,
      name: { en: 'Executive Office Door', ar: 'باب فلاش للمكاتب' },
      description: { en: 'Premium hidden door with high sound insulation.', ar: 'باب مخفي فاخر مع عزل صوتي عالي.' },
      features: [{ icon: Zap, en: 'Sound insulation', ar: 'عزل صوتي' }],
      images: ['https://images.unsplash.com/photo-1631300692144-83f10050c180?q=80&w=700&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']
    },

    // --- CATEGORY 3: HANDRAILS (4 Products) ---
    {
      id: 'HR01',
      categoryId: 3,
      price: 850,
      name: { en: 'Wrought Iron Railing', ar: 'درابزين حديد مشغول' },
      description: { en: 'Handcrafted decorative iron railing for internal stairs.', ar: 'درابزين حديد زخرفي مصنوع يدويًا.' },
      features: [{ icon: Construction, en: 'Hand-forged', ar: 'مشغول يدوياً' }],
      images: ['https://images.unsplash.com/photo-1764267369992-a98af1a8846b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']
    },
    {
      id: 'HR03',
      categoryId: 3,
      price: 1100,
      name: { en: 'Glass Railing', ar: 'درابزين زجاجي' },
      description: { en: 'Modern glass panels with stainless steel fixings.', ar: 'ألواح زجاجية حديثة مع مثبتات ستيل.' },
      features: [{ icon: Eye, en: 'Clear view', ar: 'رؤية واضحة' }],
      images: ['https://images.unsplash.com/photo-1762545444269-75ab7fc7cc0a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']
    },
    {
      id: 'HR04',
      categoryId: 3,
      price: 950,
      name: { en: 'Cast Aluminum Railing', ar: 'درابزين ألمنيوم' },
      description: { en: 'Lightweight, rust-free aluminum railing.', ar: 'درابزين ألمنيوم خفيف الوزن وخالي من الصدأ.' },
      features: [{ icon: Wind, en: 'Zero corrosion', ar: 'لا يتآكل' }],
      images: ['https://images.unsplash.com/photo-1559871753-75a00941f6b2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']
    },
    {
      id: 'HR06',
      categoryId: 3,
      price: 750,
      name: { en: 'Minimalist Steel Railing', ar: 'درابزين ستيل بسيط' },
      description: { en: 'Clean horizontal bar railing for a modern look.', ar: 'درابزين قضبان أفقية نظيفة لمظهر عصري.' },
      features: [{ icon: Layers, en: 'Modern lines', ar: 'خطوط عصرية' }],
      images: ['https://images.unsplash.com/photo-1493210977798-4f655ac200a9?q=80&w=952&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']
    },

    // --- CATEGORY 4: PERGOLAS (4 Products) ---
    {
      id: 'PG01',
      categoryId: 4,
      price: 15000,
      name: { en: 'Classic Iron Pergola', ar: 'برغولا حديد كلاسيكية' },
      description: { en: 'Ornate iron structure with UV-resistant fabric.', ar: 'هيكل حديدي مزخرف مع مظلة مقاومة للأشعة.' },
      features: [{ icon: Wind, en: 'High stability', ar: 'ثبات عالٍ' }],
      images: ['https://images.unsplash.com/photo-1649514835644-1d92d0ecb051?q=80&w=1091&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']
    },
    {
      id: 'PG03',
      categoryId: 4,
      price: 18500,
      name: { en: 'Motorized Aluminum Pergola', ar: 'برغولا ألمنيوم بمحرك ' },
      description: { en: 'Modern aluminum pergola with motorized louvers.', ar: 'برغولا ألمنيوم عصرية مع شفرات بمحرك.' },
      features: [{ icon: Zap, en: 'Motorized', ar: 'تحكم كهربائي' }],
      images: ['https://images.unsplash.com/photo-1558725177-79763c6e9014?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']
    },
    {
      id: 'PG05',
      categoryId: 4,
      price: 12000,
      name: { en: 'Eco WPC Pergola', ar: 'برغولا WPC اقتصادية' },
      description: { en: 'Sustainable wood-composite pergola, maintenance free.', ar: 'برغولا خشب مركب لا تحتاج لصيانة.' },
      features: [{ icon: ShieldCheck, en: 'No Maintenance', ar: 'بدون صيانة' }],
      images: ['https://images.unsplash.com/photo-1577670552647-6ce12a463e7d?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']
    },
    {
      id: 'PG07',
      categoryId: 4,
      price: 25000,
      name: { en: 'Garden Retreat Gazebo', ar: 'ملاذ الحديقة' },
      description: { en: 'Large custom structure for luxury garden events.', ar: 'هيكل مخصص كبير للمناسبات الفاخرة.' },
      features: [{ icon: Maximize, en: 'Large coverage', ar: 'تغطية واسعة' }],
      images: ['https://images.unsplash.com/photo-1559871753-75a00941f6b2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']
    }
]