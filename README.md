# QR code por vendedor · Empréstimo com Garantia de Veículo · Pesados (BV)

Pedido da **NEOBAND**, novembro de 2026: 23 QR codes, um por vendedor, para o banner do BV.
Quem escaneia é o **consumidor final**, e o código abre direto a conversa no WhatsApp daquele vendedor.

Cada QR aponta para uma página nossa que carimba a leitura e manda para o WhatsApp na mesma hora.
É o que permite o **painel por vendedor**: QR apontando direto para `wa.me` não deixa rastro nenhum,
nem para nós nem para a NEOBAND.

## Links

- **QR de cada vendedor:** `https://projetos.75lab.com.br/bv-pesados/<codigo>/` (v01 a v23)
- **Painel do vendedor:** `https://projetos.75lab.com.br/bv-pesados/painel/?v=<codigo>`
- **Painel da campanha inteira:** https://projetos.75lab.com.br/bv-pesados/painel/

`qr/links.csv` traz nome, telefone, link do QR e link do painel de cada um, para mandar para o cliente.

## Arquivos do QR para a arte

Em `qr/`, dois por vendedor, no nome `<codigo>-<nome>`:

- `.svg` — vetor, é o que vai para a arte do banner (escala sem perder nada)
- `.png` — 2048 × 2048 px, para quem não abre SVG

Fundo branco e código em #0E1110, com margem de 2 módulos. Quem aplicar na arte precisa manter uma
**área branca de respiro em volta** (4 módulos é o padrão) e não colocar o código sobre fundo escuro
nem sobre foto: é o que faz a câmera reconhecer de longe.

## Como funciona

1. O consumidor aponta a câmera para o QR do banner.
2. Abre `/<codigo>/`, que registra a **leitura**, mostra por um instante o nome do vendedor e vai para o WhatsApp.
3. Ao sair para o WhatsApp registra a **ida para a conversa**. A mensagem já vai escrita:
   _"Olá, {primeiro}! Vi o banner do Empréstimo com Garantia de Veículo do BV e quero saber mais."_
4. Se o aparelho não abrir sozinho, fica o botão "Se não abrir, toque aqui".

Nada de quem escaneou é guardado: sem nome, sem telefone, sem localização. Só o código do vendedor,
se foi leitura ou ida para o WhatsApp, o sistema do aparelho e a data.

## Painel

Um link por vendedor (`?v=v07`), para ele acompanhar só o que é dele: leituras do QR, quantos
seguiram para a conversa, a proporção entre as duas coisas e os últimos 14 dias. Sem o parâmetro,
o painel mostra a campanha inteira e o ranking por vendedor, que é a visão da NEOBAND e da 75 LAB.

## Refazer ou mexer na lista

A lista fica em `vendedores.json` (código, nome e telefone só com dígitos, no formato DDD + número).
Depois de editar:

```bash
node tools/gerar.mjs      # refaz as 23 páginas, os SVG, os PNG e o links.csv
git add -A && git commit -m "..." && git push
```

Trocar o telefone de alguém **não muda o QR**: o código aponta para `/<codigo>/`, não para o número.
Por isso o mesmo banner continua valendo quando um vendedor troca de celular ou sai da equipe.

## Onde ficam os números

Firestore do projeto `instalacoes-75lab`, coleção `qrv_eventos`: um documento por evento, com
`codigo`, `tipo` (`leitura` ou `whatsapp`), `so` e `dia`. As regras estão no repositório
[`caiquebecker75/produtos`](https://github.com/caiquebecker75/produtos) (`firestore.rules`): qualquer
um cria (quem escaneia não tem login) e qualquer um com o link do painel soma; apagar é só da equipe
75 LAB. Contamos documentos em vez de manter um contador porque `batchWrite`, que é o que faria o
`increment`, não aceita chamada sem login.
