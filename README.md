# Harvard Veritas — O arquivo vivo

Uma experiência 3D interativa de Guilherme Galvão, inspirada na curiosidade e na circulação do conhecimento.

O percurso conecta a chegada ao campus, um ateliê de leitura e arquivo em atividade e um álbum com seis volumes exploráveis. A cena reúne recebimento, scanner de caixas, transporte, armazenamento e leitores, com modelos licenciados e uma direção visual em marfim, navy, crimson e latão.

## Abrir o site

[Explorar Harvard Veritas](https://gpereiradeveloper-rgb.github.io/Harvard-Project-site-with-3d-Animation/)

Use a rolagem ou as etapas na barra inferior. No ateliê, **Ver o scanner 3D** aproxima a operação do scanner. Os controles permitem pausar os movimentos e escolher a qualidade.

## Executar localmente

Requer Node.js 22.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
```

A publicação pelo GitHub Pages usa a branch `gh-pages`, com o site compilado. A branch `main` contém o código-fonte e os ativos licenciados. Para reproduzir seu endereço localmente:

```sh
HARVARD_BASE_PATH=/Harvard-Project-site-with-3d-Animation/ npm run build
HARVARD_BASE_PATH=/Harvard-Project-site-with-3d-Animation/ npm run preview
```

## Design e autoria

[Direção editorial no Figma](https://www.figma.com/design/5JLgqQ96GqZeNzydUQIA0K?node-id=3-2).

Referências de composição e acabamento: Vedant Hegde (Sendoso e OrderGrid) e Alex Bender / Fancy. Os modelos e materiais proprietários desses autores não estão incluídos. Os créditos dos ativos de terceiros e suas licenças acompanham os arquivos em `public/assets/`.

Experiência independente, sem vínculo institucional com Harvard University. O ateliê é uma interpretação artística, não uma digitalização de um interior da universidade. O mapa Google de demonstração permanece exclusivo do desenvolvimento local; a publicação oferece a alternativa visual do campus sem incluir a chave privada.

O site publicado é aberto à visitação. Visitantes não recebem permissão para alterar este repositório ou a publicação.
