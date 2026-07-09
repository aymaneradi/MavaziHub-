INSERT INTO roles (name) VALUES
    ('ROLE_USER'),
    ('ROLE_EMPLOYEE'),
    ('ROLE_ADMIN')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (
    id,
    firstname,
    lastname,
    email,
    password,
    phone_number,
    enabled,
    account_locked,
    created_at,
    updated_at
)
SELECT
    '00000000-0000-0000-0000-000000000014'::uuid,
    'Borel',
    'Demo Admin',
    'borel@gmail.com',
    '$2a$10$NMViYzk0.bXdX.02J4mt3OYj8emiTgG/e/rFa8lDQTn2HRq6gJmeO',
    '+490000000000',
    true,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1
    FROM users
    WHERE email = 'borel@gmail.com'
);

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
