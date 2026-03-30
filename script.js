/* ================= VARIÁVEIS GLOBAIS ================= */
let carrinho = [];

/* ================= DOM READY ================= */
document.addEventListener("DOMContentLoaded", () => {
  console.log("JS carregado com sucesso 🚀");

  /* ================= ELEMENTOS ================= */
  const btnMenu = document.querySelector(".btn-menu");
  const categorias = document.querySelector(".categorias");
  const linksCategorias = document.querySelectorAll(".categorias a");

  const inputBusca = document.querySelector(".barra-pesquisa input");

  const btnCarrinho = document.querySelector(".carrinho-flutuante");
  const modalCarrinho = document.querySelector("#modal-carrinho");
  const fecharCarrinho = document.querySelector(".fechar-carrinho");
  const listaCarrinho = document.querySelector(".lista-carrinho");
  const totalSpan = document.querySelector("#total");
  const limparBtn = document.querySelector(".limpar-carrinho");
  const contadorCarrinho = document.querySelector(".contador-carrinho");

  const container = document.getElementById("produtos-container");

  let categoriaAtiva = "todos";

  /* ================= STORAGE ================= */
  try {
    carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  } catch {
    carrinho = [];
  }

  function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
  }

  function atualizarContador() {
    if (!contadorCarrinho) return;
    contadorCarrinho.textContent = carrinho.reduce(
      (soma, item) => soma + item.qtd,
      0,
    );
  }

  function filtrarProdutos() {
    if (!inputBusca) return;
    const texto = inputBusca.value.toLowerCase();

    document.querySelectorAll(".card").forEach((card) => {
      const nome =
        card.querySelector(".nome-produto")?.textContent.toLowerCase() || "";
      const categoria = card.dataset.categoria;

      const mostrar =
        nome.includes(texto) &&
        (categoriaAtiva === "todos" || categoria === categoriaAtiva);

      card.style.display = mostrar ? "block" : "none";
    });
  }

  function renderizarCarrinho() {
    if (!listaCarrinho || !totalSpan) return;

    listaCarrinho.innerHTML = "";
    let total = 0;

    carrinho.forEach((item, index) => {
      const subtotal = item.preco * item.qtd;
      total += subtotal;

      const div = document.createElement("div");
      div.classList.add("item-carrinho");
      div.innerHTML = `
        <span>${item.nome} (x${item.qtd})</span>
        <span>
          R$ ${subtotal.toFixed(2).replace(".", ",")}
          <button>❌</button>
        </span>
      `;

      div.querySelector("button").addEventListener("click", () => {
        carrinho.splice(index, 1);
        salvarCarrinho();
        atualizarContador();
        renderizarCarrinho();
      });

      listaCarrinho.appendChild(div);
    });

    totalSpan.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
  }

  /* ================= CARREGAR PRODUTOS ================= */
  fetch("json/produtos.json")
    .then((res) => res.json())
    .then((produtos) => {
      container.innerHTML = "";

      produtos.forEach((produto) => {
        // 🔥 IGNORA ITENS DE CATEGORIA
        if (!produto.slides) return;

        const card = document.createElement("div");
        card.classList.add("card");
        card.setAttribute("data-categoria", produto.categoria);

        let slidesHTML = "";

        produto.slides.forEach((slide) => {
          let imagem;
          let nome;
          let status = "";

          if (typeof slide === "string") {
            imagem = slide;
            nome = produto.nome;
          } else {
            imagem = slide.img;
            nome = slide.nome || produto.nome;
            status = slide.status ? `data-status="${slide.status}"` : "";
          }

          slidesHTML += `
            <div class="slide-produto" data-nome="${nome}" ${status}>
              <img src="imagem/${imagem}" loading="lazy">
            </div>
          `;
        });

        card.innerHTML = `
          <div class="slider-produto">
            <div class="slides-produto">${slidesHTML}</div>
            <button class="prev-produto">‹</button>
            <button class="next-produto">›</button>
          </div>

          <h3 class="nome-produto">${produto.nome}</h3>

          <button class="btn-comprar"
            data-nome="${produto.nome}"
            data-preco="${produto.preco}">
            Adicionar ao carrinho
          </button>
        `;

        container.appendChild(card);
      });

      iniciarSliders();
      iniciarEventosCompra();
      embaralharProdutos();
    })
    .catch((err) => console.error("Erro ao carregar JSON:", err));

  /* ================= SLIDER ================= */
  function iniciarSliders() {
    document.querySelectorAll(".card").forEach((card) => {
      const slides = card.querySelector(".slides-produto");
      const slidesItens = card.querySelectorAll(".slide-produto");
      const btnPrev = card.querySelector(".prev-produto");
      const btnNext = card.querySelector(".next-produto");

      const nomeProduto = card.querySelector(".nome-produto");
      const botaoComprar = card.querySelector(".btn-comprar");

      let index = 0;

      function atualizarSlide() {
        slides.style.transform = `translateX(-${index * 100}%)`;

        const slideAtual = slidesItens[index];
        const nome = slideAtual.dataset.nome;
        const status = slideAtual.dataset.status || "disponivel";

        if (nomeProduto && nome) nomeProduto.textContent = nome;

        if (botaoComprar) {
          botaoComprar.dataset.nome = nome;

          if (status === "indisponivel") {
            botaoComprar.disabled = true;
            botaoComprar.textContent = "Indisponível";
            botaoComprar.style.opacity = "0.6";
          } else {
            botaoComprar.disabled = false;
            botaoComprar.textContent = "Adicionar ao carrinho";
            botaoComprar.style.opacity = "1";
          }
        }
      }

      btnNext?.addEventListener("click", () => {
        index = (index + 1) % slidesItens.length;
        atualizarSlide();
      });

      btnPrev?.addEventListener("click", () => {
        index = (index - 1 + slidesItens.length) % slidesItens.length;
        atualizarSlide();
      });

      atualizarSlide();
    });
  }

  function iniciarEventosCompra() {
    document.querySelectorAll(".btn-comprar").forEach((botao) => {
      botao.addEventListener("click", () => {
        if (botao.disabled) return;

        const nome = botao.dataset.nome;
        const preco = parseFloat(botao.dataset.preco);

        const existente = carrinho.find((item) => item.nome === nome);
        existente ? existente.qtd++ : carrinho.push({ nome, preco, qtd: 1 });

        salvarCarrinho();
        atualizarContador();

        botao.classList.add("adicionado");
        setTimeout(() => botao.classList.remove("adicionado"), 400);
      });
    });
  }

  function embaralharProdutos() {
    const grid = document.querySelector(".produtos-grid");
    if (!grid) return;

    [...grid.children]
      .sort(() => Math.random() - 0.5)
      .forEach((card) => grid.appendChild(card));
  }

  /* ================= EVENTOS ================= */
  btnMenu?.addEventListener("click", () => {
    categorias?.classList.toggle("ativa");
  });

  linksCategorias.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      categoriaAtiva = link.dataset.categoria;

      linksCategorias.forEach((l) => l.classList.remove("ativo"));
      link.classList.add("ativo");

      filtrarProdutos();
    });
  });

  inputBusca?.addEventListener("input", filtrarProdutos);

  btnCarrinho?.addEventListener("click", () => {
    modalCarrinho?.classList.add("ativo");
    renderizarCarrinho();
  });

  fecharCarrinho?.addEventListener("click", () => {
    modalCarrinho?.classList.remove("ativo");
  });

  limparBtn?.addEventListener("click", () => {
    carrinho = [];
    salvarCarrinho();
    atualizarContador();
    renderizarCarrinho();
  });

  atualizarContador();
});

