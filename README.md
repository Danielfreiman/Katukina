# Katukina — MVP

Releitura em inglês do site Katukina, com Next.js App Router, React e TypeScript. Mantém preto, creme, cobre/dourado e o grafismo do site original. Home responsiva, catálogo ilustrativo, busca, filtros, fichas estáticas, FAQ e sacola persistente no navegador.

## Executar

```sh
npm install
npm run dev
```

Abra http://localhost:3000. Para produção: `npm run build` e `npm start`. Verificação: `npm run typecheck` e `npm test` (instalar Chromium com `npx playwright install chromium`).

## Estrutura

- `app/`: home, layout, páginas de produto, sitemap, robots e página 404.
- `components/storefront.tsx`: interface e interações da loja.
- `lib/content.ts`: catálogo demonstrativo, perguntas e configuração de URL.
- `public/images/`: imagens locais.
- `tests/`: testes de interação, mobile e descoberta.

## SEO, AEO e GEO

HTML pré-renderizado, idioma en-GB, títulos e descrições, canonical por página, Open Graph, Twitter Card, sitemap e robots. JSON-LD WebSite, Organization (identificada como conceito), FAQPage e BreadcrumbList. As respostas estruturadas correspondem às perguntas visíveis. Conteúdo direto, headings semânticos e fonte original vinculada ajudam a interpretação por mecanismos de busca e respostas. Não há promessa de posicionamento, citações por IA ou resultados enriquecidos.

O protótipo tem `noindex` por padrão para não indexar preços e produtos fictícios. Configure `NEXT_PUBLIC_SITE_URL` com o domínio real e só ative `SITE_INDEXABLE=true` após substituir os dados demonstrativos. Consulte `.env.example`. Não adicionamos ofertas/Product com preços fictícios ao schema. O sitemap contém apenas rotas implementadas.

## Limites do MVP

Não há checkout, pagamento, contas, estoque, backend ou envio de pedidos. A sacola fica apenas no localStorage. O catálogo usa nomes e fotografias reais de incenso Benzoe, canudo de bambu e óleo de Palo Santo do site original. Preços em EUR são ilustrativos; não há sincronização de estoque. Antes de publicar: substituir catálogo e imagens, confirmar direitos dos ativos, procedência, políticas e informações comerciais. A configuração atual identifica o projeto como demonstração; ajustar a entidade Organization para a organização verificada na versão final.

## Referências e ativos

- Referência visual e conteúdo institucional: https://katukina.com/
- Grafismo reutilizado no protótipo: https://katukina.com/upload/images/Katukina/Katukina-BG-all-border.jpg
- Fotografia ilustrativa do hero: Unsplash, ID `photo-1441974231531-c6227db76b6e`. Não representa uma comunidade específica da marca. As três fotografias de produtos são do catálogo original (fontes abaixo).
- Fontes: Cormorant Garamond e Inter hospedadas localmente via Fontsource.
- Metadata API: https://nextjs.org/docs/app/api-reference/file-conventions/metadata

Fotografias de catálogo originais: https://katukina.com/assets/images/items/1871.jpg, https://katukina.com/assets/images/items/1990.jpg e https://katukina.com/assets/images/items/1571.jpg. A foto de floresta do hero permanece ilustrativa (Unsplash).
