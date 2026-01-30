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

  /* ================= ESTADO ================= */
  let carrinho = [];
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
    const totalQtd = carrinho.reduce((soma, item) => soma + item.qtd, 0);
    contadorCarrinho.textContent = totalQtd;
  }

  function filtrarProdutos() {
    if (!inputBusca) return;
    const texto = inputBusca.value.toLowerCase();

    cards.forEach(card => {
      const nomeProduto =
        card.querySelector("h3")?.textContent.toLowerCase() || "";
      const categoriaProduto = card.dataset.categoria;

      const bateTexto = nomeProduto.includes(texto);
      const bateCategoria =
        categoriaAtiva === "todos" || categoriaProduto === categoriaAtiva;

      card.style.display = bateTexto && bateCategoria ? "block" : "none";
    });
  }

  function renderizarCarrinho() {
    if (!listaCarrinho || !totalSpan) return;

    listaCarrinho.innerHTML = "";
    let total = 0;

    carrinho.forEach((item, index) => {
      total += item.preco * item.qtd;

      const div = document.createElement("div");
      div.classList.add("item-carrinho");

      div.innerHTML = `
        <span>${item.nome} (x${item.qtd})</span>
        <span>
          R$ ${(item.preco * item.qtd).toFixed(2)}
          <button data-index="${index}">❌</button>
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

    totalSpan.textContent = `R$ ${total.toFixed(2)}`;
  }

  /* ================= SLIDER PRODUTO ================= */
  document.querySelectorAll(".card").forEach(card => {
    const slider = card.querySelector(".slider-produto");
    if (!slider) return;

    const slides = slider.querySelector(".slides-produto");
    const slidesItens = slider.querySelectorAll(".slide-produto");
    const btnPrev = slider.querySelector(".prev-produto");
    const btnNext = slider.querySelector(".next-produto");

    const nomeProduto = card.querySelector(".nome-produto");
    const botaoComprar = card.querySelector(".btn-comprar");

    let index = 0;
    const total = slidesItens.length;

    function atualizarSlide() {
      slides.style.transform = `translateX(-${index * 100}%)`;

      const slideAtual = slidesItens[index];
      const nome = slideAtual.dataset.nome;
      const preco = slideAtual.dataset.preco;

      if (nomeProduto && nome) nomeProduto.textContent = nome;
      if (botaoComprar && preco) {
        botaoComprar.dataset.nome = nome;
        botaoComprar.dataset.preco = preco;
      }
    }

    btnNext?.addEventListener("click", e => {
      e.stopPropagation();
      index = (index + 1) % total;
      atualizarSlide();
    });

    btnPrev?.addEventListener("click", e => {
      e.stopPropagation();
      index = (index - 1 + total) % total;
      atualizarSlide();
    });

    atualizarSlide();
  });

  /* ================= EVENTOS ================= */
  btnMenu?.addEventListener("click", () => {
    categorias?.classList.toggle("ativa");
  });

  linksCategorias.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      categoriaAtiva = link.dataset.categoria;

      linksCategorias.forEach(l => l.classList.remove("ativo"));
      link.classList.add("ativo");

      filtrarProdutos();
    });
  });

  inputBusca?.addEventListener("input", filtrarProdutos);

  botoesComprar.forEach(botao => {
    botao.addEventListener("click", () => {
      const nome = botao.dataset.nome;
      const preco = parseFloat(botao.dataset.preco);

      const existente = carrinho.find(item => item.nome === nome);
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
    const cardsGrid = Array.from(grid.children);

    for (let i = cardsGrid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardsGrid[i], cardsGrid[j]] = [cardsGrid[j], cardsGrid[i]];
    }

    cardsGrid.forEach(card => grid.appendChild(card));
  }

  atualizarContador();
});