/* ================= ENTREGA / RETIRADA ================= */
const tipoEntregaSelect = document.querySelector(".tipo-entrega");
const campoEndereco = document.querySelector(".campo-endereco");
const campoTaxa = document.querySelector(".campo-taxa");

tipoEntregaSelect?.addEventListener("change", () => {
  if (tipoEntregaSelect.value === "entrega") {
    campoEndereco.style.display = "block";
    campoTaxa.style.display = "block";
  } else {
    campoEndereco.style.display = "none";
    campoTaxa.style.display = "none";
  }
});

/* ================= FINALIZAR WHATSAPP ================= */
document.querySelector(".finalizar")?.addEventListener("click", (e) => {
  e.preventDefault();

  if (carrinho.length === 0) return;

  const nomeCliente =
    document.querySelector(".nome-cliente")?.value.trim() || "Cliente";

  const formaPagamento =
    document.querySelector(".forma-pagamento")?.value || "Não informado";

  const tipoEntrega =
    document.querySelector(".tipo-entrega")?.value || "retirada";

  const endereco =
    document.querySelector(".endereco-entrega")?.value.trim() || "";

  const taxaEntrega = parseFloat(
    document.querySelector(".taxa-entrega")?.value || 0,
  );

  let mensagem = `💖 *Pedido LisMakes* 💖\n\n`;
  let total = 0;

  carrinho.forEach((item) => {
    const subtotal = item.preco * item.qtd;
    total += subtotal;

    mensagem += `💄 ${item.nome} (x${item.qtd}) – R$ ${subtotal
      .toFixed(2)
      .replace(".", ",")}\n`;
  });

  mensagem += `\n🧾 *Subtotal:* R$ ${total.toFixed(2).replace(".", ",")}\n\n`;

  mensagem += `👤 *Cliente:* ${nomeCliente}\n`;
  mensagem += `💳 *Pagamento:* ${formaPagamento}\n`;

  if (tipoEntrega === "entrega") {
    mensagem += `🚚 *Entrega*\n`;
    if (endereco) mensagem += `🏠 *Endereço:* ${endereco}\n`;
    mensagem += `💸 *Taxa:* R$ ${taxaEntrega.toFixed(2).replace(".", ",")}\n`;
    total += taxaEntrega;
  } else {
    mensagem += `📍 *Retirada no local*\n`;
  }

  mensagem += `\n✨ *Valor total:* R$ ${total
    .toFixed(2)
    .replace(".", ",")}\n\n`;

  mensagem += `🤍 Muito obrigada pela preferência!`;

  window.open(
    `https://wa.me/5583994137265?text=${encodeURIComponent(mensagem)}`,
  );
});
