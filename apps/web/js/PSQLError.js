import { showWarningToast } from "./toast.js";

/**
 * Extrae información de errores de PostgreSQL
 * @param {Error} error - El error capturado
 * @returns {Object|null} - Objeto con información del error o null si no es duplicado
 */
function parseError(error) {  
  const errorMessage = error.message || error.toString();    
 
  // Detectar si es un error de clave duplicada
  if (errorMessage.includes('duplicate key value violates unique constraint')) {
    
    // Extraer el nombre de la constraint
    const constraintMatch = errorMessage.match(/"([^"]+)"/);
    const constraint = constraintMatch ? constraintMatch[1] : 'desconocida';
    
    // Extraer el valor duplicado
    const valueMatch = errorMessage.match(/Key \(([^)]+)\)=\(([^)]+)\)/);
    const campo = valueMatch ? valueMatch[1] : '';
    const valor = valueMatch ? valueMatch[2] : '';
    
    return {
      isDuplicate: true,
      constraint,
      campo,
      valor,
      mensajeOriginal: errorMessage
    };
  }
  
  if (errorMessage.includes('Usuario no encontrado:')) {
    const resultado = errorMessage.split("Usuario no encontrado: ")[1].replace('"', '');    
    return {
      isNoExistUsuario: true,
      isDuplicate: false,
      mensaje: resultado
    };
  }

  if (errorMessage.includes('Usuario bloqueado:')) {
    const resultado = errorMessage.split("Usuario bloqueado: ")[1].replace('"', '');    
    return {  
      isBloqueado: true,
      isDuplicate: false,
      isNoExistUsuario: false,
      mensaje: resultado
    };
  }

  if (errorMessage.includes('violates foreign key constraint')) {
    const resultado = errorMessage.split("violates foreign key constraint \"")[1].split("\"")[0];    
    return {
      isFKViolation: true,
      isDuplicate: false,
      isNoExistUsuario: false,
      isBloqueado: false,
      mensaje: resultado
    };
  }

  if(errorMessage.includes("no encontrado.")) {
    const resultado = errorMessage.split("no encontrado.")[1].replace('"', '');    
    return {
      isNoExist: true,
      isDuplicate: false,
      isNoExistUsuario: false,
      isBloqueado: false,
      isFKViolation: false,
      mensaje: resultado
    };
  }
  
  return null;
}

/**
 * Maneja errores de API y muestra mensajes apropiados
 * @param {Error} error - El error capturado
 * @param {string} entidad - Nombre de la entidad (ej: "Cliente", "Producto")
 */
export function manejarErrorAPI(error, entidad = 'Registro') {
  const errorDuplicado = parseError(error);

  if (errorDuplicado?.isDuplicate) {
    console.log("errorDuplicado: ", errorDuplicado);
    const { campo, valor } = errorDuplicado;
    let valorFormateado = valor;
    // Mapeo de nombres técnicos a nombres amigables
    const nombresAmigables = {
      'cliruc': 'RUC',
      'clinom': 'Nombre',
      'monid': 'Moneda',
      'depnom': 'Depósito',
      'procodbarra': 'Código de Barra',
      'prodesc': 'Descripción',
      'timdoc, timbrado, timsuc, timcaja': 'el mismo formato',
      'email': 'Email',
      // Agrega más campos según necesites
    };
    
    const campoAmigable = nombresAmigables[campo] || campo;

    if(valorFormateado.includes("Factura Electronica")) {
      valorFormateado = valorFormateado.replaceAll(',', '');
    }

    showWarningToast(
      `${entidad} ya existe`,
      `Ya existe un ${entidad.toLowerCase()} con ${campoAmigable}: ${valorFormateado}`,
      5000
    );
    
    return errorDuplicado;
  }

  if (errorDuplicado?.isNoExistUsuario) {

    showWarningToast(
      `Usuario no encontrado`,
      `El usuario ${errorDuplicado.mensaje} no existe`,
      5000
    );    

    return errorDuplicado.isNoExistUsuario;
  }
  
  if (errorDuplicado?.isBloqueado) {

    showWarningToast(
      `Usuario bloqueado`,
      `El usuario ${errorDuplicado.mensaje} está bloqueado`,
      5000
    );    

    return errorDuplicado.isBloqueado;
  }

  if (errorDuplicado?.isFKViolation) {

    showWarningToast(
      `Restricción de clave externa`,//Violación de restricción de clave externa
      `La operación violó la restricción de clave externa ${errorDuplicado.mensaje}, este dato esta en uso.`,
      5000
    );    

    return errorDuplicado.isFKViolation;
  }
  
  if (errorDuplicado?.isNoExist) {

    showWarningToast(
      `${entidad} no encontrado`,
      `El ${entidad.toLowerCase()} ${errorDuplicado.mensaje} no existe`,
      5000
    );    

    return errorDuplicado.isNoExist;
  }
  
  showWarningToast(
    'Error en la operación',
    'Ocurrió un error al procesar la solicitud. Por favor intente nuevamente.',
    5000
  );
  
  return null;
}