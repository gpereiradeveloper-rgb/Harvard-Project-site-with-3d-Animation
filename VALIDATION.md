# Validação — Harvard Veritas

Atualização: 14 de novembro de 2026. Esta nota descreve a versão local revisada, sem confundir testes automatizados com aprovação visual ou publicação.

## Verificações concluídas

- `npm test`: 14 testes passaram. A suíte inclui fluxo de caixas, leitura do scanner, continuidade e reprodução do estado ao avançar/voltar o relógio, espaços de circulação, suporte dos livros e proporções dos personagens. Quatro testes de busca de vídeo são históricos e não certificam o mundo 3D atual.
- `npm run build`: build de produção passou. A raiz também confirmou o build com base de subdiretório, necessário à hospedagem no GitHub Pages.
- Proporções: a otimização de culling inicialmente ampliou a caixa usada para normalizar os modelos, reduzindo seus corpos enquanto os alvos de movimento mantinham a escala anterior. A correção mantém a caixa física original e reserva o envelope ampliado somente à esfera de descarte de renderização. Dois testes com os GLBs reais verificam limites invariantes, altura real de 1,72 m e proporções originais em quatro escalas de ator.
- Scanner: botão “Ver o scanner 3D” aproxima a câmera do recebimento; “Voltar ao ateliê” e Escape retornam à composição geral. Cinco caixas recebidas passam pelo túnel e são lidas uma vez. As oito identidades de caixas e os dois paletes persistem até o armazenamento final, sem duplicação de carga por renderizador.
- Logística: varredura em passos de 10 ms verifica funcionários, corpo da empilhadeira importada, rack, esteira, borda da plataforma e cruzamento do robô com o transportador/carrinho. A distância mínima observada entre os cinco funcionários em pé foi aproximadamente 0,422 m; motorista e carregador mantiveram aproximadamente 0,556 m. A operação termina com ambos os paletes no rack superior e os equipamentos sem movimento residual.
- Estudantes: varredura de 3.360 s em passos de 50 ms registrou separação mínima entre pessoas de 0,42216 m, entre robôs e pessoas de 0,51624 m e distância do centro do torso à área da mesa de 0,220 m. Erro de suporte dos livros ficou abaixo de precisão numérica; saltos de posição nas transições amostradas ficaram abaixo de 0,003 mm para intervalo de 2 microssegundos.
- Mochilas: modelo escaneado, lugar próprio ao lado da cadeira, sem arrasto ao movimentar o estudante. Auditoria dos dois esqueletos em três escalas registrou folga lateral da cadeira de aproximadamente 9,18 cm e erro de posição de estacionamento inferior a 7e-15 m.
- Navegação: atualização do tamanho da janela preserva o progresso da jornada. Cenas pesadas têm carregamento e montagem adiados conforme a proximidade de sua etapa. O padrão de uma nova sessão é qualidade Automática; a escolha manual de Alta/Cinema permanece sob controle do visitante e não é rebaixada durante a rolagem.

## Revisão final de movimento — 14/11/2026

- Operação determinística de **276 s**, com segunda saída de trabalho da empilhadeira aos **232 s** e armazenamento final dos dois paletes. As cinco caixas recebidas são lidas uma única vez antes da transferência ao palete; as três caixas iniciais já constituem estoque conferido. Oito identidades de carga permanecem únicas.
- A paleteira espera afastada, aproxima-se após a descarga manual, volta a se afastar durante a preparação do segundo palete e retorna após o último depósito manual. Os trajetos de espera/coleta do recebedor contornam o robô. Nova regressão com amostragem de 10 ms mede folga mínima de **0,2646 m** entre centro do recebedor e contorno importado da paleteira e separação mínima de **0,5434 m** entre centros do recebedor e robô.
- Os alvos de coleta futura são calculados na pose de chegada prevista do transportador, evitando perseguir seu deslocamento ainda na rampa. Contagem, apoios e estado permanecem reproduzíveis ao avançar ou retroceder o relógio.
- Odômetro contínuo e com sinal mantém a rotação das rodas nas marchas à frente e à ré, sem zerar a cada trecho. Testes adicionais verificam a continuidade entre amostras e proíbem liberar uma caixa recebida ao palete antes de sua leitura.
- O relógio usa o tempo real de cada quadro ativo, inclusive abaixo de 20 FPS; pausa, inatividade e retorno de aba oculta não acumulam avanço de operação. Apenas intervalos excepcionalmente longos são limitados a 1 s.
- Túnel com esteira e estrutura originais Kenney/CC0. Uma adaptação em tempo de execução abre somente o painel de inspeção lateral, mantendo os arquivos originais, a cobertura e os pórticos. Janela transparente, contorno óptico vermelho nas duas bocas e pequena luz interna mostram a leitura; luz e contorno acendem apenas com leitura ativa. O envelope de dimensões acompanha a caixa durante sua passagem. A avaliação visual da entrega cabe à revisão de navegador registrada pela raiz.

## Limites da evidência

A animação usa trajetórias cinemáticas e tarefas coordenadas por um relógio compartilhado, não uma simulação geral de corpos rígidos. As auditorias usam esqueletos, planos de apoio e envelopes geométricos; não certificam ausência de interseção entre todos os triângulos de dedos, roupas, mochilas ou cenografia em todo enquadramento. Desempenho varia com equipamento, resolução e qualidade selecionada; não se promete taxa de quadros constante.

A direção visual se inspira em Vedant Hegde/Sendoso e Alex Bender/FANCY. Os modelos licenciados e as cenas autorais não são os arquivos proprietários dessas obras, nem equivalência comprovada de materiais, medidas, técnica de produção ou ultrarrealismo. Não se declara resolução 8K nativa ou DLSS.

## Publicação e retomada

Situação de publicação registrada em 13/11, preservada como histórico: prévia local `http://127.0.0.1:5174/`; o acesso GitHub havia retornado 403 e o projeto legado de Sites, 404. A execução de 14/11 retomou a entrega. Substituir este estado pelo resultado e pelo endereço efetivamente verificados pela raiz antes de declarar publicação concluída.

Repositório indicado: https://github.com/gpereiradeveloper-rgb/Harvard-site-with-3d-animation

A demonstração de mapa continua restrita ao desenvolvimento. A configuração local foi excluída do pacote de entrega e não deve ser lida, impressa, copiada ao GitHub ou publicada. O pacote conserva as licenças e créditos dos ativos.
