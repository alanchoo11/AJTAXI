-- Remove the old sample catalog and copy that described driver onboarding.
delete from public.vehicles where is_demo = true;

delete from public.faqs
where question_en in (
  'How do I join the AJ fleet?',
  'Which documents will I need?',
  'Can I reserve a vehicle on the website?',
  'Where can I see prices and deposits?',
  'Should I send documents through the website?',
  'Does the calculator guarantee earnings?'
);

delete from public.site_content
where key in ('home_driver_text','home_calculator_text','drivers_intro','drivers_requirements');

delete from public.site_settings where left(key,11) = 'calculator_';
insert into public.site_settings(key,value) values
  ('whatsapp_number','"77017446622"'::jsonb),
  ('phone','"+77017446622"'::jsonb)
on conflict(key) do update set value=excluded.value,updated_at=now();

insert into public.faqs(category,question_kk,question_ru,question_en,answer_kk,answer_ru,answer_en,sort_order)
select s.category,s.question_kk,s.question_ru,s.question_en,s.answer_kk,s.answer_ru,s.answer_en,s.sort_order
from (values
  ('rental','Көлікті қандай мақсатта жалға алуға болады?','Для чего можно арендовать автомобиль?','What can I rent a car for?','Көліктер таксиде, соның ішінде Яндекс Go қызметінде жұмыс істеу үшін жалға беріледі. Жүргізушілер такси паркіне қосылмайды.','Автомобили сдаются в аренду для работы в такси, в том числе в Яндекс Go. AJLOGIST не подключает водителей к таксопарку.','Cars are available for taxi work, including work with Yandex Go. AJLOGIST does not onboard drivers into a taxi fleet.',1),
  ('owners','Көлігімді AJLOGIST-ке ұсына аламын ба?','Можно ли передать AJLOGIST свой автомобиль?','Can I offer my car to AJLOGIST?','Иә. Иелердің көліктерін кейін жалға беру үшін қабылдаймыз. Тапсыру тәртібі мен шарттарды алдын ала талқылаймыз.','Да. Мы принимаем автомобили владельцев для дальнейшей аренды. Порядок передачи и условия обсуждаем заранее.','Yes. We accept cars from owners for rental. We discuss the handover and terms in advance.',2),
  ('owners','Көлік иесі қандай үлес алады?','Какую долю получает владелец автомобиля?','What share does the vehicle owner receive?','Иесінің үлесін көлікті тапсырғанға дейін жеке келісеміз.','Долю владельца согласуем индивидуально до передачи автомобиля.','We agree on the owner’s share individually before handover.',3),
  ('rental','Көліктердің қолжетімділігі мен шарттарын қайдан білуге болады?','Где узнать о наличии автомобилей и условиях?','How can I ask about availability and terms?','Қоңырау шалыңыз немесе жазыңыз. Өзекті ақпаратты хабарласқанда айтамыз.','Позвоните или напишите нам. Актуальную информацию по автомобилям и условиям сообщим при обращении.','Call or message us. We will share current vehicle and rental details when you get in touch.',4)
) as s(category,question_kk,question_ru,question_en,answer_kk,answer_ru,answer_en,sort_order)
where not exists(select 1 from public.faqs f where f.question_en=s.question_en);
