import { SupportedLanguage } from '@/localization/translations';

type LegalDoc = { updated: string; sections: { heading: string; body: string }[] };

export type LegalDocId = 'privacy' | 'terms';

export const LEGAL: Record<SupportedLanguage, Record<LegalDocId, LegalDoc>> = {
  en: {
    privacy: {
      updated: 'Last updated: 12 October 2026',
      sections: [
        {
          heading: 'Who we are',
          body: 'El3amer is a grocery store that takes orders through this app and delivers them to customers near the store. This policy explains what information the app collects, why, and what you can do about it.',
        },
        {
          heading: 'What we collect',
          body: 'Account details: your name, email address and password (stored only as a secure hash). If you sign in with Google, we receive your name, email address and profile picture from Google instead of a password.\n\nDelivery details: your phone number, delivery address and the point you pin on the map.\n\nOrders: the items you buy, prices, totals, payment method, order status and delivery details.',
        },
        {
          heading: 'Location',
          body: 'The app asks for your location only when you tap the button to place your delivery pin at your current position. It is used once to move the pin and is never tracked in the background. You can always place the pin by hand instead.',
        },
        {
          heading: 'How we use it',
          body: 'To create and secure your account, prepare and deliver your orders, contact you about a delivery, check that your address is inside our delivery area, and keep records of sales. We do not sell your information and we do not show ads.',
        },
        {
          heading: 'Who else sees it',
          body: 'Our hosting and database providers store the data on our behalf. Google handles sign-in if you choose it. The map is loaded from OpenStreetMap, whose servers see your device\'s IP address when map tiles are downloaded. Our staff and drivers see the order and delivery details needed to deliver to you. We share information with authorities only when the law requires it.',
        },
        {
          heading: 'On your phone',
          body: 'Your cart, favorites, language and sign-in session are saved on your phone. Signing out clears the cart, favorites and cached orders.',
        },
        {
          heading: 'How long we keep it',
          body: 'We keep your account information for as long as your account is open. If you delete your account, you are signed out and can no longer sign in, but past orders and the contact details on them are kept for our sales and accounting records.',
        },
        {
          heading: 'Your choices',
          body: 'You can view and correct your profile, phone number and address in the app at any time, and delete your account from Settings. For any other request about your data, contact us at the support email shown on the About screen.',
        },
        {
          heading: 'Security',
          body: 'The app talks to our servers over an encrypted connection, and passwords are never stored in readable form. No system is perfectly secure, so please use a password you don\'t use anywhere else.',
        },
        {
          heading: 'Children',
          body: 'The app is not meant for children under 13, and we do not knowingly collect their information.',
        },
        {
          heading: 'Changes',
          body: 'If we change this policy, we will update the date at the top. Important changes will be shown in the app.',
        },
      ],
    },
    terms: {
      updated: 'Last updated: 12 October 2026',
      sections: [
        {
          heading: 'Using the app',
          body: 'By creating an account or placing an order, you agree to these terms. If you don\'t agree, please don\'t use the app.',
        },
        {
          heading: 'Your account',
          body: 'Give us accurate details, including a phone number we can reach you on, and keep your password to yourself. You are responsible for orders placed from your account.',
        },
        {
          heading: 'Delivery area',
          body: 'We only deliver inside the area shown on the map in the app. Orders with a delivery point outside that area cannot be placed.',
        },
        {
          heading: 'Orders and prices',
          body: 'Prices are those shown in the app when you place the order. Everything is subject to availability; if an item runs out, we may cancel the order or the item and let you know.',
        },
        {
          heading: 'Payment',
          body: 'Payment is made on delivery, in cash or by card where offered. Delivery is currently free.',
        },
        {
          heading: 'Cancelling',
          body: 'You can cancel an order from the app while it is pending or confirmed. Once it is out for delivery it can no longer be cancelled.',
        },
        {
          heading: 'Problems with an order',
          body: 'If something is missing, damaged or not what you ordered, contact us as soon as possible using the support email on the About screen and we will make it right.',
        },
        {
          heading: 'Closing your account',
          body: 'You can delete your account from Settings once you have no orders in progress. We may suspend accounts that are used for fraud or abuse.',
        },
        {
          heading: 'Changes and law',
          body: 'We may update these terms and will change the date at the top when we do. These terms are governed by the laws of the Arab Republic of Egypt.',
        },
      ],
    },
  },
  ar: {
    privacy: {
      updated: 'آخر تحديث: 12 أكتوبر 2026',
      sections: [
        {
          heading: 'من نحن',
          body: 'العامر متجر بقالة يستقبل الطلبات من خلال هذا التطبيق ويوصلها للعملاء القريبين من المتجر. توضح هذه السياسة البيانات التي يجمعها التطبيق، وسبب جمعها، وما يمكنك فعله بشأنها.',
        },
        {
          heading: 'البيانات التي نجمعها',
          body: 'بيانات الحساب: اسمك وبريدك الإلكتروني وكلمة المرور (تُحفظ مشفرة فقط). إذا سجلت الدخول بحساب Google، نستلم اسمك وبريدك الإلكتروني وصورة ملفك الشخصي من Google بدلاً من كلمة المرور.\n\nبيانات التوصيل: رقم هاتفك وعنوان التوصيل والنقطة التي تحددها على الخريطة.\n\nالطلبات: المنتجات التي تشتريها والأسعار والإجمالي وطريقة الدفع وحالة الطلب وبيانات التوصيل.',
        },
        {
          heading: 'الموقع',
          body: 'يطلب التطبيق موقعك فقط عندما تضغط زر وضع دبوس التوصيل على موقعك الحالي. يُستخدم مرة واحدة لتحريك الدبوس ولا يتم تتبعك في الخلفية أبداً. ويمكنك دائماً وضع الدبوس يدوياً بدلاً من ذلك.',
        },
        {
          heading: 'كيف نستخدمها',
          body: 'لإنشاء حسابك وحمايته، وتجهيز طلباتك وتوصيلها، والتواصل معك بخصوص التوصيل، والتأكد من أن عنوانك داخل نطاق التوصيل، والاحتفاظ بسجلات المبيعات. نحن لا نبيع بياناتك ولا نعرض إعلانات.',
        },
        {
          heading: 'من يطّلع عليها',
          body: 'مزودو الاستضافة وقواعد البيانات يحفظون البيانات نيابة عنا. تتولى Google تسجيل الدخول إذا اخترته. تُحمَّل الخريطة من OpenStreetMap، وترى خوادمها عنوان IP لجهازك عند تحميل الخريطة. يرى فريقنا والسائقون بيانات الطلب والتوصيل اللازمة لتوصيله إليك. ولا نشارك البيانات مع الجهات الرسمية إلا إذا طلب القانون ذلك.',
        },
        {
          heading: 'على هاتفك',
          body: 'تُحفظ سلة التسوق والمفضلة واللغة وجلسة تسجيل الدخول على هاتفك. تسجيل الخروج يمسح السلة والمفضلة والطلبات المحفوظة مؤقتاً.',
        },
        {
          heading: 'مدة الاحتفاظ',
          body: 'نحتفظ ببيانات حسابك طالما كان حسابك مفتوحاً. إذا حذفت حسابك، يتم تسجيل خروجك ولا يمكنك الدخول به مرة أخرى، لكن نحتفظ بطلباتك السابقة وبيانات التواصل المرتبطة بها في سجلات المبيعات والحسابات.',
        },
        {
          heading: 'اختياراتك',
          body: 'يمكنك عرض وتعديل ملفك الشخصي ورقم هاتفك وعنوانك من التطبيق في أي وقت، وحذف حسابك من الإعدادات. ولأي طلب آخر يخص بياناتك، تواصل معنا عبر بريد الدعم الموجود في صفحة "حول".',
        },
        {
          heading: 'الأمان',
          body: 'يتواصل التطبيق مع خوادمنا عبر اتصال مشفر، ولا تُحفظ كلمات المرور بشكل مقروء أبداً. لا يوجد نظام آمن تماماً، لذا ننصحك باستخدام كلمة مرور لا تستخدمها في أي مكان آخر.',
        },
        {
          heading: 'الأطفال',
          body: 'التطبيق غير موجه للأطفال دون 13 عاماً، ولا نجمع بياناتهم عن قصد.',
        },
        {
          heading: 'التغييرات',
          body: 'إذا غيّرنا هذه السياسة سنحدّث التاريخ في الأعلى، وسنعرض التغييرات المهمة داخل التطبيق.',
        },
      ],
    },
    terms: {
      updated: 'آخر تحديث: 12 أكتوبر 2026',
      sections: [
        {
          heading: 'استخدام التطبيق',
          body: 'بإنشائك حساباً أو تقديمك طلباً فإنك توافق على هذه الشروط. إذا لم توافق عليها، يُرجى عدم استخدام التطبيق.',
        },
        {
          heading: 'حسابك',
          body: 'أدخل بيانات صحيحة، ومنها رقم هاتف يمكننا التواصل معك عليه، ولا تشارك كلمة المرور مع أحد. أنت مسؤول عن الطلبات التي تتم من حسابك.',
        },
        {
          heading: 'نطاق التوصيل',
          body: 'نوصل فقط داخل النطاق الظاهر على الخريطة في التطبيق. لا يمكن تقديم طلب إذا كانت نقطة التوصيل خارج هذا النطاق.',
        },
        {
          heading: 'الطلبات والأسعار',
          body: 'الأسعار هي المعروضة في التطبيق وقت تقديم الطلب. كل المنتجات حسب توفرها؛ وإذا نفد منتج قد نلغي الطلب أو المنتج ونبلغك بذلك.',
        },
        {
          heading: 'الدفع',
          body: 'يتم الدفع عند الاستلام، نقداً أو بالبطاقة إذا كانت متاحة. التوصيل مجاني حالياً.',
        },
        {
          heading: 'الإلغاء',
          body: 'يمكنك إلغاء الطلب من التطبيق طالما كان قيد الانتظار أو مؤكداً. بعد خروجه للتوصيل لا يمكن إلغاؤه.',
        },
        {
          heading: 'مشاكل الطلب',
          body: 'إذا كان هناك منتج ناقص أو تالف أو مختلف عما طلبته، تواصل معنا في أسرع وقت عبر بريد الدعم في صفحة "حول" وسنحل المشكلة.',
        },
        {
          heading: 'إغلاق حسابك',
          body: 'يمكنك حذف حسابك من الإعدادات عندما لا يكون لديك طلبات قيد التنفيذ. وقد نوقف الحسابات المستخدمة في الاحتيال أو الإساءة.',
        },
        {
          heading: 'التعديلات والقانون',
          body: 'قد نحدّث هذه الشروط وسنغيّر التاريخ في الأعلى عند ذلك. تخضع هذه الشروط لقوانين جمهورية مصر العربية.',
        },
      ],
    },
  },
};
