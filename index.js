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
                                funcionario: titleCase(funcionario["Nome do funcionário"]),
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

function titleCase(frase) {
    return frase
        .split(" ")
        .map(
            (palavra) =>
                palavra.charAt(0).toUpperCase() +
                palavra.slice(1).toLowerCase()
        )
        .join(" ");
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

        return array.sort((a, b) => a.nome.localeCompare(b.nome));
    }
    return array;
}

function ordenarTabela(funcionarios) {
    const select = document.getElementById("ordenacao");

    if (!select) {
        console.error("Elemento #ordenacao não encontrado.");
        return;
    }

    select.addEventListener("change", () => {
        const valor = select.value;
        const funcionariosOrdenados = ordenacao(valor, funcionarios);
        renderizarTabela(funcionariosOrdenados);
    });
    
    return funcionarios; // Retorna o array atualizado
}

function renderizarTabela(funcionarios) {
    const divFuncionario = document.querySelector("#corpo");

    if (!divFuncionario) {
        console.error("Elemento #corpo não encontrado.");
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

function renderizarTabela(funcionarios) {
    const divFuncionario = document.querySelector("#corpo");

    if (!divFuncionario) {
        console.error("Elemento #corpo não encontrado.");
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

function filtragemTabela(funcionarios) {
    const botao = document.getElementById('lupa');

    const funcionariosOrdenados = ordenarTabela(funcionarios);
    renderizarTabela(funcionariosOrdenados);
    

    botao.addEventListener("click", ()=> {

        const colunaDePesquisa = document.getElementById('filtragem').value
        const valor_pesquisa = document.getElementById('pesquisar').value

        const valorDeOrdenacao = document.getElementById("ordenacao").value;

        
        alert(`Callback do botão funcionou! 
            coluna: ${colunaDePesquisa}; 
            pesquisa: ${valor_pesquisa}; 
            ordenar = ${valorDeOrdenacao}`)

        const funcionariosFiltrados = funcionarios.filter((funcionario) => {
            return funcionario[colunaDePesquisa].toUpperCase().includes(valor_pesquisa.toUpperCase())
        })

        console.log({funcionariosFiltrados})

        const funcionariosOrdenados = ordenacao(valorDeOrdenacao, funcionariosFiltrados);
        renderizarTabela(funcionariosOrdenados);


    })
    
}


// Executa a busca dos dados e renderiza a tabela
fetchData().then((dados) => {

    filtragemTabela(dados)
    //const filtrarFuncionarios = filtragemTabela(dados);    
    //const funcionariosOrdenados = ordenarTabela(dados);
    //renderizarTabela(filtrarFuncionarios);
    //renderizarTabela(funcionariosOrdenados);
    
});

