/**
 * Monedas SIFEN - Paraguay
 *
 * Catálogo oficial de monedas aceptadas por SIFEN (DNIT) según el Manual
 * Técnico v150 para Documentos Electrónicos en Paraguay.
 *
 * Total: 200 monedas según códigos ISO 4217
 *
 * Estructura de cada moneda:
 *   - codigo: Código ISO 4217 (3 letras) → campo cMoneOpe del XML SIFEN
 *   - descripcion: Nombre original en inglés (como lo provee SIFEN)
 *   - descripcion_es: Nombre en español
 *   - simbolo: Símbolo monetario para mostrar en UI
 *   - decimales: Cantidad de decimales según ISO 4217
 *   - pais: País o región emisora
 *   - comun: true si es de uso frecuente en Paraguay
 *
 * Fuente: facturacionelectronicapy-xmlgen (TIPS-SA / FacturaSend)
 * https://github.com/TIPS-SA/facturacionelectronicapy-xmlgen
 */

export const MONEDAS_SIFEN = [
  { codigo: 'AED', descripcion: 'Dirham', descripcion_es: 'Dírham de los Emiratos', simbolo: 'د.إ', decimales: 2, pais: 'Emiratos Árabes Unidos', comun: false },
  { codigo: 'AFN', descripcion: 'Afghani', descripcion_es: 'Afgani afgano', simbolo: '؋', decimales: 2, pais: 'Afganistán', comun: false },
  { codigo: 'ALL', descripcion: 'Lek', descripcion_es: 'Lek albanés', simbolo: 'L', decimales: 2, pais: 'Albania', comun: false },
  { codigo: 'AMD', descripcion: 'Dram', descripcion_es: 'Dram armenio', simbolo: '֏', decimales: 2, pais: 'Armenia', comun: false },
  { codigo: 'ANG', descripcion: 'Netherlands Antillian Guilder', descripcion_es: 'Florín antillano', simbolo: 'ƒ', decimales: 2, pais: 'Antillas Neerlandesas', comun: false },
  { codigo: 'AOA', descripcion: 'Kwanza', descripcion_es: 'Kuanza angoleño', simbolo: 'Kz', decimales: 2, pais: 'Angola', comun: false },
  { codigo: 'ARS', descripcion: 'Argentine Peso', descripcion_es: 'Peso argentino', simbolo: '$', decimales: 2, pais: 'Argentina', comun: true },
  { codigo: 'AUD', descripcion: 'Australian Dollar', descripcion_es: 'Dólar australiano', simbolo: 'A$', decimales: 2, pais: 'Australia', comun: false },
  { codigo: 'AWG', descripcion: 'Aruban Guilder', descripcion_es: 'Florín arubeño', simbolo: 'ƒ', decimales: 2, pais: 'Aruba', comun: false },
  { codigo: 'AZM', descripcion: 'Azerbaijanian Manat', descripcion_es: 'Manat azerbaiyano (obsoleto)', simbolo: '₼', decimales: 2, pais: 'Azerbaiyán', comun: false },
  { codigo: 'BAM', descripcion: 'Convertible Mark', descripcion_es: 'Marco convertible', simbolo: 'KM', decimales: 2, pais: 'Bosnia y Herzegovina', comun: false },
  { codigo: 'BBD', descripcion: 'Barbados Dollar', descripcion_es: 'Dólar de Barbados', simbolo: '$', decimales: 2, pais: 'Barbados', comun: false },
  { codigo: 'BYN', descripcion: 'Belarusian Ruble', descripcion_es: 'Rublo bielorruso', simbolo: 'Br', decimales: 2, pais: 'Bielorrusia', comun: false },
  { codigo: 'BDT', descripcion: 'Taka', descripcion_es: 'Taka bangladesí', simbolo: '৳', decimales: 2, pais: 'Bangladés', comun: false },
  { codigo: 'BGN', descripcion: 'Bulgarian Lev', descripcion_es: 'Lev búlgaro', simbolo: 'лв', decimales: 2, pais: 'Bulgaria', comun: false },
  { codigo: 'BHD', descripcion: 'Bahraini Dinar', descripcion_es: 'Dinar bareiní', simbolo: '.د.ب', decimales: 3, pais: 'Baréin', comun: false },
  { codigo: 'BIF', descripcion: 'Burundi Franc', descripcion_es: 'Franco burundés', simbolo: 'FBu', decimales: 0, pais: 'Burundi', comun: false },
  { codigo: 'BMD', descripcion: 'Bermudian Dollar (customarily: Bermuda Dollar)', descripcion_es: 'Dólar bermudeño', simbolo: '$', decimales: 2, pais: 'Bermudas', comun: false },
  { codigo: 'BND', descripcion: 'Brunei Dollar', descripcion_es: 'Dólar de Brunéi', simbolo: '$', decimales: 2, pais: 'Brunéi', comun: false },
  { codigo: 'BOB', descripcion: 'Boliviano', descripcion_es: 'Boliviano', simbolo: 'Bs', decimales: 2, pais: 'Bolivia', comun: true },
  { codigo: 'BOV', descripcion: 'Mvdol', descripcion_es: 'Mvdol', simbolo: 'BOV', decimales: 2, pais: 'Bolivia', comun: false },
  { codigo: 'BRL', descripcion: 'Brazilian Real', descripcion_es: 'Real brasileño', simbolo: 'R$', decimales: 2, pais: 'Brasil', comun: true },
  { codigo: 'BSD', descripcion: 'Bahamian Dollar', descripcion_es: 'Dólar bahameño', simbolo: '$', decimales: 2, pais: 'Bahamas', comun: false },
  { codigo: 'BTN', descripcion: 'Ngultrum', descripcion_es: 'Ngultrum butanés', simbolo: 'Nu.', decimales: 2, pais: 'Bután', comun: false },
  { codigo: 'BWP', descripcion: 'Pula', descripcion_es: 'Pula botsuano', simbolo: 'P', decimales: 2, pais: 'Botsuana', comun: false },
  { codigo: 'BYR', descripcion: 'Belarussian Ruble', descripcion_es: 'Rublo bielorruso (obsoleto)', simbolo: 'Br', decimales: 0, pais: 'Bielorrusia', comun: false },
  { codigo: 'BZD', descripcion: 'Belize Dollar', descripcion_es: 'Dólar beliceño', simbolo: 'BZ$', decimales: 2, pais: 'Belice', comun: false },
  { codigo: 'CAD', descripcion: 'Canadian Dollar', descripcion_es: 'Dólar canadiense', simbolo: 'C$', decimales: 2, pais: 'Canadá', comun: false },
  { codigo: 'CDF', descripcion: 'Franc Congolais', descripcion_es: 'Franco congoleño', simbolo: 'FC', decimales: 2, pais: 'Rep. Dem. del Congo', comun: false },
  { codigo: 'CHF', descripcion: 'Swiss Franc', descripcion_es: 'Franco suizo', simbolo: 'CHF', decimales: 2, pais: 'Suiza', comun: false },
  { codigo: 'CHE', descripcion: 'WIR Euro', descripcion_es: 'Euro WIR', simbolo: 'CHE', decimales: 2, pais: 'Suiza', comun: false },
  { codigo: 'CHW', descripcion: 'WIR Franc', descripcion_es: 'Franco WIR', simbolo: 'CHW', decimales: 2, pais: 'Suiza', comun: false },
  { codigo: 'CLP', descripcion: 'Chilean Peso', descripcion_es: 'Peso chileno', simbolo: '$', decimales: 0, pais: 'Chile', comun: true },
  { codigo: 'CLF', descripcion: 'Unidad de Fomento', descripcion_es: 'Unidad de Fomento', simbolo: 'UF', decimales: 4, pais: 'Chile', comun: false },
  { codigo: 'CNY', descripcion: 'Yuan Renminbi', descripcion_es: 'Yuan chino', simbolo: '¥', decimales: 2, pais: 'China', comun: true },
  { codigo: 'COP', descripcion: 'Colombian Peso', descripcion_es: 'Peso colombiano', simbolo: '$', decimales: 2, pais: 'Colombia', comun: true },
  { codigo: 'COU', descripcion: 'Unidad de Valor Real', descripcion_es: 'Unidad de Valor Real', simbolo: 'COU', decimales: 2, pais: 'Colombia', comun: false },
  { codigo: 'CRC', descripcion: 'Costa Rican Colon', descripcion_es: 'Colón costarricense', simbolo: '₡', decimales: 2, pais: 'Costa Rica', comun: false },
  { codigo: 'CUP', descripcion: 'Cuban Peso', descripcion_es: 'Peso cubano', simbolo: '$', decimales: 2, pais: 'Cuba', comun: false },
  { codigo: 'CUC', descripcion: 'Peso Convertible', descripcion_es: 'Peso convertible cubano', simbolo: '$', decimales: 2, pais: 'Cuba', comun: false },
  { codigo: 'CVE', descripcion: 'Cape Verde Escudo', descripcion_es: 'Escudo caboverdiano', simbolo: '$', decimales: 2, pais: 'Cabo Verde', comun: false },
  { codigo: 'CYP', descripcion: 'Cyprus Pound', descripcion_es: 'Libra chipriota (obsoleta)', simbolo: '£', decimales: 2, pais: 'Chipre', comun: false },
  { codigo: 'CZK', descripcion: 'Czech Koruna', descripcion_es: 'Corona checa', simbolo: 'Kč', decimales: 2, pais: 'Rep. Checa', comun: false },
  { codigo: 'DJF', descripcion: 'Djibouti Franc', descripcion_es: 'Franco yibutiano', simbolo: 'Fdj', decimales: 0, pais: 'Yibuti', comun: false },
  { codigo: 'DKK', descripcion: 'Danish Krone', descripcion_es: 'Corona danesa', simbolo: 'kr', decimales: 2, pais: 'Dinamarca', comun: false },
  { codigo: 'DOP', descripcion: 'Dominican Peso', descripcion_es: 'Peso dominicano', simbolo: 'RD$', decimales: 2, pais: 'República Dominicana', comun: false },
  { codigo: 'DZD', descripcion: 'Algerian Dinar', descripcion_es: 'Dinar argelino', simbolo: 'د.ج', decimales: 2, pais: 'Argelia', comun: false },
  { codigo: 'EEK', descripcion: 'Kroon', descripcion_es: 'Corona estonia (obsoleta)', simbolo: 'kr', decimales: 2, pais: 'Estonia', comun: false },
  { codigo: 'EGP', descripcion: 'Egyptian Pound', descripcion_es: 'Libra egipcia', simbolo: 'E£', decimales: 2, pais: 'Egipto', comun: false },
  { codigo: 'ERN', descripcion: 'Nakfa', descripcion_es: 'Nakfa eritreo', simbolo: 'Nfk', decimales: 2, pais: 'Eritrea', comun: false },
  { codigo: 'ETB', descripcion: 'Ethopian Birr', descripcion_es: 'Birr etíope', simbolo: 'Br', decimales: 2, pais: 'Etiopía', comun: false },
  { codigo: 'EUR', descripcion: 'Euro', descripcion_es: 'Euro', simbolo: '€', decimales: 2, pais: 'Zona Euro', comun: true },
  { codigo: 'FJD', descripcion: 'Fiji Dollar', descripcion_es: 'Dólar fiyiano', simbolo: '$', decimales: 2, pais: 'Fiyi', comun: false },
  { codigo: 'FKP', descripcion: 'Falkland Islands Pound', descripcion_es: 'Libra malvinense', simbolo: '£', decimales: 2, pais: 'Islas Malvinas', comun: false },
  { codigo: 'GBP', descripcion: 'Pound Sterling', descripcion_es: 'Libra esterlina', simbolo: '£', decimales: 2, pais: 'Reino Unido', comun: true },
  { codigo: 'GEL', descripcion: 'Lari', descripcion_es: 'Lari georgiano', simbolo: '₾', decimales: 2, pais: 'Georgia', comun: false },
  { codigo: 'GHS', descripcion: 'Ghana Cedi', descripcion_es: 'Cedi ghanés', simbolo: 'GH₵', decimales: 2, pais: 'Ghana', comun: false },
  { codigo: 'GHC', descripcion: 'Cedi', descripcion_es: 'Cedi (obsoleto)', simbolo: '₵', decimales: 2, pais: 'Ghana', comun: false },
  { codigo: 'GIP', descripcion: 'Gibraltar Pound', descripcion_es: 'Libra gibraltareña', simbolo: '£', decimales: 2, pais: 'Gibraltar', comun: false },
  { codigo: 'GMD', descripcion: 'Dalasi', descripcion_es: 'Dalasi gambiano', simbolo: 'D', decimales: 2, pais: 'Gambia', comun: false },
  { codigo: 'GNF', descripcion: 'Guinea Franc', descripcion_es: 'Franco guineano', simbolo: 'FG', decimales: 0, pais: 'Guinea', comun: false },
  { codigo: 'GTQ', descripcion: 'Quetzal', descripcion_es: 'Quetzal guatemalteco', simbolo: 'Q', decimales: 2, pais: 'Guatemala', comun: false },
  { codigo: 'GYD', descripcion: 'Guyana Dollar', descripcion_es: 'Dólar guyanés', simbolo: '$', decimales: 2, pais: 'Guyana', comun: false },
  { codigo: 'HKD', descripcion: 'Honk Kong Dollar', descripcion_es: 'Dólar de Hong Kong', simbolo: 'HK$', decimales: 2, pais: 'Hong Kong', comun: false },
  { codigo: 'HNL', descripcion: 'Lempira', descripcion_es: 'Lempira hondureña', simbolo: 'L', decimales: 2, pais: 'Honduras', comun: false },
  { codigo: 'HRK', descripcion: 'Kuna', descripcion_es: 'Kuna croata', simbolo: 'kn', decimales: 2, pais: 'Croacia', comun: false },
  { codigo: 'HTG', descripcion: 'Gourde', descripcion_es: 'Gourde haitiano', simbolo: 'G', decimales: 2, pais: 'Haití', comun: false },
  { codigo: 'HUF', descripcion: 'Forint', descripcion_es: 'Forint húngaro', simbolo: 'Ft', decimales: 2, pais: 'Hungría', comun: false },
  { codigo: 'IDR', descripcion: 'Rupiah', descripcion_es: 'Rupia indonesia', simbolo: 'Rp', decimales: 2, pais: 'Indonesia', comun: false },
  { codigo: 'ILS', descripcion: 'New Israeli Sheqel', descripcion_es: 'Nuevo séquel israelí', simbolo: '₪', decimales: 2, pais: 'Israel', comun: false },
  { codigo: 'INR', descripcion: 'Indian Rupee', descripcion_es: 'Rupia india', simbolo: '₹', decimales: 2, pais: 'India', comun: false },
  { codigo: 'IQD', descripcion: 'Iraqi Dinar', descripcion_es: 'Dinar iraquí', simbolo: 'ع.د', decimales: 3, pais: 'Irak', comun: false },
  { codigo: 'IRR', descripcion: 'Iranian Rial', descripcion_es: 'Rial iraní', simbolo: '﷼', decimales: 2, pais: 'Irán', comun: false },
  { codigo: 'ISK', descripcion: 'Iceland Krona', descripcion_es: 'Corona islandesa', simbolo: 'kr', decimales: 0, pais: 'Islandia', comun: false },
  { codigo: 'JMD', descripcion: 'Jamaican Dollar', descripcion_es: 'Dólar jamaicano', simbolo: 'J$', decimales: 2, pais: 'Jamaica', comun: false },
  { codigo: 'JOD', descripcion: 'Jordanian Dinar', descripcion_es: 'Dinar jordano', simbolo: 'د.ا', decimales: 3, pais: 'Jordania', comun: false },
  { codigo: 'JPY', descripcion: 'Yen', descripcion_es: 'Yen japonés', simbolo: '¥', decimales: 0, pais: 'Japón', comun: true },
  { codigo: 'KES', descripcion: 'Kenyan Shilling', descripcion_es: 'Chelín keniano', simbolo: 'KSh', decimales: 2, pais: 'Kenia', comun: false },
  { codigo: 'KGS', descripcion: 'Som', descripcion_es: 'Som kirguís', simbolo: 'с', decimales: 2, pais: 'Kirguistán', comun: false },
  { codigo: 'KHR', descripcion: 'Riel', descripcion_es: 'Riel camboyano', simbolo: '៛', decimales: 2, pais: 'Camboya', comun: false },
  { codigo: 'KMF', descripcion: 'Comoro Franc', descripcion_es: 'Franco comorano', simbolo: 'CF', decimales: 0, pais: 'Comoras', comun: false },
  { codigo: 'KPW', descripcion: 'North Korean Won', descripcion_es: 'Won norcoreano', simbolo: '₩', decimales: 2, pais: 'Corea del Norte', comun: false },
  { codigo: 'KRW', descripcion: 'Won', descripcion_es: 'Won surcoreano', simbolo: '₩', decimales: 0, pais: 'Corea del Sur', comun: false },
  { codigo: 'KWD', descripcion: 'Kuwaiti Dinar', descripcion_es: 'Dinar kuwaití', simbolo: 'د.ك', decimales: 3, pais: 'Kuwait', comun: false },
  { codigo: 'KYD', descripcion: 'Cayman Islands Dollar', descripcion_es: 'Dólar de las Islas Caimán', simbolo: '$', decimales: 2, pais: 'Islas Caimán', comun: false },
  { codigo: 'KZT', descripcion: 'Tenge', descripcion_es: 'Tenge kazajo', simbolo: '₸', decimales: 2, pais: 'Kazajistán', comun: false },
  { codigo: 'LAK', descripcion: 'Kip', descripcion_es: 'Kip laosiano', simbolo: '₭', decimales: 2, pais: 'Laos', comun: false },
  { codigo: 'LBP', descripcion: 'Lebanese Pound', descripcion_es: 'Libra libanesa', simbolo: 'ل.ل', decimales: 2, pais: 'Líbano', comun: false },
  { codigo: 'LKR', descripcion: 'Sri Lanka Rupee', descripcion_es: 'Rupia de Sri Lanka', simbolo: '₨', decimales: 2, pais: 'Sri Lanka', comun: false },
  { codigo: 'LRD', descripcion: 'Liberian Dollar', descripcion_es: 'Dólar liberiano', simbolo: '$', decimales: 2, pais: 'Liberia', comun: false },
  { codigo: 'LSL', descripcion: 'Loti', descripcion_es: 'Loti lesotense', simbolo: 'L', decimales: 2, pais: 'Lesoto', comun: false },
  { codigo: 'LTL', descripcion: 'Lithuanian Litas', descripcion_es: 'Litas lituano (obsoleto)', simbolo: 'Lt', decimales: 2, pais: 'Lituania', comun: false },
  { codigo: 'LVL', descripcion: 'Latvian Lats', descripcion_es: 'Lats letón (obsoleto)', simbolo: 'Ls', decimales: 2, pais: 'Letonia', comun: false },
  { codigo: 'LYD', descripcion: 'Libyan Dinar', descripcion_es: 'Dinar libio', simbolo: 'ل.د', decimales: 3, pais: 'Libia', comun: false },
  { codigo: 'MAD', descripcion: 'Morrocan Dirham', descripcion_es: 'Dírham marroquí', simbolo: 'د.م.', decimales: 2, pais: 'Marruecos', comun: false },
  { codigo: 'MZN', descripcion: 'Mozambique Metical', descripcion_es: 'Metical mozambiqueño', simbolo: 'MT', decimales: 2, pais: 'Mozambique', comun: false },
  { codigo: 'MDL', descripcion: 'Moldovan Leu', descripcion_es: 'Leu moldavo', simbolo: 'L', decimales: 2, pais: 'Moldavia', comun: false },
  { codigo: 'MGF', descripcion: 'Malagasy Franc', descripcion_es: 'Franco malgache (obsoleto)', simbolo: 'Ar', decimales: 0, pais: 'Madagascar', comun: false },
  { codigo: 'MKD', descripcion: 'Denar', descripcion_es: 'Denar macedonio', simbolo: 'ден', decimales: 2, pais: 'Macedonia del Norte', comun: false },
  { codigo: 'MGA', descripcion: 'Malagasy Ariary', descripcion_es: 'Ariary malgache', simbolo: 'Ar', decimales: 2, pais: 'Madagascar', comun: false },
  { codigo: 'MMK', descripcion: 'Kyat', descripcion_es: 'Kyat birmano', simbolo: 'K', decimales: 2, pais: 'Myanmar', comun: false },
  { codigo: 'MNT', descripcion: 'Tugrik', descripcion_es: 'Tugrik mongol', simbolo: '₮', decimales: 2, pais: 'Mongolia', comun: false },
  { codigo: 'MOP', descripcion: 'Pataca', descripcion_es: 'Pataca de Macao', simbolo: 'P', decimales: 2, pais: 'Macao', comun: false },
  { codigo: 'MRO', descripcion: 'Ouguiya', descripcion_es: 'Ouguiya (obsoleta)', simbolo: 'UM', decimales: 2, pais: 'Mauritania', comun: false },
  { codigo: 'MTL', descripcion: 'Maltese Lira', descripcion_es: 'Lira maltesa (obsoleta)', simbolo: 'Lm', decimales: 2, pais: 'Malta', comun: false },
  { codigo: 'MUR', descripcion: 'Mauritius Rupee', descripcion_es: 'Rupia mauriciana', simbolo: '₨', decimales: 2, pais: 'Mauricio', comun: false },
  { codigo: 'XUA', descripcion: 'ADB Unit of Account', descripcion_es: 'Unidad de cuenta del BAfD', simbolo: 'XUA', decimales: 2, pais: 'África', comun: false },
  { codigo: 'MVR', descripcion: 'Rufiyaa', descripcion_es: 'Rufiyaa maldiva', simbolo: 'Rf', decimales: 2, pais: 'Maldivas', comun: false },
  { codigo: 'MRU', descripcion: 'Ouguiya', descripcion_es: 'Ouguiya mauritana', simbolo: 'UM', decimales: 2, pais: 'Mauritania', comun: false },
  { codigo: 'MWK', descripcion: 'Kwacha', descripcion_es: 'Kwacha malauí', simbolo: 'MK', decimales: 2, pais: 'Malaui', comun: false },
  { codigo: 'MXN', descripcion: 'Mexican Peso', descripcion_es: 'Peso mexicano', simbolo: '$', decimales: 2, pais: 'México', comun: true },
  { codigo: 'MXV', descripcion: 'Mexican Unidad de Inversion', descripcion_es: 'Unidad de Inversión', simbolo: 'MXV', decimales: 2, pais: 'México', comun: false },
  { codigo: 'MYR', descripcion: 'Malaysian Ringgit', descripcion_es: 'Ringgit malayo', simbolo: 'RM', decimales: 2, pais: 'Malasia', comun: false },
  { codigo: 'MZM', descripcion: 'Metical', descripcion_es: 'Metical (obsoleto)', simbolo: 'MT', decimales: 2, pais: 'Mozambique', comun: false },
  { codigo: 'NAD', descripcion: 'Namibia Dollar', descripcion_es: 'Dólar namibio', simbolo: '$', decimales: 2, pais: 'Namibia', comun: false },
  { codigo: 'NGN', descripcion: 'Naira', descripcion_es: 'Naira nigeriana', simbolo: '₦', decimales: 2, pais: 'Nigeria', comun: false },
  { codigo: 'NIO', descripcion: 'Cordoba Oro', descripcion_es: 'Córdoba nicaragüense', simbolo: 'C$', decimales: 2, pais: 'Nicaragua', comun: false },
  { codigo: 'NOK', descripcion: 'Norwegian Krone', descripcion_es: 'Corona noruega', simbolo: 'kr', decimales: 2, pais: 'Noruega', comun: false },
  { codigo: 'NPR', descripcion: 'Nepalese Rupee', descripcion_es: 'Rupia nepalí', simbolo: '₨', decimales: 2, pais: 'Nepal', comun: false },
  { codigo: 'NZD', descripcion: 'New Zealand Dollar', descripcion_es: 'Dólar neozelandés', simbolo: 'NZ$', decimales: 2, pais: 'Nueva Zelanda', comun: false },
  { codigo: 'OMR', descripcion: 'Rial Omani', descripcion_es: 'Rial omaní', simbolo: 'ر.ع.', decimales: 3, pais: 'Omán', comun: false },
  { codigo: 'PAB', descripcion: 'Balboa', descripcion_es: 'Balboa panameño', simbolo: 'B/.', decimales: 2, pais: 'Panamá', comun: false },
  { codigo: 'PEN', descripcion: 'Nuevo Sol', descripcion_es: 'Sol peruano', simbolo: 'S/', decimales: 2, pais: 'Perú', comun: true },
  { codigo: 'PGK', descripcion: 'Kina', descripcion_es: 'Kina', simbolo: 'K', decimales: 2, pais: 'Papúa Nueva Guinea', comun: false },
  { codigo: 'PHP', descripcion: 'Philippine Peso', descripcion_es: 'Peso filipino', simbolo: '₱', decimales: 2, pais: 'Filipinas', comun: false },
  { codigo: 'PKR', descripcion: 'Pakistan Rupee', descripcion_es: 'Rupia pakistaní', simbolo: '₨', decimales: 2, pais: 'Pakistán', comun: false },
  { codigo: 'PLN', descripcion: 'Zloty', descripcion_es: 'Zloty polaco', simbolo: 'zł', decimales: 2, pais: 'Polonia', comun: false },
  { codigo: 'PYG', descripcion: 'Guarani', descripcion_es: 'Guaraní paraguayo', simbolo: '₲', decimales: 0, pais: 'Paraguay', comun: true },
  { codigo: 'QAR', descripcion: 'Qatari Rial', descripcion_es: 'Rial catarí', simbolo: 'ر.ق', decimales: 2, pais: 'Catar', comun: false },
  { codigo: 'RON', descripcion: 'Romanian Leu', descripcion_es: 'Leu rumano', simbolo: 'lei', decimales: 2, pais: 'Rumania', comun: false },
  { codigo: 'ROL', descripcion: 'Leu', descripcion_es: 'Leu rumano (obsoleto)', simbolo: 'lei', decimales: 2, pais: 'Rumania', comun: false },
  { codigo: 'RUB', descripcion: 'Russian Ruble', descripcion_es: 'Rublo ruso', simbolo: '₽', decimales: 2, pais: 'Rusia', comun: false },
  { codigo: 'RWF', descripcion: 'Rwanda Franc', descripcion_es: 'Franco ruandés', simbolo: 'FRw', decimales: 0, pais: 'Ruanda', comun: false },
  { codigo: 'SAR', descripcion: 'Saudi Riyal', descripcion_es: 'Rial saudí', simbolo: 'ر.س', decimales: 2, pais: 'Arabia Saudita', comun: false },
  { codigo: 'RSD', descripcion: 'Serbian Dinar', descripcion_es: 'Dinar serbio', simbolo: 'дин', decimales: 2, pais: 'Serbia', comun: false },
  { codigo: 'SBD', descripcion: 'Solomon Islands Dollar', descripcion_es: 'Dólar salomonense', simbolo: '$', decimales: 2, pais: 'Islas Salomón', comun: false },
  { codigo: 'SCR', descripcion: 'Seychelles Rupee', descripcion_es: 'Rupia seychelense', simbolo: '₨', decimales: 2, pais: 'Seychelles', comun: false },
  { codigo: 'SDD', descripcion: 'Sudanese Dinar', descripcion_es: 'Dinar sudanés (obsoleto)', simbolo: 'ج.س.', decimales: 2, pais: 'Sudán', comun: false },
  { codigo: 'SDG', descripcion: 'Sudanese Pound', descripcion_es: 'Libra sudanesa', simbolo: 'ج.س.', decimales: 2, pais: 'Sudán', comun: false },
  { codigo: 'SRD', descripcion: 'Surinam Dollar', descripcion_es: 'Dólar surinamés', simbolo: '$', decimales: 2, pais: 'Surinam', comun: false },
  { codigo: 'SEK', descripcion: 'Swedish Krona', descripcion_es: 'Corona sueca', simbolo: 'kr', decimales: 2, pais: 'Suecia', comun: false },
  { codigo: 'SGD', descripcion: 'Singapore Dollar', descripcion_es: 'Dólar singapurense', simbolo: 'S$', decimales: 2, pais: 'Singapur', comun: false },
  { codigo: 'SHP', descripcion: 'St. Helena Pound', descripcion_es: 'Libra de Santa Elena', simbolo: '£', decimales: 2, pais: 'Santa Elena', comun: false },
  { codigo: 'SIT', descripcion: 'Tolar', descripcion_es: 'Tólar esloveno (obsoleto)', simbolo: 'SIT', decimales: 2, pais: 'Eslovenia', comun: false },
  { codigo: 'SKK', descripcion: 'Slovak Koruna', descripcion_es: 'Corona eslovaca (obsoleta)', simbolo: 'Sk', decimales: 2, pais: 'Eslovaquia', comun: false },
  { codigo: 'SLL', descripcion: 'Leone', descripcion_es: 'Leone sierraleonés', simbolo: 'Le', decimales: 2, pais: 'Sierra Leona', comun: false },
  { codigo: 'SOS', descripcion: 'Somali Shilling', descripcion_es: 'Chelín somalí', simbolo: 'S', decimales: 2, pais: 'Somalia', comun: false },
  { codigo: 'SRG', descripcion: 'Suriname Guilder', descripcion_es: 'Florín surinamés (obsoleto)', simbolo: '$', decimales: 2, pais: 'Surinam', comun: false },
  { codigo: 'SSP', descripcion: 'South Sudanese Pound', descripcion_es: 'Libra sursudanesa', simbolo: '£', decimales: 2, pais: 'Sudán del Sur', comun: false },
  { codigo: 'STD', descripcion: 'Dobra', descripcion_es: 'Dobra (obsoleta)', simbolo: 'Db', decimales: 2, pais: 'Santo Tomé y Príncipe', comun: false },
  { codigo: 'SVC', descripcion: 'El Salvador Colon', descripcion_es: 'Colón salvadoreño', simbolo: '$', decimales: 2, pais: 'El Salvador', comun: false },
  { codigo: 'SYP', descripcion: 'Syrian Pound', descripcion_es: 'Libra siria', simbolo: '£S', decimales: 2, pais: 'Siria', comun: false },
  { codigo: 'SZL', descripcion: 'Lilangeni', descripcion_es: 'Lilangeni de Esuatini', simbolo: 'L', decimales: 2, pais: 'Esuatini', comun: false },
  { codigo: 'THB', descripcion: 'Baht', descripcion_es: 'Baht tailandés', simbolo: '฿', decimales: 2, pais: 'Tailandia', comun: false },
  { codigo: 'TJS', descripcion: 'Somoni', descripcion_es: 'Somoni tayiko', simbolo: 'SM', decimales: 2, pais: 'Tayikistán', comun: false },
  { codigo: 'TMM', descripcion: 'Manat', descripcion_es: 'Manat (obsoleto)', simbolo: 'T', decimales: 2, pais: 'Turkmenistán', comun: false },
  { codigo: 'TND', descripcion: 'Tunisian Dinar', descripcion_es: 'Dinar tunecino', simbolo: 'د.ت', decimales: 3, pais: 'Túnez', comun: false },
  { codigo: 'TRY', descripcion: 'Turkish Lira', descripcion_es: 'Lira turca', simbolo: '₺', decimales: 2, pais: 'Turquía', comun: false },
  { codigo: 'TMT', descripcion: 'Turkmenistan New Manat', descripcion_es: 'Nuevo manat turcomano', simbolo: 'T', decimales: 2, pais: 'Turkmenistán', comun: false },
  { codigo: 'TOP', descripcion: 'Pa\'anga', descripcion_es: 'Pa\'anga tongano', simbolo: 'T$', decimales: 2, pais: 'Tonga', comun: false },
  { codigo: 'TRL', descripcion: 'Turkish Lira', descripcion_es: 'Lira turca (obsoleta)', simbolo: '₤', decimales: 2, pais: 'Turquía', comun: false },
  { codigo: 'TTD', descripcion: 'Trinidad and Tobago Dollar', descripcion_es: 'Dólar de Trinidad y Tobago', simbolo: 'TT$', decimales: 2, pais: 'Trinidad y Tobago', comun: false },
  { codigo: 'TWD', descripcion: 'New Taiwan Dollar', descripcion_es: 'Nuevo dólar taiwanés', simbolo: 'NT$', decimales: 2, pais: 'Taiwán', comun: false },
  { codigo: 'TZS', descripcion: 'Tanzanian Shilling', descripcion_es: 'Chelín tanzano', simbolo: 'TSh', decimales: 2, pais: 'Tanzania', comun: false },
  { codigo: 'UAH', descripcion: 'Hryvnia', descripcion_es: 'Grivna ucraniana', simbolo: '₴', decimales: 2, pais: 'Ucrania', comun: false },
  { codigo: 'UGX', descripcion: 'Uganda Shilling', descripcion_es: 'Chelín ugandés', simbolo: 'USh', decimales: 0, pais: 'Uganda', comun: false },
  { codigo: 'USD', descripcion: 'US Dollar', descripcion_es: 'Dólar estadounidense', simbolo: 'US$', decimales: 2, pais: 'Estados Unidos', comun: true },
  { codigo: 'USN', descripcion: 'US Dollar(Next day)', descripcion_es: 'Dólar (siguiente día)', simbolo: 'USN', decimales: 2, pais: 'Estados Unidos', comun: false },
  { codigo: 'UYU', descripcion: 'Peso Uruguayo', descripcion_es: 'Peso uruguayo', simbolo: '$U', decimales: 2, pais: 'Uruguay', comun: true },
  { codigo: 'UYI', descripcion: 'Uruguay Peso en Unidades Indexadas(UI)', descripcion_es: 'Peso uruguayo en Unidades Indexadas', simbolo: 'UI', decimales: 0, pais: 'Uruguay', comun: false },
  { codigo: 'UYW', descripcion: 'Unidad Previsional', descripcion_es: 'Unidad Previsional', simbolo: 'UYW', decimales: 4, pais: 'Uruguay', comun: false },
  { codigo: 'UZS', descripcion: 'Uzbekistan Sum', descripcion_es: 'Som uzbeko', simbolo: 'soʻm', decimales: 2, pais: 'Uzbekistán', comun: false },
  { codigo: 'VEB', descripcion: 'Bolivar', descripcion_es: 'Bolívar (obsoleto)', simbolo: 'Bs', decimales: 2, pais: 'Venezuela', comun: false },
  { codigo: 'VND', descripcion: 'Dong', descripcion_es: 'Dong vietnamita', simbolo: '₫', decimales: 0, pais: 'Vietnam', comun: false },
  { codigo: 'VUV', descripcion: 'Vatu', descripcion_es: 'Vatu vanuatuense', simbolo: 'VT', decimales: 0, pais: 'Vanuatu', comun: false },
  { codigo: 'VES', descripcion: 'Bolivar Soberano', descripcion_es: 'Bolívar soberano', simbolo: 'Bs.S', decimales: 2, pais: 'Venezuela', comun: false },
  { codigo: 'WST', descripcion: 'Tala', descripcion_es: 'Tala samoano', simbolo: 'WS$', decimales: 2, pais: 'Samoa', comun: false },
  { codigo: 'STN', descripcion: 'Dobra', descripcion_es: 'Dobra', simbolo: 'Db', decimales: 2, pais: 'Santo Tomé y Príncipe', comun: false },
  { codigo: 'XAF', descripcion: 'CFA Franc', descripcion_es: 'Franco CFA (BEAC)', simbolo: 'FCFA', decimales: 0, pais: 'África Central', comun: false },
  { codigo: 'XAG', descripcion: 'Silver', descripcion_es: 'Plata (onza troy)', simbolo: 'XAG', decimales: 0, pais: '-', comun: false },
  { codigo: 'XAU', descripcion: 'Gold', descripcion_es: 'Oro (onza troy)', simbolo: 'XAU', decimales: 0, pais: '-', comun: false },
  { codigo: 'XCD', descripcion: 'East Carribean Dollar', descripcion_es: 'Dólar del Caribe Oriental', simbolo: 'EC$', decimales: 2, pais: 'Caribe Oriental', comun: false },
  { codigo: 'XDR', descripcion: 'SDR', descripcion_es: 'Derechos Especiales de Giro', simbolo: 'XDR', decimales: 0, pais: 'FMI', comun: false },
  { codigo: 'XOF', descripcion: 'CFA Franc', descripcion_es: 'Franco CFA (BCEAO)', simbolo: 'CFA', decimales: 0, pais: 'África Occidental', comun: false },
  { codigo: 'XPD', descripcion: 'Palladium', descripcion_es: 'Paladio (onza troy)', simbolo: 'XPD', decimales: 0, pais: '-', comun: false },
  { codigo: 'XPF', descripcion: 'CFP Franc', descripcion_es: 'Franco CFP', simbolo: '₣', decimales: 0, pais: 'Polinesia Francesa', comun: false },
  { codigo: 'XPT', descripcion: 'Platinum', descripcion_es: 'Platino (onza troy)', simbolo: 'XPT', decimales: 0, pais: '-', comun: false },
  { codigo: 'XSU', descripcion: 'Sucre', descripcion_es: 'Sucre', simbolo: 'Sucre', decimales: 0, pais: 'SUCRE', comun: false },
  { codigo: 'XBA', descripcion: 'Bond Markets Unit European Composite Unit(EURCO)', descripcion_es: 'Unidad Compuesta Europea (EURCO)', simbolo: 'XBA', decimales: 0, pais: '-', comun: false },
  { codigo: 'XBB', descripcion: 'Bond Markets Unit European Monetary Unit(E.M.U.-6)', descripcion_es: 'Unidad Monetaria Europea (E.M.U.-6)', simbolo: 'XBB', decimales: 0, pais: '-', comun: false },
  { codigo: 'XBC', descripcion: 'Bond Markets Unit European Unit of Account 17 (E.U.A.-17)', descripcion_es: 'Unidad de Cuenta Europea 17', simbolo: 'XBC', decimales: 0, pais: '-', comun: false },
  { codigo: 'XTS', descripcion: 'Codes specifically reserved for testing purposes', descripcion_es: 'Código de prueba', simbolo: 'XTS', decimales: 0, pais: '-', comun: false },
  { codigo: 'XXX', descripcion: 'The codes assigned for transactions where no currency is involved', descripcion_es: 'Sin moneda asociada', simbolo: 'XXX', decimales: 0, pais: '-', comun: false },
  { codigo: 'YER', descripcion: 'Yemeni Rial', descripcion_es: 'Rial yemení', simbolo: '﷼', decimales: 2, pais: 'Yemen', comun: false },
  { codigo: 'YUM', descripcion: 'New Dinar', descripcion_es: 'Nuevo dinar (obsoleto)', simbolo: 'дин', decimales: 2, pais: 'Yugoslavia', comun: false },
  { codigo: 'ZMW', descripcion: 'Zambian Kwacha', descripcion_es: 'Kwacha zambiano', simbolo: 'ZK', decimales: 2, pais: 'Zambia', comun: false },
  { codigo: 'ZWL', descripcion: 'Zimbabwe Dollar', descripcion_es: 'Dólar zimbabuense', simbolo: 'Z$', decimales: 2, pais: 'Zimbabue', comun: false },
  { codigo: 'ZAR', descripcion: 'Rand', descripcion_es: 'Rand sudafricano', simbolo: 'R', decimales: 2, pais: 'Sudáfrica', comun: false },
  { codigo: 'ZMK', descripcion: 'Kwacha', descripcion_es: 'Kwacha (obsoleto)', simbolo: 'ZK', decimales: 2, pais: 'Zambia', comun: false },
  { codigo: 'ZWD', descripcion: 'Zimbabwe Dollar', descripcion_es: 'Dólar zimbabuense (obsoleto)', simbolo: 'Z$', decimales: 2, pais: 'Zimbabue', comun: false },
];

