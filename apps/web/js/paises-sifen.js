/**
 * Países SIFEN - Paraguay
 *
 * Catálogo oficial de países aceptados por SIFEN (DNIT) para el campo
 * cPaisRec (código de país del receptor) en documentos electrónicos.
 *
 * Total: 249 países y territorios
 * Estándar: ISO 3166-1 alfa-3 (códigos de 3 letras)
 *
 * Estructura:
 *   - codigo: ISO 3166-1 alfa-3 → campo cPaisRec del XML SIFEN
 *   - iso2: ISO 3166-1 alfa-2 (útil para banderas, mapas, librerías de telefonía)
 *   - descripcion: Nombre del país en español
 *   - bandera: Emoji de la bandera (Unicode regional indicators)
 *   - codigo_telefono: Prefijo telefónico internacional
 *   - region: Continente/región geográfica
 *   - frecuente: true si es de uso frecuente en Paraguay (vecinos + grandes economías)
 *
 * Ordenamiento: Frecuentes primero (Paraguay → vecinos → grandes economías),
 * luego el resto alfabéticamente.
 *
 * Fuente: facturacionelectronicapy-xmlgen (TIPS-SA / FacturaSend)
 * https://github.com/TIPS-SA/facturacionelectronicapy-xmlgen
 *
 * Nota: El código 'NN' corresponde a un valor especial SIFEN para casos
 * donde no se puede determinar el país. Úsese con criterio.
 */

