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
                                if (indice === array.length - 1) return null;

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
        exibirMetricas(funcionariosOrdenados);
    });
    
    return funcionarios;
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

function calcularMetricas(funcionarios) {
    if (!funcionarios.length) return {};

    const salarios = funcionarios.map(f => parseFloat(f.liquido)).filter(s => !isNaN(s));
    if (salarios.length === 0) return {};
    
    const maiorSalario = Math.max(...salarios);
    const menorSalario = Math.min(...salarios);
    const mediaSalarial = (salarios.reduce((acc, s) => acc + s, 0) / salarios.length).toFixed(2);
    const variancia = salarios.reduce((acc, s) => acc + Math.pow(s - mediaSalarial, 2), 0) / salarios.length;
    const desvioPadrao = Math.sqrt(variancia).toFixed(2);
    
    return { maiorSalario, menorSalario, mediaSalarial, desvioPadrao };
}

function exibirMetricas(funcionarios) {
    const metricas = calcularMetricas(funcionarios);
    const divMetricas = document.getElementById("metricas");

    if (!divMetricas) {
        console.error("Elemento #metricas não encontrado.");
        return;
    }

    if (Object.keys(metricas).length === 0) {
        divMetricas.innerHTML = "<p>Nenhuma métrica disponível.</p>";
        return;
    }

    divMetricas.innerHTML = `
        <h3>Métricas Salariais</h3>
        <ul>
            <li>Maior Salário Líquido: R$ ${metricas.maiorSalario.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</li>
            <li>Menor Salário Líquido: R$ ${metricas.menorSalario.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</li>
            <li>Média Salarial: R$ ${metricas.mediaSalarial.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</li>
            <li>Desvio Padrão: R$ ${metricas.desvioPadrao.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</li>
        </ul>
    `;
}

fetchData().then((dados) => {
    const funcionariosOrdenados = ordenarTabela(dados);
    renderizarTabela(funcionariosOrdenados);
    exibirMetricas(funcionariosOrdenados);
});