// ============================================
// Constantes útiles
// ============================================

/**
 * Moneda por defecto del sistema (Guaraní paraguayo).
 */
export const MONEDA_DEFAULT = 'PYG';

/**
 * Monedas más usadas en Paraguay (para mostrar destacadas en selects).
 */
export const MONEDAS_COMUNES = MONEDAS_SIFEN.filter(m => m.comun);

// ============================================
// Helpers
// ============================================

/**
 * Busca una moneda por su código ISO 4217.
 * @param {string} codigo - Código de 3 letras (ej: 'PYG', 'USD')
 * @returns {object|undefined} La moneda encontrada o undefined
 */
export const getMonedaByCodigo = (codigo) =>
  MONEDAS_SIFEN.find(m => m.codigo === codigo?.toUpperCase());

/**
 * Busca monedas por texto en código, descripción (es/en) o país.
 * Útil para autocomplete en formularios.
 * @param {string} texto - Texto a buscar
 * @returns {Array} Array de monedas que coinciden
 */
export const buscarMoneda = (texto) => {
  if (!texto) return MONEDAS_SIFEN;
  const q = texto.toLowerCase().trim();
  return MONEDAS_SIFEN.filter(m =>
    m.codigo.toLowerCase().includes(q) ||
    m.descripcion.toLowerCase().includes(q) ||
    m.descripcion_es.toLowerCase().includes(q) ||
    m.pais.toLowerCase().includes(q)
  );
};