export const PAISES_SIFEN = [
  { codigo: 'PRY', iso2: 'PY', descripcion: 'Paraguay', bandera: '🇵🇾', codigo_telefono: '+595', region: 'América', frecuente: true },
  { codigo: 'ARG', iso2: 'AR', descripcion: 'Argentina', bandera: '🇦🇷', codigo_telefono: '+54', region: 'América', frecuente: true },
  { codigo: 'BRA', iso2: 'BR', descripcion: 'Brasil', bandera: '🇧🇷', codigo_telefono: '+55', region: 'América', frecuente: true },
  { codigo: 'URY', iso2: 'UY', descripcion: 'Uruguay', bandera: '🇺🇾', codigo_telefono: '+598', region: 'América', frecuente: true },
  { codigo: 'BOL', iso2: 'BO', descripcion: 'Bolivia (Estado Plurinacional de)', bandera: '🇧🇴', codigo_telefono: '+591', region: 'América', frecuente: true },
  { codigo: 'CHL', iso2: 'CL', descripcion: 'Chile', bandera: '🇨🇱', codigo_telefono: '+56', region: 'América', frecuente: true },
  { codigo: 'PER', iso2: 'PE', descripcion: 'Perú', bandera: '🇵🇪', codigo_telefono: '+51', region: 'América', frecuente: true },
  { codigo: 'COL', iso2: 'CO', descripcion: 'Colombia', bandera: '🇨🇴', codigo_telefono: '+57', region: 'América', frecuente: true },
  { codigo: 'MEX', iso2: 'MX', descripcion: 'México', bandera: '🇲🇽', codigo_telefono: '+52', region: 'América', frecuente: true },
  { codigo: 'USA', iso2: 'US', descripcion: 'Estados Unidos de América', bandera: '🇺🇸', codigo_telefono: '+1', region: 'América', frecuente: true },
  { codigo: 'CAN', iso2: 'CA', descripcion: 'Canadá', bandera: '🇨🇦', codigo_telefono: '+1', region: 'América', frecuente: true },
  { codigo: 'ESP', iso2: 'ES', descripcion: 'España', bandera: '🇪🇸', codigo_telefono: '+34', region: 'Europa', frecuente: true },
  { codigo: 'DEU', iso2: 'DE', descripcion: 'Alemania', bandera: '🇩🇪', codigo_telefono: '+49', region: 'Europa', frecuente: true },
  { codigo: 'FRA', iso2: 'FR', descripcion: 'Francia', bandera: '🇫🇷', codigo_telefono: '+33', region: 'Europa', frecuente: true },
  { codigo: 'GBR', iso2: 'GB', descripcion: 'Reino Unido de Gran Bretaña e Irlanda del Norte', bandera: '🇬🇧', codigo_telefono: '+44', region: 'Europa', frecuente: true },
  { codigo: 'ITA', iso2: 'IT', descripcion: 'Italia', bandera: '🇮🇹', codigo_telefono: '+39', region: 'Europa', frecuente: true },
  { codigo: 'CHN', iso2: 'CN', descripcion: 'China', bandera: '🇨🇳', codigo_telefono: '+86', region: 'Asia', frecuente: true },
  { codigo: 'JPN', iso2: 'JP', descripcion: 'Japón', bandera: '🇯🇵', codigo_telefono: '+81', region: 'Asia', frecuente: true },
  { codigo: 'AFG', iso2: 'AF', descripcion: 'Afganistán', bandera: '🇦🇫', codigo_telefono: '+93', region: 'Asia', frecuente: false },
  { codigo: 'ALB', iso2: 'AL', descripcion: 'Albania', bandera: '🇦🇱', codigo_telefono: '+355', region: 'Europa', frecuente: false },
  { codigo: 'AND', iso2: 'AD', descripcion: 'Andorra', bandera: '🇦🇩', codigo_telefono: '+376', region: 'Europa', frecuente: false },
  { codigo: 'AGO', iso2: 'AO', descripcion: 'Angola', bandera: '🇦🇴', codigo_telefono: '+244', region: 'África', frecuente: false },
  { codigo: 'AIA', iso2: 'AI', descripcion: 'Anguila', bandera: '🇦🇮', codigo_telefono: '+1264', region: 'América', frecuente: false },
  { codigo: 'ATG', iso2: 'AG', descripcion: 'Antigua y Barbuda', bandera: '🇦🇬', codigo_telefono: '+1268', region: 'América', frecuente: false },
  { codigo: 'ATA', iso2: 'AQ', descripcion: 'Antártida', bandera: '🇦🇶', codigo_telefono: '+672', region: 'Antártida', frecuente: false },
  { codigo: 'SAU', iso2: 'SA', descripcion: 'Arabia Saudita', bandera: '🇸🇦', codigo_telefono: '+966', region: 'Asia', frecuente: false },
  { codigo: 'DZA', iso2: 'DZ', descripcion: 'Argelia', bandera: '🇩🇿', codigo_telefono: '+213', region: 'África', frecuente: false },
  { codigo: 'ARM', iso2: 'AM', descripcion: 'Armenia', bandera: '🇦🇲', codigo_telefono: '+374', region: 'Asia', frecuente: false },
  { codigo: 'ABW', iso2: 'AW', descripcion: 'Aruba', bandera: '🇦🇼', codigo_telefono: '+297', region: 'América', frecuente: false },
  { codigo: 'AUS', iso2: 'AU', descripcion: 'Australia', bandera: '🇦🇺', codigo_telefono: '+61', region: 'Oceanía', frecuente: false },
  { codigo: 'AUT', iso2: 'AT', descripcion: 'Austria', bandera: '🇦🇹', codigo_telefono: '+43', region: 'Europa', frecuente: false },
  { codigo: 'AZE', iso2: 'AZ', descripcion: 'Azerbaiyán', bandera: '🇦🇿', codigo_telefono: '+994', region: 'Asia', frecuente: false },
  { codigo: 'BHS', iso2: 'BS', descripcion: 'Bahamas', bandera: '🇧🇸', codigo_telefono: '+1242', region: 'América', frecuente: false },
  { codigo: 'BHR', iso2: 'BH', descripcion: 'Bahrein', bandera: '🇧🇭', codigo_telefono: '+973', region: 'Asia', frecuente: false },
  { codigo: 'BGD', iso2: 'BD', descripcion: 'Bangladesh', bandera: '🇧🇩', codigo_telefono: '+880', region: 'Asia', frecuente: false },
  { codigo: 'BRB', iso2: 'BB', descripcion: 'Barbados', bandera: '🇧🇧', codigo_telefono: '+1246', region: 'América', frecuente: false },
  { codigo: 'BLR', iso2: 'BY', descripcion: 'Belarús', bandera: '🇧🇾', codigo_telefono: '+375', region: 'Europa', frecuente: false },
  { codigo: 'BLZ', iso2: 'BZ', descripcion: 'Belice', bandera: '🇧🇿', codigo_telefono: '+501', region: 'América', frecuente: false },
  { codigo: 'BEN', iso2: 'BJ', descripcion: 'Benin', bandera: '🇧🇯', codigo_telefono: '+229', region: 'África', frecuente: false },
  { codigo: 'BMU', iso2: 'BM', descripcion: 'Bermuda', bandera: '🇧🇲', codigo_telefono: '+1441', region: 'América', frecuente: false },
  { codigo: 'BTN', iso2: 'BT', descripcion: 'Bhután', bandera: '🇧🇹', codigo_telefono: '+975', region: 'Asia', frecuente: false },
  { codigo: 'BES', iso2: 'BQ', descripcion: 'Bonaire, San Eustaquio y Saba', bandera: '🇧🇶', codigo_telefono: '+599', region: 'América', frecuente: false },
  { codigo: 'BIH', iso2: 'BA', descripcion: 'Bosnia y Herzegovina', bandera: '🇧🇦', codigo_telefono: '+387', region: 'Europa', frecuente: false },
  { codigo: 'BWA', iso2: 'BW', descripcion: 'Botswana', bandera: '🇧🇼', codigo_telefono: '+267', region: 'África', frecuente: false },
  { codigo: 'BRN', iso2: 'BN', descripcion: 'Brunei Darussalam', bandera: '🇧🇳', codigo_telefono: '+673', region: 'Asia', frecuente: false },
  { codigo: 'BGR', iso2: 'BG', descripcion: 'Bulgaria', bandera: '🇧🇬', codigo_telefono: '+359', region: 'Europa', frecuente: false },
  { codigo: 'BFA', iso2: 'BF', descripcion: 'Burkina Faso', bandera: '🇧🇫', codigo_telefono: '+226', region: 'África', frecuente: false },
  { codigo: 'BDI', iso2: 'BI', descripcion: 'Burundi', bandera: '🇧🇮', codigo_telefono: '+257', region: 'África', frecuente: false },
  { codigo: 'BEL', iso2: 'BE', descripcion: 'Bélgica', bandera: '🇧🇪', codigo_telefono: '+32', region: 'Europa', frecuente: false },
  { codigo: 'CUB', iso2: 'CU', descripcion: 'CUBA', bandera: '🇨🇺', codigo_telefono: '+53', region: 'América', frecuente: false },
  { codigo: 'CPV', iso2: 'CV', descripcion: 'Cabo Verde', bandera: '🇨🇻', codigo_telefono: '+238', region: 'África', frecuente: false },
  { codigo: 'KHM', iso2: 'KH', descripcion: 'Camboya', bandera: '🇰🇭', codigo_telefono: '+855', region: 'Asia', frecuente: false },
  { codigo: 'CMR', iso2: 'CM', descripcion: 'Camerún', bandera: '🇨🇲', codigo_telefono: '+237', region: 'África', frecuente: false },
  { codigo: 'TCD', iso2: 'TD', descripcion: 'Chad', bandera: '🇹🇩', codigo_telefono: '+235', region: 'África', frecuente: false },
  { codigo: 'CZE', iso2: 'CZ', descripcion: 'Chequia', bandera: '🇨🇿', codigo_telefono: '+420', region: 'Europa', frecuente: false },
  { codigo: 'CYP', iso2: 'CY', descripcion: 'Chipre', bandera: '🇨🇾', codigo_telefono: '+357', region: 'Europa', frecuente: false },
  { codigo: 'COM', iso2: 'KM', descripcion: 'Comoras', bandera: '🇰🇲', codigo_telefono: '+269', region: 'África', frecuente: false },
  { codigo: 'COG', iso2: 'CG', descripcion: 'Congo', bandera: '🇨🇬', codigo_telefono: '+242', region: 'África', frecuente: false },
  { codigo: 'CRI', iso2: 'CR', descripcion: 'Costa Rica', bandera: '🇨🇷', codigo_telefono: '+506', region: 'América', frecuente: false },
  { codigo: 'HRV', iso2: 'HR', descripcion: 'Croacia', bandera: '🇭🇷', codigo_telefono: '+385', region: 'Europa', frecuente: false },
  { codigo: 'CUW', iso2: 'CW', descripcion: 'Curaçao', bandera: '🇨🇼', codigo_telefono: '+599', region: 'América', frecuente: false },
  { codigo: 'DNK', iso2: 'DK', descripcion: 'Dinamarca', bandera: '🇩🇰', codigo_telefono: '+45', region: 'Europa', frecuente: false },
  { codigo: 'DJI', iso2: 'DJ', descripcion: 'Djibouti', bandera: '🇩🇯', codigo_telefono: '+253', region: 'África', frecuente: false },
  { codigo: 'DMA', iso2: 'DM', descripcion: 'Dominica', bandera: '🇩🇲', codigo_telefono: '+1767', region: 'América', frecuente: false },
  { codigo: 'ECU', iso2: 'EC', descripcion: 'Ecuador', bandera: '🇪🇨', codigo_telefono: '+593', region: 'América', frecuente: false },
  { codigo: 'EGY', iso2: 'EG', descripcion: 'Egipto', bandera: '🇪🇬', codigo_telefono: '+20', region: 'África', frecuente: false },
  { codigo: 'SLV', iso2: 'SV', descripcion: 'El Salvador', bandera: '🇸🇻', codigo_telefono: '+503', region: 'América', frecuente: false },
  { codigo: 'ARE', iso2: 'AE', descripcion: 'Emiratos Árabes Unidos', bandera: '🇦🇪', codigo_telefono: '+971', region: 'Asia', frecuente: false },
  { codigo: 'ERI', iso2: 'ER', descripcion: 'Eritrea', bandera: '🇪🇷', codigo_telefono: '+291', region: 'África', frecuente: false },
  { codigo: 'SVK', iso2: 'SK', descripcion: 'Eslovaquia', bandera: '🇸🇰', codigo_telefono: '+421', region: 'Europa', frecuente: false },
  { codigo: 'SVN', iso2: 'SI', descripcion: 'Eslovenia', bandera: '🇸🇮', codigo_telefono: '+386', region: 'Europa', frecuente: false },
  { codigo: 'PSE', iso2: 'PS', descripcion: 'Estado de Palestina', bandera: '🇵🇸', codigo_telefono: '+970', region: 'Asia', frecuente: false },
  { codigo: 'EST', iso2: 'EE', descripcion: 'Estonia', bandera: '🇪🇪', codigo_telefono: '+372', region: 'Europa', frecuente: false },
  { codigo: 'ETH', iso2: 'ET', descripcion: 'Etiopía', bandera: '🇪🇹', codigo_telefono: '+251', region: 'África', frecuente: false },
  { codigo: 'RUS', iso2: 'RU', descripcion: 'Federación de Rusia', bandera: '🇷🇺', codigo_telefono: '+7', region: 'Europa', frecuente: false },
  { codigo: 'FJI', iso2: 'FJ', descripcion: 'Fiji', bandera: '🇫🇯', codigo_telefono: '+679', region: 'Oceanía', frecuente: false },
  { codigo: 'PHL', iso2: 'PH', descripcion: 'Filipinas', bandera: '🇵🇭', codigo_telefono: '+63', region: 'Asia', frecuente: false },
  { codigo: 'FIN', iso2: 'FI', descripcion: 'Finlandia', bandera: '🇫🇮', codigo_telefono: '+358', region: 'Europa', frecuente: false },
  { codigo: 'GAB', iso2: 'GA', descripcion: 'Gabón', bandera: '🇬🇦', codigo_telefono: '+241', region: 'África', frecuente: false },
  { codigo: 'GMB', iso2: 'GM', descripcion: 'Gambia', bandera: '🇬🇲', codigo_telefono: '+220', region: 'África', frecuente: false },
  { codigo: 'GEO', iso2: 'GE', descripcion: 'Georgia', bandera: '🇬🇪', codigo_telefono: '+995', region: 'Asia', frecuente: false },
  { codigo: 'SGS', iso2: 'GS', descripcion: 'Georgia del Sur y las Islas Sandwich del Sur', bandera: '🇬🇸', codigo_telefono: '-', region: 'América', frecuente: false },
  { codigo: 'GHA', iso2: 'GH', descripcion: 'Ghana', bandera: '🇬🇭', codigo_telefono: '+233', region: 'África', frecuente: false },
  { codigo: 'GIB', iso2: 'GI', descripcion: 'Gibraltar', bandera: '🇬🇮', codigo_telefono: '+350', region: 'Europa', frecuente: false },
  { codigo: 'GRD', iso2: 'GD', descripcion: 'Granada', bandera: '🇬🇩', codigo_telefono: '+1473', region: 'América', frecuente: false },
  { codigo: 'GRC', iso2: 'GR', descripcion: 'Grecia', bandera: '🇬🇷', codigo_telefono: '+30', region: 'Europa', frecuente: false },
  { codigo: 'GRL', iso2: 'GL', descripcion: 'Groenlandia', bandera: '🇬🇱', codigo_telefono: '+299', region: 'América', frecuente: false },
  { codigo: 'GLP', iso2: 'GP', descripcion: 'Guadalupe', bandera: '🇬🇵', codigo_telefono: '+590', region: 'América', frecuente: false },
  { codigo: 'GUM', iso2: 'GU', descripcion: 'Guam', bandera: '🇬🇺', codigo_telefono: '+1671', region: 'Oceanía', frecuente: false },
  { codigo: 'GTM', iso2: 'GT', descripcion: 'Guatemala', bandera: '🇬🇹', codigo_telefono: '+502', region: 'América', frecuente: false },
  { codigo: 'GUF', iso2: 'GF', descripcion: 'Guayana Francesa', bandera: '🇬🇫', codigo_telefono: '+594', region: 'América', frecuente: false },
  { codigo: 'GGY', iso2: 'GG', descripcion: 'Guernsey', bandera: '🇬🇬', codigo_telefono: '+44', region: 'Europa', frecuente: false },
  { codigo: 'GIN', iso2: 'GN', descripcion: 'Guinea', bandera: '🇬🇳', codigo_telefono: '+224', region: 'África', frecuente: false },
  { codigo: 'GNQ', iso2: 'GQ', descripcion: 'Guinea Ecuatorial', bandera: '🇬🇶', codigo_telefono: '+240', region: 'África', frecuente: false },
  { codigo: 'GNB', iso2: 'GW', descripcion: 'Guinea-Bissau', bandera: '🇬🇼', codigo_telefono: '+245', region: 'África', frecuente: false },
  { codigo: 'GUY', iso2: 'GY', descripcion: 'Guyana', bandera: '🇬🇾', codigo_telefono: '+592', region: 'América', frecuente: false },
  { codigo: 'HTI', iso2: 'HT', descripcion: 'Haití', bandera: '🇭🇹', codigo_telefono: '+509', region: 'América', frecuente: false },
  { codigo: 'HND', iso2: 'HN', descripcion: 'Honduras', bandera: '🇭🇳', codigo_telefono: '+504', region: 'América', frecuente: false },
  { codigo: 'HKG', iso2: 'HK', descripcion: 'Hong Kong', bandera: '🇭🇰', codigo_telefono: '+852', region: 'Asia', frecuente: false },
  { codigo: 'HUN', iso2: 'HU', descripcion: 'Hungría', bandera: '🇭🇺', codigo_telefono: '+36', region: 'Europa', frecuente: false },
  { codigo: 'IND', iso2: 'IN', descripcion: 'India', bandera: '🇮🇳', codigo_telefono: '+91', region: 'Asia', frecuente: false },
  { codigo: 'IDN', iso2: 'ID', descripcion: 'Indonesia', bandera: '🇮🇩', codigo_telefono: '+62', region: 'Asia', frecuente: false },
  { codigo: 'IRQ', iso2: 'IQ', descripcion: 'Iraq', bandera: '🇮🇶', codigo_telefono: '+964', region: 'Asia', frecuente: false },
  { codigo: 'IRL', iso2: 'IE', descripcion: 'Irlanda', bandera: '🇮🇪', codigo_telefono: '+353', region: 'Europa', frecuente: false },
  { codigo: 'IRN', iso2: 'IR', descripcion: 'Irán (República Islámica de)', bandera: '🇮🇷', codigo_telefono: '+98', region: 'Asia', frecuente: false },
  { codigo: 'IMN', iso2: 'IM', descripcion: 'Isla de Man', bandera: '🇮🇲', codigo_telefono: '+44', region: 'Europa', frecuente: false },
  { codigo: 'CXR', iso2: 'CX', descripcion: 'Isla de Navidad', bandera: '🇨🇽', codigo_telefono: '+61', region: 'Oceanía', frecuente: false },
  { codigo: 'ISL', iso2: 'IS', descripcion: 'Islandia', bandera: '🇮🇸', codigo_telefono: '+354', region: 'Europa', frecuente: false },
  { codigo: 'CYM', iso2: 'KY', descripcion: 'Islas Caimán', bandera: '🇰🇾', codigo_telefono: '+1345', region: 'América', frecuente: false },
  { codigo: 'CCK', iso2: 'CC', descripcion: 'Islas Cocos (Keeling)', bandera: '🇨🇨', codigo_telefono: '+61', region: 'Oceanía', frecuente: false },
  { codigo: 'COK', iso2: 'CK', descripcion: 'Islas Cook', bandera: '🇨🇰', codigo_telefono: '+682', region: 'Oceanía', frecuente: false },
  { codigo: 'FRO', iso2: 'FO', descripcion: 'Islas Feroe', bandera: '🇫🇴', codigo_telefono: '+298', region: 'Europa', frecuente: false },
  { codigo: 'HMD', iso2: 'HM', descripcion: 'Islas Heard y McDonald', bandera: '🇭🇲', codigo_telefono: '-', region: 'Oceanía', frecuente: false },
  { codigo: 'FLK', iso2: 'FK', descripcion: 'Islas Malvinas (Falkland)', bandera: '🇫🇰', codigo_telefono: '+500', region: 'América', frecuente: false },
  { codigo: 'MNP', iso2: 'MP', descripcion: 'Islas Marianas Septentrionales', bandera: '🇲🇵', codigo_telefono: '+1670', region: 'Oceanía', frecuente: false },
  { codigo: 'MHL', iso2: 'MH', descripcion: 'Islas Marshall', bandera: '🇲🇭', codigo_telefono: '+692', region: 'Oceanía', frecuente: false },
  { codigo: 'NFK', iso2: 'NF', descripcion: 'Islas Norfolk', bandera: '🇳🇫', codigo_telefono: '+672', region: 'Oceanía', frecuente: false },
  { codigo: 'SLB', iso2: 'SB', descripcion: 'Islas Salomón', bandera: '🇸🇧', codigo_telefono: '+677', region: 'Oceanía', frecuente: false },
  { codigo: 'SJM', iso2: 'SJ', descripcion: 'Islas Svalbard y Jan Mayen', bandera: '🇸🇯', codigo_telefono: '+47', region: 'Europa', frecuente: false },
  { codigo: 'TCA', iso2: 'TC', descripcion: 'Islas Turcas y Caicos', bandera: '🇹🇨', codigo_telefono: '+1649', region: 'América', frecuente: false },
  { codigo: 'VGB', iso2: 'VG', descripcion: 'Islas Vírgenes Británicas', bandera: '🇻🇬', codigo_telefono: '+1284', region: 'América', frecuente: false },
  { codigo: 'VIR', iso2: 'VI', descripcion: 'Islas Vírgenes de los Estados Unidos', bandera: '🇻🇮', codigo_telefono: '+1340', region: 'América', frecuente: false },
  { codigo: 'WLF', iso2: 'WF', descripcion: 'Islas Wallis y Futuna', bandera: '🇼🇫', codigo_telefono: '+681', region: 'Oceanía', frecuente: false },
  { codigo: 'UMI', iso2: 'UM', descripcion: 'Islas menores alejadas de Estados Unidos', bandera: '🇺🇲', codigo_telefono: '-', region: 'América', frecuente: false },
  { codigo: 'ALA', iso2: 'AX', descripcion: 'Islas Åland', bandera: '🇦🇽', codigo_telefono: '+358', region: 'Europa', frecuente: false },
  { codigo: 'ISR', iso2: 'IL', descripcion: 'Israel', bandera: '🇮🇱', codigo_telefono: '+972', region: 'Asia', frecuente: false },
  { codigo: 'JAM', iso2: 'JM', descripcion: 'Jamaica', bandera: '🇯🇲', codigo_telefono: '+1876', region: 'América', frecuente: false },
  { codigo: 'JEY', iso2: 'JE', descripcion: 'Jersey', bandera: '🇯🇪', codigo_telefono: '+44', region: 'Europa', frecuente: false },
  { codigo: 'JOR', iso2: 'JO', descripcion: 'Jordania', bandera: '🇯🇴', codigo_telefono: '+962', region: 'Asia', frecuente: false },
  { codigo: 'KAZ', iso2: 'KZ', descripcion: 'Kazajstán', bandera: '🇰🇿', codigo_telefono: '+7', region: 'Asia', frecuente: false },
  { codigo: 'KEN', iso2: 'KE', descripcion: 'Kenya', bandera: '🇰🇪', codigo_telefono: '+254', region: 'África', frecuente: false },
  { codigo: 'KGZ', iso2: 'KG', descripcion: 'Kirguistán', bandera: '🇰🇬', codigo_telefono: '+996', region: 'Asia', frecuente: false },
  { codigo: 'KIR', iso2: 'KI', descripcion: 'Kiribati', bandera: '🇰🇮', codigo_telefono: '+686', region: 'Oceanía', frecuente: false },
  { codigo: 'KWT', iso2: 'KW', descripcion: 'Kuwait', bandera: '🇰🇼', codigo_telefono: '+965', region: 'Asia', frecuente: false },
  { codigo: 'LSO', iso2: 'LS', descripcion: 'Lesotho', bandera: '🇱🇸', codigo_telefono: '+266', region: 'África', frecuente: false },
  { codigo: 'LVA', iso2: 'LV', descripcion: 'Letonia', bandera: '🇱🇻', codigo_telefono: '+371', region: 'Europa', frecuente: false },
  { codigo: 'LBR', iso2: 'LR', descripcion: 'Liberia', bandera: '🇱🇷', codigo_telefono: '+231', region: 'África', frecuente: false },
  { codigo: 'LBY', iso2: 'LY', descripcion: 'Libia', bandera: '🇱🇾', codigo_telefono: '+218', region: 'África', frecuente: false },
  { codigo: 'LIE', iso2: 'LI', descripcion: 'Liechtenstein', bandera: '🇱🇮', codigo_telefono: '+423', region: 'Europa', frecuente: false },
  { codigo: 'LTU', iso2: 'LT', descripcion: 'Lituania', bandera: '🇱🇹', codigo_telefono: '+370', region: 'Europa', frecuente: false },
  { codigo: 'LUX', iso2: 'LU', descripcion: 'Luxemburgo', bandera: '🇱🇺', codigo_telefono: '+352', region: 'Europa', frecuente: false },
  { codigo: 'LBN', iso2: 'LB', descripcion: 'Líbano', bandera: '🇱🇧', codigo_telefono: '+961', region: 'Asia', frecuente: false },
  { codigo: 'MAC', iso2: 'MO', descripcion: 'Macao', bandera: '🇲🇴', codigo_telefono: '+853', region: 'Asia', frecuente: false },
  { codigo: 'MKD', iso2: 'MK', descripcion: 'Macedonia del Norte', bandera: '🇲🇰', codigo_telefono: '+389', region: 'Europa', frecuente: false },
  { codigo: 'MDG', iso2: 'MG', descripcion: 'Madagascar', bandera: '🇲🇬', codigo_telefono: '+261', region: 'África', frecuente: false },
  { codigo: 'MYS', iso2: 'MY', descripcion: 'Malasia', bandera: '🇲🇾', codigo_telefono: '+60', region: 'Asia', frecuente: false },
  { codigo: 'MWI', iso2: 'MW', descripcion: 'Malawi', bandera: '🇲🇼', codigo_telefono: '+265', region: 'África', frecuente: false },
  { codigo: 'MDV', iso2: 'MV', descripcion: 'Maldivas', bandera: '🇲🇻', codigo_telefono: '+960', region: 'Asia', frecuente: false },
  { codigo: 'MLT', iso2: 'MT', descripcion: 'Malta', bandera: '🇲🇹', codigo_telefono: '+356', region: 'Europa', frecuente: false },
  { codigo: 'MLI', iso2: 'ML', descripcion: 'Malí', bandera: '🇲🇱', codigo_telefono: '+223', region: 'África', frecuente: false },
  { codigo: 'MAR', iso2: 'MA', descripcion: 'Marruecos', bandera: '🇲🇦', codigo_telefono: '+212', region: 'África', frecuente: false },
  { codigo: 'MTQ', iso2: 'MQ', descripcion: 'Martinica', bandera: '🇲🇶', codigo_telefono: '+596', region: 'América', frecuente: false },
  { codigo: 'MUS', iso2: 'MU', descripcion: 'Mauricio', bandera: '🇲🇺', codigo_telefono: '+230', region: 'África', frecuente: false },
  { codigo: 'MRT', iso2: 'MR', descripcion: 'Mauritania', bandera: '🇲🇷', codigo_telefono: '+222', region: 'África', frecuente: false },
  { codigo: 'MYT', iso2: 'YT', descripcion: 'Mayotte', bandera: '🇾🇹', codigo_telefono: '+262', region: 'África', frecuente: false },
  { codigo: 'FSM', iso2: 'FM', descripcion: 'Micronesia (Estados Federados de)', bandera: '🇫🇲', codigo_telefono: '+691', region: 'Oceanía', frecuente: false },
  { codigo: 'MNG', iso2: 'MN', descripcion: 'Mongolia', bandera: '🇲🇳', codigo_telefono: '+976', region: 'Asia', frecuente: false },
  { codigo: 'MNE', iso2: 'ME', descripcion: 'Montenegro', bandera: '🇲🇪', codigo_telefono: '+382', region: 'Europa', frecuente: false },
  { codigo: 'MSR', iso2: 'MS', descripcion: 'Montserrat', bandera: '🇲🇸', codigo_telefono: '+1664', region: 'América', frecuente: false },
  { codigo: 'MOZ', iso2: 'MZ', descripcion: 'Mozambique', bandera: '🇲🇿', codigo_telefono: '+258', region: 'África', frecuente: false },
  { codigo: 'MMR', iso2: 'MM', descripcion: 'Myanmar', bandera: '🇲🇲', codigo_telefono: '+95', region: 'Asia', frecuente: false },
  { codigo: 'MCO', iso2: 'MC', descripcion: 'Mónaco', bandera: '🇲🇨', codigo_telefono: '+377', region: 'Europa', frecuente: false },
  { codigo: 'NN', iso2: 'NN', descripcion: 'NO EXISTE', bandera: '', codigo_telefono: '-', region: '-', frecuente: false },
  { codigo: 'NAM', iso2: 'NA', descripcion: 'Namibia', bandera: '🇳🇦', codigo_telefono: '+264', region: 'África', frecuente: false },
  { codigo: 'NRU', iso2: 'NR', descripcion: 'Nauru', bandera: '🇳🇷', codigo_telefono: '+674', region: 'Oceanía', frecuente: false },
  { codigo: 'NPL', iso2: 'NP', descripcion: 'Nepal', bandera: '🇳🇵', codigo_telefono: '+977', region: 'Asia', frecuente: false },
  { codigo: 'NIC', iso2: 'NI', descripcion: 'Nicaragua', bandera: '🇳🇮', codigo_telefono: '+505', region: 'América', frecuente: false },
  { codigo: 'NGA', iso2: 'NG', descripcion: 'Nigeria', bandera: '🇳🇬', codigo_telefono: '+234', region: 'África', frecuente: false },
  { codigo: 'NIU', iso2: 'NU', descripcion: 'Niue', bandera: '🇳🇺', codigo_telefono: '+683', region: 'Oceanía', frecuente: false },
  { codigo: 'NOR', iso2: 'NO', descripcion: 'Noruega', bandera: '🇳🇴', codigo_telefono: '+47', region: 'Europa', frecuente: false },
  { codigo: 'NCL', iso2: 'NC', descripcion: 'Nueva Caledonia', bandera: '🇳🇨', codigo_telefono: '+687', region: 'Oceanía', frecuente: false },
  { codigo: 'NZL', iso2: 'NZ', descripcion: 'Nueva Zelandia', bandera: '🇳🇿', codigo_telefono: '+64', region: 'Oceanía', frecuente: false },
  { codigo: 'NER', iso2: 'NE', descripcion: 'Níger', bandera: '🇳🇪', codigo_telefono: '+227', region: 'África', frecuente: false },
  { codigo: 'OMN', iso2: 'OM', descripcion: 'Omán', bandera: '🇴🇲', codigo_telefono: '+968', region: 'Asia', frecuente: false },
  { codigo: 'PAK', iso2: 'PK', descripcion: 'Pakistán', bandera: '🇵🇰', codigo_telefono: '+92', region: 'Asia', frecuente: false },
  { codigo: 'PLW', iso2: 'PW', descripcion: 'Palau', bandera: '🇵🇼', codigo_telefono: '+680', region: 'Oceanía', frecuente: false },
  { codigo: 'PAN', iso2: 'PA', descripcion: 'Panamá', bandera: '🇵🇦', codigo_telefono: '+507', region: 'América', frecuente: false },
  { codigo: 'PNG', iso2: 'PG', descripcion: 'Papua Nueva Guinea', bandera: '🇵🇬', codigo_telefono: '+675', region: 'Oceanía', frecuente: false },
  { codigo: 'NLD', iso2: 'NL', descripcion: 'Países Bajos', bandera: '🇳🇱', codigo_telefono: '+31', region: 'Europa', frecuente: false },
  { codigo: 'PCN', iso2: 'PN', descripcion: 'Pitcairn', bandera: '🇵🇳', codigo_telefono: '+64', region: 'Oceanía', frecuente: false },
  { codigo: 'PYF', iso2: 'PF', descripcion: 'Polinesia Francesa', bandera: '🇵🇫', codigo_telefono: '+689', region: 'Oceanía', frecuente: false },
  { codigo: 'POL', iso2: 'PL', descripcion: 'Polonia', bandera: '🇵🇱', codigo_telefono: '+48', region: 'Europa', frecuente: false },
  { codigo: 'PRT', iso2: 'PT', descripcion: 'Portugal', bandera: '🇵🇹', codigo_telefono: '+351', region: 'Europa', frecuente: false },
  { codigo: 'PRI', iso2: 'PR', descripcion: 'Puerto Rico', bandera: '🇵🇷', codigo_telefono: '+1787', region: 'América', frecuente: false },
  { codigo: 'QAT', iso2: 'QA', descripcion: 'Qatar', bandera: '🇶🇦', codigo_telefono: '+974', region: 'Asia', frecuente: false },
  { codigo: 'CAF', iso2: 'CF', descripcion: 'República Centroafricana', bandera: '🇨🇫', codigo_telefono: '+236', region: 'África', frecuente: false },
  { codigo: 'LAO', iso2: 'LA', descripcion: 'República Democrática Popular Lao', bandera: '🇱🇦', codigo_telefono: '+856', region: 'Asia', frecuente: false },
  { codigo: 'COD', iso2: 'CD', descripcion: 'República Democrática del Congo', bandera: '🇨🇩', codigo_telefono: '+243', region: 'África', frecuente: false },
  { codigo: 'DOM', iso2: 'DO', descripcion: 'República Dominicana', bandera: '🇩🇴', codigo_telefono: '+1809', region: 'América', frecuente: false },
  { codigo: 'PRK', iso2: 'KP', descripcion: 'República Popular Democrática de Corea', bandera: '🇰🇵', codigo_telefono: '+850', region: 'Asia', frecuente: false },
  { codigo: 'TZA', iso2: 'TZ', descripcion: 'República Unida de Tanzanía', bandera: '🇹🇿', codigo_telefono: '+255', region: 'África', frecuente: false },
  { codigo: 'KOR', iso2: 'KR', descripcion: 'República de Corea', bandera: '🇰🇷', codigo_telefono: '+82', region: 'Asia', frecuente: false },
  { codigo: 'MDA', iso2: 'MD', descripcion: 'República de Moldova', bandera: '🇲🇩', codigo_telefono: '+373', region: 'Europa', frecuente: false },
  { codigo: 'SYR', iso2: 'SY', descripcion: 'República Árabe Siria', bandera: '🇸🇾', codigo_telefono: '+963', region: 'Asia', frecuente: false },
  { codigo: 'REU', iso2: 'RE', descripcion: 'Reunión', bandera: '🇷🇪', codigo_telefono: '+262', region: 'África', frecuente: false },
  { codigo: 'ROU', iso2: 'RO', descripcion: 'Rumania', bandera: '🇷🇴', codigo_telefono: '+40', region: 'Europa', frecuente: false },
  { codigo: 'RWA', iso2: 'RW', descripcion: 'Rwanda', bandera: '🇷🇼', codigo_telefono: '+250', region: 'África', frecuente: false },
  { codigo: 'KNA', iso2: 'KN', descripcion: 'Saint Kitts y Nevis', bandera: '🇰🇳', codigo_telefono: '+1869', region: 'América', frecuente: false },
  { codigo: 'SPM', iso2: 'PM', descripcion: 'Saint Pierre y Miquelon', bandera: '🇵🇲', codigo_telefono: '+508', region: 'América', frecuente: false },
  { codigo: 'WSM', iso2: 'WS', descripcion: 'Samoa', bandera: '🇼🇸', codigo_telefono: '+685', region: 'Oceanía', frecuente: false },
  { codigo: 'ASM', iso2: 'AS', descripcion: 'Samoa Americana', bandera: '🇦🇸', codigo_telefono: '+1684', region: 'Oceanía', frecuente: false },
  { codigo: 'BLM', iso2: 'BL', descripcion: 'San Bartolomé', bandera: '🇧🇱', codigo_telefono: '+590', region: 'América', frecuente: false },
  { codigo: 'SMR', iso2: 'SM', descripcion: 'San Marino', bandera: '🇸🇲', codigo_telefono: '+378', region: 'Europa', frecuente: false },
  { codigo: 'MAF', iso2: 'MF', descripcion: 'San Martín (parte francesa)', bandera: '🇲🇫', codigo_telefono: '+590', region: 'América', frecuente: false },
  { codigo: 'SXM', iso2: 'SX', descripcion: 'San Martín (parte holandés)', bandera: '🇸🇽', codigo_telefono: '+1721', region: 'América', frecuente: false },
  { codigo: 'VCT', iso2: 'VC', descripcion: 'San Vicente y las Granadinas', bandera: '🇻🇨', codigo_telefono: '+1784', region: 'América', frecuente: false },
  { codigo: 'SHN', iso2: 'SH', descripcion: 'Santa Elena', bandera: '🇸🇭', codigo_telefono: '+290', region: 'África', frecuente: false },
  { codigo: 'LCA', iso2: 'LC', descripcion: 'Santa Lucía', bandera: '🇱🇨', codigo_telefono: '+1758', region: 'América', frecuente: false },
  { codigo: 'VAT', iso2: 'VA', descripcion: 'Santa Sede', bandera: '🇻🇦', codigo_telefono: '+39', region: 'Europa', frecuente: false },
  { codigo: 'STP', iso2: 'ST', descripcion: 'Santo Tomé y Príncipe', bandera: '🇸🇹', codigo_telefono: '+239', region: 'África', frecuente: false },
  { codigo: 'SEN', iso2: 'SN', descripcion: 'Senegal', bandera: '🇸🇳', codigo_telefono: '+221', region: 'África', frecuente: false },
  { codigo: 'SRB', iso2: 'RS', descripcion: 'Serbia', bandera: '🇷🇸', codigo_telefono: '+381', region: 'Europa', frecuente: false },
  { codigo: 'SYC', iso2: 'SC', descripcion: 'Seychelles', bandera: '🇸🇨', codigo_telefono: '+248', region: 'África', frecuente: false },
  { codigo: 'SLE', iso2: 'SL', descripcion: 'Sierra Leona', bandera: '🇸🇱', codigo_telefono: '+232', region: 'África', frecuente: false },
  { codigo: 'SGP', iso2: 'SG', descripcion: 'Singapur', bandera: '🇸🇬', codigo_telefono: '+65', region: 'Asia', frecuente: false },
  { codigo: 'SOM', iso2: 'SO', descripcion: 'Somalia', bandera: '🇸🇴', codigo_telefono: '+252', region: 'África', frecuente: false },
  { codigo: 'LKA', iso2: 'LK', descripcion: 'Sri Lanka', bandera: '🇱🇰', codigo_telefono: '+94', region: 'Asia', frecuente: false },
  { codigo: 'ZAF', iso2: 'ZA', descripcion: 'Sudáfrica', bandera: '🇿🇦', codigo_telefono: '+27', region: 'África', frecuente: false },
  { codigo: 'SDN', iso2: 'SD', descripcion: 'Sudán', bandera: '🇸🇩', codigo_telefono: '+249', region: 'África', frecuente: false },
  { codigo: 'SSD', iso2: 'SS', descripcion: 'Sudán del Sur', bandera: '🇸🇸', codigo_telefono: '+211', region: 'África', frecuente: false },
  { codigo: 'SWE', iso2: 'SE', descripcion: 'Suecia', bandera: '🇸🇪', codigo_telefono: '+46', region: 'Europa', frecuente: false },
  { codigo: 'CHE', iso2: 'CH', descripcion: 'Suiza', bandera: '🇨🇭', codigo_telefono: '+41', region: 'Europa', frecuente: false },
  { codigo: 'SUR', iso2: 'SR', descripcion: 'Suriname', bandera: '🇸🇷', codigo_telefono: '+597', region: 'América', frecuente: false },
  { codigo: 'SWZ', iso2: 'SZ', descripcion: 'Swazilandia', bandera: '🇸🇿', codigo_telefono: '+268', region: 'África', frecuente: false },
  { codigo: 'ESH', iso2: 'EH', descripcion: 'Sáhara Occidental', bandera: '🇪🇭', codigo_telefono: '+212', region: 'África', frecuente: false },
  { codigo: 'THA', iso2: 'TH', descripcion: 'Tailandia', bandera: '🇹🇭', codigo_telefono: '+66', region: 'Asia', frecuente: false },
  { codigo: 'TWN', iso2: 'TW', descripcion: 'Taiwán (Provincia de China)', bandera: '🇹🇼', codigo_telefono: '+886', region: 'Asia', frecuente: false },
  { codigo: 'TJK', iso2: 'TJ', descripcion: 'Tayikistán', bandera: '🇹🇯', codigo_telefono: '+992', region: 'Asia', frecuente: false },
  { codigo: 'IOT', iso2: 'IO', descripcion: 'Territorio Británico del Océano Índico', bandera: '🇮🇴', codigo_telefono: '+246', region: 'Asia', frecuente: false },
  { codigo: 'ATF', iso2: 'TF', descripcion: 'Territorio de las Tierras Australes Francesas', bandera: '🇹🇫', codigo_telefono: '-', region: 'Antártida', frecuente: false },
  { codigo: 'TLS', iso2: 'TL', descripcion: 'Timor-Leste', bandera: '🇹🇱', codigo_telefono: '+670', region: 'Asia', frecuente: false },
  { codigo: 'TGO', iso2: 'TG', descripcion: 'Togo', bandera: '🇹🇬', codigo_telefono: '+228', region: 'África', frecuente: false },
  { codigo: 'TKL', iso2: 'TK', descripcion: 'Tokelau', bandera: '🇹🇰', codigo_telefono: '+690', region: 'Oceanía', frecuente: false },
  { codigo: 'TON', iso2: 'TO', descripcion: 'Tonga', bandera: '🇹🇴', codigo_telefono: '+676', region: 'Oceanía', frecuente: false },
  { codigo: 'TTO', iso2: 'TT', descripcion: 'Trinidad y Tabago', bandera: '🇹🇹', codigo_telefono: '+1868', region: 'América', frecuente: false },
  { codigo: 'TKM', iso2: 'TM', descripcion: 'Turkmenistán', bandera: '🇹🇲', codigo_telefono: '+993', region: 'Asia', frecuente: false },
  { codigo: 'TUR', iso2: 'TR', descripcion: 'Turquía', bandera: '🇹🇷', codigo_telefono: '+90', region: 'Asia', frecuente: false },
  { codigo: 'TUV', iso2: 'TV', descripcion: 'Tuvalu', bandera: '🇹🇻', codigo_telefono: '+688', region: 'Oceanía', frecuente: false },
  { codigo: 'TUN', iso2: 'TN', descripcion: 'Túnez', bandera: '🇹🇳', codigo_telefono: '+216', region: 'África', frecuente: false },
  { codigo: 'UKR', iso2: 'UA', descripcion: 'Ucrania', bandera: '🇺🇦', codigo_telefono: '+380', region: 'Europa', frecuente: false },
  { codigo: 'UGA', iso2: 'UG', descripcion: 'Uganda', bandera: '🇺🇬', codigo_telefono: '+256', region: 'África', frecuente: false },
  { codigo: 'UZB', iso2: 'UZ', descripcion: 'Uzbekistán', bandera: '🇺🇿', codigo_telefono: '+998', region: 'Asia', frecuente: false },
  { codigo: 'VUT', iso2: 'VU', descripcion: 'Vanuatu', bandera: '🇻🇺', codigo_telefono: '+678', region: 'Oceanía', frecuente: false },
  { codigo: 'VEN', iso2: 'VE', descripcion: 'Venezuela (República Bolivariana de)', bandera: '🇻🇪', codigo_telefono: '+58', region: 'América', frecuente: false },
  { codigo: 'VNM', iso2: 'VN', descripcion: 'Viet Nam', bandera: '🇻🇳', codigo_telefono: '+84', region: 'Asia', frecuente: false },
  { codigo: 'YEM', iso2: 'YE', descripcion: 'Yemen', bandera: '🇾🇪', codigo_telefono: '+967', region: 'Asia', frecuente: false },
  { codigo: 'ZMB', iso2: 'ZM', descripcion: 'Zambia', bandera: '🇿🇲', codigo_telefono: '+260', region: 'África', frecuente: false },
  { codigo: 'ZWE', iso2: 'ZW', descripcion: 'Zimbabwe', bandera: '🇿🇼', codigo_telefono: '+263', region: 'África', frecuente: false },
];

