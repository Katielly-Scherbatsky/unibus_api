import { PrismaClient } from '@prisma/client'
import { fakerPT_BR as faker } from '@faker-js/faker'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const SENHA_PADRAO = 'senha123'

const faculdades = [
  'USP - Universidade de São Paulo',
  'UNIP - Universidade Paulista',
  'FIAP - Faculdade de Informática e Administração Paulista',
  'Mackenzie',
  'Unifesp - Universidade Federal de São Paulo',
  'PUC-SP',
  'Uninove',
  'FATEC',
]

const cursos = [
  'Ciência da Computação',
  'Engenharia Civil',
  'Direito',
  'Psicologia',
  'Administração',
  'Medicina',
  'Arquitetura e Urbanismo',
  'Engenharia de Software',
  'Marketing',
  'Contabilidade',
]

const bairrosSP = [
  'Centro', 'Pinheiros', 'Vila Mariana', 'Moema', 'Itaim Bibi',
  'Jardins', 'Liberdade', 'Santana', 'Tatuapé', 'Brooklin',
  'Morumbi', 'Vila Madalena', 'Butantã', 'Ipiranga', 'Sacomã',
]

const ruasSP = [
  'Rua Augusta', 'Avenida Paulista', 'Rua Oscar Freire', 'Avenida Brigadeiro Faria Lima',
  'Rua da Consolação', 'Avenida Rebouças', 'Rua Haddock Lobo', 'Avenida Angélica',
  'Rua dos Três Irmãos', 'Avenida Jaguaré', 'Rua Cardoso de Almeida', 'Avenida Pacaembu',
  'Rua Teodoro Sampaio', 'Avenida Europa', 'Rua João Cachoeira',
]

const tiposSolicitacao = ['Troca de Ônibus', 'Troca de Poltrona', 'Cancelamento de Linha', 'Justificativa de Falta']
const tiposAdvertencia = ['HIGIENE', 'CONDUTA', 'PERTURBACAO', 'HORARIO'] as const
const titulosNormas = [
  'Estatuto do Estudante 2026',
  'Regulamento de Segurança e Convivência',
  'Normas de Uso do Transporte Universitário',
]

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
  const ddd = ['11', '11', '11', '11', '12', '13', '15'][Math.floor(Math.random() * 7)]
  return `(${ddd}) 9${num.slice(0, 4)}-${num.slice(4, 8)}`
}

