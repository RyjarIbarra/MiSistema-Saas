package com.MiSistema.Config;

import com.MiSistema.ModelsDto.Login.UserCredentials;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static UserCredentials getUserCredentials() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserCredentials) {
            return (UserCredentials) authentication.getPrincipal();
        }
        return null;
    }

}
