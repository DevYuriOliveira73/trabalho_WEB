function titleCase(frase) {
  return frase
    .split(" ") // Divide em palavras
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()) // Capitaliza cada palavra
    .join(" "); // Junta tudo de volta
}



async function fetchData() {
  try {
    const response = await fetch('prefeituraQuixada.json');
    const json = await response.json(); // Pegamos o JSON inteiro
    console.log("JSON carregado:", json); // Verifica a estrutura dos dados

    const dados = json.data || json; // Se "data" existir, usa "json.data"; senão, usa "json"

    if (!Array.isArray(dados)) {
      throw new Error("Os dados carregados não são uma lista.");
    }

    const objeto = dados.map((funcionario) => {
      /*let salBruto = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number(funcionario["Proventos"]));*/

    
      return {
        funcionario: titleCase(funcionario["Nome do funcionário"]),
        cargo: funcionario["Cargo"],
        setor: funcionario["Setor"],
        matricula: funcionario["Matricula"],
        bruto: funcionario["Proventos"],
        desconto: funcionario["Descontos"],
        liquido: funcionario["Líquido"]
      };
    });

    //console.log("Funcionários formatados:", objeto);
    return objeto;
  } catch (error) {
    console.error("Erro ao carregar o arquivo:", error);
  }
}

// Chamada da função
let divFuncionario = document.querySelector('#corpo');

fetchData().then((dados) => {
  if (!dados || !Array.isArray(dados)) {
    console.error("Erro: Nenhum dado válido encontrado.");
    return;
  }

  // Criando um HTML com os funcionários de forma eficiente
  const listaHTML = dados.map((row) => 
    `<tr>
      <th>${row.funcionario}</th>
      <th>${row.cargo}</th>
      <th>${row.setor}</th>
      <th>${row.matricula}</th>
      <th>${row.bruto}</th>
      <th>${row.desconto}</th>
      <th>${row.liquido}</th>
    </tr>`  
  ).join(""); // Une os elementos sem recriar a DOM várias vezes

  divFuncionario.innerHTML = listaHTML;
});
