package com.MiSistemaReport.Config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

/**
 * Solo valida tokens emitidos por MiSistema (no genera).
 * ⚠️ El SECRET_KEY DEBE ser idéntico al de MiSistema para que los tokens decodifiquen.
 */
@Service
public class JwtService {

    // 🔑 MISMA clave secreta que MiSistema — cualquier cambio rompe la compatibilidad de tokens
    private static final String SECRET_KEY = "cnlqYXJhZHJpYW5pYmFycmFiYXJyaW9zMTgwNzIwMDBjYW1wZW9uZW5jb250aW51YWxhYmF0YWxsYWJ1ZW5vc2FpcmVzMjAyMg==";

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        Date exp = extractExpiration(token);
        // Si el token no tiene expiración (MiSistema no la setea), lo consideramos válido
        return exp != null && exp.before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
