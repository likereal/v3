import React from 'react';

const RoleSelector: React.FC = () => (
  <div>
    <label htmlFor="role">Role:</label>
    <select id="role" name="role">
      <option value="admin">Admin</option>
      <option value="developer">Developer</option>
      <option value="guest">Guest</option>
    </select>
  </div>
);

export default RoleSelector; 