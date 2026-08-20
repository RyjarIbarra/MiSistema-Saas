const auth = `auth/`;
export const sign_in = `${auth}sign_in`;
export const insertSession = `${auth}insertSession`;

const menu = `menu/`;
export const menuByUser = `${menu}byUser`;

const client = `cli/`;
export const listClientes = `${client}list`;
export const InsertCliente = `${client}insert`;
export const UpdateCliente = `${client}update`;
export const DeleteCliente = `${client}delete`;
export const getByIdCliente = `${client}getById`;

const proveedor = `proveedor/`;
export const listProveedor = `${proveedor}list`;
export const InsertProveedor = `${proveedor}insert`;
export const UpdateProveedor = `${proveedor}update`;
export const DeleteProveedor = `${proveedor}delete`;
export const getByIdProveedor = `${proveedor}getById`;

const timbrado = `timbrado/`;
export const listTimbrado = `${timbrado}list`;
export const InsertTimbrado = `${timbrado}insert`;
export const UpdateTimbrado = `${timbrado}update`;
export const DeleteTimbrado = `${timbrado}delete`;
export const getByIdTimbrado = `${timbrado}getById`;
export const actEstadoTimbrado = `${timbrado}actestado`;

const sucursal = `sucursal/`;
export const listSucursal = `${sucursal}list`;
export const getByIdSucursal = `${sucursal}getById`;
export const InsertSucursal = `${sucursal}insert`;
export const UpdateSucursal = `${sucursal}update`;
export const DeleteSucursal = `${sucursal}delete`;

const caja = `caja/`;
export const listCaja = `${caja}list`;
export const getByIdCaja = `${caja}getById`;
export const InsertCaja = `${caja}insert`;
export const UpdateCaja = `${caja}update`;
export const DeleteCaja = `${caja}delete`;
export const actEstadoCaja = `${caja}actestado`;

const deposito = `deposito/`;
export const listDeposito = `${deposito}list`;
export const getByIdDeposito = `${deposito}getById`;
export const InsertDeposito = `${deposito}insert`;
export const UpdateDeposito = `${deposito}update`;
export const DeleteDeposito = `${deposito}delete`;

const moneda = `moneda/`;
export const listMoneda = `${moneda}list`;
export const getByIdMoneda = `${moneda}getById`;
export const InsertMoneda = `${moneda}insert`;
export const UpdateMoneda = `${moneda}update`;
export const DeleteMoneda = `${moneda}delete`;

const unidad = `unidadMedida/`;
export const listUnidad = `${unidad}list`;
export const urlgetByIdUnidad = `${unidad}getById`;
export const InsertUnidad = `${unidad}insert`;
export const UpdateUnidad = `${unidad}update`;
export const DeleteUnidad = `${unidad}delete`;
export const actEstadoUnidad = `${unidad}actestado`;

const producto = `producto/`;
export const listProducto = `${producto}list`;
export const listStockDetalladoProducto = `${producto}stockDetallado/list`;
export const precioVentaProducto = `${producto}precioVenta`;
export const getByIdProducto = `${producto}getById`;
export const InsertProducto = `${producto}insert`;
export const UpdateProducto = `${producto}update`;
export const DeleteProducto = `${producto}delete`;
export const migrateTemplateProducto = `${producto}migrate/template`;
export const migrateProducto = `${producto}migrate`;

const ajusteStock = `ajusteStock/`;
export const listAjusteStock = `${ajusteStock}list`;
export const getByIdAjusteStock = `${ajusteStock}getById`;
export const InsertAjusteStock = `${ajusteStock}insert`;
export const anularAjusteStock = `${ajusteStock}anular`;

const documento = `documento/`;
export const listDocumento = `${documento}list`;
export const getByIdDocumento = `${documento}getById`;
export const InsertDocumento = `${documento}insert`;
export const anularDocumento = `${documento}anular`;

