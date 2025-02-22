async function fetchData() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/DevYuriOliveira73/jsonPrefeituraQuixada/refs/heads/main/prefeituraQuixada.json");
        const json = await response.json();
        console.log("JSON carregado:", json);

        const dados = json.data || json;

        if (!Array.isArray(dados)) {
            throw new Error("Os dados carregados não são uma lista.");
        }
        const visu = [...new Set(dados.map(f => f["Cargo"].split(' ').slice(2).join(' ')))];
        console.log(visu)


        const resultado = dados
                            .map((funcionario, indice, array) => {
                                if (indice === array.length - 1) return null; // Ignora o último elemento
                                /*if (indice %2== 0) {
                                    console.log(funcionario["Nome do funcionário"], funcionario["Líquido"], typeof(funcionario["Líquido"]))
                                }*/
                                const valorAmericanoBruto = (parseFloat(funcionario["Proventos"].toString().padEnd(2, "0")).toFixed(5))*1000
                                

                                const valorAmericanoLiquido = (parseFloat(funcionario["Líquido"].toString().padEnd(2, "0")).toFixed(2))
                                
                                
                                

                                return {
                                
                                funcionario: funcionario["Nome do funcionário"],
                                cargo: funcionario["Cargo"].split(' ').slice(2).join(' '),
                                setor: funcionario["Setor"],
                                matricula: funcionario["Matricula"],
                                bruto: valorAmericanoBruto,
                                
                                liquido: valorAmericanoLiquido,

                                };
                            })
                            .filter(item => item !== null);
        return resultado;
    } catch (error) {
        console.error("Erro ao carregar o arquivo:", error);
        return [];
    }
}

function ordenacao(valor, array) {
    if (valor === "cargo") {
        
        return array.sort((a, b) => a.cargo.localeCompare(b.cargo));
    } 
    if (valor === "menorSalario") {

        return array.sort((a, b) => a.liquido - (b.liquido));
    }
    if (valor === "maiorSalario") {

        return array.sort((a, b) => b.liquido - (a.liquido));
    }
    if (valor === "alfabetica") {

        return array.sort((a, b) => a.funcionario.localeCompare(b.funcionario));
    }
    return array;
}



function renderizarTabela(funcionarios) {
    const divFuncionario = document.querySelector("#corpo");

    if (!divFuncionario) {
        alert("Elemento #corpo não encontrado.");
        return;
    }

    if (!funcionarios.length) {
        divFuncionario.innerHTML =
            "<tr><td colspan='7'>Nenhum dado disponível.</td></tr>";
        return;
    }

    const listaHTML = funcionarios
        .map(
            ({ funcionario, cargo, setor, matricula, bruto, liquido }) => {

                let valorBrBruto = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bruto);
                let valorBrLiquido = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(liquido);
                const valorDescontado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bruto - liquido);

                return(
                        `<tr>
                        <td>${funcionario}</td>
                        <td>${cargo}</td>
                        <td>${setor}</td>
                        <td>${matricula}</td>
                        <td>${valorBrBruto}</td>
                        <td>${valorDescontado}</td>
                        <td>${valorBrLiquido}</td>
                        </tr>`
                    )
                }
        )
        .join("");

    divFuncionario.innerHTML = listaHTML;
}




function vamosRodarAutoBot(funcionarios) {
    const colunaDePesquisa = document.getElementById('filtragem').value
    const valor_pesquisa = document.getElementById('pesquisar').value
    const valorDeOrdenacao = document.getElementById("ordenacao").value;

    const funcionariosFiltrados = funcionarios.filter((funcionario) => {
        return funcionario[colunaDePesquisa]
            .toUpperCase()
            .includes(valor_pesquisa.toUpperCase())
        });

    const funcionariosOrdenados = ordenacao(valorDeOrdenacao, funcionariosFiltrados);
    renderizarTabela(funcionariosOrdenados)
}


// Executa a busca dos dados e renderiza a tabela
fetchData().then((dados) => {
    
    const select = document.getElementById("ordenacao");
    const inputDePesquisa = document.getElementById('pesquisar');


    select.addEventListener("change", () =>vamosRodarAutoBot(dados))
    inputDePesquisa.addEventListener("input", () =>vamosRodarAutoBot(dados))
    
    renderizarTabela(dados)


    
});