package com.example.flickfit.util;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {
    private String key = "SSAFY_NonMajor_JavaTrack_SecretKey";
    private SecretKey secretKey = Keys.hmacShaKeyFor(key.getBytes(StandardCharsets.UTF_8));

    // JWT 생성
    public String createToken(String email) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + 1000 * 60 * 60); // 1시간 유효

        return Jwts.builder()
                .setSubject("User Authentication") // 토큰 용도
                .claim("email", email) // 클레임 추가
                .setIssuedAt(now) // 생성 시간
                .setExpiration(exp) // 만료 시간
                .signWith(secretKey) // 비밀 키로 서명
                .compact();
    }

    // JWT 검증
    public Jws<Claims> validate(String token) {
        return Jwts.parserBuilder() // JwtParserBuilder 객체 생성
                .setSigningKey(secretKey) // 비밀 키 설정
                .build() // JwtParser 객체 생성
                .parseClaimsJws(token); // 토큰 검증 및 클레임 파싱
    }
}
