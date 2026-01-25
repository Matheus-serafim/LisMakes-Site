const btnCarrinho = document.querySelector(".btn-carrinho");
const modalCarrinho = document.querySelector("#modal-carrinho");
const fecharCarrinho = document.querySelector(".fechar-carrinho");
const listaCarrinho = document.querySelector(".lista-carrinho");
const totalSpan = document.querySelector("#total");
const limparBtn = document.querySelector(".limpar-carrinho");
const botoesComprar = document.querySelectorAll(".btn-comprar");
const contadorCarrinho = document.querySelector(".contador-carrinho");

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

/* ---------- util ---------- */
function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function atualizarContador() {
  const totalQtd = carrinho.reduce((s, i) => s + i.qtd, 0);
  contadorCarrinho.textContent = totalQtd;
}

/* ---------- render ---------- */
function renderizarCarrinho() {
  listaCarrinho.innerHTML = "";
  let total = 0;

  carrinho.forEach((item, index) => {
    total += item.preco * item.qtd;

    listaCarrinho.innerHTML += `
      <div class="item-carrinho">
        <span>${item.nome} (x${item.qtd})</span>
        <span>
          R$ ${(item.preco * item.qtd).toFixed(2)}
          <button onclick="removerItem(${index})">❌</button>
        </span>
      </div>
    `;
  });

  totalSpan.textContent = `R$ ${total.toFixed(2)}`;
}

/* ---------- ações ---------- */
window.removerItem = (index) => {
  carrinho.splice(index, 1);
  salvarCarrinho();
  atualizarContador();
  renderizarCarrinho();
};

limparBtn.addEventListener("click", () => {
  carrinho = [];
  salvarCarrinho();
  atualizarContador();
  renderizarCarrinho();
});

/* abrir / fechar modal */
btnCarrinho.addEventListener("click", () => {
  modalCarrinho.classList.add("ativo");
  renderizarCarrinho();
});

fecharCarrinho.addEventListener("click", () => {
  modalCarrinho.classList.remove("ativo");
});

modalCarrinho.addEventListener("click", (e) => {
  if (e.target === modalCarrinho) {
    modalCarrinho.classList.remove("ativo");
  }
});

/* ---------- adicionar produto ---------- */
botoesComprar.forEach((botao) => {
  botao.addEventListener("click", () => {
    const nome = botao.dataset.nome;
    const preco = parseFloat(botao.dataset.preco);

    const existente = carrinho.find((item) => item.nome === nome);

    if (existente) {
      existente.qtd++;
    } else {
      carrinho.push({ nome, preco, qtd: 1 });
    }

    salvarCarrinho();
    atualizarContador();

    /* animação */
    botao.classList.add("adicionado");
    setTimeout(() => botao.classList.remove("adicionado"), 400);
  });
});

/* ---------- WhatsApp ---------- */
document.querySelector(".finalizar").addEventListener("click", () => {
  if (carrinho.length === 0) return;

  let mensagem = "🛍️ *Pedido LisMakes*%0A%0A";
  let total = 0;

  carrinho.forEach((item) => {
    total += item.preco * item.qtd;
    mensagem += `• ${item.nome} (x${item.qtd}) - R$ ${(item.preco * item.qtd).toFixed(2)}%0A`;
  });

  mensagem += `%0A*Total:* R$ ${total.toFixed(2)}`;

  const telefone = "5599999999999"; // 🔴 coloque seu número aqui
  window.open(`https://wa.me/${telefone}?text=${mensagem}`, "_blank");
});

/* init */
atualizarContador();
