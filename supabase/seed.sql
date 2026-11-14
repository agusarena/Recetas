-- =============================================================
-- seed.sql — Catálogo ampliado: 54 ingredientes + 37 recetas.
-- Ejecutar DESPUÉS de 0001_init.sql, 0002_seguridad_e_indices.sql y
-- 0003_reemplazos.sql
-- (SQL Editor del dashboard de Supabase o supabase db reset).
--
-- Todo el archivo corre en UNA transacción: si algo falla, no queda
-- un catálogo a medias (ingresos sin relaciones o viceversa).
--
-- Los IDs son fijos y deterministas, y los inserts son idempotentes
-- (`on conflict do nothing`): se puede volver a correr sin duplicar.
-- Los macros son ESTIMACIONES orientativas por porción.
-- =============================================================

begin;

-- ─────────────────────────────────────────────────────────────
-- Ingredientes (IDs fijos 00000000-0000-4000-8000-0000000000NN)
-- ─────────────────────────────────────────────────────────────
insert into ingredientes (id, nombre, categoria, es_basico, alergenos) values
  ('00000000-0000-4000-8000-000000000001', 'Sal',                         'básicos',   true,  '{}'),
  ('00000000-0000-4000-8000-000000000002', 'Agua',                        'básicos',   true,  '{}'),
  ('00000000-0000-4000-8000-000000000003', 'Aceite',                      'básicos',   true,  '{}'),
  ('00000000-0000-4000-8000-000000000004', 'Pimienta',                    'básicos',   true,  '{}'),
  ('00000000-0000-4000-8000-000000000005', 'Huevos',                      'frescos',   false, '{huevo}'),
  ('00000000-0000-4000-8000-000000000006', 'Papa',                        'verduras',  false, '{}'),
  ('00000000-0000-4000-8000-000000000007', 'Cebolla',                     'verduras',  false, '{}'),
  ('00000000-0000-4000-8000-000000000008', 'Tomate',                      'verduras',  false, '{}'),
  ('00000000-0000-4000-8000-000000000009', 'Fideos',                      'almacén',   false, '{gluten}'),
  ('00000000-0000-4000-8000-000000000010', 'Arroz',                       'almacén',   false, '{}'),
  ('00000000-0000-4000-8000-000000000011', 'Pechuga de pollo',            'carnes',    false, '{}'),
  ('00000000-0000-4000-8000-000000000012', 'Queso rallado',               'lácteos',   false, '{lactosa}'),
  ('00000000-0000-4000-8000-000000000013', 'Manteca',                     'lácteos',   false, '{lactosa}'),
  ('00000000-0000-4000-8000-000000000014', 'Leche',                       'lácteos',   false, '{lactosa}'),
  ('00000000-0000-4000-8000-000000000015', 'Zanahoria',                   'verduras',  false, '{}'),
  ('00000000-0000-4000-8000-000000000016', 'Morrón rojo',                 'verduras',  false, '{}'),
  ('00000000-0000-4000-8000-000000000017', 'Palta',                       'frescos',   false, '{}'),
  ('00000000-0000-4000-8000-000000000018', 'Atún en lata',                'almacén',   false, '{pescado}'),
  ('00000000-0000-4000-8000-000000000019', 'Ajo',                         'verduras',  false, '{}'),
  ('00000000-0000-4000-8000-000000000020', 'Pan',                         'panadería', false, '{gluten}'),
  ('00000000-0000-4000-8000-000000000021', 'Banana',                      'frescos',   false, '{}'),
  ('00000000-0000-4000-8000-000000000022', 'Avena',                       'almacén',   false, '{gluten}'),
  ('00000000-0000-4000-8000-000000000023', 'Yogur natural',               'lácteos',   false, '{lactosa}'),
  ('00000000-0000-4000-8000-000000000024', 'Limón',                       'frescos',   false, '{}'),
  ('00000000-0000-4000-8000-000000000025', 'Carne picada',                'carnes',    false, '{}'),
  ('00000000-0000-4000-8000-000000000026', 'Puré de tomate',              'almacén',   false, '{}'),
  ('00000000-0000-4000-8000-000000000027', 'Lentejas en lata',            'almacén',   false, '{}'),
  ('00000000-0000-4000-8000-000000000028', 'Garbanzos en lata',           'almacén',   false, '{}'),
  ('00000000-0000-4000-8000-000000000029', 'Zapallito verde',             'verduras',  false, '{}'),
  ('00000000-0000-4000-8000-000000000030', 'Calabaza / Anco',             'verduras',  false, '{}'),
  ('00000000-0000-4000-8000-000000000031', 'Espinaca',                    'verduras',  false, '{}'),
  ('00000000-0000-4000-8000-000000000032', 'Orégano',                     'básicos',   true,  '{}'),
  ('00000000-0000-4000-8000-000000000033', 'Pimentón dulce',              'básicos',   true,  '{}'),
  ('00000000-0000-4000-8000-000000000034', 'Harina de trigo',             'almacén',   false, '{gluten}'),
  ('00000000-0000-4000-8000-000000000035', 'Queso cremoso / muzzarella',  'lácteos',   false, '{lactosa}'),
  ('00000000-0000-4000-8000-000000000036', 'Nueces',                      'almacén',   false, '{frutos_secos}'),
  ('00000000-0000-4000-8000-000000000037', 'Manzana',                     'frescos',   false, '{}'),
  ('00000000-0000-4000-8000-000000000038', 'Miel',                        'almacén',   false, '{}'),
  ('00000000-0000-4000-8000-000000000039', 'Choclo en lata',              'almacén',   false, '{}'),
  ('00000000-0000-4000-8000-000000000040', 'Jamón cocido',                'carnes',    false, '{}'),
  -- Ingredientes que existen sobre todo como reemplazo de otro (0003).
  ('00000000-0000-4000-8000-000000000041', 'Cebolla de verdeo',           'verduras',  false, '{}'),
  ('00000000-0000-4000-8000-000000000042', 'Muslos de pollo',             'carnes',    false, '{}'),
  ('00000000-0000-4000-8000-000000000043', 'Queso crema',                 'lácteos',   false, '{lactosa}'),
  ('00000000-0000-4000-8000-000000000044', 'Vinagre',                     'almacén',   false, '{}'),
  ('00000000-0000-4000-8000-000000000045', 'Arvejas en lata',             'almacén',   false, '{}'),
  ('00000000-0000-4000-8000-000000000046', 'Acelga',                      'verduras',  false, '{}'),
  ('00000000-0000-4000-8000-000000000047', 'Maní y almendras',            'almacén',   false, '{frutos_secos}'),
  ('00000000-0000-4000-8000-000000000048', 'Pera',                        'frescos',   false, '{}'),
  -- Nuevos en Fase 2 (00000000-0000-4000-8000-000000000049 a 0054).
  ('00000000-0000-4000-8000-000000000049', 'Polenta',                     'almacén',   false, '{}'),
  ('00000000-0000-4000-8000-000000000050', 'Apio',                        'verduras',  false, '{}'),
  ('00000000-0000-4000-8000-000000000051', 'Caldo en cubito',             'almacén',   false, '{}'),
  ('00000000-0000-4000-8000-000000000052', 'Frutillas',                   'frescos',   false, '{}'),
  ('00000000-0000-4000-8000-000000000053', 'Durazno en lata',             'almacén',   false, '{}'),
  ('00000000-0000-4000-8000-000000000054', 'Dulce de leche',              'almacén',   false, '{lactosa}')
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────
-- Recetas (IDs fijos 00000000-0000-4000-8000-0000000001NN)
-- ─────────────────────────────────────────────────────────────
insert into recetas (id, titulo, descripcion_corta, tiempo_minutos, dificultad, porciones_base, pasos, tip_principiante, etiquetas_dieta, macros_generales, imagen_url) values
  ('00000000-0000-4000-8000-000000000101',
   'Tortilla de papas',
   'La clásica de siempre, con cebolla dorada. Poca técnica, mucho resultado.',
   30, 'facil', 2,
   '[{"orden":1,"texto":"Lavá, pelá y cortá las papas en cubos chicos.","tiempo_segundos":null},
     {"orden":2,"texto":"Herví las papas en agua con sal hasta que estén tiernas (les entra fácil un cuchillo).","tiempo_segundos":600},
     {"orden":3,"texto":"Mientras, batí los huevos en un bowl y mezclá con la cebolla picada.","tiempo_segundos":null},
     {"orden":4,"texto":"Escalchá las papas, mezclalas con los huevos y salpimentá.","tiempo_segundos":null},
     {"orden":5,"texto":"Volcá todo en una sartén con aceite a fuego medio y cociná 5 minutos.","tiempo_segundos":300},
     {"orden":6,"texto":"Dala vuelta con un plato y cociná 4 minutos más del otro lado.","tiempo_segundos":240}]',
   'Para darla vuelta sin drama: poné un plato grande sobre la sartén, agarrá firme con dos manos y girá rápido.',
   '{vegetariano,sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":420,"perfil":"balanceado","proteinas":16,"carbohidratos":44,"grasas":19}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000102',
   'Fideos con manteca y queso',
   'La cena de rescate de 15 minutos. Tres ingredientes, cero misterio.',
   15, 'cero_cocina', 2,
   '[{"orden":1,"texto":"Poné a hervir agua en una olla grande (rellenala hasta la mitad) con un puñado de sal.","tiempo_segundos":null},
     {"orden":2,"texto":"Cuando rompa el hervor, echá los fideos y revolvé una vez para que no se peguen.","tiempo_segundos":null},
     {"orden":3,"texto":"Cociná el tiempo que dice el paquete (generalmente 8 a 10 minutos) y probá uno: tiene que estar tierno pero firme al morder.","tiempo_segundos":540},
     {"orden":4,"texto":"Colá los fideos, devolvelos a la olla caliente, sumá la manteca y mezclá hasta que se derrita.","tiempo_segundos":null},
     {"orden":5,"texto":"Serví en platos hondos y espolvoreá con el queso rallado y pimienta.","tiempo_segundos":null}]',
   'Guardá dos cucharadas del agua antes de colar: si los fideos te quedan secos, ese chorrito emulsiona la manteca y el queso en una crema perfecta.',
   '{vegetariano,sin_frutos_secos}',
   '{"calorias":480,"perfil":"carbohidratos","proteinas":14,"carbohidratos":68,"grasas":16}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000103',
   'Wok exprés de verduras con arroz',
   'Crocante, liviano y con lo que haya en el cajón de la heladera.',
   20, 'facil', 2,
   '[{"orden":1,"texto":"Si no tenés arroz cocido: poné 1 taza de arroz con 2 tazas de agua y una pizca de sal a fuego medio con tapa durante 15 minutos.","tiempo_segundos":900},
     {"orden":2,"texto":"Cortá la zanahoria y el morrón en tiritas finas; la cebolla en pluma.","tiempo_segundos":null},
     {"orden":3,"texto":"Calentá una sartén o wok con 2 cucharadas de aceite a fuego fuerte hasta que humee apenas.","tiempo_segundos":null},
     {"orden":4,"texto":"Tirá las verduras juntas y saltealas moviendo la sartén durante 5 a 7 minutos (tienen que quedar doraditas pero crocantes).","tiempo_segundos":360},
     {"orden":5,"texto":"Salpimentá, serví el arroz en un bowl y coroná con las verduras calientes.","tiempo_segundos":null}]',
   'Fuego bien fuerte y no amontonar las verduras: si las cocinás a fuego bajo se hierven en su propio vapor y pierden lo crocante.',
   '{vegetariano,vegano,sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":340,"perfil":"carbohidratos","proteinas":6,"carbohidratos":62,"grasas":7}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000104',
   'Omelette cremoso de queso',
   'El desayuno proteico o cena ultra rápida que sale en menos de 10 minutos.',
   10, 'cero_cocina', 1,
   '[{"orden":1,"texto":"Rompé los 2 huevos en un bowl, agregá una pizca de sal y pimienta, y batí con un tenedor hasta que no se vean partes transparentes.","tiempo_segundos":null},
     {"orden":2,"texto":"Poné una sartén antiadherente chica a fuego medio con media cucharadita de manteca o unas gotas de aceite.","tiempo_segundos":null},
     {"orden":3,"texto":"Cuando la manteca esté derretida (sin quemarse), volcá los huevos. Con una espátula andá empujando los bordes cocidos hacia el centro para que el huevo líquido baje.","tiempo_segundos":60},
     {"orden":4,"texto":"Cuando la superficie esté casi firme pero todavía húmeda, poné el queso en una mitad.","tiempo_segundos":null},
     {"orden":5,"texto":"Doblá la otra mitad encima con la espátula, apagá el fuego y dejá 30 segundos para que el queso se derrita. Serví de inmediato.","tiempo_segundos":30}]',
   'El fuego nunca al máximo: si la base se dora antes de que el centro cuaje, el omelette queda seco en vez de cremoso.',
   '{vegetariano,sin_tacc,sin_frutos_secos}',
   '{"calorias":260,"perfil":"alto en proteinas","proteinas":17,"carbohidratos":2,"grasas":20}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000105',
   'Pechugas a la plancha con zanahorias doradas',
   'Proteína magra bien dorada por fuera y jugosa adentro, con guarnición dulce natural.',
   20, 'facil', 2,
   '[{"orden":1,"texto":"Cortá las zanahorias en rodajas finas o bastones. Secá las pechugas con papel de cocina y salpimentá de ambos lados.","tiempo_segundos":null},
     {"orden":2,"texto":"Calentá una sartén con una cucharada de aceite a fuego medio. Agregá las zanahorias con una pizca de sal y cocinalas 8 minutos removiendo hasta que estén tiernas y doraditas. Retiralas a un plato.","tiempo_segundos":480},
     {"orden":3,"texto":"En la misma sartén bien caliente, sumá apenas más aceite y poné las pechugas. Cocinalas 5 a 6 minutos sin moverlas para que se doren bien.","tiempo_segundos":330},
     {"orden":4,"texto":"Dalas vuelta y cociná 4 a 5 minutos más hasta que al pincharlas el jugo salga transparente, no rosado.","tiempo_segundos":270},
     {"orden":5,"texto":"Serví el pollo con las zanahorias calientes y unas gotas de limón por encima.","tiempo_segundos":null}]',
   'No muevas la pechuga durante los primeros 4 minutos: si la tocás antes de tiempo se desgarra y pierde el dorado crocante.',
   '{sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":310,"perfil":"alto en proteinas","proteinas":38,"carbohidratos":12,"grasas":11}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000106',
   'Ensalada de atún, tomate y huevo duro',
   'Cero fuego (salvo el huevo), fresca, saciante y lista en 10 minutos.',
   12, 'cero_cocina', 2,
   '[{"orden":1,"texto":"Poné los huevos en un jarrito con agua que los cubra. Llevá a fuego fuerte y, cuando hierva, contá 9 minutos. Pasalos a un bowl con agua fría para frenar la cocción.","tiempo_segundos":540},
     {"orden":2,"texto":"Mientras hierven, lavá y cortá los tomates en cubos medianos; la cebolla en tiritas finas.","tiempo_segundos":null},
     {"orden":3,"texto":"Abrí la lata de atún y escurrí el líquido (aceite o agua).","tiempo_segundos":null},
     {"orden":4,"texto":"Pelá los huevos ya tibios y cortalos al medio o en cuartos.","tiempo_segundos":null},
     {"orden":5,"texto":"En una fuente mezclá tomate, cebolla y atún desmenuzado. Condimentá con sal, pimienta, aceite y unas gotas de limón. Coroná con los huevos duros.","tiempo_segundos":null}]',
   'Para que el huevo duro se pele facilísimo: rompelo golpeando suavemente toda la cáscara y pelalo bajo un chorrito fino de agua de la canilla.',
   '{sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":280,"perfil":"alto en proteinas","proteinas":26,"carbohidratos":8,"grasas":14}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000107',
   'Guisito rápido de arroz, pollo y tomate',
   'Comida de olla en una sola sartén profunda: reconfortante y sin ensuciar de más.',
   35, 'facil', 2,
   '[{"orden":1,"texto":"Cortá las pechugas en cubos del tamaño de un bocado. Picá la cebolla, el morrón y la zanahoria en cubitos chicos. Cortá los tomates en cubos (con jugo y todo).","tiempo_segundos":null},
     {"orden":2,"texto":"En una olla o sartén profunda calentá 2 cucharadas de aceite a fuego fuerte. Dorá el pollo 4 minutos con una pizca de sal.","tiempo_segundos":240},
     {"orden":3,"texto":"Bajá a fuego medio, sumá la cebolla, el morrón y la zanahoria. Cociná 5 minutos hasta que la cebolla se vuelva transparente.","tiempo_segundos":300},
     {"orden":4,"texto":"Agregá los tomates picados y cociná 3 minutos para que suelten jugo.","tiempo_segundos":180},
     {"orden":5,"texto":"Sumá las 2 tazas de arroz, revolvé 1 minuto y agregá 4 tazas de agua caliente con sal y pimienta.","tiempo_segundos":null},
     {"orden":6,"texto":"Bajá el fuego a mínimo, tapá y cociná 15 minutos sin revolver para que el arroz no se pegue. Apagá y dejá reposar 3 minutos tapado antes de servir.","tiempo_segundos":900}]',
   'Regla de oro del arroz de guiso: 2 tazas de agua por cada taza de arroz. Si lo hacés tapado y a fuego mínimo, no se quema nunca.',
   '{sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":520,"perfil":"balanceado","proteinas":42,"carbohidratos":68,"grasas":8}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000108',
   'Bowl de banana, avena y yogur',
   'Desayuno o merienda en 2 minutos sin prender nada. Energía limpia y saciante.',
   5, 'cero_cocina', 1,
   '[{"orden":1,"texto":"Pelá la banana y cortala en rodajas.","tiempo_segundos":null},
     {"orden":2,"texto":"En un bowl serví el pote entero de yogur natural.","tiempo_segundos":null},
     {"orden":3,"texto":"Espolvoreá las 4 cucharadas de avena por encima.","tiempo_segundos":null},
     {"orden":4,"texto":"Acomodá las rodajas de banana. Si te gusta, terminá con una pizca de canela o gotas de miel.","tiempo_segundos":null}]',
   'Si dejás reposar la avena con el yogur 5 minutos antes de comer, la avena se hidrata y queda mucho más suave y cremosa.',
   '{vegetariano,sin_frutos_secos}',
   '{"calorias":330,"perfil":"carbohidratos","proteinas":13,"carbohidratos":56,"grasas":6}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000109',
   'Tostada de palta y tomate',
   'El clásico infalible para cuando no tenés ni hambre ni ganas.',
   10, 'cero_cocina', 2,
   '[{"orden":1,"texto":"Tostá el pan.","tiempo_segundos":null},
     {"orden":2,"texto":"Machacá la palta con un tenedor, con sal y limón.","tiempo_segundos":null},
     {"orden":3,"texto":"Untá la palta en el pan y sumá el tomate en rodajas.","tiempo_segundos":null},
     {"orden":4,"texto":"Terminá con un chorrito de aceite y pimienta.","tiempo_segundos":null}]',
   'El limón no solo da sabor: evita que la palta se ponga marrón.',
   '{vegetariano,sin_lactosa,sin_frutos_secos}',
   '{"calorias":290,"perfil":"grasas buenas","proteinas":8,"carbohidratos":30,"grasas":16}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000110',
   'Fideos con salsa boloñesa exprés',
   'La pasta con carne clásica reconfortante, rápida y llena de sabor.',
   25, 'facil', 2,
   '[{"orden":1,"texto":"Poné a hervir agua con sal en una olla para los fideos.","tiempo_segundos":null},
     {"orden":2,"texto":"En una sartén con aceite, rehogá la cebolla y el ajo picados por 3 minutos.","tiempo_segundos":180},
     {"orden":3,"texto":"Agregá la carne picada desmenuzándola con cuchara de madera hasta que cambie de color.","tiempo_segundos":300},
     {"orden":4,"texto":"Echá el puré de tomate, sal, pimienta y orégano. Bajá el fuego y cociná 10 minutos.","tiempo_segundos":600},
     {"orden":5,"texto":"Cociná los fideos en el agua hirviendo según el paquete (unos 8-9 min). Colá y mezclá con la salsa.","tiempo_segundos":540}]',
   'Si la salsa de tomate te queda un poco ácida, agregale media cucharadita de azúcar.',
   '{sin_lactosa,sin_frutos_secos}',
   '{"calorias":520,"perfil":"alto en proteinas","proteinas":32,"carbohidratos":64,"grasas":14}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000111',
   'Sopa crema de calabaza y zanahoria',
   'Cremosa, tibia y dulce natural. Perfecta para un día frío o cena liviana.',
   25, 'facil', 2,
   '[{"orden":1,"texto":"Pelá y cortá la calabaza y la zanahoria en cubos medianos. Picá la cebolla.","tiempo_segundos":null},
     {"orden":2,"texto":"En una olla rehogá la cebolla con un chorrito de aceite 3 minutos.","tiempo_segundos":180},
     {"orden":3,"texto":"Sumá la calabaza, zanahoria, agua hasta apenas tapar y una cucharadita de sal. Herví tapado hasta que estén blandas.","tiempo_segundos":900},
     {"orden":4,"texto":"Retirá del fuego, procesá o pisá muy bien con pisapapas o minipimer hasta que quede suave. Serví con pimienta.","tiempo_segundos":null}]',
   'Para que quede más cremosa sin lácteos, guardá un poco del agua de cocción antes de pisar y andá agregando de a poco.',
   '{vegetariano,vegano,sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":180,"perfil":"bajo en calorias","proteinas":4,"carbohidratos":34,"grasas":3}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000112',
   'Revuelto de zapallitos con huevo',
   'El salvador de las verduras en heladera: suave, nutritivo y en 15 minutos.',
   15, 'cero_cocina', 2,
   '[{"orden":1,"texto":"Lavá y cortá los zapallitos en cubos chicos (sin pelar). Picá la cebolla.","tiempo_segundos":null},
     {"orden":2,"texto":"En una sartén con aceite, salteá la cebolla 3 minutos hasta que esté transparente.","tiempo_segundos":180},
     {"orden":3,"texto":"Agregá los zapallitos con una pizca de sal y cociná a fuego medio 6 minutos hasta que ablanden y suelten líquido.","tiempo_segundos":360},
     {"orden":4,"texto":"Batí los huevos con sal y pimienta, tiralos a la sartén y revolvé suave hasta que coagulen sin secarse.","tiempo_segundos":120}]',
   'No tapes la sartén mientras se cocinan los zapallitos para que no junten exceso de agua.',
   '{vegetariano,sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":210,"perfil":"balanceado","proteinas":13,"carbohidratos":9,"grasas":13}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000113',
   'Ensalada tibia de lentejas, huevo y tomate',
   'Una bomba proteica y saciante sin prender casi nada la cocina.',
   10, 'cero_cocina', 2,
   '[{"orden":1,"texto":"Abrí la lata de lentejas, enjuagalas bajo la canilla en un colador y escurrilas bien.","tiempo_segundos":null},
     {"orden":2,"texto":"Herví 2 huevos en un jarrito con agua durante 9 minutos para que queden duros.","tiempo_segundos":540},
     {"orden":3,"texto":"Cortá el tomate en cubos y pelá los huevos enfriados en agua fría.","tiempo_segundos":null},
     {"orden":4,"texto":"En un bowl mezclá las lentejas, tomate y huevos en cuartos. Condimentá con aceite, sal y gotas de limón.","tiempo_segundos":null}]',
   'Las legumbres en lata ya vienen cocidas, con solo enjuagarlas para quitar el líquido de conserva están listas para comer.',
   '{vegetariano,sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":340,"perfil":"alto en proteinas","proteinas":19,"carbohidratos":38,"grasas":11}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000114',
   'Hummus casero de garbanzos',
   'Dip cremoso para untar en pan o comer con verduras. Listo en minutos.',
   10, 'cero_cocina', 2,
   '[{"orden":1,"texto":"Enjuagá y escurrí los garbanzos en lata. Guardá 3 cucharadas del líquido por las dudas.","tiempo_segundos":null},
     {"orden":2,"texto":"Colocá los garbanzos en un vaso de minipimer o procesadora con el ajo pelado, jugo de limón, sal y 2 cdas de aceite.","tiempo_segundos":null},
     {"orden":3,"texto":"Procesá hasta lograr una pasta suave. Si está muy espesa, agregá un chorrito de agua o del líquido guardado.","tiempo_segundos":120},
     {"orden":4,"texto":"Serví en un plato hondo con un hilo de aceite y pimentón por arriba.","tiempo_segundos":null}]',
   'Si el ajo crudo te cae pesado, retirale el brote verde del centro antes de procesarlo.',
   '{vegetariano,vegano,sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":260,"perfil":"balanceado","proteinas":9,"carbohidratos":30,"grasas":11}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000115',
   'Arroz salteado con pollo y choclo',
   'El plato ideal para aprovechar arroz que te sobró del día anterior.',
   15, 'facil', 2,
   '[{"orden":1,"texto":"Cortá la pechuga de pollo en cubos chicos y picá la cebolla.","tiempo_segundos":null},
     {"orden":2,"texto":"En una sartén bien caliente con aceite, dorá los cubos de pollo 5 minutos con sal y pimienta.","tiempo_segundos":300},
     {"orden":3,"texto":"Agregá la cebolla y el choclo en lata escurrido, cocinando 3 minutos más.","tiempo_segundos":180},
     {"orden":4,"texto":"Sumá el arroz cocido a la sartén y salteá todo junto 2 minutos mezclando bien para integrar sabores.","tiempo_segundos":120}]',
   'El arroz frío de la heladera se saltea mucho mejor que el recién hecho porque no se pega ni se rompe.',
   '{sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":410,"perfil":"alto en proteinas","proteinas":28,"carbohidratos":48,"grasas":10}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000116',
   'Omelette verde con queso derretido',
   'Nutrición express con espinaca y un centro de queso fundido.',
   10, 'cero_cocina', 1,
   '[{"orden":1,"texto":"Lavá la espinaca, secala y picala groseramente. Cortá el queso en cubitos o fetas.","tiempo_segundos":null},
     {"orden":2,"texto":"En un bowl batí 2 huevos con sal y pimienta, luego integrá la espinaca cruda.","tiempo_segundos":null},
     {"orden":3,"texto":"Calentá una sartén con unas gotas de aceite o manteca y volcá la mezcla a fuego medio-bajo.","tiempo_segundos":180},
     {"orden":4,"texto":"Cuando el huevo empiece a cuajar por arriba, poné el queso en una mitad, doblá la otra mitad encima y esperá 1 minuto a que funda.","tiempo_segundos":60}]',
   'La espinaca no hace falta cocinarla antes: con el mismo calor del omelette se tierniza en segundos.',
   '{vegetariano,sin_tacc,sin_frutos_secos}',
   '{"calorias":280,"perfil":"alto en proteinas","proteinas":18,"carbohidratos":3,"grasas":21}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000117',
   'Panqueques rápidos de avena y banana',
   'Desayuno o merienda dulce saludable con solo 3 ingredientes, sin azúcar agregada.',
   15, 'cero_cocina', 1,
   '[{"orden":1,"texto":"En un bowl pisá bien la banana con un tenedor hasta hacerla puré.","tiempo_segundos":null},
     {"orden":2,"texto":"Agregá el huevo y las 4 cucharadas de avena. Mezclá con tenedor hasta que quede uniforme.","tiempo_segundos":null},
     {"orden":3,"texto":"Calentá una sartén a fuego medio con apenas manteca o aceite. Echá porciones de mezcla formando discos chicos.","tiempo_segundos":120},
     {"orden":4,"texto":"Cuando veas burbujitas en la superficie, dalos vuelta con espátula y cociná 1 minuto más. Serví con miel.","tiempo_segundos":60}]',
   'Hacelos de tamaño chico (tamaño de la palma de la mano) para que sea súper fácil darlos vuelta sin que se quiebren.',
   '{vegetariano,sin_lactosa,sin_frutos_secos}',
   '{"calorias":310,"perfil":"balanceado","proteinas":11,"carbohidratos":46,"grasas":8}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000118',
   'Pechugas a la napolitana en sartén',
   'Clásico bodegón argentino llevado a versión fácil sin horno ni fritura.',
   20, 'facil', 2,
   '[{"orden":1,"texto":"Salpimentá los bifes de pechuga de pollo.","tiempo_segundos":null},
     {"orden":2,"texto":"Dorá el pollo en una sartén con aceite a fuego fuerte 3 minutos por lado.","tiempo_segundos":360},
     {"orden":3,"texto":"Bajá el fuego al mínimo. Colocá sobre cada pechuga una cucharada de puré de tomate y rodajas de queso cremoso.","tiempo_segundos":null},
     {"orden":4,"texto":"Espolvoreá orégano, tapá la sartén y dejá cocinar 4 minutos hasta que el queso se derrita por completo.","tiempo_segundos":240}]',
   'Tapar la sartén es el secreto: el vapor derrite el queso rapidísimo sin quemar la base del pollo.',
   '{sin_tacc,sin_frutos_secos}',
   '{"calorias":390,"perfil":"alto en proteinas","proteinas":42,"carbohidratos":5,"grasas":21}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000119',
   'Tostado completo de jamón y queso',
   'El tostado de cafetería con pan crocante y queso derretido.',
   10, 'cero_cocina', 1,
   '[{"orden":1,"texto":"Armá el sandwich con las 2 rodajas de pan, jamón cocido y queso cremoso en el medio.","tiempo_segundos":null},
     {"orden":2,"texto":"Untá apenas una capa fina de manteca por la cara exterior de los panes.","tiempo_segundos":null},
     {"orden":3,"texto":"Ponelo en una sartén o tostadora a fuego medio-bajo, aplastando suave con una espátula.","tiempo_segundos":180},
     {"orden":4,"texto":"Dalo vuelta cuando esté dorado y tostá del otro lado hasta que el queso empiece a asomar derretido.","tiempo_segundos":180}]',
   'Untar manteca por fuera del pan le da el toque dorado y crocante idéntico al de confitería.',
   '{sin_frutos_secos}',
   '{"calorias":380,"perfil":"balanceado","proteinas":18,"carbohidratos":32,"grasas":19}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000120',
   'Yogur con manzana, nueces y miel',
   'Snack crujiente, dulce y saciante listo en 2 minutos sin cocción.',
   5, 'cero_cocina', 1,
   '[{"orden":1,"texto":"Lavá la manzana y cortala en cubos chicos o láminas finas.","tiempo_segundos":null},
     {"orden":2,"texto":"Serví el yogur en un bowl o vaso hondo.","tiempo_segundos":null},
     {"orden":3,"texto":"Agregá encima la manzana y las nueces picadas con las manos.","tiempo_segundos":null},
     {"orden":4,"texto":"Terminá con un hilo de miel por arriba.","tiempo_segundos":null}]',
   'Podés dejar la cáscara de la manzana para sumar más fibra y textura crujiente.',
   '{vegetariano,sin_tacc}',
   '{"calorias":250,"perfil":"balanceado","proteinas":7,"carbohidratos":36,"grasas":9}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000121',
   'Puré rústico de papa y zapallo',
   'La guarnición más tierna y rendidora que combina con cualquier carne o huevo.',
   25, 'facil', 2,
   '[{"orden":1,"texto":"Pelá y cortá las papas y la calabaza en cubos de tamaño similar para que se cocinen parejos.","tiempo_segundos":null},
     {"orden":2,"texto":"Herví en abundante agua con sal durante 15 minutos hasta que al pincharlos se desarmen.","tiempo_segundos":900},
     {"orden":3,"texto":"Escurrí bien todo el agua y volvé las verduras a la olla caliente.","tiempo_segundos":null},
     {"orden":4,"texto":"Agregá una nuez de manteca, un chorrito de leche tibia, nuez moscada o pimienta y pisá con fuerza hasta obtener la textura deseada.","tiempo_segundos":null}]',
   'Escurrí bien el agua antes de pisar para que el puré no te quede aguado.',
   '{vegetariano,sin_tacc,sin_frutos_secos}',
   '{"calorias":220,"perfil":"carbohidratos","proteinas":4,"carbohidratos":38,"grasas":6}'::jsonb,
   null),

  -- ─────────────────────────────────────────────────────────────
  -- Fase 2 (122 a 137): recetas para las heladeras que menos
  -- resultados útiles tenían (Mínima, Boloñesa, Wok, Fruta).
  -- ─────────────────────────────────────────────────────────────
  ('00000000-0000-4000-8000-000000000122',
   'Papas al horno con huevo',
   'Crocantes por fuera, tiernas adentro y con huevo encima. Todo en una sola bandeja.',
   35, 'facil', 2,
   '[{"orden":1,"texto":"Precalentá el horno a 200 grados.","tiempo_segundos":null},
     {"orden":2,"texto":"Lavá las papas y cortalas en gajos finos (sin pelar si querés más crocante).","tiempo_segundos":null},
     {"orden":3,"texto":"Aliñalas con aceite, sal y pimienta, y estiralas en una sola capa sobre la bandeja.","tiempo_segundos":null},
     {"orden":4,"texto":"Horneá 25 minutos, moviéndolas a mitad de cocción.","tiempo_segundos":1500},
     {"orden":5,"texto":"Mientras, hacé 2 huevos a la sartén y servilos sobre las papas bien calientes.","tiempo_segundos":null}]',
   'Dejá espacio entre los gajos: si se amontonan se cuecen al vapor y no se doren.',
   '{vegetariano,sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":390,"perfil":"balanceado","proteinas":17,"carbohidratos":38,"grasas":18}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000123',
   'Papa al horno con queso y huevo',
   'Papas doradas con queso fundido y un huevo encima. Reconfortante y en una sola bandeja.',
   40, 'facil', 2,
   '[{"orden":1,"texto":"Precalentá el horno a 200 grados y cortá las papas en gajos.","tiempo_segundos":null},
     {"orden":2,"texto":"Aliñalas con aceite, sal y pimentón y horneá 25 minutos hasta que estén doradas.","tiempo_segundos":1500},
     {"orden":3,"texto":"Repartí el queso rallado por encima y quebrá 2 huevos encima, uno por cada porción.","tiempo_segundos":null},
     {"orden":4,"texto":"Volvé al horno 8 minutos hasta que las claras cuajen.","tiempo_segundos":480}]',
   'Sacá la bandeja cuando las claras apenas cuajaron: con el calor residual la yema queda cremosa.',
   '{vegetariano,sin_tacc,sin_frutos_secos}',
   '{"calorias":460,"perfil":"balanceado","proteinas":21,"carbohidratos":41,"grasas":23}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000124',
   'Empanadas de carne al horno',
   'Masa casera hecha en la mesada y relleno de carne picada. Sin fritura.',
   70, 'facil', 4,
   '[{"orden":1,"texto":"Mezclá la harina con agua tibia, sal y 2 cucharadas de aceite hasta formar una masa lisa.","tiempo_segundos":null},
     {"orden":2,"texto":"Tapala con un repasero y dejala reposar 10 minutos.","tiempo_segundos":600},
     {"orden":3,"texto":"Dorá la cebolla en aceite, agregá la carne y cociná 10 minutos a fuego medio con pimentón.","tiempo_segundos":600},
     {"orden":4,"texto":"Estirá la masa sobre la mesada, cortá moldes, rellená y cerrá apretando el borde con un tenedor.","tiempo_segundos":null},
     {"orden":5,"texto":"Horneá a 200 grados 20 minutos o hasta que estén doradas.","tiempo_segundos":1200}]',
   'Si tenés una sola bandeja, horneá de a tandas y guardá las empanadas armadas tapadas para que la masa no se seque.',
   '{sin_lactosa,sin_frutos_secos}',
   '{"calorias":470,"perfil":"balanceado","proteinas":21,"carbohidratos":50,"grasas":21}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000125',
   'Guiso de carne picada con arroz',
   'Carne salteada con tomate y arroz absorbiendo todo el jugo. Una sola olla.',
   35, 'facil', 3,
   '[{"orden":1,"texto":"Dorá la cebolla picada en una olla con aceite durante 3 minutos.","tiempo_segundos":180},
     {"orden":2,"texto":"Agregá la carne y cociná 5 minutos moviéndola con la cuchara para que se desarme.","tiempo_segundos":300},
     {"orden":3,"texto":"Incorporá el puré de tomate, el pimentón y 2 tazas de agua caliente.","tiempo_segundos":null},
     {"orden":4,"texto":"Sumá el arroz, tapá y cociná 15 minutos a fuego bajo sin remover.","tiempo_segundos":900},
     {"orden":5,"texto":"Apagá y dejá reposar 5 minutos tapado antes de servir.","tiempo_segundos":300}]',
   'Tapá la olla y no la toques los últimos 10 minutos: ahí el arroz suelta el almidón y no se pega.',
   '{sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":530,"perfil":"carbohidratos","proteinas":24,"carbohidratos":58,"grasas":19}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000126',
   'Arroz chaufa rápido',
   'El clásico arroz con huevo hecho en 20 minutos con lo que haya en la heladera.',
   20, 'facil', 2,
   '[{"orden":1,"texto":"Picá finamente la cebolla y cortá la pechuga en cubos chicos.","tiempo_segundos":null},
     {"orden":2,"texto":"Dorá el pollo a fuego fuerte 5 minutos hasta que se dore por fuera.","tiempo_segundos":300},
     {"orden":3,"texto":"Sumá la cebolla y el arroz y salteá moviendo seguido 4 minutos.","tiempo_segundos":240},
     {"orden":4,"texto":"Empujá todo a un costado, quebrá los huevos en el espacio libre y revolver hasta que cuajen.","tiempo_segundos":null},
     {"orden":5,"texto":"Mezclá todo, salpimentá y serví de inmediato.","tiempo_segundos":null}]',
   'Usá arroz del día anterior: recién hecho se pega y se rompe al saltear.',
   '{sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":490,"perfil":"carbohidratos","proteinas":26,"carbohidratos":58,"grasas":15}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000127',
   'Arroz saltado con arvejas',
   'Arroz salteado con arvejas de lata: cero complicaciones y listo en minutos.',
   15, 'facil', 2,
   '[{"orden":1,"texto":"Dorá la cebolla y el ajo en aceite a fuego fuerte durante 3 minutos.","tiempo_segundos":180},
     {"orden":2,"texto":"Agregá las arvejas escurridas y salteá 3 minutos más.","tiempo_segundos":180},
     {"orden":3,"texto":"Incorporá el arroz frío y mové sin parar 4 minutos hasta que brille.","tiempo_segundos":240},
     {"orden":4,"texto":"Salpimentá, apagá el fuego y serví bien caliente.","tiempo_segundos":null}]',
   'Escurrí bien las arvejas antes de tirarlas a la sartén: si vienen mojadas bajan la temperatura y dejan de dorarse.',
   '{vegetariano,vegano,sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":400,"perfil":"carbohidratos","proteinas":13,"carbohidratos":72,"grasas":8}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000128',
   'Licuado de pera, yogur y miel',
   'Cremoso, dulce y en dos minutos sin prender nada. Frío o tibio según la hora.',
   5, 'cero_cocina', 1,
   '[{"orden":1,"texto":"Lavá la pera, quitale el corazón y cortala en trozos.","tiempo_segundos":null},
     {"orden":2,"texto":"Poné la pera, el yogur y la miel en la licuadora.","tiempo_segundos":null},
     {"orden":3,"texto":"Licuá 30 segundos hasta que quede homogéneo.","tiempo_segundos":30},
     {"orden":4,"texto":"Probá y endulzá con miel si hace falta.","tiempo_segundos":null}]',
   'Si la pera está muy madura usala de una: endulza sin necesitar tanta miel.',
   '{vegetariano,sin_tacc,sin_frutos_secos}',
   '{"calorias":280,"perfil":"balanceado","proteinas":8,"carbohidratos":52,"grasas":5}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000129',
   'Tostadas de pera con miel',
   'Dulce, crocante y en 5 minutos: pera madura sobre pan tostado.',
   5, 'cero_cocina', 1,
   '[{"orden":1,"texto":"Tostá las rebanadas de pan hasta que queden doradas.","tiempo_segundos":null},
     {"orden":2,"texto":"Cortá la pera en láminas finas.","tiempo_segundos":null},
     {"orden":3,"texto":"Acomodá las láminas sobre el pan caliente.","tiempo_segundos":null},
     {"orden":4,"texto":"Terminá con un hilo de miel y serví de inmediato.","tiempo_segundos":null}]',
   'Elegí una pera bien madura: si está dura se desliza del pan en vez de quedar pegada.',
   '{vegetariano,sin_lactosa,sin_frutos_secos}',
   '{"calorias":260,"perfil":"carbohidratos","proteinas":6,"carbohidratos":46,"grasas":6}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000130',
   'Milanesas de pollo al horno',
   'Crocantes por fuera y jugosas adentro, sin fritura ni olor a aceite en la casa.',
   35, 'facil', 2,
   '[{"orden":1,"texto":"Aplaná las pechugas con un vaso hasta que queden de un centímetro de grosor.","tiempo_segundos":null},
     {"orden":2,"texto":"Batí los huevos con sal y pimienta en un plato hondo.","tiempo_segundos":null},
     {"orden":3,"texto":"Pasá el pollo por el huevo y después por el pan rallado, presionando con la mano.","tiempo_segundos":null},
     {"orden":4,"texto":"Poné las milanesas en una bandeja encharcada de aceite y horneá a 200 grados 20 minutos, dando vuelta a la mitad.","tiempo_segundos":1200}]',
   'Aplaná las pechugas con un vaso: se cocinan parejos y no se seca el centro.',
   '{sin_lactosa,sin_frutos_secos}',
   '{"calorias":430,"perfil":"balanceado","proteinas":39,"carbohidratos":23,"grasas":20}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000131',
   'Ensalada de pollo con palta y tomate',
   'Fresca y proteica, con pollo, palta y tomate. Sin fuego y en 10 minutos.',
   15, 'facil', 2,
   '[{"orden":1,"texto":"Cortá el pollo cocido en tiras (sobras de pollo asado funcionan perfecto).","tiempo_segundos":null},
     {"orden":2,"texto":"Cortá el tomate en gajos y la palta en láminas.","tiempo_segundos":null},
     {"orden":3,"texto":"Mezclá todo con suavidad en un bowl para que la palta no se deshaga.","tiempo_segundos":null},
     {"orden":4,"texto":"Aliñá con aceite, sal y un chorrito de limón recién exprimido.","tiempo_segundos":null}]',
   'Exprimí el limón justo antes de servir: si lo hacés antes la palta se pone marrona.',
   '{sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":420,"perfil":"balanceado","proteinas":32,"carbohidratos":14,"grasas":26}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000132',
   'Sopa de fideos con verduras',
   'Caldo casero con fideos y verduras. Reconfortante en 25 minutos.',
   25, 'facil', 2,
   '[{"orden":1,"texto":"Picá la cebolla y rallá la zanahoria.","tiempo_segundos":null},
     {"orden":2,"texto":"Dorá las verduras en una olla con aceite durante 5 minutos.","tiempo_segundos":300},
     {"orden":3,"texto":"Cubrí todo con agua y herví a fuego medio 8 minutos.","tiempo_segundos":480},
     {"orden":4,"texto":"Sumá los fideos y cociná el tiempo que indique el paquete.","tiempo_segundos":null},
     {"orden":5,"texto":"Apagá, tapá y dejá reposar 2 minutos antes de servir.","tiempo_segundos":120}]',
   'Apagá el fuego y tapá la olla: los fideos siguen cociendo con el calor y no quedan pastosos.',
   '{vegetariano,sin_lactosa,sin_frutos_secos}',
   '{"calorias":350,"perfil":"carbohidratos","proteinas":10,"carbohidratos":56,"grasas":8}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000133',
   'Estofado rápido de pollo',
   'Pollo tierno con papa y zanahorias en su propio jugo. Una sola olla.',
   45, 'facil', 3,
   '[{"orden":1,"texto":"Dorá el pollo por ambos lados 4 minutos y reserve.","tiempo_segundos":240},
     {"orden":2,"texto":"En la misma olla dorá la cebolla, la zanahoria y el ajo 4 minutos.","tiempo_segundos":240},
     {"orden":3,"texto":"Devolvé el pollo, cubrí con agua hasta la mitad y salpimentá.","tiempo_segundos":null},
     {"orden":4,"texto":"Tapá y cociná 30 minutos a fuego bajo hasta que la papa esté tierna.","tiempo_segundos":1800},
     {"orden":5,"texto":"Dejá reposar 5 minutos y serví con el jugo de la cocción.","tiempo_segundos":300}]',
   'Sacá el pollo antes de dorar las verduras y devuélvelo después: queda sellado por fuera y jugoso adentro.',
   '{sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":470,"perfil":"balanceado","proteinas":36,"carbohidratos":28,"grasas":23}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000134',
   'Verduras al horno con papa',
   'Verduras cortadas gruesas y doradas al horno. Guarnición o plato principal.',
   40, 'facil', 2,
   '[{"orden":1,"texto":"Precalentá el horno a 220 grados.","tiempo_segundos":null},
     {"orden":2,"texto":"Cortá la papa, la cebolla y la zanahoria en trozos de tamaño similar.","tiempo_segundos":null},
     {"orden":3,"texto":"Aliñá con aceite, sal, orégano y pimentón.","tiempo_segundos":null},
     {"orden":4,"texto":"Estirá todo en capa única y horneá 30 minutos, moviendo a mitad de cocción.","tiempo_segundos":1800}]',
   'El horno tiene que estar bien caliente desde el inicio: si entra frío la verdura se hierve en vez de dorarse.',
   '{vegetariano,vegano,sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":310,"perfil":"carbohidratos","proteinas":7,"carbohidratos":49,"grasas":11}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000135',
   'Ensalada de garbanzos con tomate y cebolla',
   'Proteína vegetal fría lista en 10 minutos. Aguanta toda la semana en la heladera.',
   10, 'cero_cocina', 2,
   '[{"orden":1,"texto":"Enjuagá los garbanzos hasta que el agua salga clara.","tiempo_segundos":null},
     {"orden":2,"texto":"Picá finamente la cebolla y cortá el tomate en cubos chicos.","tiempo_segundos":null},
     {"orden":3,"texto":"Mezclá todo en un bowl con aceite y sal.","tiempo_segundos":null},
     {"orden":4,"texto":"Dejá reposar 5 minutos para que se aromatice antes de servir.","tiempo_segundos":300}]',
   'Enjuagá los garbanzos bien: con eso se pierde el sabor a lata y quedan suaves.',
   '{vegetariano,vegano,sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":340,"perfil":"balanceado","proteinas":15,"carbohidratos":48,"grasas":9}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000136',
   'Polenta con salsa de carne picada',
   'Polenta cremosa con salsa rápida de carne. Rendidora y reconfortante.',
   30, 'facil', 3,
   '[{"orden":1,"texto":"Dorá la cebolla en aceite durante 3 minutos.","tiempo_segundos":180},
     {"orden":2,"texto":"Agregá la carne y cociná 5 minutos con pimentón.","tiempo_segundos":300},
     {"orden":3,"texto":"Sumá el puré de tomate y cociná la salsa 10 minutos a fuego bajo.","tiempo_segundos":600},
     {"orden":4,"texto":"En otra olla herví agua con sal y tirá la polenta en lluvia removiendo sin parar.","tiempo_segundos":null},
     {"orden":5,"texto":"Cociná 8 minutos a fuego medio hasta que espese, tapando si salpica.","tiempo_segundos":480}]',
   'Tirá la polenta en lluvia y seguí removiendo: si la echás toda junto se forman bolas que no se desarman.',
   '{sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":540,"perfil":"carbohidratos","proteinas":23,"carbohidratos":64,"grasas":20}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000137',
   'Ensalada de frutas con miel y yogur',
   'Fruta de la semana con yogur y miel: fresca, dulce y en 5 minutos.',
   5, 'cero_cocina', 1,
   '[{"orden":1,"texto":"Lavá la fruta y cortá la banana y la manzana en bastones finos.","tiempo_segundos":null},
     {"orden":2,"texto":"Serví el yogur en un bowl o vaso hondo.","tiempo_segundos":null},
     {"orden":3,"texto":"Acomodá la fruta encima.","tiempo_segundos":null},
     {"orden":4,"texto":"Terminá con un hilo de miel.","tiempo_segundos":null}]',
   'Cortá la banana en el último momento: al aire se pone marrona muy rápido.',
   '{vegetariano,sin_tacc,sin_frutos_secos}',
   '{"calorias":300,"perfil":"balanceado","proteinas":9,"carbohidratos":54,"grasas":7}'::jsonb,
   null)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────