// --- Módulo de Bancos ---
const banco = `banco/`;
export const listBanco = `${banco}list`;
export const getByIdBanco = `${banco}getById`;
export const InsertBanco = `${banco}insert`;
export const UpdateBanco = `${banco}update`;
export const DeleteBanco = `${banco}delete`;

const cuentaBancaria = `cuenta-bancaria/`;
export const listCuentaBancaria = `${cuentaBancaria}list`;
export const getByIdCuentaBancaria = `${cuentaBancaria}getById`;
export const InsertCuentaBancaria = `${cuentaBancaria}insert`;
export const UpdateCuentaBancaria = `${cuentaBancaria}update`;
export const DeleteCuentaBancaria = `${cuentaBancaria}delete`;

const tipoMovimiento = `tipo-movimiento/`;
export const listTipoMovimiento = `${tipoMovimiento}list`;
export const getByCodigoTipoMovimiento = `${tipoMovimiento}getByCodigo`;
export const InsertTipoMovimiento = `${tipoMovimiento}insert`;
export const UpdateTipoMovimiento = `${tipoMovimiento}update`;
export const DeleteTipoMovimiento = `${tipoMovimiento}delete`;

const movimientoBancario = `movimiento-bancario/`;
export const listMovimiento = `${movimientoBancario}list`;
export const registrarMovimiento = `${movimientoBancario}registrar`;
export const anularMovimiento = `${movimientoBancario}anular`;
export const saldoCuenta = `${movimientoBancario}saldo`;

const chequera = `chequera/`;
export const listChequera = `${chequera}list`;
export const getByIdChequera = `${chequera}getById`;
export const InsertChequera = `${chequera}insert`;
export const UpdateChequera = `${chequera}update`;
export const DeleteChequera = `${chequera}delete`;

const chequePropio = `cheque-propio/`;
export const listChequePropio = `${chequePropio}list`;
export const getByIdChequePropio = `${chequePropio}getById`;
export const emitirChequePropio = `${chequePropio}emitir`;
export const entregarChequePropio = `${chequePropio}entregar`;
export const cobrarChequePropio = `${chequePropio}cobrar`;
export const rechazarChequePropio = `${chequePropio}rechazar`;
export const anularChequePropio = `${chequePropio}anular`;

const extracto = `extracto/`;
export const listExtracto = `${extracto}list`;
export const getByIdExtracto = `${extracto}getById`;
export const InsertExtracto = `${extracto}insert`;
export const cerrarExtracto = `${extracto}cerrar`;
export const DeleteExtracto = `${extracto}delete`;
export const listPartidas = `${extracto}partidas`;
export const addPartida = `${extracto}partida`;
export const addPartidasBulk = `${extracto}partidas/bulk`;
export const deletePartida = `${extracto}partida`;
export const ignorarPartida = `${extracto}partida/ignorar`;
export const plantillaPartidas = `${extracto}partidas/plantilla`;
export const importarPartidas = `${extracto}partidas/importar`;

const conciliacion = `conciliacion/`;
export const reporteConciliacion = `${conciliacion}reporte`;
export const movimientosConciliar = `${conciliacion}movimientos`;
export const listVinculos = `${conciliacion}vinculos`;
export const vincularConciliacion = `${conciliacion}vincular`;
export const desvincularConciliacion = `${conciliacion}desvincular`;
export const autoMatchConciliacion = `${conciliacion}auto`;

const chequeTercero = `cheque-tercero/`;
export const listChequeTercero = `${chequeTercero}list`;
export const getByIdChequeTercero = `${chequeTercero}getById`;
export const recibirChequeTercero = `${chequeTercero}recibir`;
export const depositarChequeTercero = `${chequeTercero}depositar`;
export const acreditarChequeTercero = `${chequeTercero}acreditar`;
export const endosarChequeTercero = `${chequeTercero}endosar`;
export const rechazarChequeTercero = `${chequeTercero}rechazar`;
export const devolverChequeTercero = `${chequeTercero}devolver`;

