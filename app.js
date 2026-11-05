/* ==========================================================================
   PHONETICFACE — MOTOR JAVASCRIPT DE LETRAMENTO ADULTO, VOZ NEURAL E OCR
   ========================================================================== */
(function () {
    'use strict';

    if (window.__PHONETICFACE_READY__) return;
    window.__PHONETICFACE_READY__ = true;

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (regs) {
            for (var i = 0; i < regs.length; i++) regs[i].unregister();
        }).catch(function () {});
    }

    function lerStorage(chave, padrao) {
        try {
            var v = localStorage.getItem(chave);
            return v !== null ? v : padrao;
        } catch (e) { return padrao; }
    }

    function salvarStorage(chave, valor) {
        try { localStorage.setItem(chave, String(valor)); } catch (e) {}
    }

    function embaralharArray(arr) {
        var copia = arr.slice();
        for (var i = copia.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = copia[i];
            copia[i] = copia[j];
            copia[j] = temp;
        }
        return copia;
    }

    /* Normalização fonética e ortográfica para comparação rigorosa de fala e digitação */
    function normalizarTextoComparacao(str) {
        return String(str || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ');
    }

    function toggleMenuMobile() {
        var menu = document.getElementById('menu-principal');
        var btn = document.querySelector('.menu-toggle');
        if (menu) {
            var aberto = menu.classList.toggle('aberto');
            if (btn) btn.setAttribute('aria-expanded', String(aberto));
        }
    }

    /* MAPAS FONÉTICOS REAIS PARA SÍNTESE FLUIDA */
    var MapaFoneticoVogais = { 'A': 'á', 'E': 'é', 'I': 'í', 'O': 'ó', 'U': 'ú' };
    var MapaFoneticoConsoantes = {
        'B': 'bê', 'C': 'cê', 'D': 'dê', 'F': 'éfe', 'G': 'gê', 'H': 'agá',
        'J': 'jóta', 'K': 'cá', 'L': 'éle', 'M': 'ême', 'N': 'êne', 'P': 'pê',
        'Q': 'quê', 'R': 'érre', 'S': 'ésse', 'T': 'tê', 'V': 'vê', 'W': 'dáblio',
        'X': 'xís', 'Y': 'ípsilon', 'Z': 'zê'
    };
    var MapaFoneticoSilabas = {
        'BA': 'bá', 'BE': 'bê', 'BI': 'bí', 'BO': 'bó', 'BU': 'bú',
        'CA': 'cá', 'CE': 'cê', 'CI': 'cí', 'CO': 'có', 'CU': 'cú',
        'DA': 'dá', 'DE': 'dê', 'DI': 'dí', 'DO': 'dó', 'DU': 'dú',
        'FA': 'fá', 'FE': 'fê', 'FI': 'fí', 'FO': 'fó', 'FU': 'fú',
        'GA': 'gá', 'GE': 'gê', 'GI': 'gí', 'GO': 'gó', 'GU': 'gú',
        'HA': 'á',  'HE': 'ê',  'HI': 'í',  'HO': 'ó',  'HU': 'ú',
        'JA': 'já', 'JE': 'jê', 'JI': 'jí', 'JO': 'jó', 'JU': 'jú',
        'LA': 'lá', 'LE': 'lê', 'LI': 'lí', 'LO': 'ló', 'LU': 'lú',
        'MA': 'má', 'ME': 'mê', 'MI': 'mí', 'MO': 'mó', 'MU': 'mú',
        'NA': 'ná', 'NE': 'nê', 'NI': 'ní', 'NO': 'nó', 'NU': 'nú',
        'PA': 'pá', 'PE': 'pê', 'PI': 'pí', 'PO': 'pó', 'PU': 'pú',
        'RA': 'rrá','RE': 'rrê','RI': 'rrí','RO': 'rró','RU': 'rrú',
        'SA': 'sá', 'SE': 'sê', 'SI': 'sí', 'SO': 'só', 'SU': 'sú',
        'TA': 'tá', 'TE': 'tê', 'TI': 'tí', 'TO': 'tó', 'TU': 'tú',
        'VA': 'vá', 'VE': 'vê', 'VI': 'ví', 'VO': 'vó', 'VU': 'vú',
        'XA': 'xá', 'XE': 'xê', 'XI': 'xí', 'XO': 'xó', 'XU': 'xú',
        'ZA': 'zá', 'ZE': 'zê', 'ZI': 'zí', 'ZO': 'zó', 'ZU': 'zú'
    };

    var ExemplosSilabasAdulto = {
        'BA': 'BANCÁRIO', 'BE': 'BENEFÍCIO', 'BI': 'BILHETE', 'BO': 'BOLETO', 'BU': 'BULA',
        'CA': 'CAMINHÃO', 'CE': 'CERTIDÃO', 'CI': 'CIDADANIA', 'CO': 'CONTRATO', 'CU': 'CUSTO',
        'DA': 'DADOS', 'DE': 'DEVERES', 'DI': 'DINHEIRO', 'DO': 'DOCUMENTO', 'DU': 'DURAÇÃO',
        'FA': 'FARMÁCIA', 'FE': 'FERRAMENTA', 'FI': 'FINANÇAS', 'FO': 'FOLHA', 'FU': 'FUNÇÃO',
        'GA': 'GARANTIA', 'GE': 'GERENTE', 'GI': 'GIRO', 'GO': 'GOVERNO', 'GU': 'GUIA',
        'JA': 'JORNADA', 'JO': 'JOVEM', 'JU': 'JUSTIÇA',
        'LA': 'LAVOURA', 'LE': 'LEITURA', 'LI': 'LINHA', 'LO': 'LOGÍSTICA', 'LU': 'LUCRO',
        'MA': 'MÁQUINA', 'ME': 'MERCADO', 'MI': 'MINISTÉRIO', 'MO': 'MOTORISTA', 'MU': 'MUNICÍPIO',
        'NA': 'NAVEGAÇÃO', 'NE': 'NEGÓCIO', 'NI': 'NÍVEL', 'NO': 'NOTA', 'NU': 'NÚMERO',
        'PA': 'PAGAMENTO', 'PE': 'PEDESTRE', 'PI': 'PLANTIO', 'PO': 'PORTARIA', 'PU': 'PÚBLICO',
        'RA': 'RECIBO', 'RE': 'RECEITA', 'RI': 'REGISTRO', 'RO': 'RODOVIA', 'RU': 'RURAL',
        'SA': 'SALÁRIO', 'SE': 'SEGURANÇA', 'SI': 'SISTEMA', 'SO': 'SOCIEDADE', 'SU': 'SAÚDE',
        'TA': 'TARIFA', 'TE': 'TRABALHO', 'TI': 'TÍTULO', 'TO': 'TURNO', 'TU': 'TUBULAÇÃO',
        'VA': 'VALOR', 'VE': 'VEÍCULO', 'VI': 'VISTORIA', 'VO': 'VOTAÇÃO', 'VU': 'VULNERÁVEL',
        'XA': 'XAROPE', 'XI': 'XÍCARA', 'ZE': 'ZELADORIA'
    };

    /* BANCO DE DADOS VOLTADO À VIVÊNCIA E LETRAMENTO DE ADULTOS (ZERO INFANTILIZAÇÃO) */
    var BancoDados = {
        alfabeto: [
            { letra: 'A', palavra: 'AUTONOMIA', youtubeId: 'XBCDUG-yEaw' },
            { letra: 'B', palavra: 'BOLETO', youtubeId: 'j6ROsDM87UU' },
            { letra: 'C', palavra: 'CAMINHÃO', youtubeId: 'hWZA7DElS_I' },
            { letra: 'D', palavra: 'DOCUMENTO', youtubeId: 'mAIWY3S12s4' },
            { letra: 'E', palavra: 'EMPREGO', youtubeId: '8s43APNFMtM' },
            { letra: 'F', palavra: 'FERRAMENTA', youtubeId: 'nuX0O_hqoFM' },
            { letra: 'G', palavra: 'GESTÃO', youtubeId: '4SjEf5gYXio' },
            { letra: 'H', palavra: 'HOSPITAL', youtubeId: 'NhZ6eVHmVDA' },
            { letra: 'I', palavra: 'IDENTIDADE', youtubeId: 'ILhan-Htj0g' },
            { letra: 'J', palavra: 'JORNADA', youtubeId: 'Z9lBor1lnI8' },
            { letra: 'K', palavra: 'KILOWATT', youtubeId: 'eGrZ1WM_oaE' },
            { letra: 'L', palavra: 'LAVOURA', youtubeId: 'tC3yWQPeNpE' },
            { letra: 'M', palavra: 'MERCADO', youtubeId: 'mH3byoH67O4' },
            { letra: 'N', palavra: 'NOTA FISCAL', youtubeId: 'AGPxKWabjSc' },
            { letra: 'O', palavra: 'ORÇAMENTO', youtubeId: '-8RtEgO3Y5s' },
            { letra: 'P', palavra: 'PROFISSÃO', youtubeId: 'bmQ_2UA7sWw' },
            { letra: 'Q', palavra: 'QUALIDADE', youtubeId: '-qZ5fNtr-8g' },
            { letra: 'R', palavra: 'RECEITA', youtubeId: '7fKcMXcBNOA' },
            { letra: 'S', palavra: 'SALÁRIO', youtubeId: 's6XAkz5lGxA' },
            { letra: 'T', palavra: 'TRABALHO', youtubeId: '-FyHvZ9Hz0Y' },
            { letra: 'U', palavra: 'UNIDADE', youtubeId: 'beFXQ-w5CKs' },
            { letra: 'V', palavra: 'TRANSPORTE', youtubeId: 'cGJ2MXDMsgE' },
            { letra: 'W', palavra: 'WEB', youtubeId: 'An41gHwcEEw' },
            { letra: 'X', palavra: 'XAROPE', youtubeId: 'zqrqp-RHFHs' },
            { letra: 'Y', palavra: 'YOUTUBE', youtubeId: 'NJLEAbML25A' },
            { letra: 'Z', palavra: 'ZELADORIA', youtubeId: '-QBkzFZDWNU' }
        ],
        vogais: ['A', 'E', 'I', 'O', 'U'],
        consoantes: ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'],
        sinaisDesenho: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        iniciais: [
            { img: '🚛', nome: 'CAMINHÃO', certa: 'C', cat: 'TRANSPORTE E LOGÍSTICA' },
            { img: '🛠️', nome: 'TRABALHO', certa: 'T', cat: 'ATIVIDADE PROFISSIONAL' },
            { img: '🪪', nome: 'DOCUMENTO', certa: 'D', cat: 'CIDADANIA E DIREITOS' },
            { img: '💊', nome: 'MEDICAMENTO', certa: 'M', cat: 'SAÚDE E RECEITUÁRIO' },
            { img: '🪖', nome: 'CAPACETE', certa: 'C', cat: 'EQUIPAMENTO DE PROTEÇÃO (EPI)' },
            { img: '💵', nome: 'SALÁRIO', certa: 'S', cat: 'FINANÇAS E RENDA' },
            { img: '🚌', nome: 'ÔNIBUS', certa: 'O', cat: 'MOBILIDADE URBANA' },
            { img: '🏥', nome: 'HOSPITAL', certa: 'H', cat: 'ATENDIMENTO DE SAÚDE' },
            { img: '🛒', nome: 'MERCADO', certa: 'M', cat: 'ABASTECIMENTO DOMÉSTICO' },
            { img: '🚜', nome: 'LAVOURA', certa: 'L', cat: 'PRODUÇÃO AGRÍCOLA' },
            { img: '📄', nome: 'CONTRATO', certa: 'C', cat: 'VÍNCULO FORMAL' },
            { img: '🧰', nome: 'FERRAMENTA', certa: 'F', cat: 'OPERAÇÃO TÉCNICA' },
            { img: '🏦', nome: 'AGÊNCIA', certa: 'A', cat: 'SERVIÇO BANCÁRIO' },
            { img: '⚡', nome: 'ENERGIA', certa: 'E', cat: 'INFRAESTRUTURA' },
            { img: '🏭', nome: 'INDÚSTRIA', certa: 'I', cat: 'SETOR PRODUTIVO' },
            { img: '🧾', nome: 'RECIBO', certa: 'R', cat: 'COMPROVAÇÃO FINANCEIRA' },
            { img: '🧤', nome: 'PROTEÇÃO', certa: 'P', cat: 'SEGURANÇA DO TRABALHO' },
            { img: '🗳️', nome: 'VOTAÇÃO', certa: 'V', cat: 'EXERCÍCIO DA CIDADANIA' }
        ],
        silabas: [
            { consoante: 'C', vogal: 'A', palavra: 'CAMINHÃO' },
            { consoante: 'S', vogal: 'A', palavra: 'SALÁRIO' },
            { consoante: 'M', vogal: 'E', palavra: 'MERCADO' },
            { consoante: 'R', vogal: 'E', palavra: 'RECEITA' },
            { consoante: 'D', vogal: 'O', palavra: 'DOCUMENTO' },
            { consoante: 'F', vogal: 'E', palavra: 'FERRAMENTA' }
        ],
        palavrasJogo: [
            { p: 'CAMINHÃO', s: ['CA', 'MI', 'NHÃO'] },
            { p: 'TRABALHO', s: ['TRA', 'BA', 'LHO'] },
            { p: 'DOCUMENTO', s: ['DO', 'CU', 'MEN', 'TO'] },
            { p: 'CAPACETE', s: ['CA', 'PA', 'CE', 'TE'] },
            { p: 'SALÁRIO', s: ['SA', 'LÁ', 'RIO'] },
            { p: 'RECEITA', s: ['RE', 'CEI', 'TA'] },
            { p: 'MERCADO', s: ['MER', 'CA', 'DO'] },
            { p: 'CONTRATO', s: ['CON', 'TRA', 'TO'] },
            { p: 'HOSPITAL', s: ['HOS', 'PI', 'TAL'] },
            { p: 'FARMÁCIA', s: ['FAR', 'MÁ', 'CIA'] },
            { p: 'SEGURANÇA', s: ['SE', 'GU', 'RAN', 'ÇA'] },
            { p: 'LAVOURA', s: ['LA', 'VOU', 'RA'] },
            { p: 'COLHEITA', s: ['CO', 'LHEI', 'TA'] },
            { p: 'PRODUÇÃO', s: ['PRO', 'DU', 'ÇÃO'] },
            { p: 'TELEFONE', s: ['TE', 'LE', 'FO', 'NE'] },
            { p: 'COMPUTADOR', s: ['COM', 'PU', 'TA', 'DOR'] },
            { p: 'ORÇAMENTO', s: ['OR', 'ÇA', 'MEN', 'TO'] },
            { p: 'CIDADANIA', s: ['CI', 'DA', 'DA', 'NIA'] }
        ],
        termosDigitacaoFuncional: [
            'CAMINHÃO',
            'CARTEIRA DE TRABALHO',
            'RECEITA MÉDICA',
            'EQUIPAMENTO DE PROTEÇÃO',
            'COMPROVANTE DE PAGAMENTO',
            'DOCUMENTO DE IDENTIDADE',
            'SEGURANÇA DO TRABALHO',
            'TERMINAL RODOVIÁRIO'
        ],
        cores: [
            { n: 'AZUL', c: '#2196F3', txt: '#FFF' }, { n: 'VERMELHO', c: '#FF3B30', txt: '#FFF' },
            { n: 'AMARELO', c: '#FFCC00', txt: '#000' }, { n: 'VERDE', c: '#34C759', txt: '#FFF' },
            { n: 'LARANJA', c: '#FF9500', txt: '#FFF' }, { n: 'ROXO', c: '#9B59B6', txt: '#FFF' },
            { n: 'MARROM', c: '#A2845E', txt: '#FFF' }, { n: 'PRETO', c: '#1C1C1E', txt: '#FFF' },
            { n: 'BRANCO', c: '#FFFFFF', txt: '#000' }, { n: 'CINZA', c: '#8E8E93', txt: '#FFF' },
            { n: 'VERDE ESCURO', c: '#248A3D', txt: '#FFF' }, { n: 'AZUL CLARO', c: '#5AC8FA', txt: '#000' }
        ],
        vidaPratica: [
            { titulo: 'RECEITUÁRIO MÉDICO', cat: 'geral', icone: '💊', textoFala: 'Prescrição médica: Tomar um comprimido de dipirona de 500 miligramas a cada 8 horas, após as refeições.' },
            { titulo: 'ITINERÁRIO DE ÔNIBUS', cat: 'geral', icone: '🚌', textoFala: 'Transporte coletivo: Linha Expresso Centro via Terminal Rodoviário e Avenida Brasil.' },
            { titulo: 'ORÇAMENTO DE MERCADO', cat: 'geral', icone: '🛒', textoFala: 'Lista de abastecimento: 5 quilos de arroz, 2 quilos de feijão, óleo de soja, café e leite.' },
            { titulo: 'FICHA DE CONDICIONAMENTO', cat: 'geral', icone: '🏋️', textoFala: 'Orientação física: Realizar 3 séries de 12 repetições com intervalo de 1 minuto entre as séries.' },
            { titulo: 'NORMA DE EPI (NR-6)', cat: 'trabalho', icone: '🪖', textoFala: 'Segurança operacional: Uso obrigatório de capacete, botas de segurança, luvas e óculos de proteção neste setor.' },
            { titulo: 'SINALIZAÇÃO DE ALTA TENSÃO', cat: 'trabalho', icone: '⚠️', textoFala: 'Atenção: Quadro de energia elétrica de alta tensão. Manutenção restrita à equipe técnica autorizada.' },
            { titulo: 'REGISTRO DE PONTO DIÁRIO', cat: 'trabalho', icone: '⏱️', textoFala: 'Controle de jornada: Confira seu comprovante impresso ao registrar o horário de entrada, intervalo e saída.' },
            { titulo: 'ARMAZENAMENTO DE INSUMOS', cat: 'trabalho', icone: '📦', textoFala: 'Instrução logística: Empilhamento máximo de 5 caixas. Manter em local seco, arejado e protegido do sol.' }
        ],
        animais: [
            { nome: 'CAVALO', icone: '🐎', cat: 'PECUÁRIA E CAMPO' },
            { nome: 'VACA', icone: '🐄', cat: 'PRODUÇÃO LEITEIRA' },
            { nome: 'PORCO', icone: '🐷', cat: 'SUINOCULTURA' },
            { nome: 'GALINHA', icone: '🐔', cat: 'AVICULTURA' },
            { nome: 'OVELHA', icone: '🐑', cat: 'OVINOCULTURA' },
            { nome: 'ABELHA', icone: '🐝', cat: 'APICULTURA E POLINIZAÇÃO' },
            { nome: 'PEIXE', icone: '🐟', cat: 'PISCICULTURA' },
            { nome: 'CACHORRO', icone: '🐕', cat: 'CONVÍVIO DOMÉSTICO' },
            { nome: 'GATO', icone: '🐈', cat: 'CONVÍVIO DOMÉSTICO' },
            { nome: 'PATO', icone: '🦆', cat: 'FAUNA AQUÁTICA' },
            { nome: 'CORUJA', icone: '🦉', cat: 'FAUNA SILVESTRE' },
            { nome: 'TARTARUGA', icone: '🐢', cat: 'FAUNA AMBIENTAL' }
        ],
        alunosProfessor: [
            {
                nome: 'José Carlos da Silva',
                idade: 58,
                perfilEtario: 'Pessoa Adulta',
                serie: 'EJA - Fase I (2º Segmento)',
                notaRCO: '9,5',
                tarefas: '14 atividades concluídas',
                pct: 92,
                corBarra: 'fill-verde',
                categoria: 'otimo',
                relatorio: 'Domínio consistente de famílias silábicas, validação por voz e leitura de normas de segurança do trabalho.',
                orientacao: 'Apto para progressão à leitura e interpretação de textos técnicos',
                historico: [
                    'Concluiu 14 atividades nos módulos de Sílabas, Palavras e Leitura Prática.',
                    'Validou a pronúncia no microfone e utilizou o leitor óptico por câmera com autonomia.',
                    'Aproveitamento integral na avaliação diagnóstica RCO.'
                ]
            },
            {
                nome: 'Maria Aparecida Oliveira',
                idade: 64,
                perfilEtario: 'Pessoa Adulta +',
                serie: 'EJA - Fase I (1º Segmento)',
                notaRCO: '7,0',
                tarefas: '6 atividades concluídas',
                pct: 54,
                corBarra: 'fill-amarelo',
                categoria: 'dificuldade',
                relatorio: 'Apresentou oscilação na ordenação de palavras polissílabas e diferenciação gráfica entre F e V.',
                orientacao: 'Aplicar reforço focado nos Módulos 4 e 6',
                historico: [
                    'Realizou 6 atividades nos módulos de Som Inicial e Formação de Palavras.',
                    'Necessita de acompanhamento complementar na transição para palavras de 4 sílabas.',
                    'Concluiu corretamente a digitação conferida de documentos.'
                ]
            },
            {
                nome: 'Antônio Ferreira Santos',
                idade: 71,
                perfilEtario: 'Pessoa Adulta +',
                serie: 'EJA - Etapa Inicial (Alfabetização)',
                notaRCO: '6,0',
                tarefas: '3 atividades concluídas',
                pct: 32,
                corBarra: 'fill-vermelho',
                categoria: 'plataforma',
                relatorio: 'Em fase de adaptação ao uso do dispositivo móvel; requer orientação na transição entre abas.',
                orientacao: 'Manter Alto Contraste ativo e mediação presencial inicial',
                historico: [
                    'Realizou 3 atividades no Módulo 1 e Módulo 2.',
                    'Boa resposta auditiva ao sintetizador de voz humanizado.',
                    'Indicada mediação prática de 10 minutos para uso autônomo do navegador.'
                ]
            },
            {
                nome: 'Sebastiana Rodrigues',
                idade: 52,
                perfilEtario: 'Pessoa Adulta',
                serie: 'EJA - Fase II (2º Segmento)',
                notaRCO: '9,0',
                tarefas: '12 atividades concluídas',
                pct: 88,
                corBarra: 'fill-verde',
                categoria: 'otimo',
                relatorio: 'Elevado índice de acerto na validação geométrica de caligrafia, leitura de receituários e educação financeira.',
                orientacao: 'Progredir para redação funcional e cálculo aplicado',
                historico: [
                    'Concluiu 12 atividades completas na sessão.',
                    'Atingiu precisão superior a 85% na matriz geométrica de traçado.',
                    'Autonomia plena em dispositivos móveis e desktop.'
                ]
            },
            {
                nome: 'Lucas Gabriel Almeida',
                idade: 21,
                perfilEtario: 'Jovem',
                serie: 'EJA - Fase I (1º Segmento)',
                notaRCO: '8,5',
                tarefas: '10 atividades concluídas',
                pct: 80,
                corBarra: 'fill-verde',
                categoria: 'otimo',
                relatorio: 'Rápida assimilação da trilha de Segurança Operacional (NRs) e validação precisa de digitação.',
                orientacao: 'Consolidar escrita técnica e documentação profissional',
                historico: [
                    'Realizou 10 atividades nos módulos 5, 6, 7 e 10.',
                    'Excelente desempenho na leitura de comunicados industriais e EPIs.',
                    'Apto para certificação intermediária do módulo.'
                ]
            }
        ]
    };

    /* ==========================================================================
       2. MOTOR DE VOZ HUMANIZADA (SELEÇÃO AUTOMÁTICA DE VOZES NEURAIS PT-BR)
       ========================================================================== */
    var Voz = {
        synth: window.speechSynthesis || null,
        vozesDisponiveis: [],
        vozSelecionada: null,

        inicializarVozes: function () {
            if (!this.synth) return;
            var self = this;

            function carregarLista() {
                var todas = self.synth.getVoices() || [];
                var ptVoices = todas.filter(function (v) {
                    return /pt[-_]br|portugu/i.test(v.lang + ' ' + v.name);
                });

                /* Ordena priorizando vozes Neurais / Online Natural (Microsoft Francisca/Antonio, Google, Luciana) */
                ptVoices.sort(function (a, b) {
                    function pontuar(v) {
                        var n = (v.name || '').toLowerCase();
                        var p = 0;
                        if (n.indexOf('natural') !== -1 || n.indexOf('neural') !== -1) p += 100;
                        if (n.indexOf('francisca') !== -1 || n.indexOf('antonio') !== -1 || n.indexOf('thalita') !== -1) p += 80;
                        if (n.indexOf('google') !== -1) p += 60;
                        if (n.indexOf('luciana') !== -1 || n.indexOf('felipe') !== -1 || n.indexOf('premium') !== -1) p += 50;
                        if (/pt[-_]br/i.test(v.lang)) p += 20;
                        return p;
                    }
                    return pontuar(b) - pontuar(a);
                });

                self.vozesDisponiveis = ptVoices.length > 0 ? ptVoices : todas;
                if (self.vozesDisponiveis.length > 0 && !self.vozSelecionada) {
                    self.vozSelecionada = self.vozesDisponiveis[0];
                }

                var selectEl = document.getElementById('seletor-voz-tts');
                if (selectEl && ptVoices.length > 0) {
                    selectEl.innerHTML = '';
                    ptVoices.forEach(function (v, idx) {
                        var opt = document.createElement('option');
                        opt.value = String(idx);
                        opt.textContent = v.name.replace(/Microsoft |Online \(Natural\) - Portuguese \(Brazil\)/g, '').trim() + ' (BR)';
                        selectEl.appendChild(opt);
                    });
                }
            }

            carregarLista();
            if (typeof this.synth.onvoiceschanged !== 'undefined') {
                this.synth.onvoiceschanged = carregarLista;
            }
        },

        selecionarVozManual: function (indiceStr) {
            var idx = parseInt(indiceStr, 10);
            if (!isNaN(idx) && this.vozesDisponiveis[idx]) {
                this.vozSelecionada = this.vozesDisponiveis[idx];
                this.falar('Voz de leitura atualizada com sucesso.');
            }
        },

        /* Formata textos em CAIXA ALTA para caixa natural antes de enviar ao TTS, evitando leitura robótica/soletrada */
        humanizarTextoParaFala: function (texto) {
            var limpo = String(texto || '').trim();
            if (!limpo) return '';
            if (limpo === limpo.toUpperCase() && limpo.length > 2) {
                limpo = limpo.charAt(0).toUpperCase() + limpo.slice(1).toLowerCase();
            }
            return limpo;
        },

        falar: function (texto, aoFinalizar) {
            if (!this.synth) {
                if (typeof aoFinalizar === 'function') aoFinalizar();
                return;
            }
            try {
                this.synth.cancel();
                var textoNatural = this.humanizarTextoParaFala(texto);
                var declaracao = new SpeechSynthesisUtterance(textoNatural);
                declaracao.lang = 'pt-BR';
                if (this.vozSelecionada) {
                    declaracao.voice = this.vozSelecionada;
                }
                declaracao.rate = 0.98;
                declaracao.pitch = 1.0;
                if (typeof aoFinalizar === 'function') {
                    declaracao.onend = aoFinalizar;
                    declaracao.onerror = aoFinalizar;
                }
                this.synth.speak(declaracao);
            } catch (e) {
                if (typeof aoFinalizar === 'function') aoFinalizar();
            }
        },

        falarVogal: function (vogal) {
            var som = MapaFoneticoVogais[vogal] || vogal.toLowerCase();
            this.falar(som);
        },

        falarConsoante: function (consoante) {
            var som = MapaFoneticoConsoantes[consoante] || consoante.toLowerCase();
            this.falar(som);
        },

        falarSilaba: function (silaba) {
            var chave = String(silaba).toUpperCase().trim();
            var som = MapaFoneticoSilabas[chave] || chave.toLowerCase();
            this.falar(som);
        },

        parar: function () {
            if (this.synth) {
                try { this.synth.cancel(); } catch (e) {}
            }
        }
    };

    /* ==========================================================================
       3. RECONHECIMENTO DE VOZ DE ALTA PRECISÃO (SEM CONFLITO DE ÁUDIO + CRONÔMETRO)
       ========================================================================== */
    var ReconhecimentoVoz = {
        instancia: null,
        gravando: false,
        modoAtivo: null,
        segundosGravacao: 0,
        intervaloTimer: null,
        transcricaoAcumulada: '',
        alternativasCapturadas: [],

        alternarGravacao: function (modo) {
            if (this.gravando) {
                this.pararEVerificar();
            } else {
                this.iniciarGravacao(modo);
            }
        },

        iniciarGravacao: function (modo) {
            var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            var statusEl = document.getElementById(modo === 'inicial' ? 'status-reconhecimento' : 'status-rec-palavra');
            var btnMic = document.getElementById(modo === 'inicial' ? 'btn-mic-inicial' : 'btn-mic-palavra');

            if (!SpeechRecognition) {
                if (statusEl) statusEl.innerText = 'SEU NAVEGADOR NÃO SUPORTA MICROFONE NATIVO. UTILIZE O GOOGLE CHROME OU EDGE.';
                return;
            }

            /* Interrompe imediatamente qualquer áudio do sistema antes de abrir o microfone */
            Voz.parar();

            this.modoAtivo = modo;
            this.gravando = true;
            this.segundosGravacao = 0;
            this.transcricaoAcumulada = '';
            this.alternativasCapturadas = [];

            var recognition = new SpeechRecognition();
            this.instancia = recognition;
            recognition.lang = 'pt-BR';
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.maxAlternatives = 5;

            var self = this;

            recognition.onstart = function () {
                if (btnMic) {
                    btnMic.classList.add('ouvindo');
                    btnMic.innerText = 'GRAVANDO (00:00) — CLIQUE PARA FINALIZAR';
                }
                if (statusEl) {
                    statusEl.innerText = 'MICROFONE ABERTO: PRONUNCIE A PALAVRA COM CLAREZA E CLIQUE NO BOTÃO PARA CONCLUIR.';
                }
                clearInterval(self.intervaloTimer);
                self.intervaloTimer = setInterval(function () {
                    self.segundosGravacao++;
                    var seg = self.segundosGravacao < 10 ? '0' + self.segundosGravacao : String(self.segundosGravacao);
                    if (btnMic && self.gravando) {
                        btnMic.innerText = 'GRAVANDO (00:' + seg + ') — CLIQUE PARA FINALIZAR';
                    }
                }, 1000);
            };

            recognition.onresult = function (event) {
                var parcial = '';
                for (var i = 0; i < event.results.length; i++) {
                    var res = event.results[i];
                    parcial += res[0].transcript + ' ';
                    for (var a = 0; a < res.length; a++) {
                        self.alternativasCapturadas.push(res[a].transcript);
                    }
                }
                self.transcricaoAcumulada = parcial.trim();
                if (statusEl && self.transcricaoAcumulada) {
                    statusEl.innerText = 'CAPTURADO: "' + self.transcricaoAcumulada.toUpperCase() + '" — CLIQUE NO BOTÃO PARA VALIDAR.';
                }
            };

            recognition.onerror = function () {
                self.encerrarEstadoVisual();
                if (statusEl) {
                    statusEl.innerText = 'NÃO FOI POSSÍVEL CAPTURAR O ÁUDIO. VERIFIQUE A PERMISSÃO DO MICROFONE E TENTE NOVAMENTE.';
                }
            };

            recognition.onend = function () {
                if (self.gravando) {
                    self.avaliarPronunciaCapturada();
                }
            };

            try {
                recognition.start();
            } catch (e) {
                this.encerrarEstadoVisual();
            }
        },

        pararEVerificar: function () {
            if (!this.gravando) return;
            var statusEl = document.getElementById(this.modoAtivo === 'inicial' ? 'status-reconhecimento' : 'status-rec-palavra');
            if (statusEl) statusEl.innerText = 'VERIFICANDO PRONÚNCIA...';
            try {
                if (this.instancia) this.instancia.stop();
            } catch (e) {
                this.avaliarPronunciaCapturada();
            }
        },

        encerrarEstadoVisual: function () {
            this.gravando = false;
            clearInterval(this.intervaloTimer);
            var btn1 = document.getElementById('btn-mic-inicial');
            var btn2 = document.getElementById('btn-mic-palavra');
            if (btn1) {
                btn1.classList.remove('ouvindo');
                btn1.innerText = '2. INICIAR GRAVAÇÃO DE VOZ';
            }
            if (btn2) {
                btn2.classList.remove('ouvindo');
                btn2.innerText = '2. INICIAR GRAVAÇÃO DE VOZ';
            }
        },

        /* Comparação exata da palavra falada (normalizando acentos como "caminhão" <-> "caminhao" e rejeitando palavras diferentes) */
        palavraCorrespondeExata: function (faladoBruto, palavraAlvo) {
            var alvoNorm = normalizarTextoComparacao(palavraAlvo);
            var faladoNorm = normalizarTextoComparacao(faladoBruto);
            if (!alvoNorm || !faladoNorm) return false;

            if (faladoNorm === alvoNorm) return true;

            var tokens = faladoNorm.split(' ');
            for (var i = 0; i < tokens.length; i++) {
                if (tokens[i] === alvoNorm) return true;
            }
            return false;
        },

        avaliarPronunciaCapturada: function () {
            var modo = this.modoAtivo;
            this.encerrarEstadoVisual();

            var statusEl = document.getElementById(modo === 'inicial' ? 'status-reconhecimento' : 'status-rec-palavra');
            var palavraAlvo = '';

            if (modo === 'inicial') {
                var item = InteracaoApp.itemInicialAtual;
                palavraAlvo = item ? item.nome : '';
            } else {
                var elDica = document.getElementById('dica-palavra');
                palavraAlvo = elDica ? elDica.innerText.trim() : '';
            }

            var todasTentativas = [this.transcricaoAcumulada].concat(this.alternativasCapturadas);
            var acertou = false;

            for (var i = 0; i < todasTentativas.length; i++) {
                if (this.palavraCorrespondeExata(todasTentativas[i], palavraAlvo)) {
                    acertou = true;
                    break;
                }
            }

            var exibicaoFalado = (this.transcricaoAcumulada || '').trim().toUpperCase();

            if (!exibicaoFalado) {
                if (statusEl) statusEl.innerText = 'NENHUMA FALA DETECTADA. CLIQUE EM "INICIAR GRAVAÇÃO", FALE A PALAVRA E CLIQUE PARA FINALIZAR.';
                return;
            }

            if (acertou) {
                if (statusEl) {
                    statusEl.innerText = 'VALIDADO COM SUCESSO! VOCÊ PRONUNCIOU CORRETAMENTE: "' + palavraAlvo.toUpperCase() + '".';
                }
                if (modo === 'inicial') {
                    var elDicaInicial = document.getElementById('nome-inicial-dica');
                    if (elDicaInicial) elDicaInicial.innerText = palavraAlvo.split('').join(' ');
                }
                Voz.falar('Muito bem! Você pronunciou a palavra ' + palavraAlvo.toLowerCase() + ' corretamente.');
                InteracaoApp.gerarConfetes();
                GerenciadorPerfil.registrarAcaoAluno('Pronúncia validada por voz na palavra: ' + palavraAlvo);
                setTimeout(function () {
                    if (modo === 'inicial') InteracaoApp.sortearNovaInicial();
                    else InteracaoApp.proximaPalavra();
                }, 2600);
            } else {
                if (statusEl) {
                    statusEl.innerText = 'PRONÚNCIA INCORRETA. VOCÊ DISSE "' + exibicaoFalado + '", MAS A PALAVRA CORRETA É "' + palavraAlvo.toUpperCase() + '". TENTE NOVAMENTE.';
                }
                Voz.falar('Palavra incorreta. Você disse ' + exibicaoFalado.toLowerCase() + '. A palavra correta é ' + palavraAlvo.toLowerCase() + '. Tente novamente.');
                GerenciadorPerfil.registrarDificuldadeAluno('Divergência na leitura por voz de "' + palavraAlvo + '" (pronunciou "' + exibicaoFalado + '").');
            }
        }
    };

    /* ==========================================================================
       4. VALIDADOR ESTRITO DE DIGITAÇÃO (MÓDULOS 7 E 9)
       ========================================================================== */
    var ValidadorDigitacao = {
        palavraAlvoModulo7: 'AUTONOMIA',
        indiceTermoFuncional: 0,

        definirPalavraAlvoModulo7: function (letra) {
            var encontrado = BancoDados.alfabeto.find(function (a) { return a.letra === letra; });
            this.palavraAlvoModulo7 = encontrado ? encontrado.palavra : 'AUTONOMIA';
            var elAlvo = document.getElementById('palavra-alvo-digitacao');
            var elInput = document.getElementById('input-treino-digitacao');
            var elFeedback = document.getElementById('feedback-treino-digitacao');
            if (elAlvo) elAlvo.innerText = this.palavraAlvoModulo7;
            if (elInput) elInput.value = '';
            if (elFeedback) {
                elFeedback.className = 'barra-status-tracado';
                elFeedback.innerText = 'AGUARDANDO DIGITAÇÃO DA PALAVRA "' + this.palavraAlvoModulo7 + '".';
            }
        },

        inspecionarComparacao: function (digitadoRaw, alvoRaw, elFeedback) {
            var digitado = String(digitadoRaw || '').toUpperCase();
            var alvo = String(alvoRaw || '').toUpperCase();
            if (!elFeedback) return false;

            if (digitado.length === 0) {
                elFeedback.className = 'barra-status-tracado';
                elFeedback.innerText = 'DIGITE A PALAVRA "' + alvo + '" PARA VALIDAR.';
                return false;
            }

            /* Verifica letra por letra na posição exata */
            for (var i = 0; i < digitado.length; i++) {
                var charDigitadoNorm = normalizarTextoComparacao(digitado.charAt(i));
                var charAlvoNorm = normalizarTextoComparacao(alvo.charAt(i));

                if (i >= alvo.length || charDigitadoNorm !== charAlvoNorm) {
                    var esperado = alvo.charAt(i) || '(FIM DA PALAVRA)';
                    elFeedback.className = 'barra-status-tracado erro';
                    elFeedback.innerText = 'ERRO DE DIGITAÇÃO NA POSIÇÃO ' + (i + 1) + ': VOCÊ DIGITOU "' + digitado.charAt(i) + '", MAS O CORRETO É "' + esperado + '". CORRIJA PARA PROSSEGUIR.';
                    return false;
                }
            }

            if (digitado.length < alvo.length) {
                elFeedback.className = 'barra-status-tracado';
                elFeedback.innerText = 'LETRAS CORRETAS ATÉ AGORA (' + digitado.length + '/' + alvo.length + '). CONTINUE DIGITANDO...';
                return false;
            }

            elFeedback.className = 'barra-status-tracado sucesso';
            elFeedback.innerText = 'DIGITAÇÃO EXATA CONFIRMADA: "' + alvo + '".';
            return true;
        },

        inspecionarEmTempoReal: function () {
            var elInput = document.getElementById('input-treino-digitacao');
            var elFeedback = document.getElementById('feedback-treino-digitacao');
            if (!elInput) return;
            this.inspecionarComparacao(elInput.value, this.palavraAlvoModulo7, elFeedback);
        },

        confirmarDigitacao: function () {
            var elInput = document.getElementById('input-treino-digitacao');
            var elFeedback = document.getElementById('feedback-treino-digitacao');
            if (!elInput) return;

            var ok = this.inspecionarComparacao(elInput.value.trim(), this.palavraAlvoModulo7, elFeedback);
            if (ok) {
                Voz.falar('Digitação correta da palavra ' + this.palavraAlvoModulo7.toLowerCase() + '.');
                InteracaoApp.gerarConfetes();
                GerenciadorPerfil.registrarAcaoAluno('Validou a digitação exata da palavra: ' + this.palavraAlvoModulo7);
            } else {
                Voz.falar('A digitação apresenta letras incorretas ou incompletas. Verifique o aviso em vermelho e corrija.');
                GerenciadorPerfil.registrarDificuldadeAluno('Erro de digitação na palavra "' + this.palavraAlvoModulo7 + '" (digitou "' + elInput.value.toUpperCase() + '").');
            }
        },

        inspecionarTermoFuncional: function () {
            var elInput = document.getElementById('input-termo-funcional');
            var elFeedback = document.getElementById('feedback-termo-funcional');
            var alvo = BancoDados.termosDigitacaoFuncional[this.indiceTermoFuncional];
            if (!elInput) return;
            this.inspecionarComparacao(elInput.value, alvo, elFeedback);
        },

        confirmarTermoFuncional: function () {
            var elInput = document.getElementById('input-termo-funcional');
            var elFeedback = document.getElementById('feedback-termo-funcional');
            var alvo = BancoDados.termosDigitacaoFuncional[this.indiceTermoFuncional];
            if (!elInput) return;

            var ok = this.inspecionarComparacao(elInput.value.trim(), alvo, elFeedback);
            if (ok) {
                Voz.falar('Excelente! Você digitou ' + alvo.toLowerCase() + ' sem nenhum erro.');
                InteracaoApp.gerarConfetes();
                GerenciadorPerfil.registrarAcaoAluno('Transcreveu corretamente o termo: ' + alvo);
            } else {
                Voz.falar('Há letras incorretas na sua digitação. Corrija o caractere indicado.');
            }
        },

        sortearNovoTermoFuncional: function () {
            this.indiceTermoFuncional = (this.indiceTermoFuncional + 1) % BancoDados.termosDigitacaoFuncional.length;
            var alvo = BancoDados.termosDigitacaoFuncional[this.indiceTermoFuncional];
            var elAlvo = document.getElementById('termo-funcional-alvo');
            var elInput = document.getElementById('input-termo-funcional');
            var elFeedback = document.getElementById('feedback-termo-funcional');
            if (elAlvo) elAlvo.innerText = alvo;
            if (elInput) elInput.value = '';
            if (elFeedback) {
                elFeedback.className = 'barra-status-tracado';
                elFeedback.innerText = 'DIGITE LETRA POR LETRA PARA VALIDAR.';
            }
            Voz.falar('Novo termo para digitação: ' + alvo.toLowerCase());
        }
    };

    /* ==========================================================================
       5. LEITOR PRÁTICO COM CÂMERA (OCR TESSERACT.JS + LEITURA EM VOZ ALTA)
       ========================================================================== */
    var LeitorCameraOCR = {
        streamAtivo: null,

        alternarCameraAoVivo: function () {
            var container = document.getElementById('container-webcam-ao-vivo');
            if (!container) return;
            if (container.style.display === 'none') {
                this.abrirCameraAoVivo();
            } else {
                this.fecharCameraAoVivo();
            }
        },

        abrirCameraAoVivo: function () {
            var container = document.getElementById('container-webcam-ao-vivo');
            var video = document.getElementById('video-webcam-ocr');
            var status = document.getElementById('status-ocr-camera');

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                if (status) {
                    status.className = 'barra-status-tracado erro';
                    status.innerText = 'CÂMERA AO VIVO INDISPONÍVEL NESTE NAVEGADOR. UTILIZE O BOTÃO "FOTOGRAFAR PAPEL COM O CELULAR".';
                }
                return;
            }

            var self = this;
            navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            }).then(function (stream) {
                self.streamAtivo = stream;
                if (video) video.srcObject = stream;
                if (container) container.style.display = 'block';
                if (status) {
                    status.className = 'barra-status-tracado';
                    status.innerText = 'APONTE A CÂMERA PARA O PAPEL OU DOCUMENTO E CLIQUE EM "CAPTURAR FOTO E LER TEXTO".';
                }
            }).catch(function () {
                if (status) {
                    status.className = 'barra-status-tracado erro';
                    status.innerText = 'PERMISSÃO DE CÂMERA NEGADA OU INDISPONÍVEL. UTILIZE O BOTÃO "FOTOGRAFAR PAPEL / ENVIAR FOTO".';
                }
            });
        },

        fecharCameraAoVivo: function () {
            var container = document.getElementById('container-webcam-ao-vivo');
            var video = document.getElementById('video-webcam-ocr');
            if (this.streamAtivo) {
                this.streamAtivo.getTracks().forEach(function (t) { t.stop(); });
                this.streamAtivo = null;
            }
            if (video) video.srcObject = null;
            if (container) container.style.display = 'none';
        },

        capturarQuadroWebcam: function () {
            var video = document.getElementById('video-webcam-ocr');
            if (!video || !video.videoWidth) return;

            var canvasTemp = document.createElement('canvas');
            canvasTemp.width = video.videoWidth;
            canvasTemp.height = video.videoHeight;
            var ctx = canvasTemp.getContext('2d');
            ctx.drawImage(video, 0, 0, canvasTemp.width, canvasTemp.height);

            var dataUrl = canvasTemp.toDataURL('image/png');
            this.fecharCameraAoVivo();
            this.executarOCR(dataUrl);
        },

        processarArquivoImagem: function (inputEl) {
            if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
            var arquivo = inputEl.files[0];
            var leitor = new FileReader();
            var self = this;

            leitor.onload = function (e) {
                self.executarOCR(e.target.result);
            };
            leitor.readAsDataURL(arquivo);
        },

        /* Pré-processa a foto aumentando nitidez e contraste para leitura precisa de papel */
        preprocessarImagemParaOCR: function (dataUrl, callback) {
            var img = new Image();
            img.onload = function () {
                var canvas = document.getElementById('canvas-preprocessamento-ocr') || document.createElement('canvas');
                var maxDim = 1400;
                var w = img.width;
                var h = img.height;
                if (w > maxDim || h > maxDim) {
                    if (w > h) {
                        h = Math.round((h * maxDim) / w);
                        w = maxDim;
                    } else {
                        w = Math.round((w * maxDim) / h);
                        h = maxDim;
                    }
                }
                canvas.width = w;
                canvas.height = h;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);

                var imgData = ctx.getImageData(0, 0, w, h);
                var d = imgData.data;
                for (var i = 0; i < d.length; i += 4) {
                    var cinza = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
                    var contrastado = cinza > 145 ? Math.min(255, cinza * 1.15) : Math.max(0, cinza * 0.75);
                    d[i] = d[i + 1] = d[i + 2] = contrastado;
                }
                ctx.putImageData(imgData, 0, 0);
                callback(canvas.toDataURL('image/png'));
            };
            img.onerror = function () { callback(dataUrl); };
            img.src = dataUrl;
        },

        executarOCR: function (imagemDataUrl) {
            var status = document.getElementById('status-ocr-camera');
            var painelRes = document.getElementById('painel-resultado-ocr');
            var imgPrevia = document.getElementById('img-previa-ocr');
            var textarea = document.getElementById('textarea-resultado-ocr');

            if (imgPrevia) imgPrevia.src = imagemDataUrl;
            if (painelRes) painelRes.style.display = 'grid';
            if (textarea) textarea.value = 'Processando imagem e identificando texto em português...';
            if (status) {
                status.className = 'barra-status-tracado';
                status.innerText = 'ANALISANDO FOTO DO DOCUMENTO... AGUARDE ALGUNS SEGUNDOS.';
            }

            if (typeof window.Tesseract === 'undefined') {
                if (status) {
                    status.className = 'barra-status-tracado erro';
                    status.innerText = 'BIBLIOTECA DE VISÃO COMPUTACIONAL INDISPONÍVEL OFFLINE. DIGITE OU COLE O TEXTO NO CAMPO ABAIXO PARA OUVIR.';
                }
                if (textarea) textarea.value = '';
                return;
            }

            var self = this;
            this.preprocessarImagemParaOCR(imagemDataUrl, function (imgOtimizada) {
                window.Tesseract.recognize(imgOtimizada, 'por', {
                    logger: function (m) {
                        if (m.status === 'recognizing text' && status) {
                            var pct = Math.round((m.progress || 0) * 100);
                            status.innerText = 'EXTRAINDO TEXTO DO PAPEL: ' + pct + '% CONCLUÍDO...';
                        }
                    }
                }).then(function (resultado) {
                    var textoExtraido = (resultado && resultado.data && resultado.data.text) ? resultado.data.text.trim() : '';
                    textoExtraido = textoExtraido.replace(/\n{3,}/g, '\n\n').trim();

                    if (!textoExtraido || textoExtraido.length < 2) {
                        if (status) {
                            status.className = 'barra-status-tracado erro';
                            status.innerText = 'NÃO FOI POSSÍVEL IDENTIFICAR TEXTO LEGÍVEL NA FOTO. APROXIME MAIS A CÂMERA DO PAPEL EM LOCAL ILUMINADO.';
                        }
                        if (textarea) textarea.value = '';
                        Voz.falar('Não foi possível identificar o texto na imagem. Tire outra foto aproximando mais a câmera do papel.');
                        return;
                    }

                    if (textarea) textarea.value = textoExtraido;
                    if (status) {
                        status.className = 'barra-status-tracado sucesso';
                        status.innerText = 'TEXTO EXTRAÍDO COM SUCESSO! INICIANDO LEITURA EM VOZ ALTA.';
                    }
                    GerenciadorPerfil.registrarAcaoAluno('Utilizou a câmera (OCR) para ler um documento impresso.');
                    self.lerTextoExtraido();
                }).catch(function () {
                    if (status) {
                        status.className = 'barra-status-tracado erro';
                        status.innerText = 'ERRO AO PROCESSAR A IMAGEM. TENTE NOVAMENTE COM UMA FOTO MAIS NÍTIDA.';
                    }
                });
            });
        },

        lerTextoExtraido: function () {
            var textarea = document.getElementById('textarea-resultado-ocr');
            if (!textarea || !textarea.value.trim()) {
                Voz.falar('Nenhum texto disponível para leitura.');
                return;
            }
            Voz.falar(textarea.value.trim());
        },

        limparLeitura: function () {
            Voz.parar();
            var painelRes = document.getElementById('painel-resultado-ocr');
            var textarea = document.getElementById('textarea-resultado-ocr');
            var status = document.getElementById('status-ocr-camera');
            if (textarea) textarea.value = '';
            if (painelRes) painelRes.style.display = 'none';
            if (status) {
                status.className = 'barra-status-tracado';
                status.innerText = 'SELECIONE "FOTOGRAFAR PAPEL" ACIMA PARA EXTRAIR E OUVIR O CONTEÚDO DE QUALQUER DOCUMENTO.';
            }
        }
    };

    var AppConfig = {
        tamanhoAtual: 100,
        alterarTamanhoFonte: function (inc) {
            var novo = this.tamanhoAtual + inc;
            if (novo >= 80 && novo <= 150) {
                this.tamanhoAtual = novo;
                document.documentElement.style.fontSize = this.tamanhoAtual + '%';
                var abaEscrever = document.getElementById('aba-escrever');
                if (QuadroInterativo && abaEscrever && abaEscrever.classList.contains('active')) {
                    setTimeout(function () { QuadroInterativo.redimensionar(); }, 50);
                }
            }
        },
        alternarAltoContraste: function () {
            var ativo = document.body.classList.toggle('alto-contraste');
            var botao = document.getElementById('btn-alto-contraste');
            if (botao) botao.setAttribute('aria-pressed', String(ativo));
            if (QuadroInterativo) QuadroInterativo.atualizarCorTraco();
        }
    };

    var GerenciadorCookies = {
        verificar: function () {
            var aceito = lerStorage('phoneticface_cookies_lgpd', '');
            var banner = document.getElementById('banner-cookies');
            if (!aceito && banner) banner.style.display = 'flex';
        },
        aceitar: function () {
            salvarStorage('phoneticface_cookies_lgpd', 'aceito');
            this.fechar();
        },
        fechar: function () {
            var banner = document.getElementById('banner-cookies');
            if (banner) banner.style.display = 'none';
        }
    };

    var InterfaceModal = {
        mostrarVideo: function (item) {
            var modal = document.getElementById('modal-letras');
            var titulo = document.getElementById('letra-display');
            var texto = document.getElementById('modal-texto-palavra');
            var iframe = document.getElementById('player-youtube');
            var linkDireto = document.getElementById('link-youtube-direto');

            if (!modal) return;
            Voz.parar();

            if (titulo) titulo.innerText = 'LETRA ' + item.letra.toUpperCase();
            if (texto) texto.innerText = item.letra.toUpperCase() + ' DE ' + item.palavra.toUpperCase();
            if (iframe) iframe.src = 'https://www.youtube.com/embed/' + item.youtubeId + '?rel=0&autoplay=1';
            if (linkDireto) linkDireto.href = 'https://www.youtube.com/watch?v=' + item.youtubeId;

            modal.classList.add('visivel');
            GerenciadorPerfil.registrarAcaoAluno('Assistiu ao vídeo da docente para a letra ' + item.letra + ' (' + item.palavra + ').');
        },
        fechar: function () {
            var modal = document.getElementById('modal-letras');
            var iframe = document.getElementById('player-youtube');
            if (modal) modal.classList.remove('visivel');
            Voz.parar();
            if (iframe) iframe.src = '';
        }
    };

    var ConstrutorSilabas = {
        consoantes: ['C', 'B', 'D', 'F', 'G', 'J', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'X', 'Z'],
        vogais: ['A', 'E', 'I', 'O', 'U'],
        idxConsoante: 0,
        idxVogal: 0,

        inicializar: function () {
            this.atualizarVisor(false);
            this.embaralharLetrasMisturadas();
            this.configurarArrasteRoleta('roleta-consoante', true);
            this.configurarArrasteRoleta('roleta-vogal', false);
        },

        mudarConsoante: function (direcao) {
            var total = this.consoantes.length;
            this.idxConsoante = (this.idxConsoante + direcao + total) % total;
            this.atualizarVisor(true);
        },

        mudarVogal: function (direcao) {
            var total = this.vogais.length;
            this.idxVogal = (this.idxVogal + direcao + total) % total;
            this.atualizarVisor(true);
        },

        selecionarLetraMisturada: function (letra) {
            var idxV = this.vogais.indexOf(letra);
            if (idxV !== -1) {
                this.idxVogal = idxV;
            } else {
                var idxC = this.consoantes.indexOf(letra);
                if (idxC !== -1) this.idxConsoante = idxC;
            }
            this.atualizarVisor(true);
        },

        atualizarVisor: function (falarAutomaticamente) {
            var c = this.consoantes[this.idxConsoante];
            var v = this.vogais[this.idxVogal];
            var silaba = c + v;
            var palavra = ExemplosSilabasAdulto[silaba] || 'TRABALHO';

            var elC = document.getElementById('visor-consoante-ativa');
            var elV = document.getElementById('visor-vogal-ativa');
            var elSil = document.getElementById('texto-silaba-formada');
            var elPal = document.getElementById('texto-palavra-silaba');

            if (elC) elC.innerText = c;
            if (elV) elV.innerText = v;
            if (elSil) elSil.innerText = silaba;
            if (elPal) elPal.innerText = silaba + ' DE ' + palavra;

            if (falarAutomaticamente) {
                this.falarResultadoAtual();
            }
        },

        falarResultadoAtual: function () {
            var c = this.consoantes[this.idxConsoante];
            var v = this.vogais[this.idxVogal];
            var silaba = c + v;
            var palavra = ExemplosSilabasAdulto[silaba] || '';
            var somSilaba = MapaFoneticoSilabas[silaba] || silaba.toLowerCase();
            Voz.falar(somSilaba + ', de ' + palavra.toLowerCase());
            GerenciadorPerfil.registrarAcaoAluno('Construiu a sílaba ' + silaba + ' (' + silaba + ' de ' + palavra + ').');
        },

        embaralharLetrasMisturadas: function () {
            var container = document.getElementById('painel-letras-misturadas');
            if (!container) return;
            container.innerHTML = '';
            var todas = embaralharArray(this.consoantes.concat(this.vogais));
            var self = this;

            todas.forEach(function (letra) {
                var ehVogal = self.vogais.indexOf(letra) !== -1;
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-letra-misturada' + (ehVogal ? ' vogal-mista' : '');
                btn.innerText = letra;
                btn.onclick = function () { self.selecionarLetraMisturada(letra); };
                container.appendChild(btn);
            });
        },

        configurarArrasteRoleta: function (idElemento, ehConsoante) {
            var el = document.getElementById(idElemento);
            if (!el) return;
            var inicioY = null;
            var self = this;

            el.addEventListener('touchstart', function (e) {
                if (e.touches && e.touches.length > 0) inicioY = e.touches[0].clientY;
            }, { passive: true });

            el.addEventListener('touchend', function (e) {
                if (inicioY === null || !e.changedTouches || e.changedTouches.length === 0) return;
                var deltaY = e.changedTouches[0].clientY - inicioY;
                if (Math.abs(deltaY) > 22) {
                    var direcao = deltaY > 0 ? -1 : 1;
                    if (ehConsoante) self.mudarConsoante(direcao);
                    else self.mudarVogal(direcao);
                }
                inicioY = null;
            }, { passive: true });

            el.addEventListener('wheel', function (e) {
                e.preventDefault();
                var direcao = e.deltaY > 0 ? 1 : -1;
                if (ehConsoante) self.mudarConsoante(direcao);
                else self.mudarVogal(direcao);
            }, { passive: false });
        }
    };

    /* ==========================================================================
       6. CALIGRAFIA COM CORRELAÇÃO DE MATRIZ 4x4 (REJEITA LETRAS ERRADAS)
       ========================================================================== */
    function CanvasCaligrafia(idCanvas, idContainer, idGuia) {
        this.canvas = document.getElementById(idCanvas);
        this.container = document.getElementById(idContainer);
        this.guiaFundo = document.getElementById(idGuia);
        this.barraStatus = document.getElementById('aviso-tracado');
        if (!this.canvas || !this.container) return;

        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.canvasMolde = document.createElement('canvas');
        this.ctxMolde = this.canvasMolde.getContext('2d', { willReadFrequently: true });

        this.letraAtual = 'A';
        this.desenhando = false;
        this.vincularEventos();
    }

    CanvasCaligrafia.prototype.atualizarCorTraco = function () {
        if (!this.ctx) return;
        this.ctx.strokeStyle = document.body.classList.contains('alto-contraste') ? '#FFFF00' : '#004A99';
    };

    CanvasCaligrafia.prototype.redimensionar = function () {
        if (!this.container || !this.canvas || !this.ctx) return;
        var largura = this.container.clientWidth || 600;
        var altura = this.container.clientHeight || 420;

        var anterior = document.createElement('canvas');
        anterior.width = this.canvas.width;
        anterior.height = this.canvas.height;
        if (anterior.width > 0 && anterior.height > 0) {
            anterior.getContext('2d').drawImage(this.canvas, 0, 0);
        }

        this.canvas.width = largura;
        this.canvas.height = altura;
        this.ctx.lineWidth = 22;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.atualizarCorTraco();
        this.desenharMoldeLetra();

        if (anterior.width > 0 && anterior.height > 0) {
            this.ctx.drawImage(anterior, 0, 0, anterior.width, anterior.height, 0, 0, largura, altura);
        }
    };

    CanvasCaligrafia.prototype.desenharMoldeLetra = function () {
        if (!this.canvas) return;
        var w = this.canvas.width;
        var h = this.canvas.height;
        if (!w || !h) return;

        this.canvasMolde.width = w;
        this.canvasMolde.height = h;
        this.ctxMolde.clearRect(0, 0, w, h);

        var tamFonte = w < 500 ? 180 : 240;
        if (this.guiaFundo) this.guiaFundo.style.fontSize = tamFonte + 'px';

        this.ctxMolde.font = '900 ' + tamFonte + 'px Arial, Helvetica, sans-serif';
        this.ctxMolde.textAlign = 'center';
        this.ctxMolde.textBaseline = 'middle';
        this.ctxMolde.lineWidth = 28;
        this.ctxMolde.lineJoin = 'round';
        this.ctxMolde.strokeStyle = '#000';
        this.ctxMolde.fillStyle = '#000';
        this.ctxMolde.strokeText(this.letraAtual, w / 2, h / 2);
        this.ctxMolde.fillText(this.letraAtual, w / 2, h / 2);
    };

    CanvasCaligrafia.prototype.obterCoordenadas = function (e) {
        var rect = this.canvas.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    CanvasCaligrafia.prototype.iniciarTraco = function (e) {
        this.desenhando = true;
        this.atualizarCorTraco();
        e.preventDefault();
        var pos = this.obterCoordenadas(e);
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
    };

    CanvasCaligrafia.prototype.desenhar = function (e) {
        if (!this.desenhando) return;
        e.preventDefault();
        var pos = this.obterCoordenadas(e);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
    };

    CanvasCaligrafia.prototype.finalizarTraco = function () {
        if (!this.desenhando) return;
        this.desenhando = false;
        this.ctx.beginPath();
    };

    CanvasCaligrafia.prototype.atualizarAviso = function (texto, classe) {
        if (!this.barraStatus) return;
        this.barraStatus.innerText = texto;
        this.barraStatus.className = 'barra-status-tracado ' + (classe || '');
    };

    /* Validação matricial 4x4: compara cada quadrante da letra desenhada com o molde real */
    CanvasCaligrafia.prototype.validarDesenho = function () {
        if (!this.canvas) return;
        var w = this.canvas.width;
        var h = this.canvas.height;
        if (!w || !h) return;

        this.desenharMoldeLetra();
        var dadosAluno = this.ctx.getImageData(0, 0, w, h).data;
        var dadosMolde = this.ctxMolde.getImageData(0, 0, w, h).data;

        var pintadosPeloAluno = 0;
        var pintadosDentroDaLetra = 0;
        var tamanhoMolde = 0;

        var mMinX = w, mMaxX = 0, mMinY = h, mMaxY = 0;
        var aMinX = w, aMaxX = 0, aMinY = h, aMaxY = 0;

        for (var y = 0; y < h; y += 2) {
            for (var x = 0; x < w; x += 2) {
                var idx = (y * w + x) * 4 + 3;
                var alunoRiscou = dadosAluno[idx] > 50;
                var dentroDaLetra = dadosMolde[idx] > 50;

                if (dentroDaLetra) {
                    tamanhoMolde++;
                    if (x < mMinX) mMinX = x;
                    if (x > mMaxX) mMaxX = x;
                    if (y < mMinY) mMinY = y;
                    if (y > mMaxY) mMaxY = y;
                }
                if (alunoRiscou) {
                    pintadosPeloAluno++;
                    if (x < aMinX) aMinX = x;
                    if (x > aMaxX) aMaxX = x;
                    if (y < aMinY) aMinY = y;
                    if (y > aMaxY) aMaxY = y;
                    if (dentroDaLetra) pintadosDentroDaLetra++;
                }
            }
        }

        if (pintadosPeloAluno < 25) {
            this.atualizarAviso('NENHUM TRAÇADO SUFICIENTE DETECTADO. CONTORNE A LETRA "' + this.letraAtual + '" ANTES DE VALIDAR.', 'erro');
            Voz.falar('Contorne a letra ' + this.letraAtual + ' no quadro antes de verificar.');
            return;
        }

        /* Matriz 4x4 dentro da caixa delimitadora do molde */
        var boxW = Math.max(20, mMaxX - mMinX);
        var boxH = Math.max(20, mMaxY - mMinY);
        var zonasAtivasNoMolde = 0;
        var zonasCobertasPeloAluno = 0;
        var zonasVaziasInvadidas = 0;

        for (var gy = 0; gy < 4; gy++) {
            for (var gx = 0; gx < 4; gx++) {
                var iniX = Math.floor(mMinX + (gx * boxW) / 4);
                var fimX = Math.floor(mMinX + ((gx + 1) * boxW) / 4);
                var iniY = Math.floor(mMinY + (gy * boxH) / 4);
                var fimY = Math.floor(mMinY + ((gy + 1) * boxH) / 4);

                var moldeNaZona = 0;
                var alunoDentroZona = 0;
                var alunoForaZona = 0;

                for (var yy = iniY; yy < fimY; yy += 2) {
                    for (var xx = iniX; xx < fimX; xx += 2) {
                        var pIdx = (yy * w + xx) * 4 + 3;
                        var mAtivo = dadosMolde[pIdx] > 50;
                        var aAtivo = dadosAluno[pIdx] > 50;
                        if (mAtivo) moldeNaZona++;
                        if (aAtivo) {
                            if (mAtivo) alunoDentroZona++;
                            else alunoForaZona++;
                        }
                    }
                }

                if (moldeNaZona > 18) {
                    zonasAtivasNoMolde++;
                    if (alunoDentroZona / moldeNaZona >= 0.28) {
                        zonasCobertasPeloAluno++;
                    }
                } else if (alunoForaZona > 35) {
                    zonasVaziasInvadidas++;
                }
            }
        }

        var precisao = pintadosDentroDaLetra / pintadosPeloAluno;
        var preenchimento = tamanhoMolde > 0 ? (pintadosDentroDaLetra / tamanhoMolde) : 0;
        var taxaZonasCobertas = zonasAtivasNoMolde > 0 ? (zonasCobertasPeloAluno / zonasAtivasNoMolde) : 0;
        var propAltura = (aMaxY - aMinY) / boxH;

        /* Rejeita rigorosamente se a letra desenhada for diferente da letra do molde */
        if (
            precisao < 0.68 ||
            preenchimento < 0.42 ||
            taxaZonasCobertas < 0.75 ||
            zonasVaziasInvadidas > 1 ||
            propAltura < 0.75 ||
            pintadosPeloAluno > tamanhoMolde * 1.28
        ) {
            this.atualizarAviso('TRAÇADO INCORRETO OU INCOMPLETO! O FORMATO DESENHADO NÃO CORRESPONDE À LETRA "' + this.letraAtual + '". TENTE NOVAMENTE.', 'erro');
            Voz.falar('Traçado incorreto. O desenho não corresponde ao formato exato da letra ' + this.letraAtual + '. Tente novamente.');
            GerenciadorPerfil.registrarDificuldadeAluno('Desvio geométrico no traçado da letra ' + this.letraAtual + '.');
        } else {
            this.atualizarAviso('TRAÇADO VALIDADO COM PRECISÃO! FORMATO DA LETRA "' + this.letraAtual + '" CORRETO.', 'sucesso');
            Voz.falar('Excelente! O traçado da letra ' + this.letraAtual + ' foi validado com precisão.');
            InteracaoApp.gerarConfetes();
            GerenciadorPerfil.registrarAcaoAluno('Validou com precisão geométrica o traçado da letra ' + this.letraAtual + '.');
        }
    };

    CanvasCaligrafia.prototype.limparSilencioso = function () {
        if (this.ctx && this.canvas) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    CanvasCaligrafia.prototype.limpar = function () {
        this.limparSilencioso();
        this.atualizarAviso('QUADRO LIMPO. CONTORNE TODAS AS EXTREMIDADES DA LETRA "' + this.letraAtual + '".', '');
    };

    CanvasCaligrafia.prototype.definirGuia = function (letra, btnClicado) {
        this.letraAtual = letra;
        if (this.guiaFundo) this.guiaFundo.innerText = letra;
        if (btnClicado) {
            var bts = document.querySelectorAll('#botoes-desenho .btn-ferramenta');
            for (var i = 0; i < bts.length; i++) bts[i].classList.remove('letra-ativa');
            btnClicado.classList.add('letra-ativa');
        }
        this.limparSilencioso();
        this.desenharMoldeLetra();
        this.atualizarAviso('CONTORNE TODAS AS EXTREMIDADES DA LETRA "' + letra + '" E CLIQUE EM "VERIFICAR TRAÇADO"', '');
        ValidadorDigitacao.definirPalavraAlvoModulo7(letra);
        Voz.falar('Letra ' + letra + '. Contorne a letra no quadro e digite a palavra de referência abaixo.');
    };

    CanvasCaligrafia.prototype.vincularEventos = function () {
        var self = this;
        this.canvas.addEventListener('mousedown', function (e) { self.iniciarTraco(e); });
        this.canvas.addEventListener('mousemove', function (e) { self.desenhar(e); });
        this.canvas.addEventListener('mouseup', function () { self.finalizarTraco(); });
        this.canvas.addEventListener('touchstart', function (e) { self.iniciarTraco(e); }, { passive: false });
        this.canvas.addEventListener('touchmove', function (e) { self.desenhar(e); }, { passive: false });
        this.canvas.addEventListener('touchend', function () { self.finalizarTraco(); });
    };

    var QuadroInterativo = null;

    /* ==========================================================================
       7. INTERAÇÕES DE SOM INICIAL, PALAVRAS E IDENTIDADE CIDADÃ
       ========================================================================== */
    var InteracaoApp = {
        idInicial: 0,
        idPalavra: 0,
        itemInicialAtual: null,
        palavraAtual: null,
        silabasPreenchidas: 0,

        verificarNome: function () {
            var input = document.getElementById('input-nome');
            var feedback = document.getElementById('feedback-nome-identidade');
            if (!input) return;
            var nome = input.value.trim().toUpperCase();

            /* Validação estrita: rejeita números ou caracteres inválidos no nome */
            if (nome.length < 3 || /[^A-ZÀ-Ú\s]/.test(nome)) {
                if (feedback) {
                    feedback.style.color = '#DC2626';
                    feedback.innerText = 'NOME INVÁLIDO: DIGITE APENAS LETRAS (MÍNIMO DE 3 CARACTERES, SEM NÚMEROS OU SÍMBOLOS).';
                }
                Voz.falar('Nome inválido. Digite apenas letras, sem números ou símbolos.');
                return;
            }

            salvarStorage('phoneticface_aluno', nome);
            var boasVindas = document.getElementById('mensagem-boas-vindas');
            if (boasVindas) {
                boasVindas.innerText = 'ESTUDANTE: ' + nome;
                boasVindas.style.display = 'block';
            }
            if (feedback) {
                feedback.style.color = '#16A34A';
                feedback.innerText = 'IDENTIFICAÇÃO REGISTRADA COM SUCESSO: ' + nome;
            }
            Voz.falar('Identificação confirmada com sucesso, ' + nome.toLowerCase() + '.');
            this.gerarConfetes();
            GerenciadorPerfil.registrarAcaoAluno('Registrou identificação nominal completa (' + nome + ').');
        },

        carregarNomeSalvo: function () {
            var nomeSalvo = lerStorage('phoneticface_aluno', '');
            if (nomeSalvo) {
                var boasVindas = document.getElementById('mensagem-boas-vindas');
                var input = document.getElementById('input-nome');
                if (boasVindas) {
                    boasVindas.innerText = 'ESTUDANTE: ' + nomeSalvo;
                    boasVindas.style.display = 'block';
                }
                if (input) input.value = nomeSalvo;
            }
        },

        gerarConfetes: function () {
            var cores = ['#004A99', '#007A8C', '#2E7D32', '#F59E0B', '#4C1D95'];
            for (var i = 0; i < 45; i++) {
                (function () {
                    var confete = document.createElement('div');
                    confete.className = 'confete';
                    confete.style.left = Math.random() * 100 + 'vw';
                    confete.style.top = '-10px';
                    confete.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
                    confete.style.animationDuration = (Math.random() * 2 + 1.8) + 's';
                    document.body.appendChild(confete);
                    setTimeout(function () { confete.remove(); }, 3800);
                })();
            }
        },

        ouvirPalavraInicial: function () {
            if (this.itemInicialAtual) Voz.falar(this.itemInicialAtual.nome);
        },

        sortearNovaInicial: function () {
            this.idInicial = (this.idInicial + 1) % BancoDados.iniciais.length;
            this.carregarInicial();
            this.ouvirPalavraInicial();
        },

        carregarInicial: function () {
            var self = this;
            var elCat = document.getElementById('categoria-inicial-dica');
            var elIcone = document.getElementById('icone-inicial-visual');
            var elDica = document.getElementById('nome-inicial-dica');
            var ct = document.getElementById('opcoes-iniciais');
            var statusMic = document.getElementById('status-reconhecimento');
            if (!elDica || !ct) return;

            var item = BancoDados.iniciais[this.idInicial];
            this.itemInicialAtual = item;

            if (elCat) elCat.innerText = 'CONTEXTO: ' + item.cat;
            if (elIcone) elIcone.innerText = item.img;
            if (statusMic) statusMic.innerText = 'CLIQUE EM "INICIAR GRAVAÇÃO", FALE "' + item.nome + '" E CLIQUE PARA FINALIZAR.';
            elDica.innerText = '_ ' + item.nome.substring(1).split('').join(' ');
            ct.innerHTML = '';

            var todasLetras = BancoDados.vogais.concat(BancoDados.consoantes);
            var outras = todasLetras.filter(function (l) { return l !== item.certa; });
            var sorteadas = embaralharArray(outras).slice(0, 3);
            sorteadas.push(item.certa);
            var opcoes = embaralharArray(sorteadas);

            opcoes.forEach(function (op) {
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'btn-grande';
                b.style.backgroundColor = 'var(--cor-primaria)';
                b.innerText = op;
                b.onclick = function () {
                    if (op === item.certa) {
                        elDica.innerText = item.nome.split('').join(' ');
                        Voz.falar('Correto! A palavra ' + item.nome.toLowerCase() + ' inicia com a letra ' + item.certa + '.');
                        self.gerarConfetes();
                        GerenciadorPerfil.registrarAcaoAluno('Identificou a letra inicial da palavra ' + item.nome + '.');
                        self.idInicial = (self.idInicial + 1) % BancoDados.iniciais.length;
                        setTimeout(function () { self.carregarInicial(); }, 2500);
                    } else {
                        Voz.falar('Letra incorreta. Ouça novamente a palavra ' + item.nome.toLowerCase() + ' e observe o som inicial.');
                        GerenciadorPerfil.registrarDificuldadeAluno('Erro na identificação da letra inicial de ' + item.nome + ' (selecionou ' + op + ').');
                    }
                };
                ct.appendChild(b);
            });
        },

        carregarPalavra: function () {
            var self = this;
            var elDica = document.getElementById('dica-palavra');
            var slots = document.getElementById('slots-palavra');
            var soltas = document.getElementById('silabas-soltas');
            var statusMic = document.getElementById('status-rec-palavra');
            if (!elDica || !slots || !soltas) return;

            this.palavraAtual = BancoDados.palavrasJogo[this.idPalavra];
            this.silabasPreenchidas = 0;
            elDica.innerText = this.palavraAtual.p;
            if (statusMic) statusMic.innerText = 'CLIQUE EM "INICIAR GRAVAÇÃO", PRONUNCIE "' + this.palavraAtual.p + '" E CLIQUE PARA VERIFICAR.';
            slots.innerHTML = '';
            soltas.innerHTML = '';

            this.palavraAtual.s.forEach(function (_, i) {
                var slot = document.createElement('div');
                slot.className = 'slot-silaba';
                slot.id = 'slot-' + i;
                slots.appendChild(slot);
            });

            var embaralhadas = embaralharArray(this.palavraAtual.s);
            embaralhadas.forEach(function (silaba) {
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'btn-grande';
                b.style.backgroundColor = 'var(--cor-primaria)';
                b.innerText = silaba;
                b.onclick = function (e) {
                    var silabaCorreta = self.palavraAtual.s[self.silabasPreenchidas];
                    if (silaba === silabaCorreta) {
                        Voz.falarSilaba(silaba);
                        var sl = document.getElementById('slot-' + self.silabasPreenchidas);
                        if (sl) {
                            sl.innerText = silaba;
                            sl.style.backgroundColor = 'var(--cor-sucesso)';
                            sl.style.color = 'white';
                            sl.style.borderColor = 'var(--cor-sucesso)';
                        }
                        e.currentTarget.style.visibility = 'hidden';
                        self.silabasPreenchidas++;
                        if (self.silabasPreenchidas === self.palavraAtual.s.length) {
                            GerenciadorPerfil.registrarAcaoAluno('Estruturou corretamente a palavra ' + self.palavraAtual.p + '.');
                            setTimeout(function () {
                                Voz.falar('Muito bem! Você formou a palavra ' + self.palavraAtual.p.toLowerCase() + '.');
                                self.gerarConfetes();
                            }, 700);
                        }
                    } else {
                        Voz.falar('Sílaba fora de ordem. Observe a sequência sonora da palavra ' + self.palavraAtual.p.toLowerCase() + '.');
                        GerenciadorPerfil.registrarDificuldadeAluno('Inversão silábica na montagem da palavra ' + self.palavraAtual.p + '.');
                    }
                };
                soltas.appendChild(b);
            });
        },

        proximaPalavra: function () {
            this.idPalavra = (this.idPalavra + 1) % BancoDados.palavrasJogo.length;
            this.carregarPalavra();
        }
    };

    var LeituraPraticaApp = {
        filtroAtual: 'todos',
        filtrar: function (tipo, btn) {
            this.filtroAtual = tipo;
            if (btn) {
                var botoes = document.querySelectorAll('#aba-dia-a-dia .btn-filtro');
                for (var i = 0; i < botoes.length; i++) botoes[i].classList.remove('active');
                btn.classList.add('active');
            }
            ConstrutorInterface.renderizarVidaPratica();
        }
    };

    /* ==========================================================================
       8. PAINEL DOCENTE RCO (SEM VOZ AUTOMÁTICA E SEM EMOJIS)
       ========================================================================== */
    var GerenciadorPerfil = {
        tarefasSessao: 4,
        historicoSessao: [
            'Iniciou sessão de estudos na plataforma PhoneticFace.',
            'Realizou atividades de consciência fonológica e letramento adulto.'
        ],
        ultimoDiagnostico: 'Participando regularmente das atividades propostas na sessão.',
        fichaTextoAtual: '',
        indiceFichaAberta: 0,
        selecionadosImpressao: {},

        registrarAcaoAluno: function (acao) {
            this.tarefasSessao++;
            this.historicoSessao.unshift(acao);
            if (this.historicoSessao.length > 6) this.historicoSessao.pop();
        },

        registrarDificuldadeAluno: function (erro) {
            this.ultimoDiagnostico = erro;
            this.historicoSessao.unshift('Registro de reforço: ' + erro);
        },

        abrirModal: function () {
            Voz.parar();
            var m = document.getElementById('modal-selecao-perfil');
            if (m) m.classList.add('visivel');
        },

        solicitarSenhaProfessor: function () {
            Voz.parar();
            var m = document.getElementById('modal-selecao-perfil');
            if (m) m.classList.remove('visivel');
            var senhaModal = document.getElementById('modal-senha-professor');
            if (senhaModal) senhaModal.classList.add('visivel');
        },

        fecharSenhaProfessor: function () {
            var senhaModal = document.getElementById('modal-senha-professor');
            if (senhaModal) senhaModal.classList.remove('visivel');
            this.abrirModal();
        },

        preencherSenhaDemo: function () {
            var input = document.getElementById('input-senha-prof');
            if (input) input.value = 'prof2026';
            this.validarSenhaProfessor();
        },

        validarSenhaProfessor: function () {
            var input = document.getElementById('input-senha-prof');
            var erroBox = document.getElementById('erro-senha-prof');
            var senhaDigitada = input ? input.value.trim() : '';

            if (senhaDigitada === 'prof2026' || senhaDigitada === 'admin' || senhaDigitada === '1234') {
                if (erroBox) erroBox.style.display = 'none';
                if (input) input.value = '';
                var senhaModal = document.getElementById('modal-senha-professor');
                if (senhaModal) senhaModal.classList.remove('visivel');
                this.selecionar('professor');
            } else {
                if (erroBox) erroBox.style.display = 'block';
            }
        },

        selecionar: function (perfil) {
            Voz.parar();
            var m = document.getElementById('modal-selecao-perfil');
            if (m) m.classList.remove('visivel');

            var viewAluno = document.getElementById('view-aluno');
            var viewProf = document.getElementById('view-professor');
            var navAluno = document.getElementById('container-navegacao-aluno');
            var btnAluno = document.getElementById('btn-topo-aluno');
            var btnProf = document.getElementById('btn-topo-prof');

            if (perfil === 'professor') {
                if (viewAluno) viewAluno.style.display = 'none';
                if (navAluno) navAluno.style.display = 'none';
                if (viewProf) viewProf.style.display = 'block';
                if (btnAluno) btnAluno.classList.remove('ativo');
                if (btnProf) btnProf.classList.add('ativo');
                this.renderizarTabela('todos');
                /* Painel do professor permanece silencioso (sem voz interativa desnecessária) */
            } else {
                if (viewProf) viewProf.style.display = 'none';
                if (viewAluno) viewAluno.style.display = 'block';
                if (navAluno) navAluno.style.display = 'block';
                if (btnProf) btnProf.classList.remove('ativo');
                if (btnAluno) btnAluno.classList.add('ativo');
                var abaEscrever = document.getElementById('aba-escrever');
                if (QuadroInterativo && abaEscrever && abaEscrever.classList.contains('active')) {
                    setTimeout(function () { QuadroInterativo.redimensionar(); }, 60);
                }
            }
        },

        obterAlunosCombinados: function () {
            var nomeAtual = lerStorage('phoneticface_aluno', 'Estudante da Sessão Atual');
            var pct = Math.min(100, 45 + (this.tarefasSessao * 8));
            var alunoAoVivo = {
                id: 100,
                nome: nomeAtual + ' (Sessão Ativa)',
                idade: 32,
                perfilEtario: 'Pessoa Adulta',
                serie: 'EJA - Fase I (1º Segmento)',
                notaRCO: '8,5',
                tarefas: this.tarefasSessao + ' atividades concluídas',
                pct: pct,
                corBarra: pct >= 70 ? 'fill-verde' : 'fill-amarelo',
                categoria: 'otimo',
                relatorio: this.ultimoDiagnostico,
                orientacao: 'Acompanhamento em andamento na sessão atual',
                historico: this.historicoSessao
            };
            return [alunoAoVivo].concat(BancoDados.alunosProfessor);
        },

        adicionarNovoAluno: function () {
            var inNome = document.getElementById('novo-aluno-nome');
            var inIdade = document.getElementById('novo-aluno-idade');
            var inPerfil = document.getElementById('novo-aluno-perfil');
            var inSerie = document.getElementById('novo-aluno-serie');
            var inNota = document.getElementById('novo-aluno-nota');
            if (!inNome || !inNome.value.trim()) return;

            var idadeNum = parseInt(inIdade.value, 10) || 35;
            var notaVal = inNota && inNota.value ? String(inNota.value).replace('.', ',') : '8,0';
            var novo = {
                id: Date.now(),
                nome: inNome.value.trim(),
                idade: idadeNum,
                perfilEtario: inPerfil ? inPerfil.value : 'Pessoa Adulta',
                serie: inSerie ? inSerie.value : 'EJA - Fase I (1º Segmento)',
                notaRCO: notaVal,
                tarefas: '1 atividade registrada',
                pct: 60,
                corBarra: 'fill-verde',
                categoria: 'otimo',
                relatorio: 'Registro acadêmico inserido no sistema RCO Docente.',
                orientacao: 'Prosseguir cronograma regular de letramento',
                historico: ['Inclusão nominal e atribuição de conceito RCO realizadas pelo professor.']
            };
            BancoDados.alunosProfessor.unshift(novo);
            inNome.value = '';
            if (inIdade) inIdade.value = '';
            if (inNota) inNota.value = '';
            this.renderizarTabela('todos');
        },

        filtrarAlunos: function (categoria, btn) {
            if (btn) {
                var botoes = document.querySelectorAll('#view-professor .btn-filtro');
                for (var i = 0; i < botoes.length; i++) botoes[i].classList.remove('active');
                btn.classList.add('active');
            }
            this.renderizarTabela(categoria);
        },

        alternarSelecaoAluno: function (indice, marcado) {
            this.selecionadosImpressao[indice] = marcado;
        },

        alternarSelecaoTodos: function (marcado) {
            var todos = this.obterAlunosCombinados();
            for (var i = 0; i < todos.length; i++) {
                this.selecionadosImpressao[i] = marcado;
            }
            var checks = document.querySelectorAll('.check-impressao-aluno');
            for (var j = 0; j < checks.length; j++) {
                checks[j].checked = marcado;
            }
        },

        renderizarTabela: function (categoria) {
            var tbody = document.getElementById('tabela-alunos-body');
            if (!tbody) return;
            tbody.innerHTML = '';

            var todos = this.obterAlunosCombinados();
            var kpiTotal = document.getElementById('kpi-total-alunos');
            if (kpiTotal) kpiTotal.innerText = String(todos.length);

            var self = this;
            todos.forEach(function (aluno, idx) {
                if (categoria && categoria !== 'todos' && aluno.categoria !== categoria) return;
                var marcado = !!self.selecionadosImpressao[idx];
                var tr = document.createElement('tr');
                tr.innerHTML =
                    '<td style="text-align:center;"><input type="checkbox" class="check-impressao-aluno" ' + (marcado ? 'checked' : '') + ' onchange="GerenciadorPerfil.alternarSelecaoAluno(' + idx + ', this.checked)"></td>' +
                    '<td><strong>' + aluno.nome + '</strong></td>' +
                    '<td>' + aluno.idade + ' anos (' + aluno.perfilEtario + ')</td>' +
                    '<td>' + aluno.serie + '</td>' +
                    '<td><strong>' + (aluno.notaRCO || '8,0') + '</strong></td>' +
                    '<td><div class="barra-progresso-bg"><div class="barra-progresso-fill ' + aluno.corBarra + '" style="width:' + aluno.pct + '%;">' + aluno.pct + '%</div></div></td>' +
                    '<td>' + aluno.relatorio + '</td>' +
                    '<td><div class="acoes-linha-prof">' +
                    '<button type="button" class="btn-ver-ficha" onclick="GerenciadorPerfil.abrirFicha(' + idx + ')">PRONTUÁRIO</button>' +
                    '<button type="button" class="btn-imprimir-linha" onclick="GerenciadorPerfil.imprimirAlunoUnico(' + idx + ')">IMPRIMIR</button>' +
                    '</div></td>';
                tbody.appendChild(tr);
            });
        },

        abrirFicha: function (indice) {
            var aluno = this.obterAlunosCombinados()[indice];
            if (!aluno) return;
            this.indiceFichaAberta = indice;

            var elNome = document.getElementById('ficha-nome-aluno');
            var elResumo = document.getElementById('ficha-resumo-aluno');
            var elCorpo = document.getElementById('ficha-corpo-detalhes');
            var modalFicha = document.getElementById('modal-ficha-aluno');

            if (elNome) elNome.innerText = aluno.nome;
            if (elResumo) elResumo.innerText = 'Idade: ' + aluno.idade + ' anos (' + aluno.perfilEtario + ') | ' + aluno.serie + ' | Nota RCO: ' + (aluno.notaRCO || '8,0');

            var listaHtml = aluno.historico.map(function (h) { return '<li style="margin-bottom:6px;">' + h + '</li>'; }).join('');
            if (elCorpo) {
                elCorpo.innerHTML =
                    '<div class="ficha-item"><h4>Dados Cadastrais e Acadêmicos (RCO)</h4><p>Idade: ' + aluno.idade + ' anos — Classificação: ' + aluno.perfilEtario + '<br>Série/Etapa: ' + aluno.serie + '<br>Nota/Conceito RCO: ' + (aluno.notaRCO || '8,0') + ' — Produção: ' + aluno.tarefas + '</p></div>' +
                    '<div class="ficha-item"><h4>Parecer Técnico e Diagnóstico Pedagógico</h4><p>' + aluno.relatorio + '</p></div>' +
                    '<div class="ficha-item" style="border-left-color: var(--cor-sucesso);"><h4>Histórico de Atividades</h4><ul style="padding-left:20px;margin-top:6px;">' + listaHtml + '</ul></div>' +
                    '<div class="ficha-item" style="border-left-color: var(--cor-roxo);"><h4>Encaminhamento Docente</h4><p>' + aluno.orientacao + '</p></div>';
            }

            this.fichaTextoAtual = 'Prontuário de ' + aluno.nome + ', ' + aluno.idade + ' anos, ' + aluno.perfilEtario + ', etapa ' + aluno.serie + '. Nota RCO: ' + (aluno.notaRCO || '8,0') + '. Parecer: ' + aluno.relatorio;
            if (modalFicha) modalFicha.classList.add('visivel');
        },

        ouvirFichaAtual: function () {
            if (this.fichaTextoAtual) Voz.falar(this.fichaTextoAtual);
        },

        fecharFicha: function () {
            Voz.parar();
            var modalFicha = document.getElementById('modal-ficha-aluno');
            if (modalFicha) modalFicha.classList.remove('visivel');
        },

        montarFolhaHtmlAluno: function (aluno, dataEmissao) {
            var itensHist = aluno.historico.map(function (h) { return '<li>' + h + '</li>'; }).join('');
            return (
                '<section class="folha-relatorio-aluno">' +
                '<div class="cabecalho-folha-impressao">' +
                '<h2 style="font-size:1.35rem; margin-bottom:4px;">COLÉGIO ESTADUAL PROFESSORA IVONE SOARES CASTANHARO</h2>' +
                '<p style="font-size:0.9rem; font-weight:bold;">PHONETICFACE — FERRAMENTA TECNOLÓGICA DE APOIO DOCENTE NO PROCESSO DE ALFABETIZAÇÃO</p>' +
                '<p style="font-size:0.8rem;">RELATÓRIO INDIVIDUAL DE ACOMPANHAMENTO ACADÊMICO (RCO / EJA) — EMISSÃO: ' + dataEmissao + '</p>' +
                '</div>' +
                '<div class="grade-dados-impressao">' +
                '<div><strong>ESTUDANTE:</strong> ' + aluno.nome + '</div>' +
                '<div><strong>IDADE E PERFIL:</strong> ' + aluno.idade + ' anos (' + aluno.perfilEtario + ')</div>' +
                '<div><strong>SÉRIE / ETAPA:</strong> ' + aluno.serie + '</div>' +
                '<div><strong>CONCEITO RCO / EVOLUÇÃO:</strong> Nota ' + (aluno.notaRCO || '8,0') + ' (' + aluno.pct + '% de domínio)</div>' +
                '</div>' +
                '<div class="secao-folha-impressao">' +
                '<h3 style="font-size:0.95rem; margin-bottom:6px;">1. PARECER TÉCNICO E DIAGNÓSTICO PEDAGÓGICO</h3>' +
                '<p>' + aluno.relatorio + '</p>' +
                '</div>' +
                '<div class="secao-folha-impressao">' +
                '<h3 style="font-size:0.95rem; margin-bottom:6px;">2. REGISTRO DE ATIVIDADES CONCLUÍDAS</h3>' +
                '<ul style="padding-left:18px;">' + itensHist + '</ul>' +
                '</div>' +
                '<div class="secao-folha-impressao">' +
                '<h3 style="font-size:0.95rem; margin-bottom:6px;">3. ENCAMINHAMENTO DOCENTE</h3>' +
                '<p>' + (aluno.orientacao || 'Prosseguir acompanhamento nas unidades seguintes') + '</p>' +
                '</div>' +
                '<div class="assinaturas-impressao">' +
                '<div class="linha-assinatura">Docente Responsável / Monitoria</div>' +
                '<div class="linha-assinatura">Coordenação Pedagógica / Direção</div>' +
                '</div>' +
                '</section>'
            );
        },

        executarImpressaoFolhas: function (listaParaImprimir) {
            var area = document.getElementById('area-impressao-relatorios');
            if (!area || listaParaImprimir.length === 0) return;
            var hoje = new Date().toLocaleDateString('pt-BR');
            var self = this;
            area.innerHTML = listaParaImprimir.map(function (aluno) {
                return self.montarFolhaHtmlAluno(aluno, hoje);
            }).join('');
            window.print();
        },

        imprimirAlunoUnico: function (indice) {
            var aluno = this.obterAlunosCombinados()[indice];
            if (!aluno) return;
            this.executarImpressaoFolhas([aluno]);
        },

        imprimirSelecionados: function () {
            var todos = this.obterAlunosCombinados();
            var self = this;
            var selecionados = todos.filter(function (_, idx) {
                return !!self.selecionadosImpressao[idx];
            });
            if (selecionados.length === 0) {
                alert('Marque a caixa de seleção à esquerda dos estudantes que deseja imprimir (1 estudante por folha).');
                return;
            }
            this.executarImpressaoFolhas(selecionados);
        },

        imprimirTodosIndividual: function () {
            var todos = this.obterAlunosCombinados();
            this.executarImpressaoFolhas(todos);
        },

        exportarExcelCSV: function () {
            var todos = this.obterAlunosCombinados();
            var csv = 'Estudante;Idade;Perfil Etario;Serie;Nota RCO;Atividades;Dominio (%)\n';
            todos.forEach(function (a) {
                csv += '"' + a.nome + '";' + a.idade + ';"' + a.perfilEtario + '";"' + a.serie + '";"' + (a.notaRCO || '8,0') + '";"' + a.tarefas + '";' + a.pct + '\n';
            });
            var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'relatorio_rco_eja_phoneticface.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    /* ==========================================================================
       9. RENDERIZAÇÃO DOS MÓDULOS DE INTERFACE
       ========================================================================== */
    var ConstrutorInterface = {
        renderizarAlfabeto: function () {
            var container = document.getElementById('container-grid-alfabeto');
            if (!container) return;
            container.innerHTML = '';
            BancoDados.alfabeto.forEach(function (item) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-letra';
                btn.innerHTML = '<span>' + item.letra + '</span><span class="sub-fonema">' + item.palavra + '</span>';
                btn.onclick = function () { InterfaceModal.mostrarVideo(item); };
                container.appendChild(btn);
            });
        },

        renderizarVogaisConsoantes: function () {
            var v = document.getElementById('box-vogais');
            var c = document.getElementById('box-consoantes');
            if (!v || !c) return;
            v.innerHTML = '';
            c.innerHTML = '';
            BancoDados.vogais.forEach(function (l) {
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'btn-grande';
                b.style.backgroundColor = 'var(--cor-destaque)';
                b.innerText = l;
                b.onclick = function () { Voz.falarVogal(l); };
                v.appendChild(b);
            });
            BancoDados.consoantes.forEach(function (l) {
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'btn-letra';
                b.style.width = '80px';
                b.innerText = l;
                b.onclick = function () { Voz.falarConsoante(l); };
                c.appendChild(b);
            });
        },

        renderizarFamilias: function () {
            var bts = document.getElementById('botoes-familias');
            var res = document.getElementById('resultado-familia');
            var titulo = document.getElementById('titulo-familia-atual');
            if (!bts || !res || !titulo) return;

            bts.innerHTML = '';
            var mostrarUniao = function (consoante, falarAutomatico) {
                titulo.innerText = 'FAMÍLIA SILÁBICA DA CONSOANTE ' + consoante + ':';
                res.innerHTML = '';
                var sonsDaFamilia = [];
                BancoDados.vogais.forEach(function (vogal) {
                    var silaba = consoante + vogal;
                    var somFonetico = MapaFoneticoSilabas[silaba] || silaba.toLowerCase();
                    sonsDaFamilia.push(somFonetico);

                    var btnF = document.createElement('button');
                    btnF.type = 'button';
                    btnF.className = 'btn-grande';
                    btnF.style.backgroundColor = 'var(--cor-sucesso)';
                    btnF.innerText = silaba;
                    btnF.onclick = function () { Voz.falarSilaba(silaba); };
                    res.appendChild(btnF);
                });
                if (falarAutomatico) {
                    Voz.falar(sonsDaFamilia.join(', '));
                }
            };
            BancoDados.consoantes.forEach(function (consoante) {
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'btn-letra';
                b.style.width = '65px';
                b.innerText = consoante;
                b.onclick = function () { mostrarUniao(consoante, true); };
                bts.appendChild(b);
            });
            mostrarUniao('C', false);
        },

        renderizarSilabas: function () {
            var container = document.getElementById('container-silabas');
            if (!container) return;
            container.innerHTML = '';
            BancoDados.silabas.forEach(function (item) {
                var silaba = item.consoante + item.vogal;
                var somSil = MapaFoneticoSilabas[silaba] || silaba.toLowerCase();
                var cartao = document.createElement('div');
                cartao.className = 'cartao linha-silaba';
                cartao.innerHTML =
                    '<div class="bloco">' + item.consoante + '</div>' +
                    '<div style="color:var(--cor-primaria);font-size:2rem;">+</div>' +
                    '<div class="bloco">' + item.vogal + '</div>' +
                    '<div style="color:var(--cor-primaria);font-size:2rem;">=</div>' +
                    '<button type="button" class="bloco bloco-resultado" onclick="Voz.falar(\'' + somSil + ', de ' + item.palavra.toLowerCase() + '\')">' +
                    '<span>' + silaba + ' DE ' + item.palavra + '</span></button>';
                container.appendChild(cartao);
            });
        },

        renderizarBotoesDesenho: function () {
            var container = document.getElementById('botoes-desenho');
            if (!container) return;
            container.innerHTML = '';
            BancoDados.sinaisDesenho.forEach(function (sinal, idx) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-ferramenta' + (idx === 0 ? ' letra-ativa' : '');
                btn.innerText = sinal;
                btn.onclick = function (e) { if (QuadroInterativo) QuadroInterativo.definirGuia(sinal, e.currentTarget); };
                container.appendChild(btn);
            });
        },

        renderizarCores: function () {
            var ct = document.getElementById('container-cores');
            if (!ct) return;
            ct.innerHTML = '';
            BancoDados.cores.forEach(function (c) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-letra';
                btn.innerText = c.n;
                btn.style.backgroundColor = c.c;
                btn.style.color = c.txt;
                btn.style.fontSize = '1.35rem';
                btn.style.border = '2px solid rgba(0,0,0,0.15)';
                btn.onclick = function () { Voz.falar(c.n.toLowerCase()); };
                ct.appendChild(btn);
            });
        },

        renderizarVidaPratica: function () {
            var container = document.getElementById('container-dia-a-dia');
            if (!container) return;
            container.innerHTML = '';
            
            var filtro = LeituraPraticaApp.filtroAtual || 'todos';
            var filtrados = BancoDados.vidaPratica.filter(function (item) {
                if (filtro === 'trabalho') return item.cat === 'trabalho';
                if (filtro === 'geral') return item.cat !== 'trabalho';
                return true;
            });

            filtrados.forEach(function (item) {
                var card = document.createElement('div');
                card.className = 'card-interativo';
                card.onclick = function () { Voz.falar(item.textoFala); };
                card.innerHTML =
                    '<span class="selo-categoria-card">' + (item.cat === 'trabalho' ? 'SEGURANÇA E TRABALHO' : 'SAÚDE E COTIDIANO') + '</span>' +
                    '<span class="icone-card">' + item.icone + '</span>' +
                    '<h2 style="font-size:1.45rem; color:var(--cor-primaria); margin-bottom:8px;">' + item.titulo + '</h2>' +
                    '<p style="font-size:0.92rem; color:var(--cor-texto-secundario); font-weight:600;">' + item.textoFala + '</p>';
                container.appendChild(card);
            });
        },

        renderizarAnimais: function () {
            var container = document.getElementById('container-animais');
            if (!container) return;
            container.innerHTML = '';
            BancoDados.animais.forEach(function (animal) {
                var card = document.createElement('div');
                card.className = 'card-interativo';
                card.onclick = function () { Voz.falar(animal.nome.toLowerCase()); };
                card.innerHTML =
                    '<span class="selo-categoria-card">' + animal.cat + '</span>' +
                    '<span class="icone-card">' + animal.icone + '</span>' +
                    '<h2 style="font-size:1.75rem; color:var(--cor-primaria);">' + animal.nome + '</h2>' +
                    '<p style="font-size:0.8rem; color:var(--cor-texto-secundario); margin-top:6px; font-weight:700;">TOQUE PARA OUVIR A PRONÚNCIA</p>';
                container.appendChild(card);
            });
        },

        renderizarNumeros: function () {
            var container = document.getElementById('container-numeros');
            if (!container) return;
            container.innerHTML = '';
            for (var i = 1; i <= 100; i++) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-letra';
                btn.style.height = '80px'; 
                btn.style.fontSize = '2.1rem';
                btn.innerText = i;
                btn.onclick = (function (num) {
                    return function () { Voz.falar(String(num)); };
                })(i);
                container.appendChild(btn);
            }
        },

        configurarNavegacaoAbas: function () {
            var botoes = document.querySelectorAll('.btn-tab');
            var conteudos = document.querySelectorAll('.aba-conteudo');
            var menu = document.getElementById('menu-principal');

            botoes.forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    Voz.parar();
                    if (ReconhecimentoVoz.gravando) ReconhecimentoVoz.pararEVerificar();
                    botoes.forEach(function (b) {
                        b.classList.remove('active');
                        b.setAttribute('aria-selected', 'false');
                    });
                    e.currentTarget.classList.add('active');
                    e.currentTarget.setAttribute('aria-selected', 'true');

                    var alvo = e.currentTarget.getAttribute('data-target');
                    conteudos.forEach(function (c) {
                        c.classList.remove('active');
                        if (c.id === alvo) {
                            c.classList.add('active');
                            if (alvo === 'aba-escrever' && QuadroInterativo) {
                                setTimeout(function () { QuadroInterativo.redimensionar(); }, 50);
                            }
                        }
                    });
                    if (window.innerWidth <= 768 && menu) {
                        menu.classList.remove('aberto');
                    }
                });
            });
        }
    };

    function configurarFechamentoModal() {
        var overlayVideo = document.getElementById('modal-letras');
        if (!overlayVideo) return;
        overlayVideo.addEventListener('click', function (e) {
            if (e.target === overlayVideo) InterfaceModal.fechar();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') InterfaceModal.fechar();
        });
    }

    function inicializarTudo() {
        Voz.inicializarVozes();
        ConstrutorInterface.renderizarAlfabeto();
        ConstrutorInterface.renderizarVogaisConsoantes();
        ConstrutorInterface.renderizarFamilias();
        ConstrutorInterface.renderizarSilabas();
        ConstrutorInterface.renderizarCores();
        ConstrutorInterface.renderizarVidaPratica();
        ConstrutorInterface.renderizarAnimais();
        ConstrutorInterface.renderizarNumeros();
        ConstrutorInterface.configurarNavegacaoAbas();

        InteracaoApp.carregarInicial();
        InteracaoApp.carregarPalavra();
        InteracaoApp.carregarNomeSalvo();
        ConstrutorSilabas.inicializar();

        QuadroInterativo = new CanvasCaligrafia('canvas-caligrafia', 'container-canvas', 'guia-fundo');
        ConstrutorInterface.renderizarBotoesDesenho();
        QuadroInterativo.redimensionar();

        configurarFechamentoModal();
        GerenciadorPerfil.renderizarTabela('todos');
        GerenciadorCookies.verificar();
    }

    window.toggleMenuMobile = toggleMenuMobile;
    window.Voz = Voz;
    window.AppConfig = AppConfig;
    window.InterfaceModal = InterfaceModal;
    window.InteracaoApp = InteracaoApp;
    window.GerenciadorPerfil = GerenciadorPerfil;
    window.ConstrutorSilabas = ConstrutorSilabas;
    window.GerenciadorCookies = GerenciadorCookies;
    window.LeituraPraticaApp = LeituraPraticaApp;
    window.ReconhecimentoVoz = ReconhecimentoVoz;
    window.ValidadorDigitacao = ValidadorDigitacao;
    window.LeitorCameraOCR = LeitorCameraOCR;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarTudo);
    } else {
        inicializarTudo();
    }
})();
