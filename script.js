/* ================= VARIÁVEIS GLOBAIS ================= */
let carrinho = [];

/* ================= DOM READY ================= */
document.addEventListener("DOMContentLoaded", () => {
  console.log("JS carregado com sucesso 🚀");

  /* ================= ELEMENTOS ================= */
  const btnMenu = document.querySelector(".btn-menu");
  const categorias = document.querySelector(".categorias");
  const linksCategorias = document.querySelectorAll(".categorias a");
  const cards = document.querySelectorAll(".card");

  const inputBusca = document.querySelector(".barra-pesquisa input");

  const btnCarrinho = document.querySelector(".carrinho-flutuante");
  const modalCarrinho = document.querySelector("#modal-carrinho");
  const fecharCarrinho = document.querySelector(".fechar-carrinho");
  const listaCarrinho = document.querySelector(".lista-carrinho");
  const totalSpan = document.querySelector("#total");
  const limparBtn = document.querySelector(".limpar-carrinho");
  const botoesComprar = document.querySelectorAll(".btn-comprar");
  const contadorCarrinho = document.querySelector(".contador-carrinho");

  let categoriaAtiva = "todos";

  /* ================= STORAGE ================= */
  try {
    carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  } catch {
    carrinho = [];
  }

  /* ================= FUNÇÕES ================= */
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

    cards.forEach((card) => {
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

  /* ================= SLIDER + PREÇO DINÂMICO ================= */
  document.querySelectorAll(".card").forEach((card) => {
    const slider = card.querySelector(".slider-produto");
    if (!slider) return;

    const slides = slider.querySelector(".slides-produto");
    const slidesItens = slider.querySelectorAll(".slide-produto");
    const btnPrev = slider.querySelector(".prev-produto");
    const btnNext = slider.querySelector(".next-produto");

    const nomeProduto = card.querySelector(".nome-produto");
    const botaoComprar = card.querySelector(".btn-comprar");

    let index = 0;

    function atualizarSlide() {
      slides.style.transform = `translateX(-${index * 100}%)`;

      const slideAtual = slidesItens[index];
      const nome = slideAtual.dataset.nome;

      let preco = slideAtual.dataset.preco;

      if (!preco && botaoComprar?.dataset.preco) {
        preco = botaoComprar.dataset.preco;
      }

      if (!preco) preco = "0.00";

      if (nomeProduto && nome) nomeProduto.textContent = nome;

      if (botaoComprar) {
        botaoComprar.dataset.nome = nome;
        botaoComprar.dataset.preco = preco;
      }
    }

    btnNext?.addEventListener("click", (e) => {
      e.stopPropagation();
      index = (index + 1) % slidesItens.length;
      atualizarSlide();
    });

    btnPrev?.addEventListener("click", (e) => {
      e.stopPropagation();
      index = (index - 1 + slidesItens.length) % slidesItens.length;
      atualizarSlide();
    });

    atualizarSlide();
  });

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

  botoesComprar.forEach((botao) => {
    botao.addEventListener("click", () => {
      const nome = botao.dataset.nome;
      const preco = parseFloat(botao.dataset.preco);

      if (!nome || isNaN(preco)) return;

      const existente = carrinho.find((item) => item.nome === nome);
      existente ? existente.qtd++ : carrinho.push({ nome, preco, qtd: 1 });

      salvarCarrinho();
      atualizarContador();

      botao.classList.add("adicionado");
      setTimeout(() => botao.classList.remove("adicionado"), 400);
    });
  });

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

  /* ================= EMBARALHAR PRODUTOS ================= */
  const grid = document.querySelector(".produtos-grid");
  if (grid) {
    [...grid.children]
      .sort(() => Math.random() - 0.5)
      .forEach((card) => grid.appendChild(card));
  }

  atualizarContador();
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
  const bairro = document.querySelector(".bairro-entrega")?.value.trim() || "";
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
    if (bairro) mensagem += `📍 *Bairro:* ${bairro}\n`;
    if (endereco) mensagem += `🏠 *Endereço:* ${endereco}\n`;
    mensagem += `💸 *Taxa:* R$ ${taxaEntrega.toFixed(2).replace(".", ",")}\n`;
    total += taxaEntrega;
  } else {
    mensagem += `📍 *Retirada no local*\n`;
  }

  mensagem += `\n✨ *Valor total:* R$ ${total
    .toFixed(2)
    .replace(".", ",")}\n\n`;
  mensagem += `🤍 Muito obrigada pela preferência!\n`;

  const telefone = "5583986283024";
  window.open(
    `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`,
    "_blank",
  );
});