-- Relaciones receta ↔ ingrediente
-- cantidad_base corresponde a porciones_base de la receta.
-- ─────────────────────────────────────────────────────────────
insert into receta_ingredientes (receta_id, ingrediente_id, cantidad_base, unidad, texto_principiante, es_opcional, reemplazo_sugerido) values
  -- Tortilla de papas (101)
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000006', 600, 'g', '4 papas medianas (600 g)', false, null),
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000005', 4, 'unidad', '4 huevos', false, null),
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000007', 1, 'unidad', '1 cebolla mediana', false, '1 cebolla de verdeo (solo la parte blanca)'),

  -- Fideos con manteca y queso (102)
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000009', 200, 'g', 'medio paquete de fideos', false, null),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000013', 30, 'g', 'una nuez de manteca (2 cdas)', false, '3 cdas de aceite de oliva'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000012', 2, 'cda', '2 puñados chicos de queso rallado', false, 'queso cremoso rallado'),

  -- Wok de verduras con arroz (103)
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000010', 1, 'taza', '1 taza de arroz (un puñado generoso)', false, null),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000015', 1, 'unidad', '1 zanahoria', false, null),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000016', 1, 'unidad', '1 morrón', false, null),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000007', 1, 'unidad', '1 cebolla', false, 'cebolla de verdeo'),

  -- Omelette de queso (104)
  ('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000005', 2, 'unidad', '2 huevos', false, null),
  ('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000012', 2, 'cda', '2 cdas de queso rallado', false, '1 feta de queso de máquina'),

  -- Pechugas a la plancha (105)
  ('00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000011', 2, 'unidad', '2 pechugas', false, null),
  ('00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000015', 2, 'unidad', '2 zanahorias', false, null),

  -- Ensalada de atún (106)
  ('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000018', 1, 'unidad', '1 lata de atún', false, null),
  ('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000008', 2, 'unidad', '2 tomates', false, null),
  ('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000007', 0.5, 'unidad', 'media cebolla', false, null),
  ('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000005', 2, 'unidad', '2 huevos duros (opcional)', true, null),

  -- Guiso de arroz con pollo (107)
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000010', 2, 'taza', '2 tazas de arroz', false, null),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000011', 2, 'unidad', '2 pechugas', false, 'muslos de pollo deshuesados'),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000008', 3, 'unidad', '3 tomates', false, '1 lata de tomate triturado'),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000016', 1, 'unidad', '1 morrón', false, null),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000015', 1, 'unidad', '1 zanahoria', false, null),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000007', 1, 'unidad', '1 cebolla', false, null),

  -- Banana con avena y yogur (108)
  ('00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000021', 1, 'unidad', '1 banana madura', false, null),
  ('00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000022', 4, 'cda', '4 cdas de avena', false, null),
  ('00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000023', 1, 'unidad', '1 pote de yogur', false, 'queso crema diluido con un poco de leche'),

  -- Tostada de palta y tomate (109)
  ('00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000020', 2, 'unidad', '2 rodajas de pan', false, null),
  ('00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000017', 1, 'unidad', '1 palta madura (le cede al tacto)', false, null),
  ('00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000008', 1, 'unidad', '1 tomate', false, null),
  ('00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000024', 0.5, 'unidad', 'medio limón', false, null),

  -- Fideos con boloñesa exprés (110)
  ('00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000009', 200, 'g', 'medio paquete de fideos', false, null),
  ('00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000025', 250, 'g', 'un cuarto kilo de carne picada', false, 'lentejas cocidas o atún'),
  ('00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000026', 250, 'g', 'media caja de puré de tomate', false, '2 tomates maduros picados'),
  ('00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000007', 1, 'unidad', '1 cebolla chica', false, null),
  ('00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000019', 1, 'unidad', '1 diente de ajo', false, null),

  -- Sopa crema de calabaza y zanahoria (111)
  ('00000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000030', 400, 'g', 'medio anco o calabaza chica', false, null),
  ('00000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000015', 2, 'unidad', '2 zanahorias', false, null),
  ('00000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000007', 1, 'unidad', '1 cebolla', false, null),

  -- Revuelto de zapallitos con huevo (112)
  ('00000000-0000-4000-8000-000000000112', '00000000-0000-4000-8000-000000000029', 2, 'unidad', '2 zapallitos verdes medianos', false, '1 zucchini'),
  ('00000000-0000-4000-8000-000000000112', '00000000-0000-4000-8000-000000000005', 2, 'unidad', '2 huevos', false, null),
  ('00000000-0000-4000-8000-000000000112', '00000000-0000-4000-8000-000000000007', 0.5, 'unidad', 'media cebolla', false, null),

  -- Ensalada tibia de lentejas (113)
  ('00000000-0000-4000-8000-000000000113', '00000000-0000-4000-8000-000000000027', 1, 'unidad', '1 lata de lentejas escurridas', false, 'garbanzos en lata'),
  ('00000000-0000-4000-8000-000000000113', '00000000-0000-4000-8000-000000000005', 2, 'unidad', '2 huevos', false, null),
  ('00000000-0000-4000-8000-000000000113', '00000000-0000-4000-8000-000000000008', 1, 'unidad', '1 tomate', false, null),
  ('00000000-0000-4000-8000-000000000113', '00000000-0000-4000-8000-000000000024', 0.5, 'unidad', 'jugo de medio limón', false, 'un chorrito de vinagre'),

  -- Hummus casero de garbanzos (114)
  ('00000000-0000-4000-8000-000000000114', '00000000-0000-4000-8000-000000000028', 1, 'unidad', '1 lata de garbanzos', false, null),
  ('00000000-0000-4000-8000-000000000114', '00000000-0000-4000-8000-000000000019', 1, 'unidad', '1 diente de ajo chico', false, null),
  ('00000000-0000-4000-8000-000000000114', '00000000-0000-4000-8000-000000000024', 0.5, 'unidad', 'jugo de medio limón', false, null),

  -- Arroz salteado con pollo y choclo (115)
  ('00000000-0000-4000-8000-000000000115', '00000000-0000-4000-8000-000000000010', 1.5, 'taza', '1 taza y media de arroz cocido', false, null),
  ('00000000-0000-4000-8000-000000000115', '00000000-0000-4000-8000-000000000011', 1, 'unidad', '1 pechuga de pollo', false, null),
  ('00000000-0000-4000-8000-000000000115', '00000000-0000-4000-8000-000000000039', 0.5, 'unidad', 'media lata de choclo', false, 'arvejas en lata'),
  ('00000000-0000-4000-8000-000000000115', '00000000-0000-4000-8000-000000000007', 0.5, 'unidad', 'media cebolla', false, null),

  -- Omelette verde con queso (116)
  ('00000000-0000-4000-8000-000000000116', '00000000-0000-4000-8000-000000000005', 2, 'unidad', '2 huevos', false, null),
  ('00000000-0000-4000-8000-000000000116', '00000000-0000-4000-8000-000000000031', 1, 'taza', '1 taza de hojas de espinaca lavadas', false, 'hojas de acelga tierna'),
  ('00000000-0000-4000-8000-000000000116', '00000000-0000-4000-8000-000000000035', 50, 'g', '1 trozo o feta gruesa de queso cremoso', false, 'queso rallado'),

  -- Panqueques de avena y banana (117)
  ('00000000-0000-4000-8000-000000000117', '00000000-0000-4000-8000-000000000021', 1, 'unidad', '1 banana madura', false, null),
  ('00000000-0000-4000-8000-000000000117', '00000000-0000-4000-8000-000000000005', 1, 'unidad', '1 huevo', false, null),
  ('00000000-0000-4000-8000-000000000117', '00000000-0000-4000-8000-000000000022', 4, 'cda', '4 cucharadas de avena', false, null),
  ('00000000-0000-4000-8000-000000000117', '00000000-0000-4000-8000-000000000038', 1, 'cda', '1 cucharada de miel (opcional)', true, null),

  -- Pechugas a la napolitana en sartén (118)
  ('00000000-0000-4000-8000-000000000118', '00000000-0000-4000-8000-000000000011', 2, 'unidad', '2 filetes de pechuga de pollo', false, null),
  ('00000000-0000-4000-8000-000000000118', '00000000-0000-4000-8000-000000000026', 4, 'cda', '4 cucharadas de puré de tomate', false, 'rodajas de tomate natural'),
  ('00000000-0000-4000-8000-000000000118', '00000000-0000-4000-8000-000000000035', 80, 'g', '2 fetas gruesas de queso cremoso o muzzarella', false, null),

  -- Tostado completo de jamón y queso (119)
  ('00000000-0000-4000-8000-000000000119', '00000000-0000-4000-8000-000000000020', 2, 'unidad', '2 rodajas de pan', false, null),
  ('00000000-0000-4000-8000-000000000119', '00000000-0000-4000-8000-000000000040', 2, 'unidad', '2 fetas de jamón cocido', false, null),
  ('00000000-0000-4000-8000-000000000119', '00000000-0000-4000-8000-000000000035', 60, 'g', '2 fetas de queso cremoso o muzzarella', false, null),
  ('00000000-0000-4000-8000-000000000119', '00000000-0000-4000-8000-000000000013', 10, 'g', '1 cucharadita de manteca para dorar', false, 'gotitas de aceite'),

  -- Yogur con manzana, nueces y miel (120)
  ('00000000-0000-4000-8000-000000000120', '00000000-0000-4000-8000-000000000023', 1, 'unidad', '1 pote de yogur natural', false, null),
  ('00000000-0000-4000-8000-000000000120', '00000000-0000-4000-8000-000000000037', 1, 'unidad', '1 manzana mediana', false, 'pera o banana'),
  ('00000000-0000-4000-8000-000000000120', '00000000-0000-4000-8000-000000000036', 1, 'cda', 'un puñadito chico de nueces picadas', false, 'maní o almendras'),
  ('00000000-0000-4000-8000-000000000120', '00000000-0000-4000-8000-000000000038', 1, 'cda', '1 cucharadita de miel', true, null),

  -- Puré rústico de papa y zapallo (121)
  ('00000000-0000-4000-8000-000000000121', '00000000-0000-4000-8000-000000000006', 400, 'g', '3 papas medianas', false, null),
  ('00000000-0000-4000-8000-000000000121', '00000000-0000-4000-8000-000000000030', 300, 'g', '1 trozo de calabaza', false, null),
  ('00000000-0000-4000-8000-000000000121', '00000000-0000-4000-8000-000000000013', 20, 'g', '1 nuez de manteca (1 cda)', false, '2 cdas de aceite'),
  ('00000000-0000-4000-8000-000000000121', '00000000-0000-4000-8000-000000000014', 50, 'ml', 'un chorrito de leche tibia', false, 'agua de cocción'),

  -- Papas al horno con huevo (122)
  ('00000000-0000-4000-8000-000000000122', '00000000-0000-4000-8000-000000000006', 600, 'g', '3 papas medianas en gajos', false, null),
  ('00000000-0000-4000-8000-000000000122', '00000000-0000-4000-8000-000000000005', 2, 'unidad', '2 huevos', false, null),

  -- Papa al horno con queso y huevo (123)
  ('00000000-0000-4000-8000-000000000123', '00000000-0000-4000-8000-000000000006', 700, 'g', '4 papas medianas', false, null),
  ('00000000-0000-4000-8000-000000000123', '00000000-0000-4000-8000-000000000005', 2, 'unidad', '2 huevos', false, null),
  ('00000000-0000-4000-8000-000000000123', '00000000-0000-4000-8000-000000000035', 150, 'g', 'un puñado generoso de muzzarella', false, 'queso rallado'),
  ('00000000-0000-4000-8000-000000000123', '00000000-0000-4000-8000-000000000016', 1, 'unidad', '1 morrón en cubos (opcional)', true, null),

  -- Empanadas de carne al horno (124)
  ('00000000-0000-4000-8000-000000000124', '00000000-0000-4000-8000-000000000034', 300, 'g', '2 tazas de harina (300 g)', false, null),
  ('00000000-0000-4000-8000-000000000124', '00000000-0000-4000-8000-000000000025', 400, 'g', '400 g de carne picada', false, 'lentejas cocidas picadas'),
  ('00000000-0000-4000-8000-000000000124', '00000000-0000-4000-8000-000000000007', 1, 'unidad', '1 cebolla grande', false, null),
  ('00000000-0000-4000-8000-000000000124', '00000000-0000-4000-8000-000000000005', 1, 'unidad', '1 huevo para el repulgue (opcional)', true, null),
  ('00000000-0000-4000-8000-000000000124', '00000000-0000-4000-8000-000000000019', 1, 'unidad', '1 diente de ajo picado (opcional)', true, null),

  -- Guiso de carne picada con arroz (125)
  ('00000000-0000-4000-8000-000000000125', '00000000-0000-4000-8000-000000000025', 300, 'g', '300 g de carne picada', false, 'lentejas cocidas o atún'),
  ('00000000-0000-4000-8000-000000000125', '00000000-0000-4000-8000-000000000010', 1, 'taza', '1 taza de arroz (un puñado generoso)', false, null),
  ('00000000-0000-4000-8000-000000000125', '00000000-0000-4000-8000-000000000007', 1, 'unidad', '1 cebolla mediana', false, null),
  ('00000000-0000-4000-8000-000000000125', '00000000-0000-4000-8000-000000000026', 1, 'unidad', '1 lata de puré de tomate', false, '2 tomates maduros picados'),
  ('00000000-0000-4000-8000-000000000125', '00000000-0000-4000-8000-000000000016', 1, 'unidad', '1 morrón (opcional)', true, null),

  -- Arroz chaufa rápido (126)
  ('00000000-0000-4000-8000-000000000126', '00000000-0000-4000-8000-000000000010', 1, 'taza', '1 taza de arroz del día anterior', false, null),
  ('00000000-0000-4000-8000-000000000126', '00000000-0000-4000-8000-000000000011', 1, 'unidad', '1 pechuga', false, 'muslos de pollo'),
  ('00000000-0000-4000-8000-000000000126', '00000000-0000-4000-8000-000000000007', 1, 'unidad', '1 cebolla chica', false, null),
  ('00000000-0000-4000-8000-000000000126', '00000000-0000-4000-8000-000000000005', 2, 'unidad', '2 huevos', false, null),
  ('00000000-0000-4000-8000-000000000126', '00000000-0000-4000-8000-000000000016', 1, 'unidad', '1 morrón en cubos (opcional)', true, null),

  -- Arroz saltado con arvejas (127)
  ('00000000-0000-4000-8000-000000000127', '00000000-0000-4000-8000-000000000010', 1, 'taza', '1 taza de arroz del día anterior', false, null),
  ('00000000-0000-4000-8000-000000000127', '00000000-0000-4000-8000-000000000045', 1, 'unidad', '1 lata de arvejas', false, '1 lata de choclo'),
  ('00000000-0000-4000-8000-000000000127', '00000000-0000-4000-8000-000000000007', 1, 'unidad', '1 cebolla chica', false, null),
  ('00000000-0000-4000-8000-000000000127', '00000000-0000-4000-8000-000000000019', 1, 'unidad', '1 diente de ajo', false, null),
  ('00000000-0000-4000-8000-000000000127', '00000000-0000-4000-8000-000000000015', 1, 'unidad', '1 zanahoria rallada (opcional)', true, null),

  -- Licuado de pera, yogur y miel (128)
  ('00000000-0000-4000-8000-000000000128', '00000000-0000-4000-8000-000000000048', 1, 'unidad', '1 pera madura', false, '1 manzana'),
  ('00000000-0000-4000-8000-000000000128', '00000000-0000-4000-8000-000000000023', 1, 'unidad', '1 pote chico de yogur (175 g)', false, null),
  ('00000000-0000-4000-8000-000000000128', '00000000-0000-4000-8000-000000000038', 1, 'cda', '1 cucharada de miel', false, null),
  ('00000000-0000-4000-8000-000000000128', '00000000-0000-4000-8000-000000000022', 2, 'cda', '2 cdas de avena (opcional)', true, null),

  -- Tostadas de pera con miel (129)
  ('00000000-0000-4000-8000-000000000129', '00000000-0000-4000-8000-000000000020', 2, 'unidad', '2 rebanadas de pan', false, null),
  ('00000000-0000-4000-8000-000000000129', '00000000-0000-4000-8000-000000000048', 1, 'unidad', '1 pera madura', false, '1 manzana'),
  ('00000000-0000-4000-8000-000000000129', '00000000-0000-4000-8000-000000000038', 1, 'cda', '1 cucharada de miel', false, 'dulce de leche'),
  ('00000000-0000-4000-8000-000000000129', '00000000-0000-4000-8000-000000000043', 1, 'cda', '1 cdita de queso crema (opcional)', true, null),

  -- Milanesas de pollo al horno (130)
  ('00000000-0000-4000-8000-000000000130', '00000000-0000-4000-8000-000000000011', 2, 'unidad', '2 pechugas', false, 'muslos de pollo'),
  ('00000000-0000-4000-8000-000000000130', '00000000-0000-4000-8000-000000000005', 2, 'unidad', '2 huevos', false, null),
  ('00000000-0000-4000-8000-000000000130', '00000000-0000-4000-8000-000000000020', 100, 'g', 'migas de pan (2 rebanadas ralladas)', false, null),
  ('00000000-0000-4000-8000-000000000130', '00000000-0000-4000-8000-000000000019', 1, 'unidad', '1 diente de ajo (opcional)', true, null),

  -- Ensalada de pollo con palta y tomate (131)
  ('00000000-0000-4000-8000-000000000131', '00000000-0000-4000-8000-000000000011', 1, 'unidad', '1 pechuga cocida (o sobras de pollo asado)', false, 'muslos de pollo'),
  ('00000000-0000-4000-8000-000000000131', '00000000-0000-4000-8000-000000000017', 1, 'unidad', '1 palta', false, null),
  ('00000000-0000-4000-8000-000000000131', '00000000-0000-4000-8000-000000000008', 2, 'unidad', '2 tomates', false, null),
  ('00000000-0000-4000-8000-000000000131', '00000000-0000-4000-8000-000000000007', 0.5, 'unidad', 'media cebolla en pluma (opcional)', true, null),
  ('00000000-0000-4000-8000-000000000131', '00000000-0000-4000-8000-000000000024', 1, 'unidad', '1 limón (opcional)', true, null),

  -- Sopa de fideos con verduras (132)
  ('00000000-0000-4000-8000-000000000132', '00000000-0000-4000-8000-000000000009', 200, 'g', 'medio paquete de fideos', false, null),
  ('00000000-0000-4000-8000-000000000132', '00000000-0000-4000-8000-000000000007', 1, 'unidad', '1 cebolla', false, null),
  ('00000000-0000-4000-8000-000000000132', '00000000-0000-4000-8000-000000000015', 1, 'unidad', '1 zanahoria', false, '1 tallo de apio'),
  ('00000000-0000-4000-8000-000000000132', '00000000-0000-4000-8000-000000000050', 1, 'unidad', '1 tallo de apio en rodajas (opcional)', true, null),
  ('00000000-0000-4000-8000-000000000132', '00000000-0000-4000-8000-000000000026', 2, 'cda', '2 cdas de puré de tomate (opcional)', true, null),
  ('00000000-0000-4000-8000-000000000132', '00000000-0000-4000-8000-000000000051', 1, 'unidad', '1 cubito de caldo (opcional)', true, null),

  -- Estofado rápido de pollo (133)
  ('00000000-0000-4000-8000-000000000133', '00000000-0000-4000-8000-000000000011', 2, 'unidad', '2 pechugas', false, 'muslos de pollo'),
  ('00000000-0000-4000-8000-000000000133', '00000000-0000-4000-8000-000000000006', 2, 'unidad', '2 papas medianas', false, null),
  ('00000000-0000-4000-8000-000000000133', '00000000-0000-4000-8000-000000000007', 1, 'unidad', '1 cebolla', false, null),
  ('00000000-0000-4000-8000-000000000133', '00000000-0000-4000-8000-000000000015', 2, 'unidad', '2 zanahorias', false, null),
  ('00000000-0000-4000-8000-000000000133', '00000000-0000-4000-8000-000000000019', 2, 'unidad', '2 dientes de ajo (opcional)', true, null),
  ('00000000-0000-4000-8000-000000000133', '00000000-0000-4000-8000-000000000051', 1, 'unidad', '1 cubito de caldo (opcional)', true, null),

  -- Verduras al horno con papa (134)
  ('00000000-0000-4000-8000-000000000134', '00000000-0000-4000-8000-000000000006', 500, 'g', '3 papas medianas', false, null),
  ('00000000-0000-4000-8000-000000000134', '00000000-0000-4000-8000-000000000007', 1, 'unidad', '1 cebolla', false, null),
  ('00000000-0000-4000-8000-000000000134', '00000000-0000-4000-8000-000000000015', 3, 'unidad', '3 zanahorias', false, null),
  ('00000000-0000-4000-8000-000000000134', '00000000-0000-4000-8000-000000000016', 1, 'unidad', '1 morrón (opcional)', true, null),

  -- Ensalada de garbanzos con tomate y cebolla (135)
  ('00000000-0000-4000-8000-000000000135', '00000000-0000-4000-8000-000000000028', 1, 'unidad', '1 lata de garbanzos', false, '1 lata de lentejas'),
  ('00000000-0000-4000-8000-000000000135', '00000000-0000-4000-8000-000000000008', 2, 'unidad', '2 tomates', false, null),
  ('00000000-0000-4000-8000-000000000135', '00000000-0000-4000-8000-000000000007', 0.5, 'unidad', 'media cebolla', false, null),
  ('00000000-0000-4000-8000-000000000135', '00000000-0000-4000-8000-000000000016', 0.5, 'unidad', 'medio morrón en cubos (opcional)', true, null),
  ('00000000-0000-4000-8000-000000000135', '00000000-0000-4000-8000-000000000044', 1, 'cda', '1 cda de vinagre (opcional)', true, null),

  -- Polenta con salsa de carne picada (136)
  ('00000000-0000-4000-8000-000000000136', '00000000-0000-4000-8000-000000000049', 300, 'g', '300 g de polenta (3 tazas)', false, null),
  ('00000000-0000-4000-8000-000000000136', '00000000-0000-4000-8000-000000000025', 300, 'g', '300 g de carne picada', false, 'lentejas cocidas picadas'),
  ('00000000-0000-4000-8000-000000000136', '00000000-0000-4000-8000-000000000007', 1, 'unidad', '1 cebolla', false, null),
  ('00000000-0000-4000-8000-000000000136', '00000000-0000-4000-8000-000000000026', 1, 'unidad', '1 lata de puré de tomate', false, '2 tomates maduros picados'),
  ('00000000-0000-4000-8000-000000000136', '00000000-0000-4000-8000-000000000012', 2, 'cda', '2 cdas de queso rallado (opcional)', true, null),

  -- Ensalada de frutas con miel y yogur (137)
  ('00000000-0000-4000-8000-000000000137', '00000000-0000-4000-8000-000000000021', 1, 'unidad', '1 banana', false, null),
  ('00000000-0000-4000-8000-000000000137', '00000000-0000-4000-8000-000000000037', 1, 'unidad', '1 manzana', false, 'pera'),
  ('00000000-0000-4000-8000-000000000137', '00000000-0000-4000-8000-000000000023', 1, 'unidad', '1 pote chico de yogur (175 g)', false, null),
  ('00000000-0000-4000-8000-000000000137', '00000000-0000-4000-8000-000000000038', 1, 'cda', '1 cucharada de miel', false, 'dulce de leche'),
  ('00000000-0000-4000-8000-000000000137', '00000000-0000-4000-8000-000000000052', 4, 'unidad', '4 frutillas (opcional)', true, null),
  ('00000000-0000-4000-8000-000000000137', '00000000-0000-4000-8000-000000000053', 1, 'unidad', 'media lata de duraznos (opcional)', true, null),
  ('00000000-0000-4000-8000-000000000137', '00000000-0000-4000-8000-000000000022', 2, 'cda', '2 cdas de avena (opcional)', true, null)
