/**
 * Actividades Económicas - Paraguay
 * Basado en CIIU Rev. 3 adaptado por SET/DNIT
 * Fuente: Clasificador de Actividades Económicas (CAE) - SUACE
 *
 * IMPORTANTE: Este es un subconjunto de las actividades más comunes.
 * Para el catálogo completo y siempre actualizado consultar:
 * https://servicios.set.gov.py/eset-publico/consultarActividadEconomicaIService.do
 */

export const ACTIVIDADES_ECONOMICAS = [
  // ========== A - AGRICULTURA, GANADERÍA, CAZA Y SILVICULTURA ==========
  { codigo: '01111', descripcion: 'Cultivo de cereales', seccion: 'A' },
  { codigo: '01112', descripcion: 'Cultivo de soja', seccion: 'A' },
  { codigo: '01113', descripcion: 'Cultivo de trigo', seccion: 'A' },
  { codigo: '01114', descripcion: 'Cultivo de maíz', seccion: 'A' },
  { codigo: '01115', descripcion: 'Cultivo de arroz', seccion: 'A' },
  { codigo: '01116', descripcion: 'Cultivo de algodón', seccion: 'A' },
  { codigo: '01117', descripcion: 'Cultivo de caña de azúcar', seccion: 'A' },
  { codigo: '01118', descripcion: 'Cultivo de tabaco', seccion: 'A' },
  { codigo: '01120', descripcion: 'Cultivo de hortalizas, legumbres y especialidades hortícolas', seccion: 'A' },
  { codigo: '01130', descripcion: 'Cultivo de frutas, nueces, especias', seccion: 'A' },
  { codigo: '01210', descripcion: 'Cría de ganado bovino', seccion: 'A' },
  { codigo: '01220', descripcion: 'Cría de ovejas, cabras, caballos, asnos, mulas y burdéganos', seccion: 'A' },
  { codigo: '01230', descripcion: 'Cría de cerdos', seccion: 'A' },
  { codigo: '01240', descripcion: 'Cría de aves de corral', seccion: 'A' },
  { codigo: '01250', descripcion: 'Cría de otros animales (apicultura, etc.)', seccion: 'A' },
  { codigo: '01300', descripcion: 'Cultivo de productos agrícolas en combinación con la cría de animales', seccion: 'A' },
  { codigo: '01400', descripcion: 'Actividades de servicios agrícolas y ganaderos', seccion: 'A' },
  { codigo: '01500', descripcion: 'Caza ordinaria y mediante trampas y repoblación de animales de caza', seccion: 'A' },
  { codigo: '02010', descripcion: 'Silvicultura y extracción de madera', seccion: 'A' },
  { codigo: '02020', descripcion: 'Actividades de servicios forestales', seccion: 'A' },

  // ========== B - PESCA ==========
  { codigo: '05010', descripcion: 'Pesca, explotación de criaderos de peces y granjas piscícolas', seccion: 'B' },

  // ========== C - EXPLOTACIÓN DE MINAS Y CANTERAS ==========
  { codigo: '10100', descripcion: 'Extracción y aglomeración de carbón de piedra', seccion: 'C' },
  { codigo: '11100', descripcion: 'Extracción de petróleo crudo y gas natural', seccion: 'C' },
  { codigo: '13100', descripcion: 'Extracción de minerales de hierro', seccion: 'C' },
  { codigo: '14100', descripcion: 'Extracción de piedra, arena y arcilla', seccion: 'C' },
  { codigo: '14200', descripcion: 'Explotación de minas y canteras n.c.p.', seccion: 'C' },

  // ========== D - INDUSTRIAS MANUFACTURERAS ==========
  { codigo: '15111', descripcion: 'Producción, procesamiento y conservación de carne', seccion: 'D' },
  { codigo: '15112', descripcion: 'Matanza de ganado bovino', seccion: 'D' },
  { codigo: '15113', descripcion: 'Producción de aves de corral procesadas', seccion: 'D' },
  { codigo: '15120', descripcion: 'Elaboración y conservación de pescado y productos de pescado', seccion: 'D' },
  { codigo: '15130', descripcion: 'Elaboración y conservación de frutas, legumbres y hortalizas', seccion: 'D' },
  { codigo: '15140', descripcion: 'Elaboración de aceites y grasas de origen vegetal y animal', seccion: 'D' },
  { codigo: '15200', descripcion: 'Elaboración de productos lácteos', seccion: 'D' },
  { codigo: '15310', descripcion: 'Elaboración de productos de molinería', seccion: 'D' },
  { codigo: '15320', descripcion: 'Elaboración de almidones y productos derivados del almidón', seccion: 'D' },
  { codigo: '15330', descripcion: 'Elaboración de alimentos preparados para animales', seccion: 'D' },
  { codigo: '15410', descripcion: 'Elaboración de productos de panadería', seccion: 'D' },
  { codigo: '15420', descripcion: 'Elaboración de azúcar', seccion: 'D' },
  { codigo: '15430', descripcion: 'Elaboración de cacao, chocolate y productos de confitería', seccion: 'D' },
  { codigo: '15440', descripcion: 'Elaboración de macarrones, fideos, alcuzcuz y productos farináceos similares', seccion: 'D' },
  { codigo: '15490', descripcion: 'Elaboración de otros productos alimenticios n.c.p.', seccion: 'D' },
  { codigo: '15510', descripcion: 'Destilación, rectificación y mezcla de bebidas alcohólicas', seccion: 'D' },
  { codigo: '15520', descripcion: 'Elaboración de vinos', seccion: 'D' },
  { codigo: '15530', descripcion: 'Elaboración de bebidas malteadas y de malta (cerveza)', seccion: 'D' },
  { codigo: '15540', descripcion: 'Elaboración de bebidas no alcohólicas; aguas minerales', seccion: 'D' },
  { codigo: '15600', descripcion: 'Elaboración de productos de tabaco', seccion: 'D' },
  { codigo: '17100', descripcion: 'Hilatura, tejedura y acabado de productos textiles', seccion: 'D' },
  { codigo: '18100', descripcion: 'Fabricación de prendas de vestir, excepto prendas de piel', seccion: 'D' },
  { codigo: '19100', descripcion: 'Curtido y adobo de cueros', seccion: 'D' },
  { codigo: '19200', descripcion: 'Fabricación de maletas, bolsos de mano y artículos de talabartería y guarnicionería', seccion: 'D' },
  { codigo: '19300', descripcion: 'Fabricación de calzado', seccion: 'D' },
  { codigo: '20100', descripcion: 'Aserrado y acepilladura de madera', seccion: 'D' },
  { codigo: '20200', descripcion: 'Fabricación de productos de madera, corcho, paja y materiales trenzables', seccion: 'D' },
  { codigo: '21000', descripcion: 'Fabricación de papel y productos de papel', seccion: 'D' },
  { codigo: '22100', descripcion: 'Edición e impresión', seccion: 'D' },
  { codigo: '22200', descripcion: 'Actividades de impresión y servicios relacionados', seccion: 'D' },
  { codigo: '24100', descripcion: 'Fabricación de sustancias químicas básicas', seccion: 'D' },
  { codigo: '24200', descripcion: 'Fabricación de otros productos químicos', seccion: 'D' },
  { codigo: '24300', descripcion: 'Fabricación de fibras manufacturadas', seccion: 'D' },
  { codigo: '25100', descripcion: 'Fabricación de productos de caucho', seccion: 'D' },
  { codigo: '25200', descripcion: 'Fabricación de productos de plástico', seccion: 'D' },
  { codigo: '26100', descripcion: 'Fabricación de vidrio y productos de vidrio', seccion: 'D' },
  { codigo: '26900', descripcion: 'Fabricación de productos minerales no metálicos n.c.p.', seccion: 'D' },
  { codigo: '27100', descripcion: 'Industrias básicas de hierro y acero', seccion: 'D' },
  { codigo: '28100', descripcion: 'Fabricación de productos metálicos para uso estructural', seccion: 'D' },
  { codigo: '28900', descripcion: 'Fabricación de otros productos elaborados de metal', seccion: 'D' },
  { codigo: '29100', descripcion: 'Fabricación de maquinaria de uso general', seccion: 'D' },
  { codigo: '29200', descripcion: 'Fabricación de maquinaria de uso especial', seccion: 'D' },
  { codigo: '31000', descripcion: 'Fabricación de maquinaria y aparatos eléctricos', seccion: 'D' },
  { codigo: '34100', descripcion: 'Fabricación de vehículos automotores', seccion: 'D' },
  { codigo: '36100', descripcion: 'Fabricación de muebles', seccion: 'D' },

  // ========== E - SUMINISTRO DE ELECTRICIDAD, GAS Y AGUA ==========
  { codigo: '40100', descripcion: 'Generación, captación y distribución de energía eléctrica', seccion: 'E' },
  { codigo: '40200', descripcion: 'Fabricación de gas; distribución de combustibles gaseosos por tuberías', seccion: 'E' },
  { codigo: '41000', descripcion: 'Captación, depuración y distribución de agua', seccion: 'E' },

  // ========== F - CONSTRUCCIÓN ==========
  { codigo: '45100', descripcion: 'Preparación del terreno', seccion: 'F' },
  { codigo: '45200', descripcion: 'Construcción de edificios completos y de partes de edificios; obras de ingeniería civil', seccion: 'F' },
  { codigo: '45201', descripcion: 'Construcción de edificios residenciales', seccion: 'F' },
  { codigo: '45202', descripcion: 'Construcción de edificios no residenciales', seccion: 'F' },
  { codigo: '45203', descripcion: 'Construcción de carreteras, calles y caminos', seccion: 'F' },
  { codigo: '45300', descripcion: 'Acondicionamiento de edificios (plomería, instalaciones eléctricas)', seccion: 'F' },
  { codigo: '45400', descripcion: 'Terminación de edificios', seccion: 'F' },
  { codigo: '45500', descripcion: 'Alquiler de equipo de construcción y demolición dotado de operarios', seccion: 'F' },

  // ========== G - COMERCIO AL POR MAYOR Y MENOR ==========
  { codigo: '50100', descripcion: 'Venta de vehículos automotores', seccion: 'G' },
  { codigo: '50200', descripcion: 'Mantenimiento y reparación de vehículos automotores', seccion: 'G' },
  { codigo: '50300', descripcion: 'Venta de partes, piezas y accesorios de vehículos automotores', seccion: 'G' },
  { codigo: '50400', descripcion: 'Venta, mantenimiento y reparación de motocicletas y de sus partes', seccion: 'G' },
  { codigo: '50500', descripcion: 'Venta al por menor de combustibles para automotores', seccion: 'G' },
  { codigo: '51100', descripcion: 'Venta al por mayor a cambio de una retribución o por contrata', seccion: 'G' },
  { codigo: '51210', descripcion: 'Venta al por mayor de materias primas agropecuarias y animales vivos', seccion: 'G' },
  { codigo: '51220', descripcion: 'Venta al por mayor de alimentos, bebidas y tabaco', seccion: 'G' },
  { codigo: '51310', descripcion: 'Venta al por mayor de productos textiles, prendas de vestir y calzado', seccion: 'G' },
  { codigo: '51390', descripcion: 'Venta al por mayor de otros enseres domésticos', seccion: 'G' },
  { codigo: '51410', descripcion: 'Venta al por mayor de combustibles sólidos, líquidos y gaseosos', seccion: 'G' },
  { codigo: '51420', descripcion: 'Venta al por mayor de metales y minerales metalíferos', seccion: 'G' },
  { codigo: '51430', descripcion: 'Venta al por mayor de materiales de construcción, artículos de ferretería', seccion: 'G' },
  { codigo: '51490', descripcion: 'Venta al por mayor de otros productos intermedios, desperdicios y desechos', seccion: 'G' },
  { codigo: '51500', descripcion: 'Venta al por mayor de maquinaria, equipo y materiales', seccion: 'G' },
  { codigo: '51900', descripcion: 'Otros tipos de venta al por mayor', seccion: 'G' },
  { codigo: '52110', descripcion: 'Venta al por menor en almacenes no especializados con surtido compuesto principalmente de alimentos, bebidas y tabaco', seccion: 'G' },
  { codigo: '52190', descripcion: 'Venta al por menor de otros productos en almacenes no especializados', seccion: 'G' },
  { codigo: '52200', descripcion: 'Venta al por menor de alimentos, bebidas y tabaco en almacenes especializados', seccion: 'G' },
  { codigo: '52310', descripcion: 'Venta al por menor de productos farmacéuticos y medicinales (farmacias)', seccion: 'G' },
  { codigo: '52320', descripcion: 'Venta al por menor de productos textiles, prendas de vestir y calzado', seccion: 'G' },
  { codigo: '52330', descripcion: 'Venta al por menor de aparatos, artículos y equipo de uso doméstico', seccion: 'G' },
  { codigo: '52340', descripcion: 'Venta al por menor de artículos de ferretería, pinturas y productos de vidrio', seccion: 'G' },
  { codigo: '52390', descripcion: 'Venta al por menor de otros productos en almacenes especializados', seccion: 'G' },
  { codigo: '52400', descripcion: 'Venta al por menor de artículos usados', seccion: 'G' },
  { codigo: '52500', descripcion: 'Venta al por menor no realizada en almacenes (ferias, mercados, internet)', seccion: 'G' },
  { codigo: '52600', descripcion: 'Reparación de efectos personales y enseres domésticos', seccion: 'G' },

  // ========== H - HOTELES Y RESTAURANTES ==========
  { codigo: '55100', descripcion: 'Hoteles, campamentos y otros tipos de hospedaje temporal', seccion: 'H' },
  { codigo: '55200', descripcion: 'Restaurantes, bares y cantinas', seccion: 'H' },

  // ========== I - TRANSPORTE, ALMACENAMIENTO Y COMUNICACIONES ==========
  { codigo: '60100', descripcion: 'Transporte por vía férrea', seccion: 'I' },
  { codigo: '60210', descripcion: 'Transporte regular de pasajeros por vía terrestre', seccion: 'I' },
  { codigo: '60220', descripcion: 'Otros tipos de transporte por vía terrestre (taxis, remises)', seccion: 'I' },
  { codigo: '60230', descripcion: 'Transporte de carga por carretera', seccion: 'I' },
  { codigo: '61000', descripcion: 'Transporte por vía acuática', seccion: 'I' },
  { codigo: '62000', descripcion: 'Transporte por vía aérea', seccion: 'I' },
  { codigo: '63010', descripcion: 'Manipulación de la carga', seccion: 'I' },
  { codigo: '63020', descripcion: 'Almacenamiento y depósito', seccion: 'I' },
  { codigo: '63030', descripcion: 'Actividades de estaciones de transporte', seccion: 'I' },
  { codigo: '63040', descripcion: 'Actividades de agencias de viajes y organizadores de viajes', seccion: 'I' },
  { codigo: '63090', descripcion: 'Actividades de otras agencias de transporte', seccion: 'I' },
  { codigo: '64100', descripcion: 'Actividades postales y de mensajería', seccion: 'I' },
  { codigo: '64200', descripcion: 'Telecomunicaciones', seccion: 'I' },

  // ========== J - INTERMEDIACIÓN FINANCIERA ==========
  { codigo: '65110', descripcion: 'Banca central', seccion: 'J' },
  { codigo: '65190', descripcion: 'Otros tipos de intermediación monetaria (bancos)', seccion: 'J' },
  { codigo: '65910', descripcion: 'Arrendamiento financiero (leasing)', seccion: 'J' },
  { codigo: '65920', descripcion: 'Otros tipos de crédito (cooperativas, financieras)', seccion: 'J' },
  { codigo: '65990', descripcion: 'Otras actividades de intermediación financiera n.c.p.', seccion: 'J' },
  { codigo: '66010', descripcion: 'Planes de seguros de vida', seccion: 'J' },
  { codigo: '66030', descripcion: 'Planes de seguros generales', seccion: 'J' },
  { codigo: '67110', descripcion: 'Administración de mercados financieros', seccion: 'J' },
  { codigo: '67120', descripcion: 'Corretaje de valores y de contratos de productos básicos', seccion: 'J' },
  { codigo: '67200', descripcion: 'Actividades auxiliares de la financiación de planes de seguros y de pensiones', seccion: 'J' },

  // ========== K - ACTIVIDADES INMOBILIARIAS, EMPRESARIALES Y DE ALQUILER ==========
  { codigo: '70100', descripcion: 'Actividades inmobiliarias realizadas con bienes propios o arrendados', seccion: 'K' },
  { codigo: '70200', descripcion: 'Actividades inmobiliarias realizadas a cambio de una retribución o por contrata', seccion: 'K' },
  { codigo: '71110', descripcion: 'Alquiler de equipo de transporte por vía terrestre', seccion: 'K' },
  { codigo: '71210', descripcion: 'Alquiler de otros tipos de maquinaria y equipo', seccion: 'K' },
  { codigo: '71300', descripcion: 'Alquiler de efectos personales y enseres domésticos', seccion: 'K' },
  { codigo: '72100', descripcion: 'Consultores en equipo de informática (hardware)', seccion: 'K' },
  { codigo: '72200', descripcion: 'Consultores en programas de informática y suministro de programas de informática', seccion: 'K' },
  { codigo: '72300', descripcion: 'Procesamiento de datos', seccion: 'K' },
  { codigo: '72400', descripcion: 'Actividades relacionadas con bases de datos', seccion: 'K' },
  { codigo: '72500', descripcion: 'Mantenimiento y reparación de maquinaria de oficina, contabilidad e informática', seccion: 'K' },
  { codigo: '72900', descripcion: 'Otras actividades de informática', seccion: 'K' },
  { codigo: '73100', descripcion: 'Investigaciones y desarrollo experimental en el campo de las ciencias naturales y la ingeniería', seccion: 'K' },
  { codigo: '73200', descripcion: 'Investigaciones y desarrollo experimental en el campo de las ciencias sociales y las humanidades', seccion: 'K' },
  { codigo: '74110', descripcion: 'Actividades jurídicas (abogados, notarios, escribanos)', seccion: 'K' },
  { codigo: '74120', descripcion: 'Actividades de contabilidad, teneduría de libros y auditoría; asesoramiento en materia de impuestos', seccion: 'K' },
  { codigo: '74130', descripcion: 'Investigación y seguridad', seccion: 'K' },
  { codigo: '74140', descripcion: 'Actividades de asesoramiento empresarial y en materia de gestión', seccion: 'K' },
  { codigo: '74210', descripcion: 'Actividades de arquitectura e ingeniería y actividades conexas de asesoramiento técnico', seccion: 'K' },
  { codigo: '74220', descripcion: 'Ensayos y análisis técnicos', seccion: 'K' },
  { codigo: '74300', descripcion: 'Publicidad', seccion: 'K' },
  { codigo: '74910', descripcion: 'Obtención y dotación de personal', seccion: 'K' },
  { codigo: '74920', descripcion: 'Actividades de investigación y seguridad', seccion: 'K' },
  { codigo: '74930', descripcion: 'Actividades de limpieza de edificios', seccion: 'K' },
  { codigo: '74940', descripcion: 'Actividades de fotografía', seccion: 'K' },
  { codigo: '74950', descripcion: 'Actividades de envase y empaque', seccion: 'K' },
  { codigo: '74990', descripcion: 'Otras actividades empresariales n.c.p.', seccion: 'K' },

  // ========== L - ADMINISTRACIÓN PÚBLICA Y DEFENSA ==========
  { codigo: '75110', descripcion: 'Actividades de la administración pública en general', seccion: 'L' },
  { codigo: '75120', descripcion: 'Regulación de las actividades de organismos que prestan servicios sanitarios, educativos, culturales y otros servicios sociales', seccion: 'L' },

  // ========== M - ENSEÑANZA ==========
  { codigo: '80100', descripcion: 'Enseñanza preescolar y primaria', seccion: 'M' },
  { codigo: '80210', descripcion: 'Enseñanza secundaria general', seccion: 'M' },
  { codigo: '80220', descripcion: 'Enseñanza secundaria técnica y profesional', seccion: 'M' },
  { codigo: '80300', descripcion: 'Enseñanza superior (universidades, institutos)', seccion: 'M' },
  { codigo: '80900', descripcion: 'Enseñanza de adultos y otros tipos de enseñanza (cursos, capacitaciones)', seccion: 'M' },

  // ========== N - SERVICIOS SOCIALES Y DE SALUD ==========
  { codigo: '85110', descripcion: 'Actividades de hospitales y clínicas', seccion: 'N' },
  { codigo: '85120', descripcion: 'Actividades de médicos y odontólogos (consultorios)', seccion: 'N' },
  { codigo: '85190', descripcion: 'Otras actividades relacionadas con la salud humana', seccion: 'N' },
  { codigo: '85200', descripcion: 'Actividades veterinarias', seccion: 'N' },
  { codigo: '85300', descripcion: 'Actividades de servicios sociales', seccion: 'N' },

  // ========== O - OTRAS ACTIVIDADES DE SERVICIOS COMUNITARIOS Y SOCIALES ==========
  { codigo: '90000', descripcion: 'Eliminación de desperdicios y aguas residuales, saneamiento y actividades similares', seccion: 'O' },
  { codigo: '91110', descripcion: 'Actividades de organizaciones empresariales y de empleadores', seccion: 'O' },
  { codigo: '91200', descripcion: 'Actividades de sindicatos', seccion: 'O' },
  { codigo: '91900', descripcion: 'Actividades de otras asociaciones', seccion: 'O' },
  { codigo: '92110', descripcion: 'Producción y distribución de filmes y videocintas', seccion: 'O' },
  { codigo: '92120', descripcion: 'Exhibición de filmes y videocintas', seccion: 'O' },
  { codigo: '92130', descripcion: 'Actividades de radio y televisión', seccion: 'O' },
  { codigo: '92140', descripcion: 'Actividades teatrales y musicales y otras actividades artísticas', seccion: 'O' },
  { codigo: '92190', descripcion: 'Otras actividades de entretenimiento n.c.p.', seccion: 'O' },
  { codigo: '92200', descripcion: 'Actividades de agencias de noticias', seccion: 'O' },
  { codigo: '92300', descripcion: 'Actividades de bibliotecas, archivos, museos y otras actividades culturales', seccion: 'O' },
  { codigo: '92410', descripcion: 'Actividades deportivas', seccion: 'O' },
  { codigo: '92490', descripcion: 'Otras actividades de esparcimiento', seccion: 'O' },
  { codigo: '93010', descripcion: 'Lavado y limpieza de prendas de tela y de piel, incluso la limpieza en seco (lavanderías)', seccion: 'O' },
  { codigo: '93020', descripcion: 'Peluquería y otros tratamientos de belleza', seccion: 'O' },
  { codigo: '93030', descripcion: 'Pompas fúnebres y actividades conexas', seccion: 'O' },
  { codigo: '93090', descripcion: 'Otras actividades de servicios n.c.p.', seccion: 'O' },

  // ========== P - HOGARES PRIVADOS CON SERVICIO DOMÉSTICO ==========
  { codigo: '95000', descripcion: 'Hogares privados con servicio doméstico', seccion: 'P' },

  // ========== Q - ORGANIZACIONES Y ÓRGANOS EXTRATERRITORIALES ==========
  { codigo: '99000', descripcion: 'Organizaciones y órganos extraterritoriales', seccion: 'Q' },
];

