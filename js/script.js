document.addEventListener('DOMContentLoaded', () => {
  const menuContainers = document.querySelectorAll('.menu-container');

  menuContainers.forEach(container => {
    const menuItems = container.querySelector('.menu-items');
    const prevBtn = container.querySelector('.prev-btn');
    const nextBtn = container.querySelector('.next-btn');

    if (menuItems && prevBtn && nextBtn) {
      const scrollAmount = 400;
      let maxScroll = menuItems.scrollWidth - menuItems.clientWidth;

      window.addEventListener('resize', () => {
        maxScroll = menuItems.scrollWidth - menuItems.clientWidth;
      });

      nextBtn.addEventListener('click', () => {
        menuItems.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });

      prevBtn.addEventListener('click', () => {
        menuItems.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }
  });
});

let produtosCarrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let valorTotalProduto = 0;



function mostrarCarrinho() {
  if (produtosCarrinho.length === 0) {
    Swal.fire({
      title: "Carrinho Vazio 🍔",
      text: "Que tal adicionar um delicioso lanche ao carrinho?",
      icon: "info",
      confirmButtonText: "Ver Produtos",
      confirmButtonColor: "#f57c00", // Cor inspirada em tons de lanche
      background: "#fff5e1", // Fundo com tom claro e agradável
      backdrop: `rgba(0,0,0,0.4) url('https://example.com/path-to-lanche-gif.gif') center center no-repeat`,
      position: 'center', // Centraliza o alerta na tela
      showConfirmButton: true,
    });

  } else {
    const listaProdutos = ListaProdutos();

    Swal.fire({
      title: "<h4 style=' margin-top:20px;color: #f57c00;'>SEU CARRINHO</h4>",
      confirmButtonText: "Finalizar Compra",
      showCancelButton: true,
      cancelButtonText: "Voltar",
      confirmButtonColor: "#f57c00",
      cancelButtonColor: "#e63946",
      background: "#fff",  // Cor de fundo branca
      html: `
        <div style="max-height:350;  border-radius: 5px; padding: 10px; background: #fff;">
        <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
        <thead style="margin:30px">
        <tr style="background-color: #f57c00; color: #fff; '">
        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Produto</th>
        <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qtd</th>
        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Valor Total</th>
        <th style="padding: 10px; text-align: center; border-bottom: 2px solid #fff;"></th>
        </tr>
        </thead>
        <tbody>
        ${listaProdutos.listaProdutos}
        <tr style="background-color: #fafafa; text-align: center; border: 1px solid #ddd; solid #ddd;">
  <td style="font-size: 20px; padding: 10px; font-weight: bold;">Total:</td>
  <td style="padding: 10px; font-weight: bold; border-top: 2px solid #ddd;">-</td>
  <td style="font-size: 20px; padding: 10px 15px; font-weight: bold; color: #f57c00; border-top: 2px solid #ddd;">R$ ${listaProdutos.totalValor.toFixed(2)}</td>
</tr>

        </tbody>
        </table>
        </div>
        <p style="position: absolute; font-size: 14px; color: #666; text-align: center; width: 85%;margin:16px;">📋 Verifique os itens antes de finalizar a compra.</p>

        `,

      customClass: {
        popup: 'swal-mostrar-carrinho',
        confirmButton: 'swal-btn-confirm',  // Classe customizada para o botão confirmar
        cancelButton: 'swal-btn-cancel'    // Classe customizada para o botão cancelar
      }
    }).then((result) => {
      if (result.isConfirmed) {
        finalizarCart();
      }
    });
  }
}


function ListaProdutos() {
  let listaProdutos = '';
  let totalValor = 0;

  produtosCarrinho.forEach((produto, index) => {
    listaProdutos += `
      <tr>
          <td style="text-align:left; padding:5px;">${produto.produto}</td> 
          <td>${produto.quantidade}</td>
          <td>R$ ${(produto.preco * produto.quantidade).toFixed(2)}</td>
          <td style="text-align: center;">
            <button onclick="remover(${index})" style="background-color:rgb(255, 255, 255); font-family: cursive;font-weight:bold; color: #e63946;margin:8px; padding: 10px 8px; border: none; cursor: pointer; font-size:18px">X</button>
          </td>
        </tr>`;

    totalValor += produto.preco * produto.quantidade;
  });

  return { listaProdutos, totalValor };
}

// Função para selecionar a forma de pagamento
function selecionarPagamento(pagamentoSelecionado) {
  const campoPagamento = document.getElementById("pag");
  campoPagamento.value = pagamentoSelecionado;
}

// Função para enviar o pedido pelo WhatsApp
function enviaWhats() {
  const endereco = document.getElementById("end").value;
  const telefone = document.getElementById("tel").value;
  const pagamento = document.getElementById("pag").value; // Forma de pagamento selecionada

  // Verifica se o endereço, telefone e forma de pagamento foram preenchidos
  if (!endereco || !telefone || !pagamento) {
    Swal.fire({
      icon: "error",
      title: "Erro!",
      text: "Por favor, preencha todos os campos obrigatórios (Endereço, Telefone e Forma de Pagamento).",
    });
    return;
  }

  // Monta a mensagem para o WhatsApp com os detalhes do pedido
  let mensagem = `Olá, gostaria de fazer um pedido!\n\n` +
    `📍 Endereço: ${endereco}\n` +
    `📞 Telefone: ${telefone}\n` +
    `💳 Forma de Pagamento: ${pagamento}\n\n` +
    `🛒 *Itens do Pedido:*\n`;

  let totalValor = 0;

  // Adiciona os itens do carrinho à mensagem
  produtosCarrinho.forEach((produto) => {
    const subtotal = produto.preco * produto.quantidade;
    mensagem += `🔸 ${produto.produto} (x${produto.quantidade}) - R$ ${subtotal.toFixed(2)}\n`;
    totalValor += subtotal;
  });

  // Adiciona o total da compra à mensagem
  mensagem += `\n💰 *Total*: R$ ${totalValor.toFixed(2)}`;

  // Gera a URL do WhatsApp com a mensagem codificada
  const whatsappUrl = `https://wa.me/5515996317887?text=${encodeURIComponent(mensagem)}`;

  // Limpa o carrinho de compras e abre o WhatsApp
  localStorage.clear();
  window.open(whatsappUrl, '_blank');
}






function finalizarCart() {
  Swal.fire({
    icon: "question",
    confirmButtonText: "Enviar Pedido",
    showCancelButton: true,
    title: "Digite as informações de entrega!",
    html: `
        <form class="form-modal">
          <div class="form-group">
            <input id="end" class="form-control" placeholder="Endereço" required>
          </div>
          <div class="form-group">
            <input id="tel" class="form-control" placeholder="Telefone" required>
          </div>
          <div class="form-group">
         <label for="pag">Forma de Pagamento:</label>
          <div id="payment-options" class="payment-options">
          <button type="button" class="payment-btn" onclick="selecionarPagamento('Pix')">Pix</button>
          <button type="button" class="payment-btn" onclick="selecionarPagamento('Cartão')">Cartão</button>
          <button type="button" class="payment-btn" onclick="selecionarPagamento('Dinheiro')">Dinheiro</button>
      </div>
        <input id="pag" class="form-control-input-ex" placeholder="Forma de Pagamento Selecionada" readonly>
  </div>
  <form>

      `,
    customClass: {
      popup: 'swal-custom-popup'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      enviaWhats();
      window.location.reload();
    }
  });
}

function atualizarValorCarrinho() {
  // Calcula o valor total considerando a quantidade de cada produto
  const totalValor = produtosCarrinho.reduce(
    (total, produto) => total + produto.preco * produto.quantidade,
    0
  );

  // Atualiza o elemento HTML com o valor total formatado
  document.getElementById('preco').textContent = `R$ ${totalValor.toFixed(2).replace('.', ',')}`;
}


// Chame essa função quando a página carregar, para mostrar o valor total se já houver itens no carrinho
window.onload = function () {
  atualizarValorCarrinho();
};
function adicionar(nomeProduto, precoProduto) {
  const produtoExistente = produtosCarrinho.find(produto => produto.produto === nomeProduto);

  if (produtoExistente) {
    // Se o produto já existir no carrinho, aumenta a quantidade
    produtoExistente.quantidade += 1;
  } else {
    // Se for um novo produto, adiciona ao carrinho
    produtosCarrinho.push({ produto: nomeProduto, preco: precoProduto, quantidade: 1 });
  }

  // Salva no LocalStorage
  localStorage.setItem('carrinho', JSON.stringify(produtosCarrinho));

  // Atualiza o valor total do carrinho
  atualizarValorCarrinho();

  // Atualiza o badge do carrinho
  atualizarBadgeCarrinho();

  Swal.fire({
    title: "Delícia Adicionada! 🍔",
    text: `Você adicionou "${nomeProduto}" por R$${precoProduto.toFixed(2)} ao carrinho.`,
    icon: "success",
    confirmButtonText: "Continuar comprando",
    confirmButtonColor: "#f57c00", // Cor inspirada no tema de lanches
    background: "#fff5e1", // Fundo com tom agradável
    backdrop: `
      rgba(0,0,0,0.4)
      url('https://example.com/path-to-hamburguer-gif.gif')  // URL de um GIF temático
      center top
      no-repeat 
    `
  });
}


function remover(indexProduto) {
  const produto = produtosCarrinho[indexProduto];

  // Exibe um alerta de confirmação, informando o nome do produto que está sendo removido
  Swal.fire({
    title: `Tem certeza que deseja remover o <span style="color: #f57c00; font-weight: bold;">${produto.produto}</span>?`,
    text: `O ${produto.produto} será removido do seu carrinho.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, remover',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#f57c00',
    cancelButtonColor: '#aaa',
  }).then((result) => {
    if (result.isConfirmed) {
      // Se confirmado, remove o produto ou diminui a quantidade se for maior que 1
      if (produto.quantidade > 1) {
        produto.quantidade -= 1;
      } else {
        // Remove o produto do carrinho
        produtosCarrinho.splice(indexProduto, 1);
      }

      // Atualiza o LocalStorage
      localStorage.setItem('carrinho', JSON.stringify(produtosCarrinho));

      // Atualiza o valor total do carrinho
      atualizarValorCarrinho();

      // Atualiza o badge do carrinho
      atualizarBadgeCarrinho();

      // Exibe uma mensagem de sucesso com nome do produto em destaque
      Swal.fire({
        title: 'Produto removido!',
        html: `${produto.produto} foi removido com sucesso do seu carrinho.`,
        icon: 'success',
        confirmButtonText: 'Fechar',
        confirmButtonColor: '#3085d6',
      });

      // Atualiza a exibição do carrinho
      mostrarCarrinho();
    }
  });
}







const opcoesBebidas = {
  "Suco Natural": [
    {
      nome: "Suco de Laranja",
      imagem: "https://th.bing.com/th/id/OIP.jnabP3zla7JZWOhiCmMwJgHaIE?rs=1&pid=ImgDetMain",
      preco: 10.99,
    },
    {
      nome: "Suco de Morango",
      imagem: "https://bing.com/th?id=OSK.7de061b895b31352f5fc016e4d71f66a",
      preco: 11.99,
    },
    {
      nome: "Suco de Abacaxi",
      imagem: "data:image/jpeg;base64,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",
      preco: 12.99,
    },
  ],
  "Refrigerante": [
    {
      nome: "Coca",
      imagem: "https://th.bing.com/th/id/OIP.QRSMYfbckiJx8KDG5NzrMgHaHa?w=218&h=218&c=7&r=0&o=5&pid=1.7",
      preco: 6.00,
    },
    {
      nome: "Sprite",
      imagem: "https://7483c243aa9da28f329c-903e05bc00667eb97d832a11f670edad.ssl.cf1.rackcdn.com/1018683-LqjF_wu3-medium.jpg",
      preco: 6.00,
    },
    {
      nome: "Pepsi",
      imagem: "https://ibassets.com.br/ib.item.image.large/l-1f4e36010b80493b9dc09bd0478b8c73.jpeg",
      preco: 6.00,
    },
  ],
  "Chá": [
    {
      nome: "Limão",
      imagem: "https://th.bing.com/th/id/OIP.7Mseunye1kPqkMMmRE-7PwHaHa?w=1080&h=1080&rs=1&pid=ImgDetMain",
      preco: 12.99,
    },
    {
      nome: "CranBerry",
      imagem: "https://br.fabbri1905.com/imgpub/2011405/0/0/ch-gelado-cranberry.jpg",
      preco: 12.99,
    },
  ],
};

// Função para abrir o modal e exibir as opções de bebidas
// Função para abrir o modal e exibir as opções de bebidas
function abrirModal(nomeProduto) {
  const modal = document.getElementById("bebidaModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalOptions = document.getElementById("modalOptions");

  // Limpa as opções anteriores
  modalOptions.innerHTML = "";

  // Define o título com base no tipo de bebida
  modalTitle.textContent = `Escolha o sabor do ${nomeProduto}`;

  // Adiciona as opções de bebida ao modal
  opcoesBebidas[nomeProduto].forEach(opcao => {
    const card = document.createElement("div");
    card.classList.add("card");

    // Imagem da bebida
    const image = document.createElement("img");
    image.src = opcao.imagem;
    image.alt = `${opcao.nome} image`;

    // Nome da bebida
    const name = document.createElement("h3");
    name.textContent = opcao.nome;

    // Preço da bebida
    const price = document.createElement("p");
    price.textContent = `R$ ${opcao.preco.toFixed(2)}`;

    // Ação ao clicar no card
    card.onclick = () => {
      // Adiciona a bebida ao carrinho
      adicionar(opcao.nome, opcao.preco);

  
      Swal.fire({
        title: `Bebida Adicionada!`,
        text: `Você adicionou "${opcao.nome}" por R$${opcao.preco.toFixed(2)}`,
        icon: "success",
        confirmButtonColor: "#f57c00",
      });
      fecharModal(); // Fecha o modal após a escolha
    };

    // Adiciona o conteúdo ao card
    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(price);

    // Adiciona o card ao modal
    modalOptions.appendChild(card);
  });

  modal.style.display = "block"; // Exibe o modal
}


// Função para fechar o modal
function fecharModal() {
  const modal = document.getElementById("bebidaModal");
  modal.style.display = "none"; // Esconde o modal
}

// Fecha o modal se clicar fora dele
window.onclick = function (event) {
  const modal = document.getElementById("bebidaModal");
  if (event.target === modal) {
    fecharModal();
  }
};

function closeModal() {
  const modal = document.querySelector('.modal-content');
  modal.style.display = 'none'; // Esconde a modal
  // Ou você pode remover a modal, se necessário:
  // modal.parentNode.removeChild(modal);
}
function atualizarBadgeCarrinho() {
  const carrinhoIcon = document.getElementById('verCarrinho');
  
  // Verifica se o badge já existe
  let badge = carrinhoIcon.querySelector('.carrinho-badge');
  if (!badge) {
    // Cria o badge se não existir
    badge = document.createElement('span');
    badge.className = 'carrinho-badge';
    carrinhoIcon.style.position = 'relative'; // Para garantir o posicionamento relativo
    carrinhoIcon.appendChild(badge);
  }

  // Atualiza o valor do badge
  const quantidadeTotal = produtosCarrinho.reduce((total, produto) => total + produto.quantidade, 0);
  if (quantidadeTotal > 0) {
    badge.textContent = quantidadeTotal;
    badge.style.display = 'flex'; // Mostra o badge
  } else {
    badge.style.display = 'none'; // Esconde o badge se não houver produtos
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Carrega o carrinho do LocalStorage (se existir)
  const carrinhoSalvo = localStorage.getItem('carrinho');
  if (carrinhoSalvo) {
    produtosCarrinho = JSON.parse(carrinhoSalvo);
  }

  // Atualiza o badge
  atualizarBadgeCarrinho();
});


