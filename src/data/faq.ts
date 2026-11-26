import type { FAQItem } from '../types';

export const faqItems: FAQItem[] = [
  {
    id: 'rental-work',
    category: 'rental',
    question: {
      ru: 'Для чего можно арендовать автомобиль?',
      kk: 'Көлікті қандай мақсатта жалға алуға болады?',
      en: 'What can I rent a car for?',
    },
    answer: {
      ru: 'Автомобили сдаются в аренду для работы в такси, в том числе в Яндекс Go. Это не означает, что AJLOGIST подключает водителей к таксопарку.',
      kk: 'Көліктер таксиде, соның ішінде Яндекс Go қызметінде жұмыс істеу үшін жалға беріледі. AJLOGIST жүргізушілерді такси паркіне қоспайды.',
      en: 'Cars are available for taxi work, including work with Yandex Go. AJLOGIST does not onboard drivers into a taxi fleet.',
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
      ru: 'Да. Мы принимаем автомобили владельцев для дальнейшей аренды. Порядок передачи и другие условия обсуждаем заранее.',
      kk: 'Иә. Иелердің көліктерін кейін жалға беру үшін қабылдаймыз. Тапсыру тәртібі мен басқа шарттарды алдын ала талқылаймыз.',
      en: 'Yes. We accept cars from owners for rental. We discuss the handover and other terms in advance.',
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
      ru: 'Долю владельца согласуем индивидуально до передачи автомобиля. Фиксированный процент на сайте не указан.',
      kk: 'Иесінің үлесін көлікті тапсырғанға дейін жеке келісеміз. Сайтта белгіленген пайыз көрсетілмейді.',
      en: 'We agree on the owner’s share individually before handover. No fixed percentage is listed on the site.',
    },
  },
  {
    id: 'rental-terms',
    category: 'rental',
    question: {
      ru: 'Где узнать о наличии автомобилей и условиях?',
      kk: 'Көліктердің қолжетімділігі мен шарттарын қайдан білуге болады?',
      en: 'How can I ask about availability and terms?',
    },
    answer: {
      ru: 'Позвоните или напишите нам. Актуальную информацию по автомобилям и условиям сообщим при обращении.',
      kk: 'Қоңырау шалыңыз немесе жазыңыз. Көліктер мен шарттар туралы өзекті ақпаратты хабарласқанда айтамыз.',
      en: 'Call or message us. We will share current vehicle and rental details when you get in touch.',
    },
  },
];
