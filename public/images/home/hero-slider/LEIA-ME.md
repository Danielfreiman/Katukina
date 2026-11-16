# Hero completo — três banners rotativos

O hero mantém título, descrição, botão e links atuais em HTML. **Criar apenas a imagem de fundo**, sem repetir textos ou botões na arte.

Formato obrigatório: **WebP**, perfil sRGB. Cada banner tem duas composições:

| Banner | Desktop — 2400 × 900 px | Celular — 1080 × 1350 px |
| --- | --- | --- |
| 1 | `desktop/banner-01.webp` | `mobile/banner-01.webp` |
| 2 | `desktop/banner-02.webp` | `mobile/banner-02.webp` |
| 3 | `desktop/banner-03.webp` | `mobile/banner-03.webp` |

Pasta base: `public/images/home/hero-slider/`.

## Composição

- Desktop: colocar o assunto principal na metade direita, mantendo a metade esquerda calma para o texto existente. Proporção 8:3.
- Celular: fazer uma composição própria, com o assunto principal na metade inferior e espaço para o texto na parte superior. Proporção 4:5; usada até 640 px de largura.
- O fundo preenche toda a largura e altura do hero, com recorte central proporcional (`cover`). Reservar margem de segurança de 10% nas bordas e evitar detalhes essenciais no centro inferior, onde ficam os controles.
- O hero não aplica overlay, conforme pedido posterior de Danilo. Preparar a própria imagem com áreas claras e calmas atrás dos textos existentes: esquerda no desktop e parte superior no celular.
- Preferir até 600 KB por arquivo desktop e 350 KB por arquivo celular, sem degradar a imagem. Não colocar arquivos de trabalho, PSD ou AI nesta pasta pública.

## Funcionamento

- Ordem: 01 → 02 → 03; troca automática a cada 6,5 segundos.
- Setas, indicadores, pausa/reprodução e gesto horizontal no celular. O foco por teclado e a navegação manual pausam a reprodução; preferência por movimento reduzido desativa a rotação automática.
- Apenas banners com pelo menos um arquivo disponível entram na rotação. Com um banner, ele fica fixo; sem arquivos, o texto atual aparece sobre o fundo liso da marca, sem imagem quebrada nem controles vazios.
- Fornecer as duas versões de cada banner. Se uma faltar, a disponível é usada como alternativa com recorte.
- No desenvolvimento local, salvar/substituir os WebP nesta pasta: o servidor detecta a gravação e avisa imediatamente o navegador, sem recarregar a página. Há uma espera de estabilização de 120 ms para agrupar eventos de gravação; a imagem aparece após carregar. A consulta a cada 2 segundos permanece apenas como recuperação se o aviso em tempo real falhar. A URL muda conforme a versão do arquivo para evitar cache antigo. No site publicado, incluir os arquivos na próxima publicação e recarregar.
- As imagens do hero antigo e as pastas `hero-01`, `hero-02`, `hero-03` não são usadas nesta integração. Não sobrescrevê-las.
