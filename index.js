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
				const valorAmericanoBruto = (parseFloat(funcionario["Proventos"].toString().padEnd(2, "0")).toFixed(5)) * 1000


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
		divFuncionario.innerHTML = "<tr><td colspan='7'>Nenhum dado disponível.</td></tr>";
		return;
	}

	const listaHTML = funcionarios
                .map(({ funcionario, cargo, setor, matricula, bruto, liquido}) => {

                let valorBrBruto = new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(bruto);
                let valorBrLiquido = new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(liquido);
                const valorDescontado = new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(bruto - liquido);

                return (
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

    // Calcula o desconto para cada funcionário
    funcionarios.forEach(f => {
        f.desconto = f.bruto - f.liquido;
    });

    const maxLiquido = Math.max(...funcionarios.map(f => f.liquido));
    const funcsMaiorSalario = funcionarios.filter(f => f.liquido === maxLiquido);

    const minLiquido = Math.min(...funcionarios.map(f => f.liquido));
    const funcsMenorSalario = funcionarios.filter(f => f.liquido === minLiquido);

    const maxDesconto = Math.max(...funcionarios.map(f => f.desconto));
    const funcsMaiorDesconto = funcionarios.filter(f => f.desconto === maxDesconto);

    const minDesconto = Math.min(...funcionarios.map(f => f.desconto));
    const funcsMenorDesconto = funcionarios.filter(f => f.desconto === minDesconto);

    const somaLiquidos = funcionarios.reduce((acc, f) => acc + f.liquido, 0).toFixed(2);
    const mediaSalarial = (funcionarios.reduce((acc, f) => acc + f.liquido, 0) / funcionarios.length).toFixed(2);
    const variancia = funcionarios.reduce((acc, f) => acc + Math.pow(f.liquido - mediaSalarial, 2), 0) / funcionarios.length;
    const desvioPadrao = Math.sqrt(variancia).toFixed(2);

    return {
        maiorSalarios: funcsMaiorSalario,
        menorSalarios: funcsMenorSalario,
        maiorDescontos: funcsMaiorDesconto,
        menorDescontos: funcsMenorDesconto,
        mediaSalarial,
        desvioPadrao,
        somaLiquidos
    };
}


// Função atualizada para rolar até a linha do funcionário desejado e destacar momentaneamente
function scrollToRow(id) {
    const target = document.getElementById(id);
    if (target) {
        target.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
        target.classList.add("highlight");
        setTimeout(() => {
            target.classList.remove("highlight");
        }, 2000); // destaque por 2 segundos
    }
}


function exibirMetricas(funcionarios) {
    const metricas = calcularMetricas(funcionarios);
    const divMetricas = document.getElementById("metricas");

    console.log('metricas chamada')

    if (!divMetricas) {
        console.error("Elemento #metricas não encontrado.");
        return;
    }

    const formatarFuncionarios = (funcs) =>
        funcs
        .map(
            f =>
            `<a href="#funcionario-${f.matricula}" onclick="scrollToRow('funcionario-${f.matricula}'); return false;" style="text-decoration: none; color: inherit;">${f.funcionario} (${f.setor})</a>`
        )
        .join(" | ");

    divMetricas.innerHTML = `
      <h3>Métricas Salariais</h3>
      <ul>
        <li><strong>Maior Salário Líquido:</strong> R$ ${metricas.maiorSalarios[0].liquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} - ${formatarFuncionarios(metricas.maiorSalarios)}</li>
        <li><strong>Menor Salário Líquido:</strong> R$ ${metricas.menorSalarios[0].liquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} - ${formatarFuncionarios(metricas.menorSalarios)}</li>
        <li><strong>Maior Desconto:</strong> R$ ${metricas.maiorDescontos[0].desconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} - ${formatarFuncionarios(metricas.maiorDescontos)}</li>
        <li><strong>Menor Desconto:</strong> R$ ${metricas.menorDescontos[0].desconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} - ${formatarFuncionarios(metricas.menorDescontos)}</li>
        <li><strong>Média Salarial:</strong> R$ ${parseFloat(metricas.mediaSalarial).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</li>
        <li><strong>Desvio Padrão:</strong> R$ ${parseFloat(metricas.desvioPadrao).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</li>
        <li><strong>Soma dos Salários Líquidos:</strong> R$ ${parseFloat(metricas.somaLiquidos).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</li>
      </ul>
    `;
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
	renderizarTabela(funcionariosOrdenados);
	exibirMetricas(funcionariosOrdenados);
}


// Executa a busca dos dados e renderiza a tabela
fetchData().then((dados) => {
    const select = document.getElementById("ordenacao");
    const inputDePesquisa = document.getElementById('pesquisar');


    select.addEventListener("change", () => vamosRodarAutoBot(dados))
    inputDePesquisa.addEventListener("input", () => vamosRodarAutoBot(dados))

    renderizarTabela(dados);
    exibirMetricas(dados);
});