export const languages = [
    {
        icon: "/icons/usa.png",
        alt: "USA",
        id: "en",
        name: "English",
        font: "font-mono"
    },
    {
        icon: "/icons/ksa.png",
        alt: "KSA",
        id: "ar",
        name: "العربيه",
        font: "font-cairo"
    }
]

export const PRODUCT_FILTERS = {
    materials: [
        { id: "oak", en: "Oak", ar: "بلوط" },
        { id: "beech", en: "Beech", ar: "زان" },
        { id: "walnut", en: "Walnut", ar: "جوز" },
        { id: "mahogany", en: "Mahogany", ar: "ماهوجني" },
        { id: "teak", en: "Teak", ar: "تيك" },
        { id: "steel", en: "Steel", ar: "فولاذ" },
        { id: "iron", en: "Iron", ar: "حديد" },
        { id: "aluminum", en: "Aluminum", ar: "ألمنيوم" },
        { id: "glass", en: "Glass", ar: "زجاج" },
        { id: "pvc", en: "PVC", ar: "بلاستيك" },
        { id: "carbon", en: "Carbon", ar: "كربون" },
    ],
    colors: [
        { code: "#000000", en: "Black", ar: "أسود" },
        { code: "#FFFFFF", en: "White", ar: "أبيض" },
        { code: "#808080", en: "Gray", ar: "رمادي" },
        { code: "#C0C0C0", en: "Silver", ar: "فضي" },
        { code: "#8B4513", en: "Brown", ar: "بني" },
        { code: "#BEBD7F", en: "Beige", ar: "بيج" },
        { code: "#FFD700", en: "Gold", ar: "ذهبي" },
        { code: "#FF0000", en: "Red", ar: "أحمر" },
        { code: "#0000FF", en: "Blue", ar: "أزرق" },
        { code: "#008000", en: "Green", ar: "أخضر" },
        { code: "#FFA500", en: "Orange", ar: "برتقالي" },
        { code: "#FFFF00", en: "Yellow", ar: "أصفر" },
    ],
    price: {
        min: 0,
        max: 50000,
        step: 1000,
    }
}

