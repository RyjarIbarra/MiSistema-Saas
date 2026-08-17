package com.MiSistema.Services;

import com.MiSistema.ModelsDto.Menu.MenuModuleDto;

import java.util.List;

public interface MenuService {
    List<MenuModuleDto> byUser(long idUsuario);
    List<MenuModuleDto> byPlan(long planId);
}
