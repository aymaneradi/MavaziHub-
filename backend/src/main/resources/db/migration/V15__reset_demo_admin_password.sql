UPDATE users
SET password = '$2a$10$NMViYzk0.bXdX.02J4mt3OYj8emiTgG/e/rFa8lDQTn2HRq6gJmeO',
    enabled = true,
    account_locked = false,
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'borel@gmail.com';

INSERT INTO users_roles (user_id, role_id)
SELECT users.id, roles.id
FROM users
JOIN roles ON roles.name = 'ROLE_ADMIN'
WHERE users.email = 'borel@gmail.com'
  AND NOT EXISTS (
      SELECT 1
      FROM users_roles
      WHERE users_roles.user_id = users.id
        AND users_roles.role_id = roles.id
  );
