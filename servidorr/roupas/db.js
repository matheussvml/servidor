const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost', // Endereço local
    port: 3306,        // Porta padrão do MySQL
    user: 'root',      // Usuário do seu MySQL
    password: '12345678', // Senha do padrão do MySQL
    database: 'loja'  // Nome do seu banco de dados
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.stack);
        return;
    }
    console.log('Conectado ao banco de dados.');
});

module.exports = db;