// ============================================
// Constantes útiles
// ============================================

/**
 * País por defecto del sistema (Paraguay).
 */
export const PAIS_DEFAULT = 'PRY';

/**
 * Países frecuentes como receptores (Paraguay y socios comerciales principales).
 */
export const PAISES_FRECUENTES = PAISES_SIFEN.filter(p => p.frecuente);

/**
 * Países del MERCOSUR (estados parte y asociados).
 */
export const PAISES_MERCOSUR = PAISES_SIFEN.filter(p =>
  ['ARG', 'BRA', 'PRY', 'URY', 'BOL', 'CHL', 'COL', 'ECU', 'PER'].includes(p.codigo)
);

/**
 * Países agrupados por región.
 */
export const PAISES_POR_REGION = PAISES_SIFEN.reduce((acc, p) => {
  if (!acc[p.region]) acc[p.region] = [];
  acc[p.region].push(p);
  return acc;
}, {});

// ============================================
// Helpers
// ============================================

/**
 * Busca un país por su código ISO alfa-3 (el que usa SIFEN).
 * @param {string} codigo - Código de 3 letras (ej: 'PRY', 'ARG', 'USA')
 * @returns {object|undefined}
 */
export const getPaisByCodigo = (codigo) =>
  PAISES_SIFEN.find(p => p.codigo === codigo?.toUpperCase());

