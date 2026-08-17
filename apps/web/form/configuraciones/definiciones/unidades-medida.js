export const UNIDADES_MEDIDA = [
  { codigo: '87', descripcion: 'Metros', abreviatura: 'm' },
  { codigo: '2366', descripcion: 'Costo por Mil', abreviatura: 'CPM' },
  { codigo: '2329', descripcion: 'Unidad Internacional', abreviatura: 'UI' },
  { codigo: '110', descripcion: 'Metros cúbicos', abreviatura: 'M3' },
  { codigo: '77', descripcion: 'Unidad', abreviatura: 'UNI' },
  { codigo: '86', descripcion: 'Gramos', abreviatura: 'g' },
  { codigo: '89', descripcion: 'Litros', abreviatura: 'LT' },
  { codigo: '90', descripcion: 'Miligramos', abreviatura: 'MG' },
  { codigo: '91', descripcion: 'Centimetros', abreviatura: 'CM' },
  { codigo: '92', descripcion: 'Centimetros cuadrados', abreviatura: 'CM2' },
  { codigo: '93', descripcion: 'Centimetros cubicos', abreviatura: 'CM3' },
  { codigo: '94', descripcion: 'Pulgadas', abreviatura: 'PUL' },
  { codigo: '96', descripcion: 'Milímetros cuadrados', abreviatura: 'MM2' },
  { codigo: '79', descripcion: 'Kilogramos s/ metro cuadrado', abreviatura: 'kg/m2' },
  { codigo: '97', descripcion: 'Año', abreviatura: 'AA' },
  { codigo: '98', descripcion: 'Mes', abreviatura: 'ME' },
  { codigo: '99', descripcion: 'Tonelada', abreviatura: 'TN' },
  { codigo: '100', descripcion: 'Hora', abreviatura: 'Hs' },
  { codigo: '101', descripcion: 'Minuto', abreviatura: 'Mi' },
  { codigo: '104', descripcion: 'Determinación', abreviatura: 'DET' },
  { codigo: '103', descripcion: 'Yardas', abreviatura: 'Ya' },
  { codigo: '108', descripcion: 'Metros', abreviatura: 'MT' },
  { codigo: '109', descripcion: 'Metros cuadrados', abreviatura: 'M2' },
  { codigo: '95', descripcion: 'Milímetros', abreviatura: 'MM' },
  { codigo: '666', descripcion: 'Segundo', abreviatura: 'Se' },
  { codigo: '102', descripcion: 'Día', abreviatura: 'Di' },
  { codigo: '83', descripcion: 'Kilogramos', abreviatura: 'kg' },
  { codigo: '88', descripcion: 'Mililitros', abreviatura: 'ML' },
  { codigo: '625', descripcion: 'Kilómetros', abreviatura: 'Km' },
  { codigo: '660', descripcion: 'Metro lineal', abreviatura: 'ml' },
  { codigo: '885', descripcion: 'Unidad Medida Global', abreviatura: 'GL' },
  { codigo: '891', descripcion: 'Por Milaje', abreviatura: 'pm' },
  { codigo: '869', descripcion: 'Hectáreas', abreviatura: 'ha' },
  { codigo: '569', descripcion: 'Ración', abreviatura: 'ración' }
];

export const buscarUnidadMedida = (texto = '') => {
  const query = texto.trim().toLowerCase();
  if (!query) {
    return [...UNIDADES_MEDIDA];
  }

  return UNIDADES_MEDIDA.filter((item) =>
    item.codigo.toLowerCase().includes(query) ||
    item.descripcion.toLowerCase().includes(query) ||
    item.abreviatura.toLowerCase().includes(query)
  );
};