const ordenPago = `orden-pago/`;
export const listOrdenPago = `${ordenPago}list`;
export const getByIdOrdenPago = `${ordenPago}getById`;
export const crearOrdenPago = `${ordenPago}crear`;
export const actualizarOrdenPago = `${ordenPago}actualizar`;
export const aprobarOrdenPago = `${ordenPago}aprobar`;
export const anularOrdenPago = `${ordenPago}anular`;
export const eliminarOrdenPago = `${ordenPago}eliminar`;
export const agregarMedioOrdenPago = `${ordenPago}medio`;
export const quitarMedioOrdenPago = `${ordenPago}medio`;
export const pagarOrdenPago = `${ordenPago}pagar`;

const clienteReportes = `cliente/report/`;
export const reporteClientePdf = `${clienteReportes}pdf`;

const productoReportes = `producto/report/`;
export const reporteProductoGeneralPdf = `${productoReportes}general/pdf`;
export const reporteProductoDetallePdf = `${productoReportes}detalle/pdf`;

const documentoReportes = `documento/report/`;
export const kudePdf = `${documentoReportes}kude`; // KuDE (representación gráfica) de un documento
export const reporteProductoPreciosPdf = `${productoReportes}precios/pdf`;
export const reporteProductoStockPdf = `${productoReportes}stock/pdf`;

const familia = `familia/`;
export const listFamilia = `${familia}list`;
export const getByIdFamilia = `${familia}getById`;
export const InsertFamilia = `${familia}insert`;
export const UpdateFamilia = `${familia}update`;
export const DeleteFamilia = `${familia}delete`;

const categoria = `categoria/`;
export const listCategoria = `${categoria}list`;
export const getByIdCategoria = `${categoria}getById`;
export const InsertCategoria = `${categoria}insert`;
export const UpdateCategoria = `${categoria}update`;
export const DeleteCategoria = `${categoria}delete`;

const marca = `marca/`;
export const listMarca = `${marca}list`;
export const getByIdMarca = `${marca}getById`;
export const InsertMarca = `${marca}insert`;
export const UpdateMarca = `${marca}update`;
export const DeleteMarca = `${marca}delete`;

const ubicacion = `ubicacion/`;
export const listUbicacion = `${ubicacion}list`;
export const getByIdUbicacion = `${ubicacion}getById`;
export const InsertUbicacion = `${ubicacion}insert`;
export const UpdateUbicacion = `${ubicacion}update`;
export const DeleteUbicacion = `${ubicacion}delete`;

const tipoPrecio = `tipoPrecio/`;
export const listTipoPrecio = `${tipoPrecio}list`;
export const getByIdTipoPrecio = `${tipoPrecio}getById`;
export const InsertTipoPrecio = `${tipoPrecio}insert`;
export const UpdateTipoPrecio = `${tipoPrecio}update`;
export const DeleteTipoPrecio = `${tipoPrecio}delete`;

const usuario = `usu/`;
export const listUsuarios = `${usuario}list`;
export const getUrlById = `${usuario}getById`;
export const InsertUsuario = `${usuario}insert`;
export const UpdateUsuario = `${usuario}update`;
export const DeleteUsuario = `${usuario}delete`;

const access = `access/`;
export const listAccess = `${access}list`;
export const getByIdAccess = `${access}getById`;
export const InsertAccess = `${access}insert`;
export const UpdateAccess = `${access}update`;
export const DeleteAccess = `${access}delete`;

const empresa = `empresa/`;
export const listEmpresa = `${empresa}list`;
export const getByIdEmpresa = `${empresa}getById`;
export const InsertEmpresa = `${empresa}insert`;
export const UpdateEmpresa = `${empresa}update`;
export const DeleteEmpresa = `${empresa}delete`;

const options = `options/`;
export const getUrlAllUnidades = `${options}unidad`;
export const getUrlAllMonedas = `${options}moneda`;
export const getUrlAllTiposPrecios = `${options}tipoPrecio`;
export const getUrlAllAccess = `${options}access`;
export const getUrlAllTiposDocumento = `${options}tipoDocumento`;

export const getUrlBuscar = `http://localhost:9097/fact/registro-txt/buscar`;