function limparCpf(cpf: string): string {
  return cpf.replace(/\D/g, '')
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

  console.log('🏢 Criando associação...')
  const associacao = await prisma.associacao.create({
    data: {
      nome: 'Associação de Transporte Unibus Osasco',
      sigla: 'UNIBUS',
      cnpj: gerarCnpj(),
      email: 'contato@unibusosasco.org.br',
      telefone: '(11) 3678-9012',
      rua: 'Avenida dos Autonomistas',
      bairro: 'Centro',
      numero: '1500',
      cep: '06020-010',
      cidade: 'Osasco',
      estado: 'SP',
    },
  })

  console.log('🚌 Criando transporte...')
  const transporte = await prisma.transporte.create({
    data: {
      associacaoId: associacao.id,
      poltronas: 40,
      horarioIda: '07:00',
      horarioVolta: '18:30',
      dias: 'Segunda,Terça,Quarta,Quinta,Sexta',
      pontoPartida: 'Terminal Metropolitano de Osasco',
      placa: 'ABC-1D23',
      identificacao: 'Van 01',
      rota: 'Osasco Centro → Universidade',
    },
  })

  console.log('👩‍💼 Criando administradores...')
  const adminAna = await prisma.usuario.create({
    data: {
      email: 'ana.paula@unibusosasco.org.br',
      senha: senhaHash,
      tipo: 'ADMIN',
      associacaoId: associacao.id,
    },
  })

  const adminTeste = await prisma.usuario.create({
    data: {
      email: 'admin.teste@unibusosasco.org.br',
      senha: senhaHash,
      tipo: 'ADMIN',
      associacaoId: associacao.id,
    },
  })

  await prisma.associado.createMany({
    data: [
      {
        usuarioId: adminAna.id,
        associacaoId: associacao.id,
        nome: 'Ana Paula',
        cpf: gerarCpf(),
        telefone: '(11) 98765-4321',
        faculdade: 'USP - Universidade de São Paulo',
        curso: 'Administração',
        periodo: 'Noturno',
        matricula: '2023001',
        status: 'ATIVO',
        rua: 'Avenida dos Autonomistas',
        bairro: 'Centro',
        numero: '1500',
        cep: '06020-010',
        cidade: 'Osasco',
        diasTransporte: 'Segunda,Terça,Quarta,Quinta,Sexta',
        primeiroAcesso: false,
      },
      {
        usuarioId: adminTeste.id,
        associacaoId: associacao.id,
        nome: 'Carlos Eduardo',
        cpf: gerarCpf(),
        telefone: '(11) 91234-5678',
        faculdade: 'UNIP - Universidade Paulista',
        curso: 'Direito',
        periodo: 'Matutino',
        matricula: '2023002',
        status: 'ATIVO',
        rua: 'Rua Antônio Agú',
        bairro: 'Vila Yara',
        numero: '245',
        cep: '06026-010',
        cidade: 'Osasco',
        diasTransporte: 'Segunda,Quarta,Sexta',
        primeiroAcesso: false,
      },
    ],
  })

  console.log('🎓 Criando associados estudantes...')
  const quantidadeAssociados = faker.number.int({ min: 15, max: 20 })

  const dadosUsuarios: { email: string; senha: string; tipo: string; associacaoId: number }[] = []
  const metadados: any[] = []

  for (let i = 0; i < quantidadeAssociados; i++) {
    const nome = faker.person.fullName()
    const primeiroNome = nome.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const sobrenome = nome.split(' ').slice(-1)[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const email = `${primeiroNome}.${sobrenome}${faker.number.int({ min: 1, max: 999 })}@email.com`
    const cpf = gerarCpf()
    const telefoneRaw = faker.string.numeric(8)
    const telefone = formatarTelefone(telefoneRaw)
    const cep = `${faker.number.int({ min: 10000, max: 99999 }).toString().padStart(5, '0')}-${faker.number.int({ min: 100, max: 999 }).toString().padStart(3, '0')}`
    const rua = faker.helpers.arrayElement(ruasSP)
    const bairro = faker.helpers.arrayElement(bairrosSP)
    const status = faker.helpers.arrayElement(['ATIVO', 'ATIVO', 'ATIVO', 'DESASSOCIADO', 'PENDENTE'])
    const dias = diasAleatorios()

    dadosUsuarios.push({ email, senha: senhaHash, tipo: 'ASSOCIADO', associacaoId: associacao.id })
    metadados.push({ email, nome, cpf, telefone, cep, rua, bairro, status, dias, matricula: `2023${String(i + 100).padStart(3, '0')}` })
  }

  await prisma.usuario.createMany({ data: dadosUsuarios, skipDuplicates: true })
  const usuariosCriados = await prisma.usuario.findMany({
    where: { email: { in: dadosUsuarios.map((u) => u.email) } },
    select: { id: true, email: true },
  })

  const mapaUsuarioId = new Map(usuariosCriados.map((u) => [u.email, u.id]))

  const dadosAssociados = metadados.map((meta) => ({
    usuarioId: mapaUsuarioId.get(meta.email)!,
    associacaoId: associacao.id,
    transporteId: transporte.id,
    nome: meta.nome,
    cpf: meta.cpf,
    telefone: meta.telefone,
    faculdade: faker.helpers.arrayElement(faculdades),
    curso: faker.helpers.arrayElement(cursos),
    periodo: faker.helpers.arrayElement(['Matutino', 'Vespertino', 'Noturno', 'Integral']),
    matricula: meta.matricula,
    status: meta.status,
    poltrona: null as number | null,
    rua: meta.rua,
    bairro: meta.bairro,
    numero: String(faker.number.int({ min: 10, max: 2000 })),
    cep: meta.cep,
    cidade: 'São Paulo',
    diasTransporte: meta.dias.join(','),
    primeiroAcesso: false,
  }))

  await prisma.associado.createMany({ data: dadosAssociados, skipDuplicates: true })

  let associadosCriados = await prisma.associado.findMany({
    where: { associacaoId: associacao.id, usuario: { tipo: 'ASSOCIADO' } },
  })

  // Atribuir poltronas únicas dentro do ônibus
  const poltronasUsadas = new Set<number>()
  const atualizacoes: Promise<any>[] = []
  for (const associado of associadosCriados.filter((a) => a.status === 'ATIVO')) {
    let poltrona: number
    do {
      poltrona = faker.number.int({ min: 1, max: transporte.poltronas })
    } while (poltronasUsadas.has(poltrona))
    poltronasUsadas.add(poltrona)
    atualizacoes.push(prisma.associado.update({ where: { id: associado.id }, data: { poltrona } }))
    associado.poltrona = poltrona
  }
  await Promise.all(atualizacoes)

  console.log('💰 Criando boletos...')
  const statusBoleto = ['PAGO', 'PENDENTE', 'VENCIDO']
  const valores = [175.0, 189.9, 175.0, 189.9, 210.0]
  const todosBoletos: any[] = []
  const hoje = new Date()
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())

  for (const associado of associadosCriados) {
    const meses = faker.helpers.arrayElements(
      Array.from({ length: 12 }, (_, i) => i),
      faker.number.int({ min: 8, max: 12 }),
    )

    for (const mes of meses) {
      const status = faker.helpers.arrayElement(statusBoleto)
      let dataEmissao: Date
      let dataVencimento: Date

      if (status === 'PENDENTE') {
        dataVencimento = faker.date.between({ from: inicioHoje, to: new Date(hoje.getFullYear() + 1, 11, 31) })
        dataEmissao = new Date(dataVencimento)
        dataEmissao.setDate(dataEmissao.getDate() - faker.number.int({ min: 5, max: 30 }))
      } else if (status === 'VENCIDO') {
        dataVencimento = faker.date.between({ from: new Date(2025, 0, 1), to: new Date(inicioHoje.getTime() - 1) })
        dataEmissao = new Date(dataVencimento)
        dataEmissao.setDate(dataEmissao.getDate() - faker.number.int({ min: 5, max: 30 }))
      } else {
        const ano = faker.helpers.arrayElement([2025, 2026])
        dataEmissao = new Date(ano, mes, faker.number.int({ min: 1, max: 10 }))
        dataVencimento = new Date(dataEmissao)
        dataVencimento.setDate(dataVencimento.getDate() + 10)
      }

      todosBoletos.push({
        associadoId: associado.id,
        dataVencimento,
        valor: faker.helpers.arrayElement(valores),
        status,
        createdAt: dataEmissao,
      })
    }
  }
  await prisma.boleto.createMany({ data: todosBoletos })

  console.log('📋 Criando chamadas e presenças...')
  const associadosAtivos = associadosCriados.filter((a) => a.status === 'ATIVO')
  const chamadasCriadas: any[] = []

  for (let i = 0; i < 12; i++) {
    const mes = faker.number.int({ min: 0, max: 5 })
    const dia = faker.number.int({ min: 1, max: 28 })
    const data = new Date(2026, mes, dia)
    const periodo = faker.helpers.arrayElement(['Matutino', 'Vespertino'])

    const chamada = await prisma.chamada.create({
      data: {
        transporteId: transporte.id,
        data,
        periodo,
        status: 'FINALIZADO',
        motorista: faker.person.fullName(),
      },
    })
    chamadasCriadas.push(chamada)

    const presencas = associadosAtivos.map((a) => ({
      chamadaId: chamada.id,
      associadoId: a.id,
      presente: faker.number.float({ min: 0, max: 1 }) > 0.15,
      poltrona: a.poltrona ?? 1,
    }))

    await prisma.presencaChamada.createMany({ data: presencas, skipDuplicates: true })
  }

  console.log('📝 Criando solicitações...')
  const quantidadeSolicitacoes = faker.number.int({ min: 5, max: 8 })
  const solicitacoesData = Array.from({ length: quantidadeSolicitacoes }, () => {
    const status = faker.helpers.arrayElement(['PENDENTE', 'APROVADO', 'RECUSADO'])
    return {
      associadoId: faker.helpers.arrayElement(associadosCriados).id,
      data: faker.date.between({ from: '2025-06-01', to: '2026-06-30' }),
      tipo: faker.helpers.arrayElement(tiposSolicitacao),
      motivo: faker.lorem.sentence(),
      status,
      descricao: faker.lorem.sentence().slice(0, 180),
      atendidoPor: status !== 'PENDENTE' ? faker.helpers.arrayElement(['Ana Paula', 'Carlos Eduardo']) : null,
    }
  })
  await prisma.solicitacao.createMany({ data: solicitacoesData })

  console.log('⚠️ Criando advertências...')
  const quantidadeAdvertencias = Math.min(faker.number.int({ min: 2, max: 4 }), associadosCriados.length)
  const associadosAdvertencias = faker.helpers.arrayElements(associadosCriados, quantidadeAdvertencias)
  const advertenciasData = associadosAdvertencias.map((associado) => ({
    associadoId: associado.id,
    data: faker.date.between({ from: '2025-08-01', to: '2026-06-30' }),
    tipo: faker.helpers.arrayElement(tiposAdvertencia),
    motivo: faker.lorem.sentence(),
    status: 'PENDENTE',
    descricao: faker.lorem.sentence().slice(0, 180),
  }))
  await prisma.advertencia.createMany({ data: advertenciasData })

  console.log('📄 Criando avisos...')
  const quantidadeAvisos = Math.min(3, associadosCriados.length)
  const associadosAvisos = faker.helpers.arrayElements(associadosCriados, quantidadeAvisos)
  const avisosData = associadosAvisos.map((associado) => ({
    associadoId: associado.id,
    data: faker.date.between({ from: '2025-10-01', to: '2026-06-30' }),
    tipo: faker.helpers.arrayElement(['Feriado / Operação', 'Rota / Ponto', 'Orientação']),
    motivo: faker.lorem.sentence(),
    status: 'PENDENTE',
    descricao: faker.lorem.sentence().slice(0, 180),
  }))
  await prisma.aviso.createMany({ data: avisosData })

  console.log('📚 Criando normas institucionais...')
  const normasData = titulosNormas.map((titulo, i) => ({
    nome: titulo,
    url: `/public/uploads/normas/norma_${i + 1}.pdf`,
    tipo: 'PDF',
    associacaoId: associacao.id,
  }))
  await prisma.normaDocumento.createMany({ data: normasData })

  console.log('📎 Criando documentos pessoais...')
  const tiposDocumento = ['RG_Frente.pdf', 'RG_Verso.pdf', 'Comprovante_Matricula.png', 'Comprovante_Residencia.pdf']
  const documentosData: any[] = []
  for (const associado of faker.helpers.arrayElements(associadosCriados, 5)) {
    const quantidade = faker.number.int({ min: 1, max: 3 })
    for (let i = 0; i < quantidade; i++) {
      documentosData.push({
        nome: faker.helpers.arrayElement(tiposDocumento),
        url: `/public/uploads/documentos/${associado.id}_${faker.string.alphanumeric(8)}.pdf`,
        tipo: 'DOCUMENTO_PESSOAL',
        associadoId: associado.id,
      })
    }
  }
  await prisma.documento.createMany({ data: documentosData })

  console.log('\n✅ Seed concluído com sucesso!')
  console.log({
    associacao: associacao.nome,
    administradores: 2,
    associados: associadosCriados.length,
    boletos: await prisma.boleto.count(),
    chamadas: await prisma.chamada.count(),
    presencas: await prisma.presencaChamada.count(),
    solicitacoes: await prisma.solicitacao.count(),
    advertencias: await prisma.advertencia.count(),
    avisos: await prisma.aviso.count(),
    normas: await prisma.normaDocumento.count(),
    documentos: await prisma.documento.count(),
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