export const privacy = [
  {
    header: {
      en: "Introduction and Scope",
      ar: "المقدمة والنطاق"
    },
    description: {
      en: "Welcome to the ArtLink Privacy Policy. We are committed to safeguarding your personal data in compliance with the UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection. By using our e-commerce platform to purchase our manufactured doors, you agree to our data practices. We handle your information with the highest level of care and regulatory compliance.",
      ar: "مرحباً بكم في سياسة خصوصية آرت لينك. نحن ملتزمون بحماية بياناتك الشخصية وفقاً للمرسوم بقانون اتحادي رقم 45 لسنة 2021 بشأن حماية البيانات الشخصية. باستخدامك لمنصتنا لشراء الأبواب، فإنك توافق على ممارسات البيانات الخاصة بنا. نحن نتعامل مع معلوماتك بأعلى درجات العناية والامتثال التنظيمي."
    }
  },
  {
    header: {
      en: "Data Controller Identity",
      ar: "هوية مراقب البيانات"
    },
    description: {
      en: "Under the UAE Personal Data Protection Law, ArtLink acts as the Data Controller. We determine the purposes and means of processing your personal data, ensuring all collection and storage mechanisms adhere to UAE Data Office regulations.",
      ar: "بموجب قانون حماية البيانات الشخصية الإماراتي، تعمل آرت لينك كمراقب للبيانات. نحن نحدد أغراض ووسائل معالجة بياناتك، ونضمن التزام جميع آليات الجمع والتخزين بلوائح مكتب بيانات الإمارات."
    }
  },
  {
    header: {
      en: "Categories of Personal Data We Collect",
      ar: "فئات البيانات الشخصية التي نجمعها"
    },
    description: {
      en: "We collect Identity Data (name, email) for authentication, Contact Data (billing, shipping address, phone) to fulfill your door orders, Financial Data (order history, partial payment routing), and Technical Data (IP address, browser details) for platform optimization.",
      ar: "نجمع بيانات الهوية (الاسم، البريد) للمصادقة، وبيانات الاتصال (عناوين الفواتير والشحن، الهاتف) لتنفيذ طلباتك، والبيانات المالية (سجل الطلبات، تفاصيل الدفع الجزئية)، والبيانات الفنية (عنوان IP، تفاصيل المتصفح) لتحسين المنصة."
    }
  },
  {
    header: {
      en: "Lawful Basis for Processing",
      ar: "الأساس القانوني للمعالجة"
    },
    description: {
      en: "We process your data under Article 10 of the UAE PDPL based on Contractual Necessity to deliver your purchases, Legitimate Interests to secure our platform, and Legal Obligations to maintain accurate commercial and tax records in the UAE.",
      ar: "نعالج بياناتك بموجب المادة 10 من القانون بناءً على الضرورة التعاقدية لتسليم مشترياتك، والمصالح المشروعة لتأمين منصتنا، والالتزامات القانونية للاحتفاظ بسجلات تجارية وضريبية دقيقة في الإمارات."
    }
  },
  {
    header: {
      en: "Third-Party Data Processors",
      ar: "معالجو البيانات من الأطراف الثالثة"
    },
    description: {
      en: "We use compliant third-party infrastructure: Clerk for secure authentication, Stripe for payment processing (we do not store raw card data), Convex for our real-time database, and Vercel for hosting and frontend delivery.",
      ar: "نستخدم بنية تحتية تابعة لجهات خارجية ممتثلة: كليرك للمصادقة الآمنة، وسترايب لمعالجة المدفوعات (لا نخزن بيانات البطاقة)، وكونفكس لقاعدة بياناتنا، وفيرسيل للاستضافة."
    }
  },
  {
    header: {
      en: "Cross-Border Data Transfers",
      ar: "عمليات نقل البيانات عبر الحدود"
    },
    description: {
      en: "Your data may be processed on secure servers outside the UAE where our cloud partners operate. We ensure these transfers comply with UAE data sovereignty laws through legally recognized mechanisms like standard contractual clauses.",
      ar: "قد تُعالج بياناتك على خوادم آمنة خارج الإمارات حيث يعمل شركاؤنا. نحن نضمن توافق عمليات النقل هذه مع قوانين سيادة البيانات الإماراتية من خلال آليات معترف بها قانونياً مثل البنود التعاقدية القياسية."
    }
  },
  {
    header: {
      en: "Data Security Measures",
      ar: "التدابير الأمنية للبيانات"
    },
    description: {
      en: "We protect your data using strict technical measures. All data in transit is encrypted via TLS/HTTPS, and persistent records in our database are secured at rest using standard AES-256 encryption.",
      ar: "نحمي بياناتك باستخدام تدابير فنية صارمة. يتم تشفير جميع البيانات أثناء النقل عبر (TLS/HTTPS)، ويتم تأمين السجلات في قاعدة بياناتنا باستخدام تشفير (AES-256) القياسي."
    }
  },
  {
    header: {
      en: "Data Retention",
      ar: "الاحتفاظ بالبيانات"
    },
    description: {
      en: "We retain personal data only as long as necessary. Account data remains until deletion is requested, while finalized transaction and billing records are securely archived for a mandatory minimum of five years to comply with UAE commercial laws.",
      ar: "نحتفظ بالبيانات الشخصية فقط للمدة الضرورية. تبقى بيانات الحساب حتى يُطلب حذفها، بينما تُحفظ سجلات المعاملات والفواتير النهائية لمدة لا تقل عن خمس سنوات للامتثال للقوانين التجارية الإماراتية."
    }
  },
  {
    header: {
      en: "Your Rights Under UAE PDPL",
      ar: "حقوقك بموجب قانون حماية البيانات الشخصية الإماراتي"
    },
    description: {
      en: "Under UAE law, you have the right to access, export, rectify, or erase your personal data. You may also restrict specific processing types or object to automated decision-making and direct marketing.",
      ar: "بموجب القانون الإماراتي، يحق لك الوصول إلى بياناتك أو تصديرها أو تصحيحها أو محوها. يمكنك أيضاً تقييد أنواع معينة من المعالجة أو الاعتراض على اتخاذ القرار الآلي والتسويق المباشر."
    }
  },
  {
    header: {
      en: "Contact Us",
      ar: "اتصل بنا"
    },
    description: {
      en: "To exercise your data rights or clarify any privacy concerns, you can reach out to our Data Protection Officer through our official channels. We will resolve your requests within regulatory timeframes.",
      ar: "لممارسة حقوق البيانات الخاصة بك أو توضيح أي مخاوف تتعلق بالخصوصية، يمكنك التواصل مع مسؤول حماية البيانات لدينا عبر قنواتنا الرسمية. سنقوم بحل طلباتك ضمن الأطر الزمنية التنظيمية."
    }
  }
]