on conflict (receta_id, ingrediente_id) do nothing;

-- ─────────────────────────────────────────────────────────────
-- Reemplazos verificables (0003)
--
-- Vincula el texto de `reemplazo_sugerido` con un ingrediente real para
-- que el motor cuente la receta como completa si el usuario tiene el
-- reemplazo. Es idempotente: se puede correr varias veces.
-- ─────────────────────────────────────────────────────────────
update public.receta_ingredientes as ri
set reemplazo_ingrediente_id = v.reemplazo_id::uuid
from (values
  -- Tortilla: cebolla → cebolla de verdeo
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000041'),
  -- Fideos con manteca y queso: manteca → aceite; queso rallado → queso cremoso
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000003'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000035'),
  -- Wok: cebolla → cebolla de verdeo
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000041'),
  -- Omelette: queso rallado → queso cremoso
  ('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000035'),
  -- Guiso: pollo → muslos; tomate → puré de tomate
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000042'),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000026'),
  -- Banana con avena: yogur → queso crema
  ('00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000023', '00000000-0000-4000-8000-000000000043'),
  -- Boloñesa: carne → lentejas; puré de tomate → tomate
  ('00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000025', '00000000-0000-4000-8000-000000000027'),
  ('00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000026', '00000000-0000-4000-8000-000000000008'),
  -- Ensalada de lentejas: lentejas → garbanzos; limón → vinagre
  ('00000000-0000-4000-8000-000000000113', '00000000-0000-4000-8000-000000000027', '00000000-0000-4000-8000-000000000028'),
  ('00000000-0000-4000-8000-000000000113', '00000000-0000-4000-8000-000000000024', '00000000-0000-4000-8000-000000000044'),
  -- Arroz salteado: choclo → arvejas
  ('00000000-0000-4000-8000-000000000115', '00000000-0000-4000-8000-000000000039', '00000000-0000-4000-8000-000000000045'),
  -- Omelette verde: espinaca → acelga; queso cremoso → queso rallado
  ('00000000-0000-4000-8000-000000000116', '00000000-0000-4000-8000-000000000031', '00000000-0000-4000-8000-000000000046'),
  ('00000000-0000-4000-8000-000000000116', '00000000-0000-4000-8000-000000000035', '00000000-0000-4000-8000-000000000012'),
  -- Napolitana: puré de tomate → tomate
  ('00000000-0000-4000-8000-000000000118', '00000000-0000-4000-8000-000000000026', '00000000-0000-4000-8000-000000000008'),
  -- Tostado: manteca → aceite
  ('00000000-0000-4000-8000-000000000119', '00000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000003'),
  -- Yogur con frutas: manzana → pera; nueces → maní y almendras
  ('00000000-0000-4000-8000-000000000120', '00000000-0000-4000-8000-000000000037', '00000000-0000-4000-8000-000000000048'),
  ('00000000-0000-4000-8000-000000000120', '00000000-0000-4000-8000-000000000036', '00000000-0000-4000-8000-000000000047'),
  -- Puré rústico: manteca → aceite
  ('00000000-0000-4000-8000-000000000121', '00000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000003'),
  -- Fase 2 (122 a 137)
  -- Papa con queso: queso cremoso → queso rallado
  ('00000000-0000-4000-8000-000000000123', '00000000-0000-4000-8000-000000000035', '00000000-0000-4000-8000-000000000012'),
  -- Empanadas y guisos: carne picada → lentejas; puré → tomate fresco
  ('00000000-0000-4000-8000-000000000124', '00000000-0000-4000-8000-000000000025', '00000000-0000-4000-8000-000000000027'),
  ('00000000-0000-4000-8000-000000000125', '00000000-0000-4000-8000-000000000025', '00000000-0000-4000-8000-000000000027'),
  ('00000000-0000-4000-8000-000000000125', '00000000-0000-4000-8000-000000000026', '00000000-0000-4000-8000-000000000008'),
  -- Chaufa y milanesas: pechuga → muslos
  ('00000000-0000-4000-8000-000000000126', '00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000042'),
  ('00000000-0000-4000-8000-000000000130', '00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000042'),
  ('00000000-0000-4000-8000-000000000131', '00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000042'),
  ('00000000-0000-4000-8000-000000000133', '00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000042'),
  -- Arroz saltado: arvejas → choclo
  ('00000000-0000-4000-8000-000000000127', '00000000-0000-4000-8000-000000000045', '00000000-0000-4000-8000-000000000039'),
  -- Postres: pera → manzana; miel → dulce de leche
  ('00000000-0000-4000-8000-000000000128', '00000000-0000-4000-8000-000000000048', '00000000-0000-4000-8000-000000000037'),
  ('00000000-0000-4000-8000-000000000129', '00000000-0000-4000-8000-000000000048', '00000000-0000-4000-8000-000000000037'),
  ('00000000-0000-4000-8000-000000000129', '00000000-0000-4000-8000-000000000038', '00000000-0000-4000-8000-000000000054'),
  ('00000000-0000-4000-8000-000000000137', '00000000-0000-4000-8000-000000000037', '00000000-0000-4000-8000-000000000048'),
  ('00000000-0000-4000-8000-000000000137', '00000000-0000-4000-8000-000000000038', '00000000-0000-4000-8000-000000000054'),
  -- Sopa: zanahoria → apio
  ('00000000-0000-4000-8000-000000000132', '00000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-000000000050'),
  -- Garbanzos → lentejas; polenta: carne → lentejas, puré → tomate
  ('00000000-0000-4000-8000-000000000135', '00000000-0000-4000-8000-000000000028', '00000000-0000-4000-8000-000000000027'),
  ('00000000-0000-4000-8000-000000000136', '00000000-0000-4000-8000-000000000025', '00000000-0000-4000-8000-000000000027'),
  ('00000000-0000-4000-8000-000000000136', '00000000-0000-4000-8000-000000000026', '00000000-0000-4000-8000-000000000008')
) as v(receta_id, ingrediente_id, reemplazo_id)
where ri.receta_id = v.receta_id::uuid
  and ri.ingrediente_id = v.ingrediente_id::uuid
  and ri.reemplazo_ingrediente_id is distinct from v.reemplazo_id::uuid;

commit;
