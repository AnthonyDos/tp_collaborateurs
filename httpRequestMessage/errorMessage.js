// REGEX
exports.errorRegexPassword = "le format du mot de passe n'est pas celui attendu";
exports.errorRegexEmail = " l'email ne respect pas le format attendu";

//compte
exports.errorEmailAlreadyExist = "l'email existe déjà!";
exports.errorEmailfieldIsNullOrInvalid = "le champs email est null ou invalide";
exports.errorCreateAccount = "la création du compte à échouée tous les champs ne sont pas remplis!";
exports.errorEmailOrPasswordDoesNotMatch = "l'email ou le mot de passe ne correspond pas";
exports.errorConnectionUser = "L'adresse email n'existe pas ou l'utilisateur est introuvable !";

//users
exports.errorGetAllUsers = "la récupération de la liste utilisateurs à échouée!";
exports.errorUserNotExist = "l'utilisateur n'existe pas en base de données!";
exports.errorUpdateUser = "la modification de l'utilisateur à échouée!";
exports.errorDeleteUser = "Erreur lors de la suppression d'un utilisateur!";

//authorization
exports.errorAccessAuthorization = "vous n'êtes pas autorisé!";