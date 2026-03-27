package org.group5.springmvcweb.glassesweb.Service;

import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Entity.Account;
import org.group5.springmvcweb.glassesweb.Entity.Customer;
import org.group5.springmvcweb.glassesweb.Repository.AccountRepository;
import org.group5.springmvcweb.glassesweb.Repository.CustomerRepository;
import org.group5.springmvcweb.glassesweb.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // ===== REGISTER =====
    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        if (accountRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists!");
        }
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        // Tạo Customer trước
        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setStatus("ACTIVE");
        Customer savedCustomer = customerRepository.save(customer);

        // ✅ Dùng relationship thay vì setCustomerId
        Account account = Account.builder()
                .customer(savedCustomer)
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .build();
        Account savedAccount = accountRepository.save(account);

        return new RegisterResponse(
                savedAccount.getAccountId(),
                savedAccount.getUsername(),
                request.getEmail(),
                "Register Successful!"
        );
    }

    // ===== LOGIN =====
    public LoginResponse login(LoginRequest request) {
        Account account = accountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new RuntimeException("Wrong password");
        }

        // ✅ Kiểm tra BLOCKED qua relationship
        if (account.getCustomer() != null &&
                "BLOCKED".equals(account.getCustomer().getStatus())) {
            throw new RuntimeException("Account has been blocked!");
        }

        String token = jwtUtil.generateToken(account.getUsername(), account.getRole());
        return new LoginResponse(token);
    }
    public void updateRole(Integer accountId, String newRole) {

        // Kiểm tra role hợp lệ
        List<String> validRoles = List.of("USER", "ADMIN", "STAFF", "OPERATION");
        if (!validRoles.contains(newRole)) {
            throw new RuntimeException("Role not valid!");
        }
        // kiểm tra tài khoản có tồn tại không
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not exist!"));

        account.setRole(newRole);
        accountRepository.save(account);
    }
}