const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost', // Endereço local
    port: 3306,        // Porta padrão do MySQL
    user: 'root',      // Usuário do MySQL
    password: '132465', // Senha do MySQL
    database: 'loja'  // Nome do banco de dados
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.stack);
        return;
    }
    console.log('Conectado ao banco de dados.');
});

module.exports = db;
