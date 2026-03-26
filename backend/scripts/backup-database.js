/**
 * Script de Backup do Banco de Dados
 * Cria uma cópia de segurança do banco de dados
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const dbPath = path.join(__dirname, '../database.db');
const backupDir = path.join(__dirname, '../backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + Date.now();
const backupPath = path.join(backupDir, `database-${timestamp}.db`);

// Criar diretório de backups se não existir
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Verificar se banco existe
if (!fs.existsSync(dbPath)) {
  console.error('❌ Banco de dados não encontrado em:', dbPath);
  process.exit(1);
}

console.log('💾 Criando backup do banco de dados...\n');
console.log('📁 Origem:', dbPath);
console.log('📁 Destino:', backupPath);

try {
  // Copiar arquivo de banco
  fs.copyFileSync(dbPath, backupPath);
  console.log('\n✅ Backup criado com sucesso!');
  
  // Obter informações do backup
  const stat = fs.statSync(backupPath);
  const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
  console.log('📊 Tamanho:', sizeMB, 'MB');
  console.log('⏰ Data:', new Date().toLocaleString('pt-BR'));
  
  // Listar últimos backups
  console.log('\n📋 Últimos 5 backups:');
  const backups = fs.readdirSync(backupDir)
    .sort()
    .reverse()
    .slice(0, 5);
  
  backups.forEach((backup, index) => {
    const backupFile = path.join(backupDir, backup);
    const stat = fs.statSync(backupFile);
    const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
    console.log(`  ${index + 1}. ${backup} (${sizeMB} MB)`);
  });
  
  process.exit(0);
} catch (error) {
  console.error('❌ Erro ao criar backup:', error.message);
  process.exit(1);
}
