-- =============================================================
-- seed.sql — Catálogo inicial: 24 ingredientes + 9 recetas de ejemplo.
-- Ejecutar DESPUÉS de 0001_init.sql (SQL Editor del dashboard de Supabase).
-- Los macros son ESTIMACIONES orientativas por porción.
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- Ingredientes (IDs fijos para poder referenciarlos abajo)
-- 00000000-0000-4000-8000-0000000000NN
-- ─────────────────────────────────────────────────────────────
insert into ingredientes (id, nombre, categoria, es_basico, alergenos) values
  ('00000000-0000-4000-8000-000000000001', 'Sal',                'básicos',        true,  '{}'),
  ('00000000-0000-4000-8000-000000000002', 'Agua',               'básicos',        true,  '{}'),
  ('00000000-0000-4000-8000-000000000003', 'Aceite',             'básicos',        true,  '{}'),
  ('00000000-0000-4000-8000-000000000004', 'Pimienta',           'básicos',        true,  '{}'),
  ('00000000-0000-4000-8000-000000000005', 'Huevos',             'frescos',        false, '{huevo}'),
  ('00000000-0000-4000-8000-000000000006', 'Papa',               'verduras',       false, '{}'),
  ('00000000-0000-4000-8000-000000000007', 'Cebolla',            'verduras',       false, '{}'),
  ('00000000-0000-4000-8000-000000000008', 'Tomate',             'verduras',       false, '{}'),
  ('00000000-0000-4000-8000-000000000009', 'Fideos',             'almacén',        false, '{gluten}'),
  ('00000000-0000-4000-8000-000000000010', 'Arroz',              'almacén',        false, '{}'),
  ('00000000-0000-4000-8000-000000000011', 'Pechuga de pollo',   'carnes',         false, '{}'),
  ('00000000-0000-4000-8000-000000000012', 'Queso rallado',      'lácteos',        false, '{lactosa}'),
  ('00000000-0000-4000-8000-000000000013', 'Manteca',            'lácteos',        false, '{lactosa}'),
  ('00000000-0000-4000-8000-000000000014', 'Leche',              'lácteos',        false, '{lactosa}'),
  ('00000000-0000-4000-8000-000000000015', 'Zanahoria',          'verduras',       false, '{}'),
  ('00000000-0000-4000-8000-000000000016', 'Morrón rojo',        'verduras',       false, '{}'),
  ('00000000-0000-4000-8000-000000000017', 'Palta',              'frescos',        false, '{}'),
  ('00000000-0000-4000-8000-000000000018', 'Atún en lata',       'almacén',        false, '{pescado}'),
  ('00000000-0000-4000-8000-000000000019', 'Ajo',                'verduras',       false, '{}'),
  ('00000000-0000-4000-8000-000000000020', 'Pan',                'panadería',      false, '{gluten}'),
  ('00000000-0000-4000-8000-000000000021', 'Banana',             'frescos',        false, '{}'),
  ('00000000-0000-4000-8000-000000000022', 'Avena',              'almacén',        false, '{gluten}'),
  ('00000000-0000-4000-8000-000000000023', 'Yogur natural',      'lácteos',        false, '{lactosa}'),
  ('00000000-0000-4000-8000-000000000024', 'Limón',              'frescos',        false, '{}');

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
     {"orden":2,"texto":"Cuando hierva, tirá los fideos y cocinalos el tiempo del paquete.","tiempo_segundos":480},
     {"orden":3,"texto":"Escalchá reservando media taza del agua de cocción.","tiempo_segundos":null},
     {"orden":4,"texto":"Mezclá los fideos con la manteca, un chorro del agua de cocción y el queso rallado.","tiempo_segundos":null}]',
   'El agua de cocción es el truco: hace que la manteca y el queso se vuelvan una salsita cremosa.',
   '{vegetariano,sin_frutos_secos}',
   '{"calorias":480,"perfil":"carbohidratos","proteinas":17,"carbohidratos":66,"grasas":15}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000103',
   'Wok de verduras con arroz',
   'Colorido, liviano y vegano. Una sola sartén y listo.',
   25, 'facil', 2,
   '[{"orden":1,"texto":"Poné a hervir el arroz con agua y sal (doble volumen de agua que de arroz).","tiempo_segundos":null},
     {"orden":2,"texto":"Cortá la zanahoria, el morrón y la cebolla en tiras.","tiempo_segundos":null},
     {"orden":3,"texto":"En una sartén con aceite a fuego fuerte, salteá primero la zanahoria 3 minutos.","tiempo_segundos":180},
     {"orden":4,"texto":"Sumá morrón y cebolla, salteá 4 minutos más: tienen que quedar crujientes.","tiempo_segundos":240},
     {"orden":5,"texto":"Serví el arroz con las verduras encima, salpimentá y dale un chorrito de aceite.","tiempo_segundos":null}]',
   'Fuego fuerte y sartén bien caliente: si las verduras quedan demasiado en el fondo, se cocinan en su vapor y se ablandan.',
   '{vegano,vegetariano,sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":350,"perfil":"balanceado","proteinas":8,"carbohidratos":60,"grasas":7}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000104',
   'Omelette de queso',
   'El desayuno-cena de emergencia. Diez minutos reales.',
   10, 'cero_cocina', 1,
   '[{"orden":1,"texto":"Batí los huevos con sal y pimienta.","tiempo_segundos":null},
     {"orden":2,"texto":"Calentá una sartén con un chorrito de aceite a fuego medio.","tiempo_segundos":null},
     {"orden":3,"texto":"Volcá los huevos y cuando se arme el borde, agregá el queso en el centro.","tiempo_segundos":120},
     {"orden":4,"texto":"Plegá el omelette por la mitad, dejá 1 minuto más y serví.","tiempo_segundos":60}]',
   'Si te tiembla la mano para plegarlo, no pasa nada: quedan "huevos revueltos con queso", y está igual de rico.',
   '{vegetariano,sin_tacc,sin_frutos_secos}',
   '{"calorias":280,"perfil":"proteínas","proteinas":20,"carbohidratos":2,"grasas":21}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000105',
   'Pechugas a la plancha con zanahorias',
   'Proteína simple y rapida, sin vueltas. Ideal para empezar a cocinar.',
   20, 'facil', 2,
   '[{"orden":1,"texto":"Aplastá las pechugas levemente con el fondo de una olla para que se cocinen parejas.","tiempo_segundos":null},
     {"orden":2,"texto":"Salpimentá y dorá 6 minutos por lado en sartén bien caliente con aceite.","tiempo_segundos":720},
     {"orden":3,"texto":"Sacalas y dejalas reposar tapadas con un plato.","tiempo_segundos":null},
     {"orden":4,"texto":"En la misma sartén, salteá las zanahorias en rodajas 5 minutos.","tiempo_segundos":300}]',
   'No les des vuelta las pechugas cada 2 segundos: dejalas quietas para que se doren bien.',
   '{sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":310,"perfil":"proteínas","proteinas":36,"carbohidratos":10,"grasas":13}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000106',
   'Ensalada de atún y tomate',
   'Cero cocina de verdad: abrí latas, mezclá y a comer.',
   10, 'cero_cocina', 2,
   '[{"orden":1,"texto":"Cortá los tomates en cubos y la cebolla bien chiquita.","tiempo_segundos":null},
     {"orden":2,"texto":"Escalcá el atún y mezclalo con los tomates y la cebolla.","tiempo_segundos":null},
     {"orden":3,"texto":"Aliñá con aceite, sal, pimienta y un chorrito de limón.","tiempo_segundos":null},
     {"orden":4,"texto":"Si querés, sumá el huevo duro en rodajas.","tiempo_segundos":null}]',
   'La cebolla muerde menos si la dejás 5 minutos en agua con un chorrito de vinagre.',
   '{sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":240,"perfil":"proteínas","proteinas":22,"carbohidratos":6,"grasas":13}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000107',
   'Guiso de arroz con pollo',
   'Olla única y rendidora: sobra para el día siguiente.',
   35, 'facil', 4,
   '[{"orden":1,"texto":"Cortá el pollo en pedazos y doralo en la olla con aceite.","tiempo_segundos":360},
     {"orden":2,"texto":"Sumá cebolla, morrón y zanahoria picados, cociná 5 minutos.","tiempo_segundos":300},
     {"orden":3,"texto":"Agregá el tomate picado y el arroz, remové un minuto.","tiempo_segundos":60},
     {"orden":4,"texto":"Cubrí con el doble de agua caliente, salá y cociná tapado a fuego bajo.","tiempo_segundos":900},
     {"orden":5,"texto":"Apagá y dejá reposar 5 minutos antes de servir.","tiempo_segundos":300}]',
   'Si el guiso se seca antes de que el arroz esté tierno, agregá agua caliente de a tazones y seguí cocinando.',
   '{sin_tacc,sin_lactosa,sin_frutos_secos}',
   '{"calorias":390,"perfil":"balanceado","proteinas":27,"carbohidratos":46,"grasas":10}'::jsonb,
   null),

  ('00000000-0000-4000-8000-000000000108',
   'Banana con avena y yogur',
   'Desayuno en 5 minutos sin fuego ni cuchillos afilados.',
   5, 'cero_cocina', 1,
   '[{"orden":1,"texto":"Machacá la banana con un tenedor en un bowl.","tiempo_segundos":null},
     {"orden":2,"texto":"Sumá la avena y el yogur, mezclá bien.","tiempo_segundos":null},
     {"orden":3,"texto":"Dejala reposar 3 minutos para que la avena se ablande.","tiempo_segundos":180}]',
   'Si tenés banana madura (con manchas marrones), queda mucho más dulce y no le hace falta azúcar.',
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
   null);

