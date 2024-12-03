const express = require('express');
const cors = require('cors');
const roupasRoutes = require('./routes/roupas');
const usuariosRoutes = require('./routes/usuarios'); // Importa as rotas de roupas

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// app.use(cors({
//     origin: 'http://localhost:3000', // Substitua pela URL do seu frontend
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
//     allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
// }));

// Rota principal para roupas
app.use('/api', roupasRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
