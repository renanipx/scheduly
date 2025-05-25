require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    console.log('Tentando conectar ao MongoDB...');
    
    // Conectar ao MongoDB com opções específicas
    await mongoose.connect('mongodb://127.0.0.1:27017/chronoly', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // timeout após 5 segundos
    });
    
    console.log('Conectado ao MongoDB com sucesso!');

    // Criar hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Criar usuário admin
    const adminUser = {
      name: 'Admin',
      email: 'admin@chronoly.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    };

    // Inserir no banco
    const db = mongoose.connection.db;
    await db.collection('users').insertOne(adminUser);
    
    console.log('Usuário admin criado com sucesso!');
    console.log('Email: admin@chronoly.com');
    console.log('Senha: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao conectar:', error.message);
    console.error('\nPossíveis soluções:');
    console.error('1. Verifique se o MongoDB está instalado');
    console.error('2. Verifique se o serviço do MongoDB está rodando (services.msc)');
    console.error('3. Tente abrir o MongoDB Compass para verificar a conexão');
    process.exit(1);
  }
}

createAdmin(); 