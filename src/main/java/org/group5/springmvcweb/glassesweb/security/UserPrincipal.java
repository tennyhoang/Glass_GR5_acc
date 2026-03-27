package org.group5.springmvcweb.glassesweb.security;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.group5.springmvcweb.glassesweb.Entity.Account;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private final Integer accountId;
    private final Integer customerId;
    private final String username;
    private final String passwordHash;
    private final String role;

    public static UserPrincipal from(Account account) {
        return new UserPrincipal(
                account.getAccountId(),
                account.getCustomerId(), // ✅ dùng trực tiếp
                account.getUsername(),
                account.getPasswordHash(),
                account.getRole()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override public String getPassword() { return passwordHash; }
    @Override public String getUsername() { return username; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}