import { PrismaClient, TipoAdvertencia } from '@prisma/client'
import { fakerPT_BR as faker } from '@faker-js/faker'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const SENHA_PADRAO = '123'

const faculdades = [
  'IFRO - Campus Ji-Paraná',
  'IFRO - Campus Ji-Paraná',
  'IFRO - Campus Ji-Paraná',
  'UNIR - Campus Ji-Paraná',
  'Estácio Unijipa - Ji-Paraná',
  'Ulbra Ji-Paraná',
  'Faculdade SABER Ji-Paraná',
]

const cursos = [
  'Análise e Desenvolvimento de Sistemas',
  'Engenharia Florestal',
  'Licenciatura em Química',
  'Técnico em Informática',
  'Técnico em Química',
  'Edificações',
  'Engenharia Civil',
  'Direito',
  'Administração',
  'Agronomia',
]

const bairrosJiParana = [
  'Beira Rio',
  'Centro',
  'Dois de Julho',
  'Jardim Migrantês',
  'Nova Brasília',
  'Urupá',
  'Vila Jotão',
  'Dom Bosco',
  'São Cristóvão',
  'Jardim dos Migrantes',
  'Capelasso',
]

const ruasJiParana = [
  'Rua Teresina',
  'Avenida Transcontinental',
  'Avenida Marechal Rondon',
  'Avenida Brasil',
  'Rua 22 de Novembro',
  'Rua Seis de Maio',
  'Avenida Ji-Paraná',
  'Rua Monte Castelo',
  'Rua Dom Augusto',
  'Avenida Clodoaldo Cardoso',
]

const tiposSolicitacao = ['Troca de Ônibus', 'Troca de Poltrona', 'Cancelamento de Linha', 'Justificativa de Falta']
const tiposAdvertencia: TipoAdvertencia[] = ['HIGIENE', 'CONDUTA', 'PERTURBACAO', 'HORARIO']

function gerarDigito(cpf: number[]): number {
  let soma = 0
  let multiplicador = cpf.length + 1
  for (const num of cpf) {
    soma += num * multiplicador
    multiplicador--
  }
  const resto = soma % 11
  return resto < 2 ? 0 : 11 - resto
}

function gerarCpf(): string {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))
  const dig1 = gerarDigito(base)
  const dig2 = gerarDigito([...base, dig1])
  const nums = [...base, dig1, dig2]
  return `${nums.slice(0, 3).join('')}.${nums.slice(3, 6).join('')}.${nums.slice(6, 9).join('')}-${nums.slice(9, 11).join('')}`
}

function gerarCnpj(): string {
  const base = [1, 1, 4, 4, 4, 7, 7, 7, 0, 0, 0, 1]
  const calc = (x: number) => {
    const n = base.slice(0, x)
    let y = x - 7
    let s = 0
    for (let i = x; i >= 1; i--) {
      s += n[x - i] * y--
      if (y < 2) y = 9
    }
    const r = 11 - (s % 11)
    return r > 9 ? 0 : r
  }
  const d1 = calc(12)
  const d2 = calc(13)
  const nums = [...base, d1, d2]
  return `${nums.slice(0, 2).join('')}.${nums.slice(2, 5).join('')}.${nums.slice(5, 8).join('')}/${nums.slice(8, 12).join('')}-${nums.slice(12, 14).join('')}`
}

function formatarTelefone(num: string): string {
  const ddd = '69'
  return `(${ddd}) 9${num.slice(0, 4)}-${num.slice(4, 8)}`
}

function diasAleatorios(): string[] {
  const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const quantidade = faker.number.int({ min: 2, max: 6 })
  return faker.helpers.arrayElements(dias, quantidade)
}

