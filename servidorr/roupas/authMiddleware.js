const jwt = require('jsonwebtoken');
const secretKey = '123123'; // A mesma chave que você usa para assinar o token

function autenticarToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token ausente' }); // Resposta em JSON
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' }); // Resposta em JSON
        }
        req.user = user;
        next();
    });
}


function verificarAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        console.log("Usuário:", req.user);
        next();
    } else {
        res.status(403).json({ error: 'Acesso negado: apenas administradores podem realizar esta ação!' });
    }
}

module.exports = { autenticarToken, verificarAdmin };
