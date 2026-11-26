import type { FAQItem } from '../types';

export const faqItems: FAQItem[] = [
  {
    id: 'rental-purpose',
    category: 'rental',
    question: {
      ru: 'Для чего можно арендовать автомобиль?',
      kk: 'Көлікті қандай мақсатта жалға алуға болады?',
      en: 'What can I rent a car for?',
    },
    answer: {
      ru: 'Автомобили AJLOGIST сдаются для работы в такси, в том числе в Яндекс Go. Актуальное наличие и условия аренды уточняйте перед оформлением.',
      kk: 'AJLOGIST көліктерін таксиде, соның ішінде Яндекс Go қызметінде жұмыс істеу үшін жалға алуға болады. Рәсімдеуге дейін қолжетімділігі мен шарттарын нақтылаңыз.',
      en: 'AJLOGIST cars are rented for taxi work, including Yandex Go. Ask us to confirm current availability and terms before arranging a rental.',
    },
  },
  {
    id: 'platform-connection',
    category: 'rental',
    question: {
      ru: 'Вы подключаете водителей к Яндекс Go?',
      kk: 'Жүргізушілерді Яндекс Go қызметіне қосасыздар ма?',
      en: 'Does AJLOGIST connect drivers to Yandex Go?',
    },
    answer: {
      ru: 'Нет. AJLOGIST сдаёт автомобили в аренду и не подключает водителей к такси. По регистрации и требованиям сервиса обратитесь напрямую в Яндекс Go.',
      kk: 'Жоқ. AJLOGIST көлікті жалға береді, бірақ жүргізушілерді такси қызметіне қоспайды. Тіркелу мен сервис талаптарын Яндекс Go қызметінен нақтылаңыз.',
      en: 'No. AJLOGIST rents cars and does not onboard drivers to taxi services. Contact Yandex Go directly about registration and its requirements.',
    },
  },
  {
    id: 'rental-availability',
    category: 'rental',
    question: {
      ru: 'Как узнать наличие и стоимость аренды?',
      kk: 'Көліктің қолжетімділігі мен жалдау бағасын қалай білуге болады?',
      en: 'How can I check availability and rental cost?',
    },
    answer: {
      ru: 'Позвоните или напишите в WhatsApp. Наличие автомобиля и стоимость аренды уточняются при обращении; цены на сайте не указаны.',
      kk: 'Қоңырау шалыңыз немесе WhatsApp-қа жазыңыз. Көліктің бар-жоғын және жалдау бағасын хабарласқанда нақтылауға болады; сайтта баға көрсетілмеген.',
      en: 'Call or message us on WhatsApp. Ask us about availability and rental cost; prices are not listed on this site.',
    },
  },
  {
    id: 'rental-documents',
    category: 'rental',
    question: {
      ru: 'Какие документы нужны для аренды?',
      kk: 'Жалдау үшін қандай құжаттар қажет?',
      en: 'Which documents are needed to rent a car?',
    },
    answer: {
      ru: 'Требования к документам уточните у AJLOGIST до оформления аренды. Подтверждённый перечень документов на сайте не публикуем.',
      kk: 'Жалдауды рәсімдеуге дейін қажетті құжаттарды AJLOGIST-тен нақтылаңыз. Сайтта расталған құжаттар тізімі жарияланбаған.',
      en: 'Ask AJLOGIST about document requirements before arranging a rental. A confirmed document list is not published on this site.',
    },
  },
  {
    id: 'rental-period',
    category: 'rental',
    question: {
      ru: 'На какой срок можно взять автомобиль?',
      kk: 'Көлікті қандай мерзімге жалға алуға болады?',
      en: 'How long can I rent a car for?',
    },
    answer: {
      ru: 'Срок аренды и остальные условия согласуем при обращении. Фиксированный минимальный срок на сайте не указан.',
      kk: 'Жалдау мерзімі мен басқа шарттарды хабарласқанда келісеміз. Сайтта ең аз мерзім белгіленбеген.',
      en: 'We discuss the rental period and other terms when you contact us. No fixed minimum period is listed on the site.',
    },
  },
  {
    id: 'vehicle-costs',
    category: 'rental',
    question: {
      ru: 'Кто оплачивает обслуживание, страховку и ремонт?',
      kk: 'Көлікке қызмет көрсету, сақтандыру және жөндеу ақысын кім төлейді?',
      en: 'Who pays for maintenance, insurance and repairs?',
    },
    answer: {
      ru: 'Порядок расходов на обслуживание, страхование и ремонт нужно уточнить до аренды. Единые условия по этим расходам на сайте не указаны.',
      kk: 'Қызмет көрсету, сақтандыру және жөндеу шығындарының тәртібін жалдау алдында нақтылау керек. Сайтта ортақ шарттар көрсетілмеген.',
      en: 'Clarify how maintenance, insurance and repair costs are handled before renting. This site does not publish standard terms for those costs.',
    },
  },
  {
    id: 'owner-car',
    category: 'owners',
    question: {
      ru: 'Можно ли передать AJLOGIST свой автомобиль?',
      kk: 'Көлігімді AJLOGIST-ке ұсына аламын ба?',
      en: 'Can I offer my car to AJLOGIST?',
    },
    answer: {
      ru: 'Да. Мы принимаем автомобили владельцев для дальнейшей сдачи в аренду. Напишите или позвоните, чтобы обсудить автомобиль и порядок передачи.',
      kk: 'Иә. Көлік иелерінің автомобильдерін кейін жалға беру үшін қабылдаймыз. Көлік пен оны тапсыру тәртібін талқылау үшін жазыңыз немесе қоңырау шалыңыз.',
      en: 'Yes. We accept cars from owners for rental. Call or message us to discuss the vehicle and handover.',
    },
  },
  {
    id: 'owner-share',
    category: 'owners',
    question: {
      ru: 'Какую долю получает владелец автомобиля?',
      kk: 'Көлік иесі қандай үлес алады?',
      en: 'What share does the vehicle owner receive?',
    },
    answer: {
      ru: 'Долю владельца и порядок сотрудничества согласуем индивидуально до передачи автомобиля. Фиксированная доля на сайте не указана.',
      kk: 'Көлік иесінің үлесі мен жұмыс тәртібін автомобильді тапсырғанға дейін жеке келісеміз. Сайтта тұрақты үлес көрсетілмеген.',
      en: 'We agree on the owner’s share and working terms individually before handover. No fixed share is listed on the site.',
    },
  },
  {
    id: 'owner-costs',
    category: 'owners',
    question: {
      ru: 'Как обсуждаются обслуживание и передача автомобиля владельца?',
      kk: 'Иесінің көлігін тапсыру және оған қызмет көрсету қалай талқыланады?',
      en: 'How are vehicle handover and maintenance discussed with owners?',
    },
    answer: {
      ru: 'Порядок передачи автомобиля, обслуживания и другие условия обсуждаем с владельцем заранее. Уточните детали до начала сотрудничества.',
      kk: 'Көлікті тапсыру тәртібін, оған қызмет көрсетуді және басқа шарттарды иесімен алдын ала талқылаймыз. Ынтымақтастық басталғанға дейін мәліметтерді нақтылаңыз.',
      en: 'We discuss handover, maintenance and other terms with the owner in advance. Confirm the details before working together.',
    },
  },
];
