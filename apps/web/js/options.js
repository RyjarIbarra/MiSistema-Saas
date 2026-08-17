import { getUrlAllAccess, getUrlAllMonedas, getUrlAllTiposDocumento, getUrlAllTiposPrecios, getUrlAllUnidades, listSucursal } from "./apiEndpoints.js";
import { getData, postData } from "./apiService.js";

export async function cargaOptionsUnidad() {
    const response = await getData(`${getUrlAllUnidades}`);
    if (!response.success) return '';
    return response.objectsList
        .map((item) => `<option value="${item.value}">${item.optionText}</option>`)
        .join('');
}

export async function cargaOptionsMoneda() {
    const response = await getData(`${getUrlAllMonedas}`);
    if (!response.success) return '';
    return response.objectsList
        .map((item) => `<option value="${item.value}">${item.optionText}</option>`)
        .join('');
}

export async function cargaOptionsTiposPrecios() {
    const response = await getData(`${getUrlAllTiposPrecios}`);
    if (!response.success) return '';
    return response.objectsList
        .map((item) => `<option value="${item.value}">${item.optionText}</option>`)
        .join('');
}

export async function cargaOptionsAccess() {
    const response = await getData(`${getUrlAllAccess}`);
    if (!response.success) return '';
    return response.objectsList
        .map((item) => `<option value="${item.value}">${item.optionText}</option>`)
        .join('');
}

export async function cargaOptionsTiposDocumento() {
    try {
        const response = await getData(`${getUrlAllTiposDocumento}`);
        if (!response.success) return '';
        return response.objectsList
            .map((item) => `<option value="${item.value}">${item.optionText}</option>`)
            .join('');
    } catch (error) {
        console.error("No se pudieron cargar los tipos de documento:", error);
        return "";
    }
}

export async function cargaOptionsSucursal() {
    const response = await postData(listSucursal, {
        texto: "",
        limit: 0,
        offset: 0
    }, "Sucursal");

    if (!response.success) return "";
    return (response.objectsList || [])
        .map((item) => `<option value="${item.sucest}">${item.sucnom}</option>`)
        .join("");
}
