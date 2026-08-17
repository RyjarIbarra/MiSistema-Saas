package com.MiSistema.Config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final LicenciaServiceImpl licenciaService;
    // 🔑 Clave secreta (usa al menos 256 bits para HS256)
    private static final String SECRET_KEY = "cnlqYXJhZHJpYW5pYmFycmFiYXJyaW9zMTgwNzIwMDBjYW1wZW9uZW5jb250aW51YWxhYmF0YWxsYWJ1ZW5vc2FpcmVzMjAyMg==";

    // Genera un token con datos extra
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        extraClaims.put("db_credentials", licenciaService.userCredentials(userDetails.getUsername()));
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername()) // 👈 el "username" será el subject
                .setIssuedAt(new Date(System.currentTimeMillis())) // fecha de emisión
                //.setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * 7)) // expira en 7 dias
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Genera un token sin claims extra
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    // Extrae el username del token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Valida si el token es correcto y no expiró
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    // ====================
    // Métodos internos
    // ====================

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
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