/**
 * Busca un país por su código ISO alfa-2.
 * Útil cuando integrás con librerías de telefonía o mapas que usan alfa-2.
 * @param {string} iso2 - Código de 2 letras (ej: 'PY', 'AR')
 * @returns {object|undefined}
 */
export const getPaisByIso2 = (iso2) =>
  PAISES_SIFEN.find(p => p.iso2 === iso2?.toUpperCase());

/**
 * Búsqueda por texto en código, nombre o región.
 * Ideal para autocomplete en formularios.
 * @param {string} texto
 * @returns {Array}
 */
export const buscarPais = (texto) => {
  if (!texto) return PAISES_SIFEN;
  const q = texto.toLowerCase().trim();
  return PAISES_SIFEN.filter(p =>
    p.codigo.toLowerCase().includes(q) ||
    p.iso2.toLowerCase().includes(q) ||
    p.descripcion.toLowerCase().includes(q) ||
    p.region.toLowerCase().includes(q)
  );
};

/**
 * Verifica si un código de país es válido para SIFEN.
 * @param {string} codigo - ISO alfa-3
 * @returns {boolean}
 */
export const esPaisValidoSifen = (codigo) =>
  PAISES_SIFEN.some(p => p.codigo === codigo?.toUpperCase());

/**
 * Obtiene el emoji bandera de un país por su código SIFEN.
 * @param {string} codigo - ISO alfa-3
 * @returns {string} Emoji bandera o cadena vacía
 */
export const getBandera = (codigo) => {
  const p = getPaisByCodigo(codigo);
  return p ? p.bandera : '';
};