-- ─────────────────────────────────────────────────────────────
-- Relaciones receta ↔ ingrediente
-- cantidad_base corresponde a porciones_base de la receta.
-- ─────────────────────────────────────────────────────────────
insert into receta_ingredientes (receta_id, ingrediente_id, cantidad_base, unidad, texto_principiante, es_opcional, reemplazo_sugerido) values
  -- Tortilla de papas
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000006', 600, 'g', '4 papas medianas (600 g)', false, null),
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000005', 4, 'unidad', '4 huevos', false, null),
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000007', 1, 'unidad', '1 cebolla mediana', false, '1 cebolla de verdeo (solo la parte blanca)'),
  -- Fideos con manteca y queso
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000009', 200, 'g', 'medio paquete de fideos', false, null),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000013', 30, 'g', 'una nuez de manteca (2 cdas)', false, '3 cdas de aceite de oliva'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000012', 2, 'cda', '2 puñados chicos de queso rallado', false, 'queso cremoso rallado'),
  -- Wok de verduras con arroz
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000010', 1, 'taza', '1 taza de arroz (un puñado generoso)', false, null),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000015', 1, 'unidad', '1 zanahoria', false, null),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000016', 1, 'unidad', '1 morrón', false, null),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000007', 1, 'unidad', '1 cebolla', false, 'cebolla de verdeo'),
  -- Omelette de queso
  ('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000005', 2, 'unidad', '2 huevos', false, null),
  ('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000012', 2, 'cda', '2 cdas de queso rallado', false, '1 feta de queso de máquina'),
  -- Pechugas a la plancha
  ('00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000011', 2, 'unidad', '2 pechugas', false, null),
  ('00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000015', 2, 'unidad', '2 zanahorias', false, null),
  -- Ensalada de atún
  ('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000018', 1, 'unidad', '1 lata de atún', false, null),
  ('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000008', 2, 'unidad', '2 tomates', false, null),
  ('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000007', 0.5, 'unidad', 'media cebolla', false, null),
  ('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000005', 2, 'unidad', '2 huevos duros (opcional)', true, null),
  -- Guiso de arroz con pollo
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000010', 2, 'taza', '2 tazas de arroz', false, null),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000011', 2, 'unidad', '2 pechugas', false, 'muslos de pollo deshuesados'),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000008', 3, 'unidad', '3 tomates', false, '1 lata de tomate triturado'),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000016', 1, 'unidad', '1 morrón', false, null),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000015', 1, 'unidad', '1 zanahoria', false, null),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000007', 1, 'unidad', '1 cebolla', false, null),
  -- Banana con avena y yogur
  ('00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000021', 1, 'unidad', '1 banana madura', false, null),
  ('00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000022', 4, 'cda', '4 cdas de avena', false, null),
  ('00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000023', 1, 'unidad', '1 pote de yogur', false, 'queso crema diluido con un poco de leche'),
  -- Tostada de palta y tomate
  ('00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000020', 2, 'unidad', '2 rodajas de pan', false, null),
  ('00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000017', 1, 'unidad', '1 palta madura (le cede al tacto)', false, null),
  ('00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000008', 1, 'unidad', '1 tomate', false, null),
  ('00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000024', 0.5, 'unidad', 'medio limón', false, null);
