# Site Kaio Amorim | Fisioterapeuta

Site estático (HTML, CSS e JavaScript), sem etapa de build.

## Estrutura

```
index.html            página
css/style.css         estilos
js/app.js             animações e interações
js/vendor/            GSAP, ScrollTrigger, three.js e Motion (cópias locais)
assets/img/           fotos, logo, favicon e imagem de compartilhamento
assets/video/         vídeos do atendimento e do depoimento
vercel.json           cache dos arquivos na Vercel
```

## Publicar no GitHub + Vercel

1. Crie um repositório no GitHub (ex.: `kaio-amorim-site`).
2. Envie o conteúdo desta pasta para o repositório (arraste os arquivos em "Add file > Upload files" ou use `git push`).
3. Na Vercel, clique em **Add New > Project**, importe o repositório e mantenha:
   - Framework Preset: **Other**
   - Build Command: vazio
   - Output Directory: vazio (raiz)
4. Clique em **Deploy**. Cada novo commit no GitHub publica o site automaticamente.

## Editar

- Número do WhatsApp: procure por `5595981171805` no `index.html`.
- Textos: estão todos no `index.html`.
- Cores: variáveis no topo do `css/style.css` (`--green`, `--gold`, etc.).