/**
 * Formatea un monto con el símbolo y la cantidad correcta de decimales.
 * @param {number} monto - Monto numérico
 * @param {string} codigoMoneda - Código de la moneda
 * @returns {string} Monto formateado (ej: "₲ 1.500.000")
 */
export const formatearMonto = (monto, codigoMoneda = MONEDA_DEFAULT) => {
  const moneda = getMonedaByCodigo(codigoMoneda);
  if (!moneda) return String(monto);
  const formateado = new Intl.NumberFormat('es-PY', {
    minimumFractionDigits: moneda.decimales,
    maximumFractionDigits: moneda.decimales,
  }).format(monto);
  return `${moneda.simbolo} ${formateado}`;
};

/**
 * Obtiene la cantidad de decimales correctos para una moneda.
 * Importante para SIFEN: PYG=0 decimales, USD=2 decimales, etc.
 * @param {string} codigoMoneda
 * @returns {number}
 */
export const getDecimales = (codigoMoneda) => {
  const moneda = getMonedaByCodigo(codigoMoneda);
  return moneda ? moneda.decimales : 2;
};

/**
 * Valida si un código de moneda es aceptado por SIFEN.
 * @param {string} codigo
 * @returns {boolean}
 */
export const esMonedaValidaSifen = (codigo) =>
  MONEDAS_SIFEN.some(m => m.codigo === codigo?.toUpperCase());
