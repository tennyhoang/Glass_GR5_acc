package org.group5.springmvcweb.glassesweb.Service;

import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Entity.Account;
import org.group5.springmvcweb.glassesweb.Entity.Customer;
import org.group5.springmvcweb.glassesweb.Repository.AccountRepository;
import org.group5.springmvcweb.glassesweb.Repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public CustomerProfileResponse getProfile(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found!"));
        Customer customer = account.getCustomer();
        return new CustomerProfileResponse(
                account.getAccountId(),
                account.getUsername(),
                account.getRole(),
                customer.getCustomerId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getAddress(),
                customer.getStatus()
        );
    }

    // ===== Lấy thông tin Customer từ username =====
    private Customer getCustomerByUsername(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not exist!"));

        // Dùng relationship thay vì findById(customerId)
        if (account.getCustomer() == null) {
            throw new RuntimeException("Customer not exist!");
        }
        return account.getCustomer();
    }
    // ===== Cập nhật thông tin cá nhân =====
    @Transactional
    public void updateProfile(String username, UpdateProfileRequest request) {
        Customer customer = getCustomerByUsername(username);

        if (request.getName() != null) customer.setName(request.getName());
        if (request.getPhone() != null) customer.setPhone(request.getPhone());
        if (request.getAddress() != null) customer.setAddress(request.getAddress());

        customerRepository.save(customer);
    }

    // ===== Đổi email =====
    @Transactional
    public void changeEmail(String username, ChangeEmailRequest request) {
        Customer customer = getCustomerByUsername(username);

        // Kiểm tra email mới đã tồn tại chưa
        if (customerRepository.existsByEmail(request.getNewEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        customer.setEmail(request.getNewEmail());
        customerRepository.save(customer);
    }

    // ===== Đổi password =====
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account không tồn tại!"));

        // Kiểm tra password cũ đúng không
        if (!passwordEncoder.matches(request.getOldPassword(), account.getPasswordHash())) {
            throw new RuntimeException("Password cũ không đúng!");
        }

        account.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }

    // ===== Admin update profile cho bất kỳ ai =====
    @Transactional
    public void adminUpdateProfile(Integer customerId, UpdateProfileRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại!"));

        if (request.getName() != null) customer.setName(request.getName());
        if (request.getPhone() != null) customer.setPhone(request.getPhone());
        if (request.getAddress() != null) customer.setAddress(request.getAddress());

        customerRepository.save(customer);
    }
}