export const terms = [
  {
    header: {
      en: "Agreement to Terms",
      ar: "الموافقة على الشروط"
    },
    description: {
      en: "Welcome to ArtLink. By accessing our platform to browse or purchase our manufactured doors, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our website.",
      ar: "مرحباً بكم في آرت لينك. من خلال الوصول إلى منصتنا لتصفح أو شراء الأبواب المصنعة لدينا، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على أي جزء من هذه الشروط، يجب عليك عدم استخدام موقعنا."
    }
  },
  {
    header: {
      en: "User Accounts and Security",
      ar: "حسابات المستخدمين والأمان"
    },
    description: {
      en: "To make a purchase, you must create an account. You are responsible for maintaining the confidentiality of your login credentials. We utilize Clerk to manage your secure authentication, but any activity under your account remains your sole responsibility.",
      ar: "لإجراء عملية شراء، يجب عليك إنشاء حساب. أنت مسؤول عن الحفاظ على سرية بيانات اعتماد تسجيل الدخول الخاصة بك. نحن نستخدم كليرك لإدارة المصادقة الآمنة الخاصة بك، ولكن أي نشاط يتم تحت حسابك يظل مسؤوليتك وحدك."
    }
  },
  {
    header: {
      en: "Orders and Payments",
      ar: "الطلبات والمدفوعات"
    },
    description: {
      en: "All prices are subject to change. When you place an order for our doors, it constitutes an offer to buy. Payments are processed securely via Stripe. We do not store your full credit card details. We reserve the right to cancel any order for reasons such as inventory shortages or suspected fraud.",
      ar: "جميع الأسعار عرضة للتغيير. عندما تقدم طلباً لشراء أبوابنا، فإن ذلك يشكل عرضاً للشراء. تتم معالجة المدفوعات بشكل آمن عبر سترايب. نحن لا نخزن تفاصيل بطاقتك الائتمانية بالكامل. نحتفظ بالحق في إلغاء أي طلب لأسباب مثل نقص المخزون أو الاشتباه في الاحتيال."
    }
  },
  {
    header: {
      en: "Shipping and Delivery",
      ar: "الشحن والتسليم"
    },
    description: {
      en: "We aim to deliver our manufactured doors within the estimated timeframes provided at checkout. However, delivery dates are not guaranteed. Risk of loss and title for items purchased pass to you upon our delivery to the carrier or your specified delivery address.",
      ar: "نهدف إلى تسليم الأبواب المصنعة لدينا ضمن الأطر الزمنية المقدرة المقدمة عند الدفع. ومع ذلك، تواريخ التسليم غير مضمونة. تنتقل مخاطر الفقدان والملكية للعناصر المشتراة إليك عند تسليمنا للناقل أو عنوان التسليم المحدد الخاص بك."
    }
  },
  {
    header: {
      en: "Returns and Refunds",
      ar: "المرتجعات والمبالغ المستردة"
    },
    description: {
      en: "Due to the custom nature of manufactured doors, returns and refunds are subject to our specific return policy. Please inspect all items upon delivery. Claims for damaged or defective goods must be reported immediately upon receipt.",
      ar: "نظراً للطبيعة المخصصة للأبواب المصنعة، تخضع المرتجعات والمبالغ المستردة لسياسة الإرجاع الخاصة بنا. يرجى فحص جميع العناصر عند التسليم. يجب الإبلاغ عن المطالبات المتعلقة بالبضائع التالفة أو المعيبة فور استلامها."
    }
  },
  {
    header: {
      en: "Platform Use and Restrictions",
      ar: "استخدام المنصة والقيود"
    },
    description: {
      en: "Our platform infrastructure, including our Convex database and Vercel hosting, is designed for normal e-commerce activities. You may not disrupt our services, attempt to reverse engineer our backend, or scrape our data.",
      ar: "تم تصميم البنية التحتية لمنصتنا، بما في ذلك قاعدة بيانات كونفكس واستضافة فيرسيل، لأنشطة التجارة الإلكترونية العادية. لا يجوز لك تعطيل خدماتنا أو محاولة الهندسة العكسية لنظامنا الخلفي أو استخراج بياناتنا."
    }
  },
  {
    header: {
      en: "Limitation of Liability",
      ar: "تحديد المسؤولية"
    },
    description: {
      en: "ArtLink and its affiliates shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform or the purchase of our products. Our total liability is strictly limited to the amount you paid for the specific order in question.",
      ar: "لا تتحمل آرت لينك والشركات التابعة لها المسؤولية عن أي أضرار غير مباشرة أو عرضية أو تبعية ناشئة عن استخدامك للمنصة أو شراء منتجاتنا. تقتصر مسؤوليتنا الإجمالية بشكل صارم على المبلغ الذي دفعته مقابل الطلب المحدد المعني."
    }
  },
  {
    header: {
      en: "Governing Law",
      ar: "القانون المعمول به"
    },
    description: {
      en: "These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of the United Arab Emirates.",
      ar: "تخضع شروط الخدمة هذه وأي اتفاقيات منفصلة نقدم لك بموجبها الخدمات وتفسر وفقاً لقوانين دولة الإمارات العربية المتحدة."
    }
  }
]