async function limparBanco() {
  console.log('🧹 Limpando banco de dados...')
  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0`)
  const tabelas = [
    'PasswordReset',
    'PresencaChamada',
    'Chamada',
    'Documento',
    'Boleto',
    'Solicitacao',
    'Advertencia',
    'AvisoUsuario',
    'Aviso',
    'Associado',
    'Transporte',
    'Usuario',
    'NormaDocumento',
    'Associacao',
  ]
  for (const tabela of tabelas) {
    await prisma.$executeRawUnsafe(`DELETE FROM \`${tabela}\``)
  }
  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1`)
  console.log('✅ Banco limpo')
}

async function main() {
  await limparBanco()

  const senhaHash = await bcrypt.hash(SENHA_PADRAO, 10)

  console.log('🏢 Criando associação em Ji-Paraná / RO...')
  const associacao = await prisma.associacao.create({
    data: {
      nome: 'Associação de Transporte Universitário Unibus Ji-Paraná',
      sigla: 'UNIBUS JIPA',
      cnpj: gerarCnpj(),
      email: 'contato@unibusjipa.com.br',
      telefone: '(69) 3416-2800',
      rua: 'Rua Teresina',
      bairro: 'Beira Rio',
      numero: '1240',
      cep: '76907-528',
      cidade: 'Ji-Paraná',
      estado: 'RO',
    },
  })

  console.log('🚌 Criando transporte com rotas para o IFRO Ji-Paraná...')
  const transporte = await prisma.transporte.create({
    data: {
      associacaoId: associacao.id,
      poltronas: 40,
      horarioIda: '07:00',
      horarioVolta: '18:30',
      dias: 'Segunda,Terça,Quarta,Quinta,Sexta',
      pontoPartida: 'Av. Transcontinental (BR-364) - Centro, Ji-Paraná - RO',
      placa: 'JPA-2026',
      identificacao: 'Ônibus Escolar 01 - Ji-Paraná',
      rota: 'Bairros ➔ IFRO Ji-Paraná',
    },
  })

  console.log('👤 Criando usuários padrão com contexto de Ji-Paraná / RO...')

  // 1. ADMINISTRADOR
  const userAdmin = await prisma.usuario.create({
    data: {
      email: 'admin@unibus.com',
      senha: senhaHash,
      tipo: 'ADMIN',
      associacaoId: associacao.id,
    },
  })
  await prisma.associado.create({
    data: {
      usuarioId: userAdmin.id,
      associacaoId: associacao.id,
      nome: 'Administrador IFRO Ji-Paraná',
      cpf: gerarCpf(),
      telefone: '(69) 99999-0000',
      faculdade: 'IFRO - Campus Ji-Paraná',
      curso: 'Análise e Desenvolvimento de Sistemas',
      periodo: 'Noturno',
      matricula: 'ADM001',
      status: 'ATIVO',
      rua: 'Rua Teresina',
      bairro: 'Beira Rio',
      numero: '1240',
      cep: '76907-528',
      cidade: 'Ji-Paraná',
      diasTransporte: 'Segunda,Terça,Quarta,Quinta,Sexta',
      primeiroAcesso: false,
    },
  })

  // 2. ASSOCIADO APROVADO
  const userAprovado = await prisma.usuario.create({
    data: {
      email: 'aprovado@unibus.com',
      senha: senhaHash,
      tipo: 'ASSOCIADO',
      associacaoId: associacao.id,
    },
  })
  const associadoAprovado = await prisma.associado.create({
    data: {
      usuarioId: userAprovado.id,
      associacaoId: associacao.id,
      transporteId: transporte.id,
      nome: 'Associado Aprovado Teste',
      cpf: gerarCpf(),
      telefone: '(69) 98888-1111',
      faculdade: 'IFRO - Campus Ji-Paraná',
      curso: 'Análise e Desenvolvimento de Sistemas',
      periodo: 'Noturno',
      matricula: '2026001',
      status: 'ATIVO',
      poltrona: 1,
      rua: 'Av. Transcontinental (BR-364)',
      bairro: 'Centro',
      numero: '500',
      cep: '76900-000',
      cidade: 'Ji-Paraná',
      diasTransporte: 'Segunda,Terça,Quarta,Quinta,Sexta',
      primeiroAcesso: false,
    },
  })

  // 3. ASSOCIADO PENDENTE
  const userPendente = await prisma.usuario.create({
    data: {
      email: 'pendente@unibus.com',
      senha: senhaHash,
      tipo: 'ASSOCIADO',
      associacaoId: associacao.id,
    },
  })
  await prisma.associado.create({
    data: {
      usuarioId: userPendente.id,
      associacaoId: associacao.id,
      transporteId: transporte.id,
      nome: 'Associado Pendente Teste',
      cpf: gerarCpf(),
      telefone: '(69) 97777-2222',
      faculdade: 'UNIR - Campus Ji-Paraná',
      curso: 'Engenharia Florestal',
      periodo: 'Matutino',
      matricula: '2026002',
      status: 'PENDENTE',
      poltrona: null,
      rua: 'Avenida Marechal Rondon',
      bairro: 'Dois de Julho',
      numero: '1200',
      cep: '76900-100',
      cidade: 'Ji-Paraná',
      diasTransporte: 'Segunda,Quarta,Sexta',
      primeiroAcesso: true,
    },
  })

  console.log('📌 Criando cenários de teste para o Associado Aprovado...')

  const hoje = new Date()

  // A) BOLETOS DO ASSOCIADO APROVADO
  // 1 Boleto PAGO
  const dataPagoVenc = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 15)
  const dataPagoEmis = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
  await prisma.boleto.create({
    data: {
      associadoId: associadoAprovado.id,
      valor: 189.90,
      status: 'PAGO',
      dataVencimento: dataPagoVenc,
      createdAt: dataPagoEmis,
    },
  })

  // 1 Boleto PENDENTE (a vencer no mês vigente)
  const dataPendVenc = new Date(hoje.getFullYear(), hoje.getMonth(), 25)
  const dataPendEmis = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  await prisma.boleto.create({
    data: {
      associadoId: associadoAprovado.id,
      valor: 189.90,
      status: 'PENDENTE',
      dataVencimento: dataPendVenc,
      createdAt: dataPendEmis,
    },
  })

  // 1 Boleto EM ATRASO (com data de vencimento retroativa)
  const dataAtrasoVenc = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 10)
  const dataAtrasoEmis = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1)
  await prisma.boleto.create({
    data: {
      associadoId: associadoAprovado.id,
      valor: 189.90,
      status: 'PENDENTE',
      dataVencimento: dataAtrasoVenc,
      createdAt: dataAtrasoEmis,
    },
  })

  // B) SOLICITAÇÕES DO ASSOCIADO APROVADO
  // 1 Solicitação PENDENTE
  await prisma.solicitacao.create({
    data: {
      associadoId: associadoAprovado.id,
      tipo: 'Troca de Ônibus',
      motivo: 'Alteração de horário da grade curricular no IFRO',
      descricao: 'Solicito alteração para a linha do período matutino.',
      status: 'PENDENTE',
      data: new Date(hoje.getTime() - 2 * 86400000),
    },
  })

  // 1 Solicitação APROVADA
  await prisma.solicitacao.create({
    data: {
      associadoId: associadoAprovado.id,
      tipo: 'Troca de Poltrona',
      motivo: 'Preferência por assento na janela',
      descricao: 'Gostaria de mudar da poltrona corredor para a poltrona 01 na janela.',
      status: 'APROVADO',
      atendidoPor: 'Administrador IFRO Ji-Paraná',
      data: new Date(hoje.getTime() - 10 * 86400000),
    },
  })

  // 1 Solicitação RECUSADA
  await prisma.solicitacao.create({
    data: {
      associadoId: associadoAprovado.id,
      tipo: 'Justificativa de Falta',
      motivo: 'Consulta médica',
      descricao: 'Consulta médica agendada no horário da viagem.',
      status: 'RECUSADO',
      atendidoPor: 'Administrador IFRO Ji-Paraná',
      data: new Date(hoje.getTime() - 15 * 86400000),
    },
  })

  // C) CHAMADAS / PRESENÇA DO ASSOCIADO APROVADO (ROTA BAIRROS ➔ IFRO JI-PARANÁ & IFRO JI-PARANÁ ➔ BAIRROS)
  // Viagem no sentido IDA
  const dataViagemIda = new Date(hoje.getFullYear(), hoje.getMonth(), Math.max(1, hoje.getDate() - 2))
  const chamadaIda = await prisma.chamada.create({
    data: {
      transporteId: transporte.id,
      data: dataViagemIda,
      periodo: 'Noturno - Ida',
      sentidoViagem: 'IDA',
      status: 'FINALIZADO',
      motorista: 'João Silva',
      observacoes: 'Bairros ➔ IFRO Ji-Paraná - Viagem de ida realizada sem ocorrências.',
    },
  })
  await prisma.presencaChamada.create({
    data: {
      chamadaId: chamadaIda.id,
      associadoId: associadoAprovado.id,
      presente: true,
      poltrona: 1,
    },
  })

  // Viagem no sentido VOLTA
  const dataViagemVolta = new Date(hoje.getFullYear(), hoje.getMonth(), Math.max(1, hoje.getDate() - 1))
  const chamadaVolta = await prisma.chamada.create({
    data: {
      transporteId: transporte.id,
      data: dataViagemVolta,
      periodo: 'Noturno - Volta',
      sentidoViagem: 'VOLTA',
      status: 'FINALIZADO',
      motorista: 'João Silva',
      observacoes: 'IFRO Ji-Paraná ➔ Bairros - Retorno concluído com sucesso.',
    },
  })
  await prisma.presencaChamada.create({
    data: {
      chamadaId: chamadaVolta.id,
      associadoId: associadoAprovado.id,
      presente: true,
      poltrona: 1,
    },
  })

  // D) AVISOS DO ASSOCIADO APROVADO
  // 1 Aviso PENDENTE (não lido pelo associado aprovado)
  const avisoPendente = await prisma.aviso.create({
    data: {
      data: new Date(hoje.getTime() - 2 * 86400000),
      tipo: 'Rota / Ponto',
      motivo: 'Alteração temporária na parada Av. Transcontinental',
      descricao: 'Devido a obras na BR-364, a parada no Centro será deslocada 100m à frente.',
      status: 'PENDENTE',
      feitoPor: 'Administrador IFRO Ji-Paraná',
    },
  })
  await prisma.avisoUsuario.create({
    data: {
      avisoId: avisoPendente.id,
      associadoId: associadoAprovado.id,
      lido: false,
    },
  })

  // 1 Aviso LIDO (com confirmação de leitura registrada pelo associado aprovado)
  const avisoLido = await prisma.aviso.create({
    data: {
      data: new Date(hoje.getTime() - 5 * 86400000),
      tipo: 'Orientação',
      motivo: 'Uso obrigatório do cinto de segurança no trajeto ao IFRO',
      descricao: 'Lembramos a todos os estudantes do IFRO que o uso do cinto de segurança é obrigatório durante todo o percurso.',
      status: 'PENDENTE',
      feitoPor: 'Administrador IFRO Ji-Paraná',
    },
  })
  await prisma.avisoUsuario.create({
    data: {
      avisoId: avisoLido.id,
      associadoId: associadoAprovado.id,
      lido: true,
      dataLeitura: new Date(hoje.getTime() - 4 * 86400000),
    },
  })

  // E) ADVERTÊNCIAS DO ASSOCIADO APROVADO
  // 1 Advertência PENDENTE (não lida)
  await prisma.advertencia.create({
    data: {
      associadoId: associadoAprovado.id,
      data: new Date(hoje.getTime() - 3 * 86400000),
      tipo: 'HORARIO',
      motivo: 'Atraso recorrente na parada do Bairro Dois de Julho',
      descricao: 'Notificado devido a atrasos superiores a 10 minutos na parada da rota de ida ao IFRO.',
      status: 'PENDENTE',
      feitoPor: 'Administrador IFRO Ji-Paraná',
    },
  })

  // 1 Advertência LIDA
  await prisma.advertencia.create({
    data: {
      associadoId: associadoAprovado.id,
      data: new Date(hoje.getTime() - 12 * 86400000),
      tipo: 'CONDUTA',
      motivo: 'Uso de alto-falante durante o trajeto de volta',
      descricao: 'Advertência emitida pelo uso de caixas de som sem fone de ouvido na viagem de retorno do IFRO aos bairros.',
      status: 'LIDO',
      feitoPor: 'Administrador IFRO Ji-Paraná',
    },
  })

  console.log('🎓 Populando associados adicionais em Ji-Paraná / RO...')
  const quantidadeAdicional = 15
  const novosUsuarios: any[] = []
  const metadados: any[] = []

  for (let i = 0; i < quantidadeAdicional; i++) {
    const nome = faker.person.fullName()
    const primeiroNome = nome.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const sobrenome = nome.split(' ').slice(-1)[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const email = `${primeiroNome}.${sobrenome}${faker.number.int({ min: 10, max: 999 })}@email.com`
    const cpf = gerarCpf()
    const telefone = formatarTelefone(faker.string.numeric(8))
    const status = faker.helpers.arrayElement(['ATIVO', 'ATIVO', 'ATIVO', 'DESASSOCIADO', 'PENDENTE'])

    novosUsuarios.push({ email, senha: senhaHash, tipo: 'ASSOCIADO', associacaoId: associacao.id })
    metadados.push({ email, nome, cpf, telefone, status, matricula: `2026${String(i + 10).padStart(3, '0')}` })
  }

  await prisma.usuario.createMany({ data: novosUsuarios, skipDuplicates: true })
  const usuariosEncontrados = await prisma.usuario.findMany({
    where: { email: { in: novosUsuarios.map((u) => u.email) } },
    select: { id: true, email: true },
  })

  const mapaId = new Map(usuariosEncontrados.map((u) => [u.email, u.id]))

  const dadosAssociados = metadados.map((meta) => ({
    usuarioId: mapaId.get(meta.email)!,
    associacaoId: associacao.id,
    transporteId: transporte.id,
    nome: meta.nome,
    cpf: meta.cpf,
    telefone: meta.telefone,
    faculdade: faker.helpers.arrayElement(faculdades),
    curso: faker.helpers.arrayElement(cursos),
    periodo: faker.helpers.arrayElement(['Matutino', 'Vespertino', 'Noturno']),
    matricula: meta.matricula,
    status: meta.status,
    poltrona: null as number | null,
    rua: faker.helpers.arrayElement(ruasJiParana),
    bairro: faker.helpers.arrayElement(bairrosJiParana),
    numero: String(faker.number.int({ min: 10, max: 2000 })),
    cep: '76900-000',
    cidade: 'Ji-Paraná',
    diasTransporte: diasAleatorios().join(','),
    primeiroAcesso: false,
  }))

  await prisma.associado.createMany({ data: dadosAssociados, skipDuplicates: true })

  const todosAssociadosAtivos = await prisma.associado.findMany({
    where: { associacaoId: associacao.id, status: 'ATIVO' },
  })

  // Criar boletos extras para volume
  const boletosExtras: any[] = []
  for (const assoc of todosAssociadosAtivos) {
    if (assoc.id === associadoAprovado.id) continue
    for (let m = 0; m < 5; m++) {
      const st = faker.helpers.arrayElement(['PAGO', 'PAGO', 'PENDENTE'])
      const dtVenc = new Date(2026, m, 15)
      boletosExtras.push({
        associadoId: assoc.id,
        dataVencimento: dtVenc,
        valor: 189.90,
        status: st,
        createdAt: new Date(2026, m, 1),
      })
    }
  }
  await prisma.boleto.createMany({ data: boletosExtras })

  // Criar chamadas extras para volume (rota Bairros ➔ IFRO Ji-Paraná)
  for (let m = 0; m < 5; m++) {
    const dtChamada = new Date(2026, m, 10)
    const chamadaExt = await prisma.chamada.create({
      data: {
        transporteId: transporte.id,
        data: dtChamada,
        periodo: `Noturno - Mês ${m + 1}`,
        sentidoViagem: 'IDA',
        status: 'FINALIZADO',
        motorista: 'Carlos Motorista',
        observacoes: 'Bairros ➔ IFRO Ji-Paraná',
      },
    })
    const presencasExt = todosAssociadosAtivos.map((a) => ({
      chamadaId: chamadaExt.id,
      associadoId: a.id,
      presente: faker.datatype.boolean(),
      poltrona: a.poltrona ?? 1,
    }))
    await prisma.presencaChamada.createMany({ data: presencasExt, skipDuplicates: true })
  }

  // Normas institucionais IFRO
  await prisma.normaDocumento.createMany({
    data: [
      { nome: 'Estatuto do Estudante IFRO Ji-Paraná 2026', url: '/public/uploads/normas/estatuto_ifro_2026.pdf', tipo: 'PDF', associacaoId: associacao.id },
      { nome: 'Regulamento de Transporte Escolar - Ji-Paraná RO', url: '/public/uploads/normas/regulamento_jipa.pdf', tipo: 'PDF', associacaoId: associacao.id },
    ],
  })

  console.log('\n✨ RESET E SEED CONCLUÍDOS COM SUCESSO! (CONTEXTO: JI-PARANÁ / RO) ✨\n')
  console.log('📍 FACULDADE PRINCIPAL: IFRO - Campus Ji-Paraná')
  console.log('📍 ENDEREÇO IFRO: Rua Teresina, 1240 - Bairro Beira Rio, Ji-Paraná - RO, CEP: 76907-528')
  console.log('📍 ROTAS: Bairros ➔ IFRO Ji-Paraná (Ida) / IFRO Ji-Paraná ➔ Bairros (Volta)')
  console.log('===================================================================')
  console.log('1. ADMINISTRADOR:')
  console.log('   - Email: admin@unibus.com')
  console.log('   - Senha: 123')
  console.log('   - Perfil: ADMIN / Status: ATIVO')
  console.log('-------------------------------------------------------------------')
  console.log('2. ASSOCIADO APROVADO:')
  console.log('   - Email: aprovado@unibus.com')
  console.log('   - Senha: 123')
  console.log('   - Perfil: ASSOCIADO / Status: APROVADO / ATIVO')
  console.log('   - Instituição: IFRO - Campus Ji-Paraná')
  console.log('-------------------------------------------------------------------')
  console.log('3. ASSOCIADO PENDENTE:')
  console.log('   - Email: pendente@unibus.com')
  console.log('   - Senha: 123')
  console.log('   - Perfil: ASSOCIADO / Status: PENDENTE')
  console.log('===================================================================\n')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante a execução do seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
