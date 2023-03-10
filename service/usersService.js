exports.getAllUsers = "SELECT * FROM users";
exports.getUserById = "SELECT * FROM users WHERE id= ?";
exports.getUserByEmail = "SELECT * FROM users WHERE email= ?";

exports.createUser = "INSERT INTO users SET gender= ?, firstname= ?, lastname= ?, email= ?, password= ?, phone= ?, birthdate= ?, city= ?, country= ?, photo= ?, category= ?, isAdmin= 0";

exports.updateUser = "UPDATE users SET gender= ?, firstname= ?, lastname= ?, email= ?, password= ?, phone= ?, birthdate= ?, city= ?, country= ?, photo= ?, category= ?, isAdmin= 0 WHERE id= ?";

exports.deleteUser = "DELETE FROM users WHERE id= ?";