async function fetchData() {
  try {
    const response = await fetch('prefeituraQuixada.json');
    const json = await response.json(); // Pegamos o JSON inteiro
    console.log("JSON carregado:", json); // Verifica a estrutura dos dados

    const dados = json.data || json; // Se "data" existir, usa "json.data"; senão, usa "json"

    if (!Array.isArray(dados)) {
      throw new Error("Os dados carregados não são uma lista.");
    }

    const objeto = dados.map((funcionario) => ({
      funcionario: funcionario["Nome do funcionário"],
      cargo: funcionario["Cargo"],
      setor: funcionario["Setor"],
      matricula: funcionario["Matricula"],
      bruto: funcionario["Proventos"],
      desconto: funcionario["Descontos"],
      liquido: funcionario["Líquido"]
    }));

    //console.log("Funcionários formatados:", objeto);
    return objeto;
  } catch (error) {
    console.error("Erro ao carregar o arquivo:", error);
  }
}

// Chamada da função
fetchData()
  .then((dados) => {
    console.log("Dados processados:", dados);
  });

