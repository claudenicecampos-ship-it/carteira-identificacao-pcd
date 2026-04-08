/**
 * Script de Análise do Banco de Dados
 * Exibe estatísticas e informações sobre os dados armazenados
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao abrir banco:', err.message);
    process.exit(1);
  }
  
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         📊 ANÁLISE DO BANCO DE DADOS - CARTEIRA PCD         ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  analyzeDatabase();
});

async function analyzeDatabase() {
  let tasks = 0;
  let completed = 0;

  const finishIfDone = () => {
    completed++;
    if (completed === tasks) {
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║                    ✅ Análise Concluída                      ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      db.close();
      process.exit(0);
    }
  };

  // 1. Estatísticas Gerais
  tasks++;
  db.all(`
    SELECT 
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM cards) as total_cards,
      (SELECT COUNT(*) FROM emergency_contacts) as total_contacts
  `, (err, rows) => {
    if (err) console.error('❌ Erro:', err);
    else {
      console.log('📈 ESTATÍSTICAS GERAIS');
      console.log(`  👥 Total de Usuários: ${rows[0].total_users}`);
      console.log(`  🎫 Total de Carteiras: ${rows[0].total_cards}`);
      console.log(`  📞 Total de Contatos: ${rows[0].total_contacts}\n`);
    }
    finishIfDone();
  });

  // 2. Usuários
  tasks++;
  db.all('SELECT id, email, created_at FROM users ORDER BY created_at DESC', (err, rows) => {
    if (err) console.error('❌ Erro:', err);
    else {
      console.log('👥 USUÁRIOS REGISTRADOS');
      if (rows.length === 0) {
        console.log('  [Nenhum usuário encontrado]');
      } else {
        rows.forEach((user, i) => {
          console.log(`  ${i + 1}. ${user.email}`);
          console.log(`     ID: ${user.id} | Criado: ${user.created_at}`);
        });
      }
      console.log();
    }
    finishIfDone();
  });

  // 3. Carteiras
  tasks++;
  db.all(`
    SELECT c.id, c.numero_carteira, c.nome, c.tipo_deficiencia, 
           c.grau_deficiencia, c.validade, u.email
    FROM cards c
    JOIN users u ON c.user_id = u.id
    ORDER BY c.created_at DESC
  `, (err, rows) => {
    if (err) console.error('❌ Erro:', err);
    else {
      console.log('🎫 CARTEIRAS REGISTRADAS');
      if (rows.length === 0) {
        console.log('  [Nenhuma carteira encontrada]');
      } else {
        rows.forEach((card, i) => {
          console.log(`  ${i + 1}. ${card.numero_carteira} - ${card.nome}`);
          console.log(`     Usuario: ${card.email}`);
          console.log(`     Deficiência: ${card.tipo_deficiencia} (${card.grau_deficiencia})`);
          console.log(`     Validade: ${card.validade}`);
        });
      }
      console.log();
    }
    finishIfDone();
  });

  // 4. Tipos de Deficiência
  tasks++;
  db.all(`
    SELECT tipo_deficiencia, COUNT(*) as total
    FROM cards
    GROUP BY tipo_deficiencia
    ORDER BY total DESC
  `, (err, rows) => {
    if (err) console.error('❌ Erro:', err);
    else {
      console.log('🏥 TIPOS DE DEFICIÊNCIA');
      if (rows.length === 0) {
        console.log('  [Nenhuma carteira com deficiência registrada]');
      } else {
        rows.forEach((row) => {
          console.log(`  • ${row.tipo_deficiencia}: ${row.total}`);
        });
      }
      console.log();
    }
    finishIfDone();
  });

  // 5. Carteiras Expirando
  tasks++;
  db.all(`
    SELECT numero_carteira, nome, validade,
           CASE 
             WHEN DATE(validade) < DATE('now') THEN '🔴 EXPIRADA'
             WHEN DATE(validade) <= DATE('now', '+30 days') THEN '🟡 EXPIRA EM BREVE'
             ELSE '🟢 VÁLIDA'
           END as status
    FROM cards
    ORDER BY validade ASC
  `, (err, rows) => {
    if (err) console.error('❌ Erro:', err);
    else {
      console.log('⏰ STATUS DE VALIDADE DAS CARTEIRAS');
      if (rows.length === 0) {
        console.log('  [Nenhuma carteira encontrada]');
      } else {
        rows.forEach((card) => {
          console.log(`  ${card.status} ${card.numero_carteira} - ${card.nome} (${card.validade})`);
        });
      }
      console.log();
    }
    finishIfDone();
  });

  // 6. Contatos de Emergência
  tasks++;
  db.all(`
    SELECT c.numero_carteira, c.nome as titular,
           COUNT(e.id) as total_contatos
    FROM cards c
    LEFT JOIN emergency_contacts e ON c.id = e.card_id
    GROUP BY c.id
    ORDER BY total_contatos DESC
  `, (err, rows) => {
    if (err) console.error('❌ Erro:', err);
    else {
      console.log('📞 CONTATOS DE EMERGÊNCIA');
      if (rows.length === 0) {
        console.log('  [Nenhum carteira encontrada]');
      } else {
        rows.forEach((row) => {
          console.log(`  📋 ${row.numero_carteira} (${row.titular}): ${row.total_contatos} contato(s)`);
        });
      }
      console.log();
    }
    finishIfDone();
  });

  // 7. Acompanhantes
  tasks++;
  db.all(`
    SELECT COUNT(*) as total_com_acompanhante, 
           (SELECT COUNT(*) FROM cards) as total_carteiras
    FROM cards
    WHERE acompanhante = 1
  `, (err, rows) => {
    if (err) console.error('❌ Erro:', err);
    else {
      const total = rows[0].total_com_acompanhante;
      const percentual = rows[0].total_carteiras > 0 
        ? ((total / rows[0].total_carteiras) * 100).toFixed(1) 
        : 0;
      console.log('👨‍🤝‍👨 DIREITO A ACOMPANHANTE');
      console.log(`  Com direito: ${total} (${percentual}% das carteiras)\n`);
    }
    finishIfDone();
  });

  // 8. Tamanho do Banco
  tasks++;
  const fs = require('fs');
  try {
    const stat = fs.statSync(dbPath);
    const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
    const sizeKB = (stat.size / 1024).toFixed(2);
    console.log('💾 TAMANHO DO BANCO DE DADOS');
    if (stat.size > 1024 * 1024) {
      console.log(`  ${sizeMB} MB`);
    } else {
      console.log(`  ${sizeKB} KB`);
    }
    console.log();
    finishIfDone();
  } catch (err) {
    console.error('❌ Erro ao verificar tamanho:', err);
    finishIfDone();
  }

  // 9. Informações de Tempo
  tasks++;
  db.all(`
    SELECT 
      (SELECT COUNT(*) FROM users WHERE DATE(created_at) = DATE('now')) as users_hoje,
      (SELECT COUNT(*) FROM cards WHERE DATE(created_at) = DATE('now')) as cards_hoje,
      (SELECT COUNT(*) FROM users WHERE DATE(created_at) >= DATE('now', '-7 days')) as users_semana,
      (SELECT COUNT(*) FROM cards WHERE DATE(created_at) >= DATE('now', '-7 days')) as cards_semana
  `, (err, rows) => {
    if (err) console.error('❌ Erro:', err);
    else {
      console.log('📅 ATIVIDADE RECENTE');
      console.log(`  Usuários criados hoje: ${rows[0].users_hoje}`);
      console.log(`  Carteiras criadas hoje: ${rows[0].cards_hoje}`);
      console.log(`  Usuários (últimos 7 dias): ${rows[0].users_semana}`);
      console.log(`  Carteiras (últimos 7 dias): ${rows[0].cards_semana}\n`);
    }
    finishIfDone();
  });

  // 10. Integridade
  tasks++;
  db.all(`
    SELECT 'Orfãs (cards sem user)' as problema, COUNT(*) as total
    FROM cards
    WHERE user_id NOT IN (SELECT id FROM users)
    UNION
    SELECT 'Orfãs (contatos sem card)', COUNT(*)
    FROM emergency_contacts
    WHERE card_id NOT IN (SELECT id FROM cards)
  `, (err, rows) => {
    if (err) console.error('❌ Erro:', err);
    else {
      console.log('🔍 INTEGRIDADE DOS DADOS');
      if (rows.length === 0 || rows.every(r => r.total === 0)) {
        console.log('  ✅ Banco íntegro - Sem inconsistências encontradas\n');
      } else {
        rows.forEach((row) => {
          if (row.total > 0) {
            console.log(`  ⚠️  ${row.problema}: ${row.total}\n`);
          }
        });
      }
    }
    finishIfDone();
  });
}