/**
 * Secciones del clasificador CIIU
 */
export const SECCIONES_CIIU = {
  A: 'Agricultura, Ganadería, Caza y Silvicultura',
  B: 'Pesca',
  C: 'Explotación de Minas y Canteras',
  D: 'Industrias Manufactureras',
  E: 'Suministro de Electricidad, Gas y Agua',
  F: 'Construcción',
  G: 'Comercio al por Mayor y al por Menor',
  H: 'Hoteles y Restaurantes',
  I: 'Transporte, Almacenamiento y Comunicaciones',
  J: 'Intermediación Financiera',
  K: 'Actividades Inmobiliarias, Empresariales y de Alquiler',
  L: 'Administración Pública y Defensa',
  M: 'Enseñanza',
  N: 'Servicios Sociales y de Salud',
  O: 'Otras Actividades de Servicios Comunitarios, Sociales y Personales',
  P: 'Hogares Privados con Servicio Doméstico',
  Q: 'Organizaciones y Órganos Extraterritoriales',
};

/**
 * Helpers útiles
 */
export const buscarActividadPorCodigo = (codigo) =>
  ACTIVIDADES_ECONOMICAS.find((a) => a.codigo === codigo);

export const buscarActividadesPorTexto = (texto) => {
  const query = texto.toLowerCase().trim();
  return ACTIVIDADES_ECONOMICAS.filter(
    (a) =>
      a.codigo.includes(query) ||
      a.descripcion.toLowerCase().includes(query)
  );
};

export const obtenerActividadesPorSeccion = (seccion) =>
  ACTIVIDADES_ECONOMICAS.filter((a) => a.seccion === seccion);
